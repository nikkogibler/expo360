'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Smartphone, Lock, Zap, CreditCard, ArrowRight, CheckCircle2, HelpCircle, Wallet } from 'lucide-react';
import FactSheet from '@/components/FactSheet';

// Lightweight hook for CSS-based scroll animations
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

const ApplePayPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const howItWorksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Pago Ultra Rápido',
      description: 'Tus clientes completan compras con un toque en su dispositivo Apple - sin llenar formularios'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Seguridad de Nivel Bancario',
      description: 'Tokenización y autenticación biométrica (Face ID / Touch ID) protegen cada transacción'
    },
    {
      icon: <Wallet className="w-8 h-8" />,
      title: 'Compatible Globalmente',
      description: 'Aceptado en 100+ países con más de 2 mil millones de usuarios Apple en el mundo'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Reducción de Carrito Abandonado',
      description: 'La velocidad de Apple Pay puede reducir abandonos hasta 40% en algunos segmentos'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Cliente Selecciona Apple Pay',
      description: 'En el checkout, elige Apple Pay como método de pago'
    },
    {
      number: '2',
      title: 'Autenticación Biométrica',
      description: 'Confirma con Face ID o Touch ID en su dispositivo Apple'
    },
    {
      number: '3',
      title: 'Pago Instantáneo',
      description: 'La transacción se procesa en milisegundos de forma segura'
    },
    {
      number: '4',
      title: 'Confirmación Automática',
      description: 'Recibes la confirmación y el pedido se activa inmediatamente'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona Apple Pay?',
      answer: 'El cliente toca el botón de Apple Pay en tu checkout. Se abre una pantalla de confirmación donde valida con Face ID o Touch ID, y la compra se completa instantáneamente usando la tarjeta guardada en su dispositivo Apple.'
    },
    {
      question: '¿Cuánto cuesta aceptar Apple Pay?',
      answer: 'Apple Pay utiliza las mismas tarifas de procesamiento que Stripe: 3.6% + $3 MXN para tarjetas en México. No hay costos adicionales por usar Apple Pay específicamente.'
    },
    {
      question: '¿Cuáles son los requisitos para ofrecer Apple Pay?',
      answer: 'Tu sitio debe estar en HTTPS, tener un certificado SSL válido, y estar disponible públicamente. En Expo360, todo esto está configurado automáticamente, así que Apple Pay funciona de inmediato.'
    },
    {
      question: '¿Qué dispositivos Apple soportan Apple Pay?',
      answer: 'iPhone 6 y posteriores, iPad Air 2 y posteriores, iPad Mini 3 y posteriores, y todos los Apple Watch. Esencialmente, casi todos los dispositivos Apple modernos.'
    },
    {
      question: '¿Dónde puedo ver dónde está disponible Apple Pay?',
      answer: 'Apple Pay está disponible en más de 100 países y regiones. En México está completamente disponible. El botón de Apple Pay aparece automáticamente en navegadores y dispositivos que lo soportan.'
    },
    {
      question: '¿Puedo ofrecer Apple Pay junto con otros métodos?',
      answer: 'Sí, de hecho lo recomendamos. Con Expo360 + Stripe puedes ofrecer Apple Pay, Google Pay, tarjetas, OXXO, SPEI y más - dejando que tus clientes elijan su favorito.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-linear-to-br from-gray-900/20 via-black to-gray-900/20 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-gray-600 text-white px-4 py-2 rounded-lg z-100">
          Saltar al contenido principal
        </a>

        {/* Navigation Header */}
        <header className="absolute top-0 left-0 right-0 z-50" role="banner">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
            <div className="flex items-center justify-between">
              <Link href="/" className="block" aria-label="Ir a página principal de Expo360">
                <Image
                  src="/expo360_logo.png"
                  alt="Expo360 - Showroom Virtual 3D"
                  width={180}
                  height={180}
                  className="rounded-lg"
                  priority
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2" aria-label="Navegación principal">
                <Link href="/stripe-benefits" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  Stripe + Expo360
                </Link>
                <Link href="/#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  Precios
                </Link>
                <Link href="/preguntas-frecuentes" className="text-gray-300 hover:text-white transition text-sm font-medium">
                  Preguntas Frecuentes
                </Link>
              </nav>

              <div className="flex gap-3">
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-gray-400 via-gray-300 to-gray-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-linear-to-r from-gray-700 to-gray-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-gray-600/50 transition-all duration-300">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main id="main-content" role="main">
          {/* Hero Section */}
          <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden" aria-labelledby="hero-title">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gray-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* Apple Pay Logo */}
                <div className="flex justify-center mb-8">
                  <div className="p-8">
                    <Image
                      src="/integration_logos/apple_pay_big.png"
                      alt="Apple Pay"
                      width={560}
                      height={240}
                      className="h-48 md:h-64 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-linear-to-r from-gray-300 via-white to-gray-300 bg-clip-text text-transparent">
                    Pagos Instantáneos
                  </span>
                  <br />
                  <span className="text-white">con Apple Pay en Tu Showroom Virtual</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Con <strong>Apple Pay + Expo360</strong>, tus clientes de iPhone, iPad y Mac pueden completar compras en un toque. Ultra seguro con <em>Face ID o Touch ID</em>, aceptado en <strong>100+ países</strong>.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-linear-to-br from-gray-600/20 to-gray-600/20 rounded-xl p-4 border border-gray-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-gray-300">100+</div>
                    <div className="text-sm text-gray-400">Países</div>
                  </div>
                  <div className="bg-linear-to-br from-gray-600/20 to-gray-600/20 rounded-xl p-4 border border-gray-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-gray-300">2B+</div>
                    <div className="text-sm text-gray-400">Usuarios Apple</div>
                  </div>
                  <div className="bg-linear-to-br from-gray-600/20 to-gray-600/20 rounded-xl p-4 border border-gray-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-gray-300">1 Toque</div>
                    <div className="text-sm text-gray-400">Para Pagar</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="benefits-title">
            <div ref={benefitsAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="benefits-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Por Qué Ofrecer Apple Pay?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Velocidad, seguridad y cobertura global para que tus clientes paguen cómodamente
                </p>
                <div className="h-1 w-24 bg-linear-to-r from-gray-600 to-gray-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-linear-to-br from-gray-600/10 to-gray-600/10 border border-gray-500/30 rounded-xl p-6 hover:border-gray-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    <div className="text-gray-400 mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-gray-900/5 to-black" aria-labelledby="how-it-works-title">
            <div ref={howItWorksAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Cómo Funciona Apple Pay?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Pago completado en segundos con máxima seguridad
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`relative text-center transition-all duration-500 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-gray-500/50 to-gray-500/50" aria-hidden="true"></div>
                    )}
                    
                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-gray-700 to-gray-600 flex items-center justify-center text-2xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="faq-title">
            <div ref={faqAnim.ref} className="max-w-3xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="faq-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Preguntas Frecuentes sobre Apple Pay
                </h2>
                <div className="h-1 w-24 bg-linear-to-r from-gray-600 to-gray-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-8">
                {faqs.map((faq, idx) => (
                  <article
                    key={idx}
                    className={`border-b border-gray-500/20 pb-8 last:border-0 transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-gray-400 shrink-0" />
                      {faq.question}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Quick Reference Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-gray-900/5 to-black" aria-labelledby="reference-title">
            <div className="max-w-4xl mx-auto">
              <header className="mb-12 text-center">
                <h2 id="reference-title" className="text-3xl md:text-4xl font-bold mb-4">Apple Pay de Un Vistazo</h2>
                <p className="text-gray-400">Todos los números que necesitas saber</p>
              </header>
              <FactSheet 
                title="Resumen de Apple Pay"
                className="max-w-2xl mx-auto mb-8"
                facts={[
                  { label: 'Disponibilidad', value: '100+ países y regiones', icon: <Wallet className="w-5 h-5" /> },
                  { label: 'Método de Pago', value: 'Billetera Digital (1-Tap)', icon: <CreditCard className="w-5 h-5" /> },
                  { label: 'Seguridad', value: 'Face ID / Touch ID + Tokenización', icon: <Lock className="w-5 h-5" /> },
                  { label: 'Velocidad', value: 'Instantáneo (Milisegundos)', icon: <Zap className="w-5 h-5" /> },
                ]}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
              <aside className={`bg-linear-to-r from-gray-700 to-gray-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Empieza a Aceptar Apple Pay Hoy
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Con el Plan Anual de Expo360, activa Apple Pay y más de 100 métodos de pago automáticamente
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-gray-700 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
                  >
                    Ver Planes de Expo360
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/stripe-benefits#metodos-de-pago"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 text-white font-semibold rounded-xl border border-white/40 hover:bg-white/30 transition-all duration-300"
                  >
                    Ver Todos los Métodos de Pago
                  </Link>
                </div>
              </aside>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="relative py-8 px-4 sm:px-6 lg:px-8" role="contentinfo">
          <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
            <p>© 2025 <Link href="/" className="bg-linear-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Expo360</Link> por <a href="https://interzekt.com" target="_blank" rel="noopener noreferrer" className="bg-linear-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Interzekt.com</a></p>
            <div className="mt-4 flex justify-center gap-6 text-xs">
              <Link href="/stripe-benefits" className="hover:text-white transition">Stripe + Expo360</Link>
              <Link href="/pagos-oxxo" className="hover:text-white transition">Pagos OXXO</Link>
              <Link href="/pagos-spei" className="hover:text-white transition">Pagos SPEI</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ApplePayPage;
