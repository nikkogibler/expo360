// Event pass configuration for Stripe integration
// These are one-time payments to "publish" or "go live" with a showroom

export const EVENT_PASSES = [
  {
    id: 'single-event',
    priceId: 'price_1SmwonH0qG3oBxFO35zjl8Xh',
    price: 15000, // 15,000 MXN
    currency: 'MXN',
    name: 'Pase de Evento Único',
    description: 'Publica tu showroom virtual durante 60 días',
    duration: '60 días',
    billingType: 'one-time' as const,
    monthlyAmount: null,
    features: [
      'Showroom virtual publicado',
      'Catálogo de productos ilimitado',
      'Códigos QR personalizados',
      'Soporte por email',
    ],
    popular: false,
    badge: null,
  },
  {
    id: 'yearly-onetime',
    priceId: 'price_1SmxBtH0qG3oBxFOMK7ubklK',
    price: 85000, // 85,000 MXN
    currency: 'MXN',
    name: 'Pase Anual (Pago Único)',
    description: 'Eventos ilimitados durante 12 meses (pago completo)',
    duration: '12 meses',
    billingType: 'one-time' as const,
    monthlyAmount: null,
    features: [
      'Showroom virtual publicado',
      'Catálogo de productos ilimitado',
      'Códigos QR personalizados',
      'Soporte prioritario',
      'Analytics avanzados',
      'Múltiples eventos por año',
    ],
    popular: false,
    badge: null,
  },
  {
    id: 'yearly-monthly',
    priceId: 'price_1SmxBtH0qG3oBxFO9qNzKi72',
    price: 85000, // 85,000 MXN total (7,083.33/month)
    currency: 'MXN',
    name: 'Pase Anual (12 Cuotas)',
    description: 'Eventos ilimitados durante 12 meses (12 pagos mensuales)',
    duration: '12 meses',
    billingType: 'recurring' as const,
    monthlyAmount: 7083.33,
    features: [
      'Showroom virtual publicado',
      'Catálogo de productos ilimitado',
      'Códigos QR personalizados',
      'Soporte prioritario',
      'Analytics avanzados',
      'Múltiples eventos por año',
    ],
    popular: true,
    badge: 'Más Elegido',
  },
] as const;

export type EventPass = (typeof EVENT_PASSES)[number];
