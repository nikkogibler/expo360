// Credit package configuration for Stripe integration
export const CREDIT_PACKAGES = [
  {
    id: 'starter',
    priceId: 'price_1SBeMEH0qG3oBxFONkrGGuOm',
    credits: 100,
    name: 'Recarga Básica',
    description: 'Ideal para añadir algunas variantes a tus productos favoritos',
    badge: null,
    popular: false
  },
  {
    id: 'popular',
    priceId: 'price_1SBeMEH0qG3oBxFOGsys2N8B',
    credits: 200,
    name: 'Recarga Popular',
    description: 'Perfecto para crear múltiples variantes de acabados y telas',
    badge: 'Más Elegido',
    popular: true
  },
  {
    id: 'professional',
    priceId: 'price_1SBeMEH0qG3oBxFOYQYsDEPA',
    credits: 500,
    name: 'Recarga Profesional',
    description: 'Para expandir colecciones completas con todos los acabados disponibles',
    badge: null,
    popular: false
  },
  {
    id: 'business',
    priceId: 'price_1SBeMEH0qG3oBxFOb6UEGCpP',
    credits: 1300,
    name: 'Recarga Empresarial',
    description: 'Libertad total para crear catálogos extensos y nuevas líneas de productos',
    badge: 'Mejor Valor',
    popular: false
  }
] as const;

export type CreditPackage = typeof CREDIT_PACKAGES[number];