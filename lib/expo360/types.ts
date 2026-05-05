export type Expo360Role = 'interzekt_admin' | 'smb_admin';

export type SmbClientStatus = 'active' | 'suspended';
export type EventPageStatus = 'draft' | 'published' | 'archived';
export type PublicSlugStatus = 'draft' | 'published' | 'archived';
export type LeadStatus = 'nuevo' | 'contactado' | 'cotizado' | 'ganado' | 'perdido';

export interface UserContext {
  uid: string;
  email: string;
  displayName?: string;
  role: Expo360Role;
  clientId?: string;
}

export interface ClientTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
}

export interface ClientContact {
  name?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
}

export interface ClientIntegrationPlaceholders {
  crmProvider?: string;
  crmNotes?: string;
  stripeAccountMode?: 'not_configured' | 'customer_account' | 'interzekt_assisted';
}

export interface SmbClient {
  id: string;
  slug: string;
  name: string;
  status: SmbClientStatus;
  billingStatus: 'manual' | 'not_configured' | 'configured';
  publishEntitlement: boolean;
  defaultEventPageId: string;
  logoUrl?: string;
  theme: ClientTheme;
  contact: ClientContact;
  integrations: ClientIntegrationPlaceholders;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventPage {
  id: string;
  clientId: string;
  slug: string;
  title: string;
  subtitle?: string;
  location?: string;
  eventDate?: string;
  intro?: string;
  ctaLabel: string;
  status: EventPageStatus;
  settings: {
    heroImageUrl?: string;
    leadFormTitle?: string;
    showPoweredBy?: boolean;
    layoutTemplate?: 'coleccion' | 'galeria' | 'catalogo' | 'terminal';
  };
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

export interface Product {
  id: string;
  sku?: string;
  name: string;
  description?: string;
  price?: string;
  currency: string;
  imageUrls: string[];
  details: Record<string, string>;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  selectedProductIds: string[];
  sourceSlug: string;
  status: LeadStatus;
  notes?: string;
  createdAt?: string;
  statusUpdatedAt?: string;
}

export interface ClientBundle {
  client: SmbClient;
  eventPage: EventPage;
  products: Product[];
  leads: Lead[];
  leadCount: number;
}

export interface ClientSummary extends ClientBundle {
  adminEmail?: string;
  productCount: number;
}
