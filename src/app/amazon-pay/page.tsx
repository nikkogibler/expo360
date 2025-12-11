'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Lock, User, TrendingUp, ArrowRight, HelpCircle, Shield, Globe } from 'lucide-react';
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

const AmazonPayPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const howItWorksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <User className="w-8 h-8" />,
      title: 'Usa tu Cuenta de Amazon',
      description: 'Tus clientes pagan con sus datos de Amazon que ya tienen guardados - sin necesidad de nuevo registro'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Ultra Rápido',
      description: 'Pago completado en segundos reutilizando información ya verificada de cuenta Amazon'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Seguridad de Amazon',
      description: 'Protección de fraude avanzada de uno de los mayores retailers del mundo'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Aumenta Conversiones',
      description: 'La comodidad de Amazon genera tasas de conversión más altas que métodos tradicionales'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Cliente Selecciona Amazon Pay',
      description: 'En el checkout, elige Amazon Pay como método de pago'
    },
    {
      number: '2',
      title: 'Inicia Sesión (Si Necesario)',
      description: 'Se abre un diálogo seguro donde inicia sesión con su cuenta Amazon'
    },
    {
      number: '3',
      title: 'Confirma Dirección y Pago',
      description: 'Selecciona dirección de envío y método de pago guardado en Amazon'
    },
    {
      number: '4',
      title: 'Pago Confirmado',
      description: 'Transacción completada - recibes confirmación instantánea del pago'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona Amazon Pay?',
      answer: 'Amazon Pay permite que tus clientes paguen usando su cuenta Amazon. Seleccionan Amazon Pay en checkout, inician sesión (si no lo están ya), confirman una dirección de envío y método de pago guardado en su cuenta Amazon. Todo es rápido porque Amazon ya tiene verificada su información.'
    },
    {
      question: '¿Cuánto cuesta aceptar Amazon Pay?',
      answer: 'Las tarifas de Stripe para Amazon Pay son competitivas y similares a tarjetas de crédito (alrededor de 3.6% + $3 MXN). No hay costos mensuales, solo pagas por cada transacción que completes.'
    },
    {
      question: '¿Amazon Pay funciona en México?',
      answer: 'Sí, Amazon Pay está disponible en México. Los clientes mexicanos con cuenta Amazon.com.mx pueden usar Amazon Pay para comprar en tu tienda. También funciona con cuentas Amazon internacionales.'
    },
    {
      question: '¿Necesito una cuenta de Amazon para usar Amazon Pay?',
      answer: 'No. Con Stripe, Amazon Pay se integra automáticamente. Tus clientes pueden tener cuentas Amazon y pagar contigo, pero tú no necesitas una cuenta personal. Stripe maneja la integración backend.'
    },
    {
      question: '¿Qué información veo como vendedor?',
      answer: 'Ves la confirmación de pago, dirección de envío que el cliente seleccionó, y los detalles estándar de transacción. Amazon mantiene privados los detalles de tarjeta - tú nunca los ves.'
    },
    {
      question: '¿Hay protección contra fraude?',
      answer: 'Sí. Amazon tiene sistemas muy avanzados de detección de fraude. Además, Amazon Pay ofrece protecciones para vendedores contra transacciones fraudulentas reportadas.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-linear-to-br from-orange-900/10 via-black to-gray-900/10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-orange-600 text-white px-4 py-2 rounded-lg z-100">
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
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-linear-to-r from-orange-600 to-yellow-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-600/50 transition-all duration-300">
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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* Amazon Pay Logo */}
                <div className="flex justify-center mb-8">
                  <div className="p-8">
                    <Image
                      src="/integration_logos/amazonpay-secondary-logo-rgb_rev.png"
                      alt="Amazon Pay"
                      width={280}
                      height={120}
                      className="h-24 md:h-32 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-linear-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    Paga con Amazon
                  </span>
                  <br />
                  <span className="text-white">en Tu Showroom Virtual</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Con <strong>Amazon Pay + Expo360</strong>, tus clientes que ya usan Amazon pueden pagar con sus datos ya guardados. <em>Ultra rápido</em>, sin formularios, con <strong>seguridad Amazon</strong>.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-linear-to-br from-orange-600/20 to-yellow-600/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-orange-400">310M+</div>
                    <div className="text-sm text-gray-400">Usuarios Activos</div>
                  </div>
                  <div className="bg-linear-to-br from-orange-600/20 to-yellow-600/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-yellow-400">150+</div>
                    <div className="text-sm text-gray-400">Países</div>
                  </div>
                  <div className="bg-linear-to-br from-orange-600/20 to-yellow-600/20 rounded-xl p-4 border border-orange-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-orange-400">1-Click</div>
                    <div className="text-sm text-gray-400">Pago Rápido</div>
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
                  ¿Por Qué Ofrecer Amazon Pay?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Velocidad, confianza y acceso a millones de clientes Amazon alrededor del mundo
                </p>
                <div className="h-1 w-24 bg-linear-to-r from-orange-600 to-yellow-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-linear-to-br from-orange-600/10 to-yellow-600/10 border border-orange-500/30 rounded-xl p-6 hover:border-orange-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    <div className="text-orange-400 mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-orange-900/5 to-black" aria-labelledby="how-it-works-title">
            <div ref={howItWorksAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Cómo Funciona Amazon Pay?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Integración rápida con cuentas Amazon existentes
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
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-orange-500/50 to-yellow-500/50" aria-hidden="true"></div>
                    )}
                    
                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-orange-600 to-yellow-600 flex items-center justify-center text-2xl font-bold">
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
                  Preguntas Frecuentes sobre Amazon Pay
                </h2>
                <div className="h-1 w-24 bg-linear-to-r from-orange-600 to-yellow-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-8">
                {faqs.map((faq, idx) => (
                  <article
                    key={idx}
                    className={`border-b border-orange-500/20 pb-8 last:border-0 transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-orange-400 shrink-0" />
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
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-orange-900/5 to-black" aria-labelledby="reference-title">
            <div className="max-w-4xl mx-auto">
              <header className="mb-12 text-center">
                <h2 id="reference-title" className="text-3xl md:text-4xl font-bold mb-4">Amazon Pay de Un Vistazo</h2>
                <p className="text-gray-400">Todos los números que necesitas saber</p>
              </header>
              <FactSheet 
                title="Resumen de Amazon Pay"
                className="max-w-2xl mx-auto mb-8"
                facts={[
                  { label: 'Disponibilidad', value: '150+ países', icon: <Globe className="w-5 h-5" /> },
                  { label: 'Usuarios Activos', value: '310 millones+', icon: <User className="w-5 h-5" /> },
                  { label: 'Seguridad', value: 'Fraude + Protección Amazon', icon: <Shield className="w-5 h-5" /> },
                  { label: 'Velocidad', value: 'Uno click', icon: <Zap className="w-5 h-5" /> },
                ]}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
              <aside className={`bg-linear-to-r from-orange-600 to-yellow-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Empieza a Aceptar Amazon Pay Hoy
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Con el Plan Anual de Expo360, activa Amazon Pay y más de 100 métodos de pago automáticamente
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-orange-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
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

export default AmazonPayPage;
