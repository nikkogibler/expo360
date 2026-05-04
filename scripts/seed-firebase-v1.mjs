import fs from 'fs';
import path from 'path';
import { randomBytes } from 'crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const root = process.cwd();

function loadEnvFile(fileName) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\n/g, '\n');
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

function cleanPrivateKey(value) {
  return value?.trim().replace(/^"|"$/g, '').replace(/\\n/g, '\n');
}

function adminApp() {
  if (getApps().length > 0) return getApps()[0];

  const projectId =
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail =
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL ||
    process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = cleanPrivateKey(
    process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
      process.env.FIREBASE_PRIVATE_KEY
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      'Firebase Admin env is missing. Check FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.'
    );
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

async function getOrCreateUser(auth, { email, displayName, password }) {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { displayName, password });
    return { user: existing, password, created: false };
  } catch {
    const user = await auth.createUser({
      email,
      displayName,
      emailVerified: true,
      password,
    });
    return { user, password, created: true };
  }
}

function temporaryPassword() {
  return `Expo360-${randomBytes(8).toString('base64url')}!1`;
}

async function seed() {
  adminApp();
  const auth = getAuth();
  const db = getFirestore();
  const now = FieldValue.serverTimestamp();
  const interzektEmail = (
    process.env.SEED_INTERZEKT_ADMIN_EMAIL ||
    process.env.PLATFORM_ADMIN_EMAILS?.split(',')[0] ||
    'nikkogibler@gmail.com'
  )
    .trim()
    .toLowerCase();
  const smbEmail = (
    process.env.SEED_DEMO_SMB_EMAIL || 'demo-studio@expo360.mx'
  )
    .trim()
    .toLowerCase();
  const interzektPassword =
    process.env.SEED_INTERZEKT_ADMIN_PASSWORD || temporaryPassword();
  const smbPassword =
    process.env.SEED_DEMO_SMB_PASSWORD || temporaryPassword();

  const interzekt = await getOrCreateUser(auth, {
    email: interzektEmail,
    displayName: 'Nicholas Gibler',
    password: interzektPassword,
  });
  await db.collection('users').doc(interzekt.user.uid).set(
    {
      email: interzektEmail,
      displayName: 'Nicholas Gibler',
      role: 'interzekt_admin',
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  const smb = await getOrCreateUser(auth, {
    email: smbEmail,
    displayName: 'Casa Norte Admin',
    password: smbPassword,
  });

  const clientId = 'demo-casa-norte-studio';
  const publicSlug = 'casa-norte-expo';
  const eventPageId = 'primary';
  const clientRef = db.collection('clients').doc(clientId);
  const eventPageRef = clientRef.collection('eventPages').doc(eventPageId);
  const memberRef = clientRef.collection('members').doc(smb.user.uid);
  const publicSlugRef = db.collection('publicSlugs').doc(publicSlug);

  const batch = db.batch();

  batch.set(
    clientRef,
    {
      slug: publicSlug,
      name: 'Casa Norte Studio',
      status: 'active',
      billingStatus: 'manual',
      publishEntitlement: false,
      defaultEventPageId: eventPageId,
      logoUrl: '',
      theme: {
        primaryColor: '#155e75',
        accentColor: '#d97706',
        backgroundColor: '#f8fafc',
        textColor: '#111827',
      },
      contact: {
        name: 'Casa Norte Events',
        email: smbEmail,
        phone: '+52 81 0000 0000',
        website: 'https://example.com',
        location: 'Monterrey, Nuevo Leon',
      },
      integrations: {
        crmProvider: 'HubSpot placeholder',
        crmNotes: 'Route Expo360 leads into the SMB CRM after v1 validation.',
        stripeAccountMode: 'not_configured',
      },
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    eventPageRef,
    {
      clientId,
      slug: publicSlug,
      title: 'Casa Norte en Expo Habitat',
      subtitle: 'Mobiliario exterior y piezas listas para eventos de hospitalidad.',
      location: 'Cintermex, Monterrey',
      eventDate: 'May 2026',
      intro:
        'Explora las piezas destacadas, selecciona los productos que te interesan y nuestro equipo dará seguimiento con precios, tiempos de entrega y detalles de instalación.',
      ctaLabel: 'Solicitar información',
      status: 'draft',
      settings: {
        heroImageUrl: '/demo_furniture/couch.png',
        leadFormTitle: 'Habla con Casa Norte',
        showPoweredBy: false,
      },
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    db.collection('users').doc(smb.user.uid),
    {
      email: smbEmail,
      displayName: 'Casa Norte Admin',
      role: 'smb_admin',
      clientId,
      updatedAt: now,
      createdAt: now,
    },
    { merge: true }
  );

  batch.set(
    memberRef,
    {
      uid: smb.user.uid,
      email: smbEmail,
      displayName: 'Casa Norte Admin',
      role: 'owner',
      status: 'active',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  batch.set(
    publicSlugRef,
    {
      clientId,
      eventPageId,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  const products = [
    {
      id: 'modular-lounge',
      sku: 'CN-LOUNGE-01',
      name: 'Sala modular lounge',
      price: '$42,000 MXN',
      imageUrls: ['/demo_furniture/couch.png'],
      description:
        'Sala configurable para terrazas, lobbies y áreas de hospitalidad en eventos.',
      details: { Material: 'Aluminio con pintura electrostática', Entrega: '4 semanas' },
      sortOrder: 1,
    },
    {
      id: 'woven-chair',
      sku: 'CN-CHAIR-02',
      name: 'Silla de comedor tejida',
      price: '$5,900 MXN',
      imageUrls: ['/demo_furniture/chair.png'],
      description:
        'Silla para exterior con formato compacto para restaurantes y showrooms.',
      details: { Material: 'Ratán sintético', Apilable: 'Sí' },
      sortOrder: 2,
    },
    {
      id: 'shade-daybed',
      sku: 'CN-DAYBED-03',
      name: 'Camastro con sombra',
      price: '$36,500 MXN',
      imageUrls: ['/demo_furniture/sun_bed.png'],
      description:
        'Camastro premium para albercas, rooftops de hotel y terrazas privadas.',
      details: { Tela: 'Exterior de alto desempeño', Garantía: '2 años' },
      sortOrder: 3,
    },
  ];

  for (const product of products) {
    batch.set(
      clientRef.collection('products').doc(product.id),
      {
        ...product,
        currency: 'MXN',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  }

  await batch.commit();

  console.log('Firebase v1 seed complete.');
  console.log(`Interzekt admin: ${interzektEmail}`);
  console.log(`Interzekt dev password: ${interzekt.password}`);
  console.log(`Demo SMB admin: ${smbEmail}`);
  console.log(`Demo SMB dev password: ${smb.password}`);
  console.log(`Demo event page: /c/${publicSlug} (draft until published in /admin)`);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
