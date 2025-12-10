'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, TrendingUp, Users, ShoppingCart, ArrowRight, CheckCircle2, HelpCircle, Calendar, Percent, Clock, Shield } from 'lucide-react';
import FactSheet from '@/components/FactSheet';

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

const MesesSinInteresesPage = () => {
  const heroAnim = useScrollAnimation();
  const benefitsAnim = useScrollAnimation();
  const plansAnim = useScrollAnimation();
  const banksAnim = useScrollAnimation();
  const faqAnim = useScrollAnimation();
  const ctaAnim = useScrollAnimation();

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(6);

  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Aumenta Ticket Promedio 40%',
      description: 'Los clientes compran más cuando pueden diferir el pago. Ideal para muebles y productos de alto valor.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Alcanza Más Clientes',
      description: 'Millones de mexicanos buscan activamente promociones de MSI. Atrae compradores que de otra forma no comprarían.'
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: 'Reduce Abandono de Carrito',
      description: 'El precio ya no es barrera. Convierte visitantes en compradores con pagos accesibles.'
    },
    {
      icon: <CreditCard className="w-8 h-8" />,
      title: 'Cobro Inmediato',
      description: 'Tú recibes el pago completo al momento. El banco se encarga de cobrar las mensualidades.'
    }
  ];

  const installmentPlans = [
    { months: 3, rate: '~4-5%', popular: false },
    { months: 6, rate: '~7-9%', popular: true },
    { months: 9, rate: '~10-12%', popular: false },
    { months: 12, rate: '~13-15%', popular: true },
    { months: 18, rate: '~16-18%', popular: false },
    { months: 24, rate: '~19-22%', popular: false },
  ];

  const compatibleBanks = [
    { name: 'BBVA México', logo: '🏦' },
    { name: 'Banorte', logo: '🏦' },
    { name: 'Santander', logo: '🏦' },
    { name: 'Citibanamex', logo: '🏦' },
    { name: 'HSBC', logo: '🏦' },
    { name: 'Scotiabank', logo: '🏦' },
    { name: 'American Express', logo: '💳' },
    { name: 'Inbursa', logo: '🏦' },
    { name: 'BanBajío', logo: '🏦' },
    { name: 'Afirme', logo: '🏦' },
    { name: 'Banregio', logo: '🏦' },
    { name: 'Liverpool', logo: '🛍️' },
  ];

  const faqs = [
    {
      question: '¿Cómo funcionan los meses sin intereses?',
      answer: 'El cliente paga con su tarjeta de crédito y el banco divide el total en pagos mensuales iguales sin cobrar intereses al cliente. Tú recibes el monto completo de la venta (menos la comisión de MSI) al momento de la compra. El banco se encarga de cobrar las mensualidades.'
    },
    {
      question: '¿Cuánto cuesta ofrecer meses sin intereses?',
      answer: 'La comisión varía según el plazo elegido: aproximadamente 4-5% para 3 meses, 7-9% para 6 meses, 10-12% para 9 meses, y 13-18% para 12+ meses. Esta comisión se descuenta del monto que recibes. El costo exacto depende de tu acuerdo con Stripe.'
    },
    {
      question: '¿Qué tarjetas aceptan meses sin intereses?',
      answer: 'La mayoría de tarjetas de crédito mexicanas participan en MSI: BBVA, Banorte, Santander, Citibanamex, HSBC, Scotiabank, American Express, Inbursa, BanBajío, Afirme, Banregio, y tarjetas departamentales como Liverpool. Las tarjetas de débito NO aplican para MSI.'
    },
    {
      question: '¿Hay un monto mínimo para ofrecer MSI?',
      answer: 'Sí, generalmente se requiere un monto mínimo de compra para MSI. Lo común es $1,000 a $3,000 MXN, pero puedes configurarlo según tu estrategia. Productos de bajo costo típicamente no ofrecen MSI porque la comisión no lo hace rentable.'
    },
    {
      question: '¿Puedo elegir qué plazos ofrecer?',
      answer: 'Sí, tienes control total. Puedes ofrecer solo 3 y 6 meses, o todos los plazos hasta 24 meses. Muchos comercios ofrecen 3, 6 y 12 meses como estándar. Considera que plazos más largos tienen comisiones más altas.'
    },
    {
      question: '¿Qué pasa si el cliente no paga sus mensualidades?',
      answer: 'No te afecta. Tú ya recibiste el pago completo. El banco es quien asume el riesgo de cobranza con el tarjetahabiente. Si el cliente no paga, es un problema entre el cliente y su banco, no contigo.'
    }
  ];

  // Calculator state
  const [saleAmount, setSaleAmount] = useState(15000);
  const monthlyPayment = saleAmount / selectedPlan;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background */}
      <div className="absolute inset-0 bg-linear-to-br from-green-900/10 via-black to-emerald-900/10 pointer-events-none" aria-hidden="true"></div>
      
      <div className="relative z-10">
        {/* Skip Link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-green-600 text-white px-4 py-2 rounded-lg z-100">
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
                <Link href="/signin" className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg bg-linear-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Iniciar Sesión
                </Link>
                <Link href="/#pricing" className="px-6 py-2 bg-linear-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-green-600/50 transition-all duration-300">
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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl opacity-50" aria-hidden="true"></div>

            <div ref={heroAnim.ref} className="relative z-10 max-w-5xl mx-auto">
              <div className={`text-center space-y-6 transition-all duration-700 ease-out ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                
                {/* MSI Badge */}
                <div className="flex justify-center mb-8">
                  <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl px-8 py-4 shadow-2xl shadow-green-500/20">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-10 h-10 text-white" />
                      <div className="text-left">
                        <div className="text-3xl font-bold text-white">MSI</div>
                        <div className="text-sm text-green-100">Meses Sin Intereses</div>
                      </div>
                    </div>
                  </div>
                </div>

                <h1 id="hero-title" className="text-4xl md:text-6xl font-bold leading-tight">
                  <span className="bg-linear-to-r from-green-400 via-emerald-400 to-green-400 bg-clip-text text-transparent">
                    Meses Sin Intereses
                  </span>
                  <br />
                  <span className="text-white">Para Tu Showroom Virtual</span>
                </h1>

                <p className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  Ofrece <strong>3, 6, 9, 12, 18 o 24 meses sin intereses</strong> y aumenta tu ticket promedio hasta <em>40%</em>. El método favorito de los mexicanos para comprar <strong>muebles y productos de alto valor</strong>.
                </p>

                {/* Stats */}
                <div className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto mt-12 transition-all duration-700 ease-out delay-200 ${heroAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <div className="bg-linear-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-green-400">+40%</div>
                    <div className="text-sm text-gray-400">Ticket Promedio</div>
                  </div>
                  <div className="bg-linear-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-emerald-400">24</div>
                    <div className="text-sm text-gray-400">Meses Máximo</div>
                  </div>
                  <div className="bg-linear-to-br from-green-600/20 to-emerald-600/20 rounded-xl p-4 border border-green-500/30">
                    <div className="text-3xl md:text-4xl font-bold text-green-400">0%</div>
                    <div className="text-sm text-gray-400">Interés al Cliente</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Calculator Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-green-900/5 to-black">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
                Calculadora de Mensualidades
              </h2>
              <p className="text-gray-400 text-center mb-12">
                Muestra a tus clientes cuánto pagarían al mes
              </p>
              
              <div className="bg-linear-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-2xl p-8">
                {/* Sale Amount Slider */}
                <div className="mb-8">
                  <label className="block text-sm text-gray-400 mb-2">Monto de la venta</label>
                  <div className="text-4xl font-bold text-white mb-4">${saleAmount.toLocaleString()} MXN</div>
                  <input
                    type="range"
                    min="3000"
                    max="100000"
                    step="1000"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(Number(e.target.value))}
                    className="w-full h-2 bg-green-900/50 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>$3,000</span>
                    <span>$100,000</span>
                  </div>
                </div>

                {/* Installment Options */}
                <div className="mb-8">
                  <label className="block text-sm text-gray-400 mb-4">Selecciona el plazo</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {installmentPlans.map((plan) => (
                      <button
                        key={plan.months}
                        onClick={() => setSelectedPlan(plan.months)}
                        className={`relative p-3 rounded-xl border-2 transition-all ${
                          selectedPlan === plan.months
                            ? 'border-green-500 bg-green-600/20'
                            : 'border-green-500/30 hover:border-green-500/60'
                        }`}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2 -right-2 bg-green-500 text-xs px-2 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <div className="text-2xl font-bold">{plan.months}</div>
                        <div className="text-xs text-gray-400">meses</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result */}
                <div className="bg-linear-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-center">
                  <div className="text-sm text-green-100 mb-2">Tu cliente pagaría</div>
                  <div className="text-5xl font-bold text-white mb-2">
                    ${monthlyPayment.toLocaleString('es-MX', { maximumFractionDigits: 0 })} <span className="text-2xl">MXN/mes</span>
                  </div>
                  <div className="text-green-100">
                    {selectedPlan} pagos de ${monthlyPayment.toLocaleString('es-MX', { maximumFractionDigits: 0 })} = ${saleAmount.toLocaleString()} total
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
                  ¿Por Qué Ofrecer Meses Sin Intereses?
                </h2>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                  El método de pago favorito de los mexicanos para compras importantes
                </p>
                <div className="h-1 w-24 bg-linear-to-r from-green-600 to-emerald-600 mx-auto mt-4" aria-hidden="true"></div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, idx) => (
                  <article
                    key={idx}
                    className={`bg-linear-to-br from-green-600/10 to-emerald-600/10 border border-green-500/30 rounded-xl p-6 hover:border-green-500/60 transition-all duration-500 ease-out ${benefitsAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 100}ms` }}
                  >
                    <div className="text-green-400 mb-4">{benefit.icon}</div>
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-gray-300">{benefit.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Installment Plans Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-green-900/5 to-black" aria-labelledby="plans-title">
            <div ref={plansAnim.ref} className="max-w-4xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${plansAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="plans-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Plazos Disponibles y Comisiones
                </h2>
                <p className="text-gray-400 text-center">
                  Elige qué plazos ofrecer según tu estrategia de precios
                </p>
              </header>

              <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 transition-all duration-700 ease-out ${plansAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {installmentPlans.map((plan, idx) => (
                  <div
                    key={idx}
                    className={`relative bg-linear-to-br from-green-600/10 to-emerald-600/10 border rounded-xl p-6 text-center ${
                      plan.popular ? 'border-green-500 ring-2 ring-green-500/50' : 'border-green-500/30'
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-xs font-bold px-3 py-1 rounded-full">
                        MÁS POPULAR
                      </span>
                    )}
                    <div className="text-4xl font-bold text-white mb-1">{plan.months}</div>
                    <div className="text-gray-400 mb-4">meses</div>
                    <div className="flex items-center justify-center gap-1 text-green-400">
                      <Percent className="w-4 h-4" />
                      <span className="font-semibold">{plan.rate}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">comisión aprox.</div>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-8">
                * Las comisiones exactas dependen de tu acuerdo con Stripe México
              </p>
            </div>
          </section>

          {/* Compatible Banks Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="banks-title">
            <div ref={banksAnim.ref} className="max-w-4xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${banksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="banks-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Tarjetas Participantes en MSI
                </h2>
                <p className="text-gray-400 text-center">
                  Las principales tarjetas de crédito mexicanas
                </p>
              </header>

              <div className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-all duration-700 ease-out ${banksAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                {compatibleBanks.map((bank, idx) => (
                  <div
                    key={idx}
                    className="bg-linear-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-lg p-4 text-center hover:border-green-500/50 transition-all"
                  >
                    <span className="text-2xl mb-2 block">{bank.logo}</span>
                    <span className="text-sm text-gray-300">{bank.name}</span>
                  </div>
                ))}
              </div>
              
              <p className="text-center text-gray-500 text-sm mt-6">
                Y más tarjetas de crédito que participen en el programa MSI de cada banco
              </p>
            </div>
          </section>

          {/* FAQ Section - Direct Answer Blocks */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-green-900/5 to-black" aria-labelledby="faq-title">
            <div ref={faqAnim.ref} className="max-w-3xl mx-auto">
              <header className={`mb-12 transition-all duration-700 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <h2 id="faq-title" className="text-3xl md:text-4xl font-bold text-center mb-4">
                  Preguntas Frecuentes sobre MSI
                </h2>
                <div className="h-1 w-24 bg-linear-to-r from-green-600 to-emerald-600 mx-auto" aria-hidden="true"></div>
              </header>

              <div className="space-y-8">
                {faqs.map((faq, idx) => (
                  <article
                    key={idx}
                    className={`border-b border-green-500/20 pb-8 last:border-0 transition-all duration-500 ease-out ${faqAnim.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${150 + idx * 50}ms` }}
                  >
                    <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-green-400 shrink-0" />
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
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-green-900/5 to-black" aria-labelledby="reference-title">
            <div className="max-w-4xl mx-auto">
              <header className="mb-12 text-center">
                <h2 id="reference-title" className="text-3xl md:text-4xl font-bold mb-4">Meses Sin Intereses de Un Vistazo</h2>
                <p className="text-gray-400">Todos los números que necesitas saber</p>
              </header>
              <FactSheet 
                title="Resumen de Meses Sin Intereses"
                className="max-w-2xl mx-auto mb-8"
                facts={[
                  { label: 'Plazos Disponibles', value: '3, 6, 9, 12, 18, 24 meses', icon: <Calendar className="w-5 h-5" /> },
                  { label: 'Tarjetas Aceptadas', value: 'Visa, Mastercard, Amex', icon: <CreditCard className="w-5 h-5" /> },
                  { label: 'Cobro para Ti', value: 'Inmediato (Total de la venta)', icon: <CheckCircle2 className="w-5 h-5" /> },
                  { label: 'Comisión Base', value: '~4% - 15% (según plazo)', icon: <Percent className="w-5 h-5" /> },
                ]}
              />
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8" aria-labelledby="cta-title">
            <div ref={ctaAnim.ref} className="max-w-4xl mx-auto">
              <aside className={`bg-linear-to-r from-green-600 to-emerald-600 rounded-2xl p-8 md:p-12 text-center transition-all duration-700 ease-out ${ctaAnim.isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}>
                <h2 id="cta-title" className="text-3xl md:text-4xl font-bold mb-4">
                  Activa Meses Sin Intereses Hoy
                </h2>
                
                <p className="text-lg text-white/90 mb-8">
                  Con el Plan Anual de Expo360, ofrece MSI y todos los métodos de pago de Stripe
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-green-600 font-bold rounded-xl hover:bg-gray-100 hover:scale-105 transition-all duration-300 shadow-lg text-lg"
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

export default MesesSinInteresesPage;
