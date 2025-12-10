'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Wallet, Clock, TrendingUp, Lock, ArrowRight, ChevronDown } from 'lucide-react';

// Lazy load heavy Vortex animation to improve LCP
const Vortex = dynamic(() => import('@/ui/vortex').then(mod => ({ default: mod.Vortex })), {
  ssr: false,
  loading: () => null,
});

// Lightweight hook for CSS-based scroll animations (like PHP sites use)
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const StripeBenefitsPage = () => {
  const [isCardsDropdownOpen, setIsCardsDropdownOpen] = useState(false);
  const [showVortex, setShowVortex] = useState(false);

  // Delay Vortex rendering to prioritize LCP
  useEffect(() => {
    const timer = setTimeout(() => setShowVortex(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const supportedCardIssuers = [
    'Visa',
    'Mastercard',
    'American Express',
    'Afirme',
    'BanBajío',
    'Banjercito',
    'BBVA',
    'Banca Mifel',
    'Banco Azteca',
    'Banco Famsa',
    'Banco Invex',
    'Banco Multiva',
    'Banorte',
    'Banregio',
    'Caja Morelia Valladolid',
    'Citibanamex',
    'Falabella',
    'Hey Banco',
    'Inbursa',
    'Klar',
    'Konfio',
    'Liverpool',
    'NanoPay',
    'Nubank',
    'Santander',
    'Scotiabank',
    'Suburbia'
  ];

  // Scroll animation refs for each section
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const paymentsAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  interface PaymentMethod {
    name: string;
    description: string;
    logo: string | null;
    isDropdown?: boolean;
  }

  interface PaymentCategory {
    category: string;
    icon: string;
    methods: PaymentMethod[];
  }

  const paymentMethods: PaymentCategory[] = [
    {
      category: 'Carteras Digitales',
      icon: '💳',
      methods: [
        { name: 'Apple Pay', description: 'Pago rápido y seguro desde dispositivos Apple', logo: '/integration_logos/apple_pay.png' },
        { name: 'Google Pay', description: 'Cartera digital integrada en Android y navegadores', logo: '/integration_logos/google_pay.png' },
        { name: 'PayPal', description: 'Método de pago confiable utilizado por millones globalmente', logo: '/integration_logos/paypal.png' },
        { name: 'Amazon Pay', description: 'Experiencia de compra rápida con datos de Amazon', logo: '/integration_logos/amazonpay-logo-rgb_rev.png' }
      ]
    },
    {
      category: 'Pagos Locales en México',
      icon: '🇲🇽',
      methods: [
        { name: 'OXXO', description: 'Paga en más de 19,000 tiendas OXXO en México - 30%+ de transacciones locales', logo: '/integration_logos/oxxo-logo-vector-01.png' },
        { name: 'SPEI', description: 'Transferencias bancarias instantáneas en México - ideal para B2B', logo: '/integration_logos/spei-logo_brandlogos.net_xlhsk.png' }
      ]
    },
    {
      category: 'Tarjetas',
      icon: '🎫',
      methods: [
        { name: 'Todas las Tarjetas Aceptadas', description: 'Explora todos los bancos y redes de tarjetas soportadas', logo: null, isDropdown: true },
        { name: 'Meses sin intereses', description: 'Fracciona compras en 3, 6, 9, 12, 18 o 24 meses - aceptado en la mayoría de tarjetas de crédito mexicanas', logo: null }
      ]
    },
    {
      category: 'Pagos Internacionales',
      icon: '🌍',
      methods: [
        { name: 'Débito directo SEPA', description: 'Pagos recurrentes en 36 países europeos con costos bajos', logo: '/integration_logos/Flag_of_Europe.svg.png' },
        { name: 'ACH Direct Debit', description: 'Costos de transacción reducidos para pagos en EE.UU.', logo: '/integration_logos/usaflag.svg' }
      ]
    },
  ];

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Aumenta Conversiones',
      description: 'Ofrece 100+ métodos de pago y permite que tus clientes paguen como prefieren'
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Reduce Costos',
      description: 'Métodos como transferencias SEPA y débitos directo tienen tarifas más bajas'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Seguridad Garantizada',
      description: 'Cifrado AES-256 y cumplimiento PCI DSS Nivel 1 para proteger transacciones'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Ventas en Tiempo Real',
      description: 'Procesa pagos instantáneamente y recibe confirmaciones en segundos'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none"></div>
      <div className="relative z-10">
      {/* Navigation Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <div>
              <Image
                src="/expo360_logo.png"
                alt="Expo360 Logo"
                width={180}
                height={180}
                className="rounded-lg"
                priority
              />
            </div>

            {/* Center Nav Links */}
            <nav
              className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2"
            >
              <Link href="/porque-expo360" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                ¿Porqué Expo360?
              </Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                Precios
              </Link>
              <Link href="/preguntas-frecuentes" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                Preguntas Frecuentes
              </Link>
            </nav>

            {/* Right Auth Buttons */}
            <div className="flex gap-3">
              <Link
                href="/signin"
                className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 bg-linear-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/#pricing"
                className="px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Vortex Animation - lazy loaded to improve LCP */}
        {showVortex && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
            <Vortex backgroundColor="transparent" baseHue={270} rangeY={150} particleCount={300} />
          </div>
        )}
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>

        <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
          <div
            className={`text-center space-y-6 transition-all duration-700 ease-out ${
              heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h1 
              className="text-4xl md:text-6xl font-bold leading-tight pb-2 flex items-center justify-center gap-1"
            >
              <span className="relative inline-flex items-center translate-y-[3px]">
                <Image
                  src="/integration_logos/stripe_logo.png"
                  alt="Stripe"
                  width={180}
                  height={75}
                  className="h-12 md:h-16 w-auto object-contain"
                  priority
                  style={{
                    filter: 'brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(220deg)',
                  }}
                />
              </span>
              <span className="bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">+ </span>
              <span className="relative inline-flex items-center translate-y-[3px] ml-[60px]">
                <Image
                  src="/expo360_logo.png"
                  alt="Expo360"
                  width={300}
                  height={125}
                  className="h-[30rem] md:h-[42rem] w-auto object-contain absolute top-1/2 -translate-y-1/2 -left-[15px] scale-[2.25]"
                  priority
                />
                <span className="invisible h-12 md:h-16 w-[140px]"></span>
              </span>
            </h1>

            <p 
              className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${
                heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              Con Stripe™ integrado en Expo360, accede a más de 100 métodos de pago internacionales y maximiza tus ventas en tiempo real
            </p>

            {/* Stripe Hero Image */}
            <div
              className={`mt-12 relative h-80 md:h-96 rounded-2xl border border-purple-500/30 overflow-hidden group transition-all duration-700 ease-out delay-200 ${
                heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <Image
                src="/stripe_hero.png"
                alt="Stripe Payment Methods"
                fill
                className="object-cover object-top"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1024px"
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div ref={benefitsAnim.ref} className="max-w-6xl mx-auto">
          <div className={`mb-12 transition-all duration-700 ease-out ${
            benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Beneficios Principales
            </h2>
            <div className="h-1 w-24 bg-linear-to-r from-purple-600 to-blue-600 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => (
              <div
                key={idx}
                className={`bg-linear-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-500 ease-out ${
                  benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${150 + idx * 100}ms` }}
              >
                <div className="text-purple-400 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-purple-900/5 to-black">
        <div ref={paymentsAnim.ref} className="max-w-6xl mx-auto">
          <div className={`mb-12 transition-all duration-700 ease-out ${
            paymentsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Métodos de Pago Disponibles
            </h2>
            <p className="text-gray-300 text-center max-w-2xl mx-auto">
              Más de 100 formas de pago para que tus clientes elijan la que prefieren
            </p>
          </div>

          <div className="space-y-8">
            {paymentMethods.map((category, categoryIdx) => (
              <div
                key={categoryIdx}
                className={`bg-linear-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-500 ease-out ${
                  paymentsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${150 + categoryIdx * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-purple-300">{category.category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.methods.map((method, methodIdx) => (
                    <div key={methodIdx}>
                      {method.isDropdown ? (
                        <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-lg border-2 border-purple-500/50 hover:border-purple-500/80 transition-all overflow-hidden cursor-pointer">
                          <button
                            onClick={() => setIsCardsDropdownOpen(!isCardsDropdownOpen)}
                            className="w-full p-5 flex items-center justify-between hover:bg-purple-600/15 transition-all"
                          >
                            <div className="text-left flex-1">
                              <h4 className="font-bold text-white mb-2 text-lg">{method.name}</h4>
                              <p className="text-gray-300 text-sm">{method.description}</p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <ChevronDown 
                                className={`w-6 h-6 text-purple-400 transition-transform duration-300 ${
                                  isCardsDropdownOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </button>
                          
                          <div
                            className={`bg-purple-600/10 border-t-2 border-purple-500/30 overflow-hidden transition-all duration-300 ease-out ${
                              isCardsDropdownOpen ? 'max-h-96 opacity-100 p-5' : 'max-h-0 opacity-0 p-0'
                            }`}
                          >
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {supportedCardIssuers.map((issuer, idx) => (
                                <div key={idx} className="text-sm text-gray-200 py-2 px-3 bg-purple-600/20 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-all hover:bg-purple-600/30">
                                  {issuer}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-black/40 rounded-lg p-5 border border-white/5 hover:border-purple-500/20 transition-all h-full flex flex-col items-start">
                          {method.logo && (
                            <div className="mb-4 h-16 flex items-center">
                              <Image
                                src={method.logo}
                                alt={method.name}
                                width={100}
                                height={64}
                                className="object-contain max-h-16"
                                loading="lazy"
                              />
                            </div>
                          )}
                          <h4 className="font-semibold text-white mb-3 text-lg">{method.name}</h4>
                          <p className="text-gray-400 text-sm flex-grow">{method.description}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
          <div className={`bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${
            ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              ¿Listo para Maximizar tus Ventas?
            </h2>
            
            <p className="text-lg text-white/90 mb-10">
              Elige el Plan Anual y desbloquea todas las capacidades de Stripe™ con Expo360
            </p>

            <div className="flex flex-col items-center gap-4">
              {/* Primary Button */}
              <Link
                href="/#pricing"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
              >
                Ver Planes de Precios Expo360
                <ArrowRight className="w-5 h-5" />
              </Link>
              
              {/* Secondary Buttons Row */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
                <a
                  href="https://stripe.com/mx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/40 hover:bg-white/30 hover:border-white/60 transition-all duration-300"
                >
                  Crea Tu Cuenta con Stripe
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/528186931122?text=Estoy%20interesado%20en%20saber%20m%C3%A1s%20acerca%20de%20Expo360%20by%20Interzekt%20y%20su%20integraci%C3%B3n%20con%20Stripe%E2%84%A2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#32dbbf]/10 font-semibold rounded-lg border border-[#32dbbf] hover:bg-[#32dbbf]/20 transition-all duration-300"
                  style={{ color: '#32dbbf' }}
                >
                  Escríbenos por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>© 2025 <span className="bg-linear-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-semibold">Expo360</span> por <a href="https://interzekt.com" target="_blank" rel="noopener noreferrer" className="bg-linear-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Interzekt.com</a>. Todos los derechos reservados.</p>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default StripeBenefitsPage;
