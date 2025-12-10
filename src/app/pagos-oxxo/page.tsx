'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Store, Clock, Shield, Receipt, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';

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

const PagosOxxoPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const howItWorksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <Store className="w-8 h-8" />,
      title: '+19,000 Puntos de Pago',
      description: 'Tus clientes pueden pagar en cualquiera de las más de 19,000 tiendas OXXO en todo México'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Sin Necesidad de Tarjeta',
      description: 'Ideal para clientes sin cuenta bancaria o que prefieren pagar en efectivo de forma segura'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: '72 Horas para Pagar',
      description: 'Los vouchers tienen vigencia de 3 días, dando flexibilidad a tus clientes'
    },
    {
      icon: <Receipt className="w-8 h-8" />,
      title: 'Confirmación Automática',
      description: 'Recibe notificación instantánea cuando el pago se complete en tienda'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Cliente Selecciona OXXO',
      description: 'En el checkout de tu showroom virtual, el cliente elige pagar con OXXO'
    },
    {
      number: '2',
      title: 'Genera Voucher',
      description: 'Se genera automáticamente un voucher con código de barras único'
    },
    {
      number: '3',
      title: 'Pago en Tienda',
      description: 'El cliente presenta el voucher en cualquier OXXO y paga en efectivo'
    },
    {
      number: '4',
      title: 'Confirmación Instantánea',
      description: 'Recibes la confirmación del pago y el pedido se procesa automáticamente'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona el pago con OXXO?',
      answer: 'El cliente recibe un voucher con código de barras único al finalizar su compra. Tiene hasta 72 horas para ir a cualquier tienda OXXO en México y pagar en efectivo. Una vez pagado, recibes confirmación automática y el pedido se procesa.'
    },
    {
      question: '¿Cuánto cuesta aceptar pagos con OXXO?',
      answer: 'Stripe cobra aproximadamente 3% + $10 MXN por transacción con OXXO. No hay costos mensuales adicionales ni mínimos de transacción. Solo pagas por lo que vendes.'
    },
    {
      question: '¿Cuánto tiempo tiene el cliente para pagar?',
      answer: 'Por defecto, los vouchers de OXXO tienen una vigencia de 72 horas (3 días) para realizar el pago. Si el cliente no paga en ese tiempo, el voucher expira automáticamente.'
    },
    {
      question: '¿Hay un monto mínimo o máximo para pagos OXXO?',
      answer: 'El monto mínimo es de $10 MXN y el máximo es de $10,000 MXN por transacción. Esto es una limitación de OXXO, no de Stripe o Expo360.'
    },
    {
      question: '¿Cuánto tarda en reflejarse el pago?',
      answer: 'Una vez que el cliente paga en OXXO, la confirmación llega en cuestión de minutos (generalmente menos de 30 minutos). Recibirás una notificación automática.'
    },
    {
      question: '¿Necesito hacer algo especial para activar OXXO?',
      answer: 'No. Con el Plan Anual de Expo360 y tu cuenta de Stripe México, OXXO se activa automáticamente. Solo asegúrate de que tu cuenta de Stripe esté verificada y configurada para México.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/10 via-black to-yellow-900/10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-red-600 text-white px-4 py-2 rounded-lg z-[100]">
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
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-gradient-to-r from-red-600 to-yellow-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-red-600/50 transition-all duration-300">
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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* OXXO Logo */}
                <div className="flex justify-center mb-8">
                  <div className="p-8">
                    <Image
                      src="/integration_logos/Oxxo_Logo.svg"
                      alt="OXXO"
                      width={280}
                      height={120}
                      className="h-24 md:h-32 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-red-400 via-yellow-400 to-red-400 bg-clip-text text-transparent">
                    Acepta Pagos en Efectivo
                  </span>
                  <br />
                  <span className="text-white">con OXXO en Tu Showroom Virtual</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Más del <strong>30% de las compras online en México</strong> se pagan en efectivo. Con <strong>OXXO + Expo360</strong>, tus clientes pueden pagar en cualquiera de las <em>+19,000 tiendas</em> alrededor del país.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-gradient-to-br from-red-600/20 to-yellow-600/20 rounded-xl p-4 border border-red-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-red-400">19K+</div>
                    <div className="text-sm text-gray-400">Tiendas OXXO</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-600/20 to-yellow-600/20 rounded-xl p-4 border border-red-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-400">30%+</div>
                    <div className="text-sm text-gray-400">Pagos en Efectivo</div>
                  </div>
                  <div className="bg-gradient-to-br from-red-600/20 to-yellow-600/20 rounded-xl p-4 border border-red-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-red-400">24/7</div>
                    <div className="text-sm text-gray-400">Disponibilidad</div>
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
                  ¿Por Qué Ofrecer Pagos con OXXO?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Aumenta tus ventas alcanzando a clientes que prefieren o solo pueden pagar en efectivo
                </p>
                <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-yellow-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-gradient-to-br from-red-600/10 to-yellow-600/10 border border-red-500/30 rounded-xl p-6 hover:border-red-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    <div className="text-red-400 mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-red-900/5 to-black" aria-labelledby="how-it-works-title">
            <div ref={howItWorksAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Cómo Funciona el Pago con OXXO?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Un proceso simple y automático para ti y tus clientes
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
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-red-500/50 to-yellow-500/50" aria-hidden="true"></div>
                    )}
                    
                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-600 to-yellow-600 flex items-center justify-center text-2xl font-bold">
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
                  Preguntas Frecuentes sobre OXXO
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-red-600 to-yellow-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`border border-red-500/30 rounded-xl overflow-hidden transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-red-600/10 transition-all"
                      aria-expanded={openFaq === idx}
                    >
                      <span className="font-semibold flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        {faq.question}
                      </span>
                      <CheckCircle2 className={`w-5 h-5 text-yellow-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="p-5 pt-0 text-gray-300 border-t border-red-500/20">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
              <aside className={`bg-gradient-to-r from-red-600 to-yellow-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Empieza a Aceptar Pagos con OXXO Hoy
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Con el Plan Anual de Expo360, activa OXXO y más de 100 métodos de pago automáticamente
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-red-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
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
            <p>© 2025 <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-semibold">Expo360</span> por <a href="https://interzekt.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Interzekt.com</a></p>
            <div className="mt-4 flex justify-center gap-6 text-xs">
              <Link href="/stripe-benefits" className="hover:text-white transition">Stripe + Expo360</Link>
              <Link href="/pagos-spei" className="hover:text-white transition">Pagos SPEI</Link>
              <Link href="/meses-sin-intereses" className="hover:text-white transition">Meses sin Intereses</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PagosOxxoPage;
