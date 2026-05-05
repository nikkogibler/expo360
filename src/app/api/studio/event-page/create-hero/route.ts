import { NextResponse } from 'next/server';

import { uploadClientAsset } from '@/lib/blob/storage';
import { getCurrentUserContext } from '@/lib/expo360/auth';
import { getClientBundle } from '@/lib/expo360/repositories';
import type { CreatedHeroAsset } from '@/lib/expo360/types';
import { getFirebaseAdminDb } from '@/lib/firebase/admin';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const HERO_MODEL = 'google/gemini-2.5-flash-image';
const HERO_PROMPT_ENHANCER_MODEL = 'google/gemini-3.1-flash-lite-preview';
const FREE_TRIAL_HERO_LIMIT = 5;

type CreateHeroRequest = {
  prompt?: string;
  referenceImageUrl?: string;
  title?: string;
  subtitle?: string;
  intro?: string;
};

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

async function imageUrlToDataUrl(imageUrl: string, label: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error(`La ${label} no tiene una URL válida.`);
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error(`La ${label} debe usar una URL pública http o https.`);
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: { Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8' },
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`No se pudo descargar la ${label}.`);
  }

  const contentTypeHeader = response.headers.get('content-type') || '';
  const contentType = contentTypeHeader.split(';')[0].trim().toLowerCase();

  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    throw new Error(`La ${label} debe ser JPG, PNG o WebP.`);
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > MAX_IMAGE_BYTES) {
    throw new Error(`La ${label} es demasiado pesada. Usa un archivo de hasta 5 MB.`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error(`La ${label} es demasiado pesada. Usa un archivo de hasta 5 MB.`);
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

function extractGeneratedImageReference(data: any) {
  const message = data?.choices?.[0]?.message;

  if (message?.images?.[0]?.image_url?.url) {
    return message.images[0].image_url.url as string;
  }

  if (typeof data?.id === 'string' && data.id.length > 100) {
    const base64Data = data.id.startsWith('gen-1') ? data.id.slice(5) : data.id;
    if (/^[A-Za-z0-9+/=]+$/.test(base64Data.slice(-120))) {
      return `data:image/png;base64,${base64Data}`;
    }
  }

  return '';
}

function normalizeCreatedHeroes(value: unknown): CreatedHeroAsset[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];

    const hero = item as Record<string, unknown>;
    const url = normalizeText(hero.url);

    if (!url) return [];

    return [
      {
        id: normalizeText(hero.id) || url,
        url,
        prompt: normalizeText(hero.prompt) || undefined,
        enhancedPrompt: normalizeText(hero.enhancedPrompt) || undefined,
        referenceImageUrl: normalizeText(hero.referenceImageUrl) || undefined,
        createdAt: normalizeText(hero.createdAt) || undefined,
      },
    ];
  });
}

async function imageReferenceToFile(imageReference: string) {
  if (imageReference.startsWith('data:')) {
    const match = imageReference.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new Error('La IA devolvió una imagen inválida.');
    }

    const [, contentType, base64] = match;
    const buffer = Buffer.from(base64, 'base64');
    const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';

    return new File([buffer], `hero-${Date.now()}.${extension}`, { type: contentType });
  }

  const response = await fetch(imageReference, {
    headers: { Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8' },
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('No se pudo recuperar la imagen generada por la IA.');
  }

  const contentTypeHeader = response.headers.get('content-type') || '';
  const contentType = contentTypeHeader.split(';')[0].trim().toLowerCase();
  const safeType = SUPPORTED_IMAGE_TYPES.has(contentType) ? contentType : 'image/png';
  const buffer = Buffer.from(await response.arrayBuffer());
  const extension = safeType === 'image/png' ? 'png' : safeType === 'image/webp' ? 'webp' : 'jpg';

  return new File([buffer], `hero-${Date.now()}.${extension}`, { type: safeType });
}

function buildHeroPrompt(input: {
  clientName: string;
  title: string;
  subtitle: string;
  intro: string;
  prompt: string;
  hasReferenceImage: boolean;
}) {
  const parts = [
    'Crea una imagen hero horizontal 16:9 para una landing premium de producto o coleccion.',
    'Usa el logo adjunto como referencia visual de marca para paleta, materiales, lenguaje formal y mood, pero no agregues texto legible, slogans, palabras ni branding incrustado dentro de la imagen final.',
    'La composicion debe sentirse editorial, aspiracional, limpia y lista para un sitio web de alta gama.',
    'Evita mockups de pantalla, interfaces, collage obvio, marcos, marcas de agua, tipografia, personas deformes o escenas demasiado saturadas.',
    input.hasReferenceImage
      ? 'Usa la imagen de referencia adicional como contexto visual de atmosfera, materiales, producto o encuadre, sin copiarla de forma literal.'
      : null,
    input.title ? `Titulo del evento o coleccion: ${input.title}` : null,
    input.subtitle ? `Subtitulo: ${input.subtitle}` : null,
    input.intro ? `Contexto adicional del evento: ${input.intro}` : null,
    input.clientName ? `Marca: ${input.clientName}` : null,
    input.prompt ? `Indicaciones creativas del usuario: ${input.prompt}` : null,
    'Entrega una sola imagen final, fotorealista o de arte publicitario premium segun convenga, con iluminacion cuidada, profundidad y espacio visual util para superponer contenido web.',
  ].filter(Boolean);

  return parts.join('\n\n');
}

async function enhanceHeroPrompt(input: {
  apiKey: string;
  clientName: string;
  title: string;
  subtitle: string;
  intro: string;
  prompt: string;
  hasReferenceImage: boolean;
}) {
  const systemPrompt = [
    'Eres un director creativo senior y prompt engineer especializado en imagenes hero para marcas premium.',
    'Tu trabajo es transformar un prompt breve en una direccion visual mucho mas rica, clara y producible para un modelo de generacion de imagen.',
    'Conserva la intencion del usuario, pero vuelve la instruccion mas cinematografica, editorial y precisa.',
    'Piensa en composicion, iluminacion, materiales, profundidad, atmosfera, encuadre, jerarquia visual y espacio util para texto overlay.',
    'No agregues texto dentro de la imagen, logotipos incrustados, marcas de agua, UI, mockups o collage obvio salvo que el usuario lo pida.',
    'Escribe solo el prompt final mejorado, sin encabezados, sin comillas, sin notas.',
    'Responde en espanol de Mexico si el usuario escribio en espanol; en ingles si escribio en ingles.',
  ].join(' ');

  const userPrompt = [
    'Mejora este prompt para una imagen hero 16:9 de landing page premium.',
    `Marca: ${input.clientName}`,
    input.title ? `Titulo de la coleccion o evento: ${input.title}` : null,
    input.subtitle ? `Subtitulo: ${input.subtitle}` : null,
    input.intro ? `Contexto adicional: ${input.intro}` : null,
    input.hasReferenceImage
      ? 'Habra una imagen extra de referencia visual, asi que puedes alinear atmosfera, materiales y encuadre con ese contexto.'
      : 'No hay imagen de contexto extra, asi que la direccion visual debe quedar completamente clara en el prompt.',
    `Prompt original del usuario: ${input.prompt}`,
    'Devuelve un prompt final mas fuerte, especifico y visualmente sofisticado. Debe sonar listo para produccion.',
  ].filter(Boolean).join('\n\n');

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3001',
      'X-Title': 'Expo360 Studio Hero Prompt Enhancer',
    },
    body: JSON.stringify({
      model: HERO_PROMPT_ENHANCER_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.9,
      max_tokens: 350,
    }),
  });

  if (!response.ok) {
    throw new Error(`No se pudo mejorar el prompt (${response.status}).`);
  }

  const data = await response.json();
  const enhancedPrompt = normalizeText(data.choices?.[0]?.message?.content);

  if (!enhancedPrompt) {
    throw new Error('La IA no devolvio un prompt mejorado.');
  }

  return enhancedPrompt;
}

async function reserveHeroAttempt(clientId: string) {
  const clientRef = getFirebaseAdminDb().collection('clients').doc(clientId);

  return getFirebaseAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(clientRef);
    const data = snapshot.data() || {};
    const trialStatus = normalizeText(data.trial_status);
    const currentUsage = Number(data.integrations?.heroCreatorTrialUsageCount || 0);
    const isTrialClient = trialStatus === 'active';

    if (!isTrialClient) {
      return {
        isTrialClient: false,
        remainingTries: null as number | null,
      };
    }

    if (currentUsage >= FREE_TRIAL_HERO_LIMIT) {
      throw new Error('TRIAL_LIMIT_REACHED');
    }

    const nextUsage = currentUsage + 1;
    transaction.set(
      clientRef,
      {
        integrations: {
          ...(data.integrations || {}),
          heroCreatorTrialUsageCount: nextUsage,
        },
      },
      { merge: true }
    );

    return {
      isTrialClient: true,
      remainingTries: Math.max(0, FREE_TRIAL_HERO_LIMIT - nextUsage),
    };
  });
}

async function storeCreatedHero(clientId: string, hero: CreatedHeroAsset) {
  const clientRef = getFirebaseAdminDb().collection('clients').doc(clientId);

  await getFirebaseAdminDb().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(clientRef);
    const data = snapshot.data() || {};
    const integrations = data.integrations || {};
    const existingHeroes = normalizeCreatedHeroes(integrations.createdHeroes).filter(
      (existingHero) => existingHero.url !== hero.url
    );

    transaction.set(
      clientRef,
      {
        integrations: {
          ...integrations,
          createdHeroes: [hero, ...existingHeroes].slice(0, 24),
        },
      },
      { merge: true }
    );
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const openrouterApiKey = process.env.HERO_CREATOR_OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    return NextResponse.json({ error: 'Falta configurar HERO_CREATOR_OPENROUTER_API_KEY.' }, { status: 500 });
  }

  let body: CreateHeroRequest;

  try {
    body = (await request.json()) as CreateHeroRequest;
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const prompt = normalizeText(body.prompt);
  const referenceImageUrl = normalizeText(body.referenceImageUrl);

  if (!prompt) {
    return NextResponse.json({ error: 'Escribe una indicación para crear el hero.' }, { status: 400 });
  }

  const bundle = await getClientBundle(user.clientId);
  if (!bundle) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  const logoUrl = normalizeText(bundle.client.logoUrl);
  if (!logoUrl) {
    return NextResponse.json({ error: 'Sube un logo antes de usar Create-A-Hero.' }, { status: 400 });
  }

  let logoDataUrl: string;
  let referenceDataUrl = '';

  try {
    logoDataUrl = await imageUrlToDataUrl(logoUrl, 'logo');
    if (referenceImageUrl) {
      referenceDataUrl = await imageUrlToDataUrl(referenceImageUrl, 'imagen de referencia');
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudieron preparar las imágenes de referencia.' },
      { status: 400 }
    );
  }

  const userPrompt = buildHeroPrompt({
    clientName: bundle.client.name,
    title: normalizeText(body.title) || bundle.eventPage.title,
    subtitle: normalizeText(body.subtitle) || bundle.eventPage.subtitle || '',
    intro: normalizeText(body.intro) || bundle.eventPage.intro || '',
    prompt,
    hasReferenceImage: Boolean(referenceDataUrl),
  });

  let enhancedPrompt = userPrompt;

  try {
    enhancedPrompt = await enhanceHeroPrompt({
      apiKey: openrouterApiKey,
      clientName: bundle.client.name,
      title: normalizeText(body.title) || bundle.eventPage.title,
      subtitle: normalizeText(body.subtitle) || bundle.eventPage.subtitle || '',
      intro: normalizeText(body.intro) || bundle.eventPage.intro || '',
      prompt,
      hasReferenceImage: Boolean(referenceDataUrl),
    });
  } catch {
    enhancedPrompt = userPrompt;
  }

  let attemptReservation: { isTrialClient: boolean; remainingTries: number | null };

  try {
    attemptReservation = await reserveHeroAttempt(user.clientId);
  } catch (error) {
    if (error instanceof Error && error.message === 'TRIAL_LIMIT_REACHED') {
      return NextResponse.json(
        {
          error: 'Ya usaste tus 5 intentos de Create-A-Hero incluidos en el free trial. Para seguir generando heroes, necesitas desbloquear el plan completo.',
          remainingTries: 0,
          limit: FREE_TRIAL_HERO_LIMIT,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo validar el límite del free trial.' },
      { status: 500 }
    );
  }

  let response: Response;

  try {
    response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3001',
        'X-Title': 'Expo360 Studio Hero Creator',
      },
      body: JSON.stringify({
        model: HERO_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: enhancedPrompt },
              { type: 'image_url', image_url: { url: logoDataUrl } },
              ...(referenceDataUrl ? [{ type: 'image_url', image_url: { url: referenceDataUrl } }] : []),
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.9,
      }),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo conectar con OpenRouter.' },
      { status: 502 }
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json(
      { error: `OpenRouter devolvió ${response.status}: ${errorText.slice(0, 300)}` },
      { status: 502 }
    );
  }

  const data = await response.json();
  const imageReference = extractGeneratedImageReference(data);

  if (!imageReference) {
    return NextResponse.json({ error: 'La IA no devolvió una imagen utilizable.' }, { status: 502 });
  }

  try {
    const file = await imageReferenceToFile(imageReference);
    const uploaded = await uploadClientAsset({
      clientId: user.clientId,
      kind: 'event-pages',
      file,
    });

    const createdHero: CreatedHeroAsset = {
      id: crypto.randomUUID(),
      url: uploaded.url,
      prompt,
      enhancedPrompt,
      referenceImageUrl: referenceImageUrl || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await storeCreatedHero(user.clientId, createdHero);
    } catch {
      // The generated asset still exists even if the library update fails.
    }

    return NextResponse.json({
      imageUrl: uploaded.url,
      modelUsed: HERO_MODEL,
      enhancedPrompt,
      createdHero,
      remainingTries: attemptReservation.remainingTries,
      limit: attemptReservation.isTrialClient ? FREE_TRIAL_HERO_LIMIT : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'No se pudo guardar la imagen generada.',
        remainingTries: attemptReservation.remainingTries,
        limit: attemptReservation.isTrialClient ? FREE_TRIAL_HERO_LIMIT : null,
      },
      { status: 500 }
    );
  }
}