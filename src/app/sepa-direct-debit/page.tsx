'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Lock, DollarSign, TrendingDown, ArrowRight, CheckCircle2, HelpCircle, Shield, Globe } from 'lucide-react';
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

const SEPADirectDebitPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const howItWorksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <TrendingDown className="w-8 h-8" />,
      title: 'Costos Ultra Bajos',
      description: 'SEPA Direct Debit cuesta 80% menos que tarjetas de crédito - ideal para márgenes ajustados'
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: 'Cobertura Europea Completa',
      description: 'Disponible en 36 países del SEPA (EU, EEE y Reino Unido) - acceso a 500M+ ciudadanos europeos'
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Recaudación Recurrente',
      description: 'Perfecto para suscripciones, pagos mensuales y pagos recurrentes automáticos'
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'ROI Extraordinario',
      description: 'Reduce costos de procesamiento en 80-85% vs tarjetas - ganancias netas más altas'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Cliente Selecciona SEPA Direct Debit',
      description: 'En el checkout, elige débito directo SEPA como método de pago'
    },
    {
      number: '2',
      title: 'Proporciona IBAN',
      description: 'Ingresa su número de cuenta IBAN europeo de forma segura'
    },
    {
      number: '3',
      title: 'Autoriza la Transacción',
      description: 'Confirma que autoriza débito de su cuenta bancaria europea'
    },
    {
      number: '4',
      title: 'Recaudación Automática',
      description: 'Se transfieren fondos a tu cuenta en 1-2 días bancarios'
    }
  ];

  const faqs = [
    {
      question: '¿Cómo funciona SEPA Direct Debit?',
      answer: 'SEPA Direct Debit es un sistema de transferencia bancaria que permite cobrar directamente de la cuenta bancaria de tus clientes en Europa. El cliente proporciona su IBAN, autoriza la transacción, y los fondos se transfieren automáticamente a tu cuenta bancaria en 1-2 días hábiles.'
    },
    {
      question: '¿Cuánto cuesta aceptar SEPA Direct Debit?',
      answer: 'Stripe cobra aproximadamente 0.8% por transacción SEPA Direct Debit - esto es 80% más barato que tarjetas de crédito (3.6%). Para negocios de alto volumen, esto significa ahorros significativos en comisiones.'
    },
    {
      question: '¿En qué países funciona SEPA Direct Debit?',
      answer: 'SEPA Direct Debit funciona en 36 países: los 27 miembros de la UE, más Islandia, Liechtenstein, Noruega, Suiza, Reino Unido, San Marino y Andorra. Esencialmente toda Europa occidental y central.'
    },
    {
      question: '¿Cuánto tarda la recaudación?',
      answer: 'Los fondos se transfieren típicamente en 1-2 días hábiles después del débito. El cliente verá la transacción en su estado de cuenta bancario en el mismo tiempo. No es instantáneo como tarjetas, pero muy rápido.'
    },
    {
      question: '¿Puedo usar SEPA Direct Debit para pagos recurrentes?',
      answer: 'Sí, de hecho es ideal para eso. SEPA Direct Debit es perfecto para suscripciones, pagos mensuales, y débitos recurrentes. Puedes configurar pagos recurrentes automáticos sin que el cliente tenga que autorizar cada uno.'
    },
    {
      question: '¿Qué requisitos tienen mis clientes?',
      answer: 'Solo necesitan tener una cuenta bancaria en un país SEPA y conocer su número IBAN. El IBAN es el equivalente europeo al número de cuenta bancaria - todos los bancos europeos lo proporcionan.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-linear-to-br from-blue-900/10 via-black to-indigo-900/10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-100">
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
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300">
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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* SEPA Logo */}
                <div className="flex justify-center mb-8">
                  <div className="p-8">
                    <Image
                      src="/integration_logos/european_union.svg"
                      alt="SEPA - Europa"
                      width={560}
                      height={240}
                      className="h-48 md:h-64 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-linear-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Débito Directo SEPA
                  </span>
                  <br />
                  <span className="text-white">80% Menos Comisión en Tu Showroom Virtual</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Con <strong>SEPA Direct Debit + Expo360</strong>, cobra directamente de cuentas bancarias europeas. Solo <em>0.8% de comisión</em> vs 3.6% de tarjetas - ideal para <strong>márgenes altos</strong> y <strong>pagos recurrentes</strong>.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-linear-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400">36</div>
                    <div className="text-sm text-gray-400">Países Europeos</div>
                  </div>
                  <div className="bg-linear-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-indigo-400">0.8%</div>
                    <div className="text-sm text-gray-400">Comisión</div>
                  </div>
                  <div className="bg-linear-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400">80%</div>
                    <div className="text-sm text-gray-400">Ahorro vs Tarjetas</div>
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
                  ¿Por Qué Ofrecer SEPA Direct Debit?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Costos bajísimos y cobertura europea para maximizar ganancias
                </p>
                <div className="h-1 w-24 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-linear-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    <div className="text-blue-400 mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-blue-900/5 to-black" aria-labelledby="how-it-works-title">
            <div ref={howItWorksAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Cómo Funciona SEPA Direct Debit?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Cobro directo de cuentas bancarias europeas sin intermediarios
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
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-linear-to-r from-blue-500/50 to-indigo-500/50" aria-hidden="true"></div>
                    )}
                    
                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold">
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
                  Preguntas Frecuentes sobre SEPA Direct Debit
                </h2>
                <div className="h-1 w-24 bg-linear-to-r from-blue-600 to-indigo-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-8">
                {faqs.map((faq, idx) => (
                  <article
                    key={idx}
                    className={`border-b border-blue-500/20 pb-8 last:border-0 transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-blue-400 shrink-0" />
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
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-blue-900/5 to-black" aria-labelledby="reference-title">
            <div className="max-w-4xl mx-auto">
              <header className="mb-12 text-center">
                <h2 id="reference-title" className="text-3xl md:text-4xl font-bold mb-4">SEPA Direct Debit de Un Vistazo</h2>
                <p className="text-gray-400">Todos los números que necesitas saber</p>
              </header>
              <FactSheet 
                title="Resumen de SEPA Direct Debit"
                className="max-w-2xl mx-auto mb-8"
                facts={[
                  { label: 'Disponibilidad', value: '36 países europeos', icon: <Globe className="w-5 h-5" /> },
                  { label: 'Comisión', value: '0.8% por transacción', icon: <TrendingDown className="w-5 h-5" /> },
                  { label: 'Seguridad', value: 'Autorización + Cifrado', icon: <Shield className="w-5 h-5" /> },
                  { label: 'Recaudación', value: '1-2 días bancarios', icon: <CreditCard className="w-5 h-5" /> },
                ]}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
              <aside className={`bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Empieza a Aceptar SEPA Direct Debit Hoy
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Con el Plan Anual de Expo360, activa SEPA Direct Debit y más de 100 métodos de pago automáticamente
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
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

export default SEPADirectDebitPage;
