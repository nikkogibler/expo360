'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Zap, Building2, Percent, Shield, ArrowRight, CheckCircle2, HelpCircle, Clock, Banknote } from 'lucide-react';

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

const PagosSpeiPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const howItWorksAnim = useScrollAnimation();
  const banksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Confirmación Instantánea',
      description: 'Los pagos se confirman en segundos, no en días. Procesa pedidos inmediatamente.'
    },
    {
      icon: <Percent className="w-8 h-8" />,
      title: 'Comisiones Más Bajas',
      description: 'Solo ~1% por transacción vs 3.6% de tarjetas. Ideal para ventas de alto valor.'
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: 'Perfecto para B2B',
      description: 'Empresas y negocios prefieren transferencias. Facilita ventas mayoristas.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Bancaria',
      description: 'Respaldado por Banco de México. Sin riesgo de contracargos.'
    }
  ];

  const steps = [
    {
      number: '1',
      title: 'Cliente Elige SPEI',
      description: 'En el checkout, selecciona transferencia bancaria SPEI'
    },
    {
      number: '2',
      title: 'Recibe CLABE Única',
      description: 'Se genera una CLABE interbancaria exclusiva para esa compra'
    },
    {
      number: '3',
      title: 'Transfiere desde su Banco',
      description: 'El cliente hace la transferencia desde cualquier banco mexicano'
    },
    {
      number: '4',
      title: 'Confirmación Automática',
      description: 'En segundos recibes confirmación y el pedido se procesa'
    }
  ];

  const compatibleBanks = [
    'BBVA México',
    'Banorte',
    'Santander',
    'Citibanamex',
    'HSBC',
    'Scotiabank',
    'Banco Azteca',
    'Inbursa',
    'BanBajío',
    'Afirme',
    'Banregio',
    'Hey Banco',
    'Nu México',
    'Klar',
    'Mercado Pago',
    'Spin by OXXO'
  ];

  const faqs = [
    {
      question: '¿Qué es SPEI y cómo funciona?',
      answer: 'SPEI (Sistema de Pagos Electrónicos Interbancarios) es el sistema de transferencias bancarias instantáneas operado por Banco de México. Permite enviar dinero entre cualquier banco mexicano en segundos, las 24 horas del día, los 365 días del año.'
    },
    {
      question: '¿Cuánto cuesta aceptar pagos con SPEI?',
      answer: 'Stripe cobra aproximadamente 1% por transacción con SPEI, significativamente menos que el 3.6% de tarjetas de crédito. Es especialmente rentable para ventas de alto valor como muebles o productos personalizados.'
    },
    {
      question: '¿Cuánto tarda en confirmarse un pago SPEI?',
      answer: 'Los pagos SPEI se confirman en segundos, generalmente menos de 30 segundos después de que el cliente completa la transferencia. Es el método de pago más rápido disponible en México.'
    },
    {
      question: '¿Hay un monto mínimo o máximo para pagos SPEI?',
      answer: 'No hay monto mínimo. El monto máximo depende de los límites de transferencia del banco del cliente, que típicamente van desde $50,000 hasta varios millones de pesos para cuentas empresariales.'
    },
    {
      question: '¿Qué pasa si el cliente transfiere un monto incorrecto?',
      answer: 'Si el monto es menor, el pago no se procesa y deberás contactar al cliente. Si es mayor, Stripe puede manejar el excedente según tu configuración. Recomendamos instrucciones claras en el checkout.'
    },
    {
      question: '¿SPEI funciona los fines de semana y días festivos?',
      answer: 'Sí, SPEI opera 24/7, los 365 días del año. Tus clientes pueden hacer transferencias y recibirás confirmación instantánea en cualquier momento.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-black to-cyan-900/10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-[100]">
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
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-blue-600/50 transition-all duration-300">
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
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* SPEI Logo */}
                <div className="flex justify-center mb-8">
                  <div className="p-8">
                    <Image
                      src="/integration_logos/spei-logo_brandlogos.net_xlhsk.png"
                      alt="SPEI - Sistema de Pagos Electrónicos Interbancarios"
                      width={400}
                      height={160}
                      className="h-32 md:h-40 w-auto object-contain"
                      priority
                    />
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Transferencias SPEI
                  </span>
                  <br />
                  <span className="text-white">Instantáneas en Tu Showroom</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Acepta <strong>transferencias bancarias instantáneas</strong> con comisiones hasta <em>70% más bajas</em> que tarjetas. Ideal para <strong>ventas B2B</strong> y productos de alto valor en tu showroom virtual.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400">~1%</div>
                    <div className="text-sm text-gray-400">Comisión</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-cyan-400">&lt;30s</div>
                    <div className="text-sm text-gray-400">Confirmación</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl p-4 border border-blue-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-blue-400">24/7</div>
                    <div className="text-sm text-gray-400">Disponible</div>
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
                  ¿Por Qué Ofrecer Pagos con SPEI?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  El método preferido por empresas y clientes que buscan seguridad y bajas comisiones
                </p>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-xl p-6 hover:border-blue-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
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

          {/* Cost Comparison Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900/5 to-black">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
                Compara el Ahorro con SPEI
              </h2>
              
              <div className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/30 rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Tarjeta de Crédito */}
                  <div className="text-center p-6 bg-black/40 rounded-xl border border-white/10">
                    <div className="text-gray-400 mb-2">Tarjeta de Crédito</div>
                    <div className="text-4xl font-bold text-gray-300 mb-2">3.6% + $3</div>
                    <div className="text-sm text-gray-500">Por transacción</div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-gray-400">Venta de $50,000</div>
                      <div className="text-2xl font-bold text-red-400">-$1,803 MXN</div>
                    </div>
                  </div>
                  
                  {/* SPEI */}
                  <div className="text-center p-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-xl border-2 border-blue-500/50">
                    <div className="text-blue-400 mb-2 font-semibold">SPEI</div>
                    <div className="text-4xl font-bold text-white mb-2">~1%</div>
                    <div className="text-sm text-gray-400">Por transacción</div>
                    <div className="mt-4 pt-4 border-t border-blue-500/30">
                      <div className="text-gray-300">Venta de $50,000</div>
                      <div className="text-2xl font-bold text-green-400">-$500 MXN</div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 px-6 py-3 rounded-full border border-green-500/30">
                    <Banknote className="w-5 h-5" />
                    <span className="font-bold">Ahorra $1,303 MXN por cada venta de $50,000</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="how-it-works-title">
            <div ref={howItWorksAnim.ref} className="max-w-6xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="how-it-works-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  ¿Cómo Funciona el Pago con SPEI?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  Simple para ti y tus clientes - sin fricciones
                </p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`relative text-center transition-all duration-500 ease-out ${howItWorksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    {idx < steps.length - 1 && (
                      <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-500/50 to-cyan-500/50" aria-hidden="true"></div>
                    )}
                    
                    <div className="relative z-10 w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-2xl font-bold">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-gray-400 text-sm">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compatible Banks Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-blue-900/5 to-black" aria-labelledby="banks-title">
            <div ref={banksAnim.ref} className="max-w-4xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${banksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="banks-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Compatible con Todos los Bancos de México
                </h2>
                <p className="text-gray-400 text-center">
                  Tus clientes pueden pagar desde cualquier banco o fintech
                </p>
              </header>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 ease-out ${banksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {compatibleBanks.map((bank, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-blue-600/10 to-cyan-600/10 border border-blue-500/20 rounded-lg p-3 text-center text-sm text-gray-300 hover:border-blue-500/50 transition-all"
                  >
                    {bank}
                  </div>
                ))}
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-6">
                Y más de 40 instituciones bancarias adicionales conectadas a SPEI
              </p>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="faq-title">
            <div ref={faqAnim.ref} className="max-w-3xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="faq-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Preguntas Frecuentes sobre SPEI
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-cyan-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-4">
                {faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className={`border border-blue-500/30 rounded-xl overflow-hidden transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-5 flex items-center justify-between text-left hover:bg-blue-600/10 transition-all"
                      aria-expanded={openFaq === idx}
                    >
                      <span className="font-semibold flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                        {faq.question}
                      </span>
                      <CheckCircle2 className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <p className="p-5 pt-0 text-gray-300 border-t border-blue-500/20">
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
              <aside className={`bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Empieza a Ahorrar con Pagos SPEI
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Reduce comisiones y ofrece el método preferido por empresas mexicanas
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
            <p>© 2025 <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent font-semibold">Expo360</span> por <a href="https://interzekt.com" target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Interzekt.com</a></p>
            <div className="mt-4 flex justify-center gap-6 text-xs">
              <Link href="/stripe-benefits" className="hover:text-white transition">Stripe + Expo360</Link>
              <Link href="/pagos-oxxo" className="hover:text-white transition">Pagos OXXO</Link>
              <Link href="/meses-sin-intereses" className="hover:text-white transition">Meses sin Intereses</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default PagosSpeiPage;
