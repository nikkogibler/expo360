import 'server-only';

import { randomBytes } from 'crypto';
import { FieldValue, type DocumentData } from 'firebase-admin/firestore';

import { getFirebaseAdminAuth, getFirebaseAdminDb } from '@/lib/firebase/admin';
import type {
  ClientBundle,
  ClientSummary,
  ClientTheme,
  EventPage,
  Lead,
  LeadStatus,
  Product,
  SmbClient,
} from '@/lib/expo360/types';

const DEFAULT_EVENT_PAGE_ID = 'primary';
export const leadStatuses: LeadStatus[] = [
  'nuevo',
  'contactado',
  'cotizado',
  'ganado',
  'perdido',
];

export const defaultClientTheme: ClientTheme = {
  primaryColor: '#155e75',
  accentColor: '#f59e0b',
  backgroundColor: '#f8fafc',
  textColor: '#111827',
};

export function normalizeSlug(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);

  return normalized || `event-${randomBytes(3).toString('hex')}`;
}

function timestamp() {
  return FieldValue.serverTimestamp();
}

function toIso(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return value.toDate().toISOString();
  }

  return undefined;
}

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object') return {};

  return Object.entries(value as Record<string, unknown>).reduce(
    (acc, [key, item]) => {
      if (typeof item === 'string' && item.trim()) acc[key] = item;
      return acc;
    },
    {} as Record<string, string>
  );
}

function serializeClient(id: string, data: DocumentData): SmbClient {
  return {
    id,
    slug: data.slug || id,
    name: data.name || 'Untitled SMB',
    status: data.status === 'suspended' ? 'suspended' : 'active',
    billingStatus:
      data.billingStatus === 'configured'
        ? 'configured'
        : data.billingStatus === 'manual'
          ? 'manual'
          : 'not_configured',
    publishEntitlement: Boolean(data.publishEntitlement),
    defaultEventPageId: data.defaultEventPageId || DEFAULT_EVENT_PAGE_ID,
    logoUrl: data.logoUrl || undefined,
    theme: {
      ...defaultClientTheme,
      ...(data.theme || {}),
    },
    contact: data.contact || {},
    integrations: data.integrations || {},
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function serializeEventPage(
  id: string,
  clientId: string,
  data: DocumentData
): EventPage {
  const status =
    data.status === 'published' || data.status === 'archived'
      ? data.status
      : 'draft';

  return {
    id,
    clientId,
    slug: data.slug || '',
    title: data.title || 'Event landing page',
    subtitle: data.subtitle || '',
    location: data.location || '',
    eventDate: data.eventDate || '',
    intro: data.intro || '',
    ctaLabel: data.ctaLabel || 'Request information',
    status,
    settings: {
      leadFormTitle: 'Request information',
      showPoweredBy: false,
      ...(data.settings || {}),
    },
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
    publishedAt: toIso(data.publishedAt),
  };
}

function serializeProduct(id: string, data: DocumentData): Product {
  return {
    id,
    sku: data.sku || '',
    name: data.name || 'Untitled product',
    description: data.description || '',
    price: data.price || '',
    currency: data.currency || 'MXN',
    imageUrls: Array.isArray(data.imageUrls)
      ? data.imageUrls.filter((url: unknown) => typeof url === 'string')
      : [],
    details: asStringRecord(data.details),
    isActive: data.isActive !== false,
    sortOrder:
      typeof data.sortOrder === 'number'
        ? data.sortOrder
        : Number.MAX_SAFE_INTEGER,
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

function serializeLead(id: string, data: DocumentData): Lead {
  const status = leadStatuses.includes(data.status) ? data.status : 'nuevo';

  return {
    id,
    fullName: data.fullName || '',
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    message: data.message || '',
    selectedProductIds: Array.isArray(data.selectedProductIds)
      ? data.selectedProductIds.filter((item: unknown) => typeof item === 'string')
      : [],
    sourceSlug: data.sourceSlug || '',
    status,
    notes: data.notes || '',
    createdAt: toIso(data.createdAt),
    statusUpdatedAt: toIso(data.statusUpdatedAt),
  };
}

async function getPrimaryEventPage(clientId: string, preferredId?: string) {
  const db = getFirebaseAdminDb();
  const eventPagesRef = db.collection('clients').doc(clientId).collection('eventPages');

  if (preferredId) {
    const preferred = await eventPagesRef.doc(preferredId).get();
    if (preferred.exists) {
      return serializeEventPage(preferred.id, clientId, preferred.data() || {});
    }
  }

  const eventPages = await eventPagesRef.limit(1).get();
  const first = eventPages.docs[0];

  if (!first) return null;

  return serializeEventPage(first.id, clientId, first.data());
}

async function listClientProducts(clientId: string) {
  const snapshot = await getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('products')
    .get();

  return snapshot.docs
    .map((doc) => serializeProduct(doc.id, doc.data()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export async function listClientLeads(clientId: string, limit = 250) {
  const snapshot = await getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('leads')
    .orderBy('createdAt', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => serializeLead(doc.id, doc.data()));
}

export async function updateClientLead(
  clientId: string,
  leadId: string,
  input: { status?: LeadStatus; notes?: string }
) {
  const update: Record<string, unknown> = {
    updatedAt: timestamp(),
  };

  if (input.status) {
    if (!leadStatuses.includes(input.status)) {
      throw new Error('Invalid lead status.');
    }

    update.status = input.status;
    update.statusUpdatedAt = timestamp();
  }

  if (typeof input.notes === 'string') {
    update.notes = input.notes;
  }

  const leadRef = getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('leads')
    .doc(leadId);
  const leadDoc = await leadRef.get();

  if (!leadDoc.exists) {
    throw new Error('Lead not found.');
  }

  await leadRef.set(update, { merge: true });
  const updatedDoc = await leadRef.get();

  return serializeLead(updatedDoc.id, updatedDoc.data() || {});
}

export async function getClientBundle(clientId: string): Promise<ClientBundle | null> {
  const db = getFirebaseAdminDb();
  const clientDoc = await db.collection('clients').doc(clientId).get();

  if (!clientDoc.exists) return null;

  const client = serializeClient(clientDoc.id, clientDoc.data() || {});
  const eventPage = await getPrimaryEventPage(client.id, client.defaultEventPageId);

  if (!eventPage) return null;

  const [products, leads] = await Promise.all([
    listClientProducts(client.id),
    listClientLeads(client.id),
  ]);

  return {
    client,
    eventPage,
    products,
    leads,
    leadCount: leads.length,
  };
}

export async function listClientsWithSummary(): Promise<ClientSummary[]> {
  const db = getFirebaseAdminDb();
  const snapshot = await db.collection('clients').limit(100).get();

  const summaries = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const client = serializeClient(doc.id, doc.data());
      const [eventPage, products, leads, members] = await Promise.all([
        getPrimaryEventPage(client.id, client.defaultEventPageId),
        listClientProducts(client.id),
        listClientLeads(client.id, 250),
        db.collection('clients').doc(client.id).collection('members').limit(1).get(),
      ]);

      return {
        client,
        eventPage:
          eventPage ||
          serializeEventPage(DEFAULT_EVENT_PAGE_ID, client.id, {
            slug: client.slug,
            title: `Página del evento de ${client.name}`,
          }),
        products,
        leads,
        leadCount: leads.length,
        productCount: products.length,
        adminEmail: members.docs[0]?.data().email,
      };
    })
  );

  return summaries.sort((a, b) => a.client.name.localeCompare(b.client.name));
}

async function getUniquePublicSlug(baseSlug: string) {
  const db = getFirebaseAdminDb();
  let candidate = normalizeSlug(baseSlug);
  let index = 2;

  while ((await db.collection('publicSlugs').doc(candidate).get()).exists) {
    candidate = `${normalizeSlug(baseSlug)}-${index}`;
    index += 1;
  }

  return candidate;
}

function generateTemporaryPassword() {
  return `Expo360-${randomBytes(8).toString('base64url')}!1`;
}

export async function createSmbWorkspace(input: {
  name: string;
  adminEmail: string;
  adminName?: string;
  slug?: string;
}) {
  const db = getFirebaseAdminDb();
  const auth = getFirebaseAdminAuth();
  const name = input.name.trim();
  const adminEmail = input.adminEmail.trim().toLowerCase();
  const adminName = input.adminName?.trim() || name;
  const publicSlug = await getUniquePublicSlug(input.slug || name);
  const clientId = db.collection('clients').doc().id;
  const temporaryPassword = generateTemporaryPassword();

  let userRecord;
  let createdAuthUser = false;

  try {
    userRecord = await auth.getUserByEmail(adminEmail);
  } catch {
    userRecord = await auth.createUser({
      email: adminEmail,
      displayName: adminName,
      emailVerified: true,
      password: temporaryPassword,
    });
    createdAuthUser = true;
  }

  const clientRef = db.collection('clients').doc(clientId);
  const eventPageRef = clientRef.collection('eventPages').doc(DEFAULT_EVENT_PAGE_ID);
  const userRef = db.collection('users').doc(userRecord.uid);
  const memberRef = clientRef.collection('members').doc(userRecord.uid);
  const slugRef = db.collection('publicSlugs').doc(publicSlug);

  await db.runTransaction(async (transaction) => {
    transaction.set(clientRef, {
      slug: publicSlug,
      name,
      status: 'active',
      billingStatus: 'manual',
      publishEntitlement: false,
      defaultEventPageId: DEFAULT_EVENT_PAGE_ID,
      theme: defaultClientTheme,
      contact: {
        name: adminName,
        email: adminEmail,
      },
      integrations: {
        crmProvider: '',
        crmNotes: '',
        stripeAccountMode: 'not_configured',
      },
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });

    transaction.set(eventPageRef, {
      clientId,
      slug: publicSlug,
      title: `Página del evento de ${name}`,
      subtitle: 'Un catálogo curado para generar nuevas conversaciones comerciales.',
      location: '',
      eventDate: '',
      intro:
        'Explora productos destacados, solicita detalles y conecta con nuestro equipo durante el evento.',
      ctaLabel: 'Solicitar información',
      status: 'draft',
      settings: {
        leadFormTitle: 'Solicitar información',
        showPoweredBy: false,
      },
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });

    transaction.set(
      userRef,
      {
        email: adminEmail,
        displayName: adminName,
        role: 'smb_admin',
        clientId,
        updatedAt: timestamp(),
        createdAt: timestamp(),
      },
      { merge: true }
    );

    transaction.set(memberRef, {
      uid: userRecord.uid,
      email: adminEmail,
      displayName: adminName,
      role: 'owner',
      status: 'active',
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });

    transaction.set(slugRef, {
      clientId,
      eventPageId: DEFAULT_EVENT_PAGE_ID,
      status: 'draft',
      createdAt: timestamp(),
      updatedAt: timestamp(),
    });
  });

  return {
    bundle: await getClientBundle(clientId),
    temporaryPassword: createdAuthUser ? temporaryPassword : undefined,
    authUserCreated: createdAuthUser,
  };
}

export async function setEventPagePublishState(clientId: string, published: boolean) {
  const db = getFirebaseAdminDb();
  const bundle = await getClientBundle(clientId);

  if (!bundle) {
    throw new Error('SMB customer not found.');
  }

  const eventPageRef = db
    .collection('clients')
    .doc(clientId)
    .collection('eventPages')
    .doc(bundle.eventPage.id);
  const clientRef = db.collection('clients').doc(clientId);
  const slugRef = db.collection('publicSlugs').doc(bundle.eventPage.slug);

  await db.runTransaction(async (transaction) => {
    transaction.set(
      clientRef,
      {
        publishEntitlement: published,
        updatedAt: timestamp(),
      },
      { merge: true }
    );
    transaction.set(
      eventPageRef,
      {
        status: published ? 'published' : 'draft',
        publishedAt: published ? timestamp() : FieldValue.delete(),
        updatedAt: timestamp(),
      },
      { merge: true }
    );
    transaction.set(
      slugRef,
      {
        clientId,
        eventPageId: bundle.eventPage.id,
        status: published ? 'published' : 'draft',
        updatedAt: timestamp(),
      },
      { merge: true }
    );
  });

  return getClientBundle(clientId);
}

export async function updateClientBranding(
  clientId: string,
  input: Partial<Pick<SmbClient, 'name' | 'logoUrl' | 'theme' | 'contact' | 'integrations'>>
) {
  const update: Record<string, unknown> = {
    updatedAt: timestamp(),
  };

  if (input.name?.trim()) update.name = input.name.trim();
  if (typeof input.logoUrl === 'string') update.logoUrl = input.logoUrl;
  if (input.theme) update.theme = { ...defaultClientTheme, ...input.theme };
  if (input.contact) update.contact = input.contact;
  if (input.integrations) update.integrations = input.integrations;

  await getFirebaseAdminDb().collection('clients').doc(clientId).set(update, {
    merge: true,
  });

  return getClientBundle(clientId);
}

export async function updateEventPage(
  clientId: string,
  eventPageId: string,
  input: Partial<EventPage>
) {
  const update: Record<string, unknown> = {
    updatedAt: timestamp(),
  };

  for (const key of ['title', 'subtitle', 'location', 'eventDate', 'intro', 'ctaLabel'] as const) {
    if (typeof input[key] === 'string') update[key] = input[key];
  }

  if (input.settings) update.settings = input.settings;

  await getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('eventPages')
    .doc(eventPageId)
    .set(update, { merge: true });

  return getClientBundle(clientId);
}

export async function createProduct(
  clientId: string,
  input: Partial<Product> & { name: string }
) {
  const productRef = getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('products')
    .doc();

  await productRef.set({
    sku: input.sku || '',
    name: input.name.trim(),
    description: input.description || '',
    price: input.price || '',
    currency: input.currency || 'MXN',
    imageUrls: input.imageUrls || [],
    details: input.details || {},
    isActive: input.isActive !== false,
    sortOrder:
      typeof input.sortOrder === 'number'
        ? input.sortOrder
        : Date.now(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  });

  return getClientBundle(clientId);
}

export async function updateProduct(
  clientId: string,
  productId: string,
  input: Partial<Product>
) {
  const update: Record<string, unknown> = {
    updatedAt: timestamp(),
  };

  for (const key of ['sku', 'name', 'description', 'price', 'currency'] as const) {
    if (typeof input[key] === 'string') update[key] = input[key];
  }

  if (Array.isArray(input.imageUrls)) update.imageUrls = input.imageUrls;
  if (input.details) update.details = input.details;
  if (typeof input.isActive === 'boolean') update.isActive = input.isActive;
  if (typeof input.sortOrder === 'number') update.sortOrder = input.sortOrder;

  await getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('products')
    .doc(productId)
    .set(update, { merge: true });

  return getClientBundle(clientId);
}

export async function deleteProduct(clientId: string, productId: string) {
  await getFirebaseAdminDb()
    .collection('clients')
    .doc(clientId)
    .collection('products')
    .doc(productId)
    .delete();

  return getClientBundle(clientId);
}

export async function getClientBundleBySlug(
  slug: string,
  options: { includeDraft?: boolean } = {}
) {
  const db = getFirebaseAdminDb();
  const publicSlug = await db.collection('publicSlugs').doc(slug).get();

  if (!publicSlug.exists) return null;

  const mapping = publicSlug.data() || {};
  const bundle = await getClientBundle(mapping.clientId);

  if (!bundle) return null;
  if (!options.includeDraft && bundle.eventPage.status !== 'published') return null;

  return bundle;
}

export async function createLeadForSlug(
  slug: string,
  input: Omit<
    Lead,
    | 'id'
    | 'sourceSlug'
    | 'createdAt'
    | 'selectedProductIds'
    | 'status'
    | 'notes'
    | 'statusUpdatedAt'
  > & {
    selectedProductIds?: string[];
  }
) {
  const bundle = await getClientBundleBySlug(slug, { includeDraft: true });

  if (!bundle || bundle.eventPage.status !== 'published') {
    throw new Error('This event landing page is not available.');
  }

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (!fullName || !email) {
    throw new Error('Name and email are required.');
  }

  const leadRef = getFirebaseAdminDb()
    .collection('clients')
    .doc(bundle.client.id)
    .collection('leads')
    .doc();

  await leadRef.set({
    fullName,
    email,
    phone: input.phone || '',
    company: input.company || '',
    message: input.message || '',
    selectedProductIds: input.selectedProductIds || [],
    sourceSlug: slug,
    eventPageId: bundle.eventPage.id,
    status: 'nuevo',
    notes: '',
    statusUpdatedAt: timestamp(),
    createdAt: timestamp(),
  });

  return { id: leadRef.id };
}
