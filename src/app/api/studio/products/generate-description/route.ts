import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { getClientBundle } from '@/lib/expo360/repositories';
import type { ClientBrandCopyGuide } from '@/lib/expo360/types';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MODEL_CANDIDATES = ['google/gemini-3.1-flash-lite-preview', 'openai/gpt-4.1-mini'];

type GenerateDescriptionRequest = {
  imageUrl?: string;
  name?: string;
  sku?: string;
  details?: string;
  existingDescription?: string;
  clientName?: string;
};

function normalizeText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function sanitizeDescription(value: string) {
  return value
    .replace(/^['"`]+|['"`]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeList(values?: string[]) {
  return Array.isArray(values)
    ? Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)))
    : [];
}

function findForbiddenWords(description: string, forbiddenWords: string[]) {
  const loweredDescription = description.toLowerCase();

  return forbiddenWords.filter((word) => loweredDescription.includes(word.toLowerCase()));
}

async function imageUrlToDataUrl(imageUrl: string) {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error('La imagen del producto no tiene una URL válida.');
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('La imagen debe usar una URL pública http o https.');
  }

  const response = await fetch(parsedUrl.toString(), {
    headers: { Accept: 'image/jpeg,image/png,image/webp,image/*;q=0.8' },
    cache: 'no-store',
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error('No se pudo descargar la imagen del producto.');
  }

  const contentTypeHeader = response.headers.get('content-type') || '';
  const contentType = contentTypeHeader.split(';')[0].trim().toLowerCase();

  if (!SUPPORTED_IMAGE_TYPES.has(contentType)) {
    throw new Error('La imagen debe ser JPG, PNG o WebP.');
  }

  const contentLength = Number(response.headers.get('content-length') || '0');
  if (contentLength > MAX_IMAGE_BYTES) {
    throw new Error('La imagen es demasiado pesada. Usa un archivo de hasta 5 MB.');
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('La imagen es demasiado pesada. Usa un archivo de hasta 5 MB.');
  }

  return `data:${contentType};base64,${buffer.toString('base64')}`;
}

function buildContextBlock(body: GenerateDescriptionRequest) {
  const parts = [
    normalizeText(body.clientName) ? `Marca: ${normalizeText(body.clientName)}` : null,
    normalizeText(body.name) ? `Nombre del producto: ${normalizeText(body.name)}` : null,
    normalizeText(body.sku) ? `SKU: ${normalizeText(body.sku)}` : null,
    normalizeText(body.details) ? `Detalles confirmados:\n${normalizeText(body.details)}` : null,
    normalizeText(body.existingDescription)
      ? `Descripción actual (úsala solo si coincide con la imagen y los datos): ${normalizeText(body.existingDescription)}`
      : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join('\n\n') : 'Sin contexto adicional confirmado.';
}

function buildBrandGuideBlock(brandCopyGuide?: ClientBrandCopyGuide) {
  if (!brandCopyGuide) {
    return 'Sin guía de marca adicional.';
  }

  const mentionableFacts = normalizeList(brandCopyGuide.mentionableBrandFacts);
  const forbiddenWords = normalizeList(brandCopyGuide.forbiddenWords);
  const parts = [
    normalizeText(brandCopyGuide.voiceAndTone) ? `TONO Y ESTILO\n${normalizeText(brandCopyGuide.voiceAndTone)}` : null,
    normalizeText(brandCopyGuide.brandContext) ? `CONTEXTO Y VALORES DE MARCA\n${normalizeText(brandCopyGuide.brandContext)}` : null,
    mentionableFacts.length > 0 ? `ATRIBUTOS O FRASES QUE SI PUEDES MENCIONAR\n- ${mentionableFacts.join('\n- ')}` : null,
    normalizeText(brandCopyGuide.clientProfile)
      ? `PERFIL DE CLIENTE\n${normalizeText(brandCopyGuide.clientProfile)}\nUsa este perfil para elegir tono, aspiracion y beneficios priorizados. No lo copies literal salvo que sea natural.`
      : null,
    forbiddenWords.length > 0 ? `PALABRAS PROHIBIDAS\n${forbiddenWords.join(', ')}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join('\n\n') : 'Sin guía de marca adicional.';
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const openrouterApiKey =
    process.env.PRODUCT_DESCRIPTION_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;
  if (!openrouterApiKey) {
    return NextResponse.json({ error: 'Falta configurar OpenRouter.' }, { status: 500 });
  }

  let body: GenerateDescriptionRequest;

  try {
    body = (await request.json()) as GenerateDescriptionRequest;
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  const bundle = await getClientBundle(user.clientId);
  const brandCopyGuide = bundle?.client.integrations.brandCopyGuide;
  const forbiddenWords = normalizeList(brandCopyGuide?.forbiddenWords);

  const imageUrl = normalizeText(body.imageUrl);
  if (!imageUrl) {
    return NextResponse.json({ error: 'Agrega una imagen del producto para generar la descripción.' }, { status: 400 });
  }

  let imageDataUrl: string;

  try {
    imageDataUrl = await imageUrlToDataUrl(imageUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'No se pudo preparar la imagen del producto.' },
      { status: 400 }
    );
  }

  const contextBlock = buildContextBlock(body);
  const brandGuideBlock = buildBrandGuideBlock(brandCopyGuide);
  const systemPrompt = [
    'Eres un director creativo y copywriter senior de ecommerce para marcas premium en Mexico.',
    'Escribe solo en espanol de Mexico.',
    'Tu trabajo es redactar una descripcion breve, elegante y orientada a conversion para una ficha de producto.',
    'No escribas descripciones genericas: cada producto debe sonar claramente distinto segun su categoria, uso y resultado final para la persona que lo compra.',
    'Prioriza primero lo visible en la imagen y luego los datos confirmados que te pasen.',
    'Si la imagen y los datos confirmados entran en conflicto, gana el dato confirmado.',
    'Ademas de la apariencia, enfatiza el proposito real del producto y el beneficio principal que entrega.',
    'Si faltan especificaciones concretas, por ahora puedes inferir beneficios plausibles y lenguaje tecnico verosimil segun la categoria del producto, sin usar cifras demasiado especificas, garantias, promociones o afirmaciones regulatorias.',
    'Piensa en el resultado que promete cada categoria: audio, comodidad, traccion, rendimiento, hidratacion, aislamiento, soporte, resistencia, organizacion, decoracion, ergonomia o entrenamiento, segun aplique.',
    'Usa vocabulario propio de la categoria cuando ayude a diferenciarlo: por ejemplo claridad y profundidad para audio; impulso, agarre y estabilidad para calzado; resistencia, ritmo e inclinacion para fitness; conservacion termica y practicidad para termos; confort, textura, soporte o presencia visual para mobiliario.',
    'No repitas la misma estructura entre productos del mismo color o marca. Si varios productos comparten una estetica, el foco debe cambiar hacia su uso, sensacion y resultado.',
    'Si existe una guia de marca, usala para moldear el tono y priorizar beneficios, pero no copies sus frases literalmente si no aportan naturalidad al producto.',
    'Si existe un perfil de cliente, usalo para decidir que beneficios, sensibilidad y nivel aspiracional priorizar, sin mencionar edad, clase social o antecedentes personales salvo que sea realmente natural y relevante.',
    forbiddenWords.length > 0 ? `No utilices estas palabras o frases bajo ninguna circunstancia: ${forbiddenWords.join(', ')}.` : null,
    'Evita relleno, cliches, emojis, hashtags, markdown y comillas.',
    'Devuelve solo una descripcion final en un solo parrafo, idealmente entre 140 y 220 caracteres.',
    'La redaccion debe sonar premium, clara, comercial y natural; nivel agencia top, sin exagerar ni sonar artificial.',
  ].filter(Boolean).join(' ');

  const userPrompt = [
    'Genera una descripcion de producto a partir de esta imagen y los datos confirmados.',
    'Primero identifica que tipo de producto es y para que sirve; despues redacta en funcion de ese proposito.',
    'No te quedes solo en color, acabado o estilo visual. Explica que experiencia, rendimiento o utilidad transmite el producto.',
    'Si no hay suficientes datos duros, puedes completar con beneficios plausibles de su categoria para que la descripcion no suene vacia ni repetitiva.',
    'Usa materiales, silueta, textura, color o uso solo si son claramente visibles o estan confirmados.',
    '',
    'DATOS CONFIRMADOS',
    contextBlock,
    '',
    'GUIA DE MARCA',
    brandGuideBlock,
  ].join('\n');

  let lastError = 'No se pudo generar una descripcion util.';

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3001',
          'X-Title': 'Expo360 Studio AI Product Description',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: userPrompt },
                { type: 'image_url', image_url: { url: imageDataUrl } },
              ],
            },
          ],
          temperature: 0.8,
          max_tokens: 220,
        }),
      });

      if (!response.ok) {
        lastError = `OpenRouter devolvio ${response.status} con el modelo ${model}.`;
        continue;
      }

      const data = await response.json();
      const description = sanitizeDescription(data.choices?.[0]?.message?.content || '');

      if (!description) {
        lastError = `El modelo ${model} no devolvio texto.`;
        continue;
      }

      const forbiddenMatches = findForbiddenWords(description, forbiddenWords);
      if (forbiddenMatches.length > 0) {
        lastError = `La IA uso palabras prohibidas: ${forbiddenMatches.join(', ')}.`;
        continue;
      }

      return NextResponse.json({ description, modelUsed: model });
    } catch (error) {
      lastError = error instanceof Error ? error.message : `Fallo inesperado con ${model}.`;
    }
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
