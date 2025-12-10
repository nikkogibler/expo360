'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Wallet, Clock, TrendingUp, Lock, ArrowRight } from 'lucide-react';
import { Vortex } from '@/ui/vortex';

const StripeBenefitsPage = () => {
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      }
    }
  };

  interface PaymentMethod {
    name: string;
    description: string;
    logo: string | null;
  }

  interface PaymentCategory {
    category: string;
    icon: string;
    methods: PaymentMethod[];
  }

  const paymentMethods = [
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
      category: 'Compra Ahora, Paga Después',
      icon: '📅',
      methods: [
        { name: 'Klarna', description: 'Pagos flexibles en 3, 6 o 12 cuotas sin interés', logo: '/integration_logos/klarna.png' },
        { name: 'Afterpay/Clearpay', description: 'Divide pagos en 4 cuotas quincenales sin interés', logo: '/integration_logos/afterpay.png' },
        { name: 'Affirm', description: 'Opciones de pago flexible para clientes en EE.UU. y Canadá', logo: '/integration_logos/affirm.png' },
        { name: 'Zip', description: 'Planes de pago flexibles semanales, bisemanales o mensuales', logo: '/integration_logos/zip.png' }
      ]
    },
    {
      category: 'Vales para Pago en Efectivo',
      icon: '🏪',
      methods: [
        { name: 'OXXO', description: 'Paga en más de 19,000 tiendas OXXO en México - 30%+ de transacciones locales', logo: '/integration_logos/oxxo-logo-vector-01.png' }
      ]
    },
    {
      category: 'Transferencias Bancarias',
      icon: '🏦',
      methods: [
        { name: 'SPEI', description: 'Transferencias bancarias instantáneas en México - ideal para B2B', logo: '/integration_logos/spei.png' }
      ]
    },
    {
      category: 'Débito Directo',
      icon: '💰',
      methods: [
        { name: 'Débito directo SEPA', description: 'Pagos recurrentes en 36 países europeos con costos bajos', logo: '/integration_logos/sepa.png' },
        { name: 'Débito directo Bacs', description: 'Método principal en Reino Unido para pagos puntuales y recurrentes', logo: '/integration_logos/bacs.png' },
        { name: 'ACH Direct Debit', description: 'Costos de transacción reducidos para pagos en EE.UU.', logo: '/integration_logos/ach.png' }
      ]
    },
    {
      category: 'Tarjetas',
      icon: '🎫',
      methods: [
        { name: 'Visa', description: 'Red de tarjetas más grande del mundo con mayor aceptación', logo: '/integration_logos/visa.png' },
        { name: 'Mastercard', description: 'Tarjeta principal aceptada en más de 190 países', logo: '/integration_logos/mastercard.png' },
        { name: 'American Express', description: 'Tarjeta premium con clientes de alto valor en 130+ países', logo: '/integration_logos/amex.png' }
      ]
    },
    {
      category: 'Métodos Especiales',
      icon: '⭐',
      methods: [
        { name: 'Meses sin intereses', description: 'Fracciona compras en pagos mensuales fijos en México', logo: null },
        { name: 'Criptomonedas estables', description: 'Acepta monedas estables para alcance global (Preview)', logo: '/integration_logos/crypto.png' },
        { name: 'Payment on invoice', description: 'Paga después con factura - ideal para B2B en Alemania (Preview)', logo: null }
      ]
    }
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
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Image
                src="/expo360_logo.png"
                alt="Expo360 Logo"
                width={120}
                height={120}
                className="rounded-lg scale-150"
              />
            </motion.div>

            {/* Center Nav Links */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2"
            >
              <a href="/porque-expo360" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                ¿Porqué Expo360?
              </a>
              <a href="/#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                Precios
              </a>
              <a href="/preguntas-frecuentes" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                Preguntas Frecuentes
              </a>
            </motion.nav>

            {/* Right Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-3"
            >
              <a
                href="/signin"
                className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 bg-linear-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
              >
                Iniciar Sesión
              </a>
              <a
                href="/#pricing"
                className="px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
              >
                Registrarse
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Vortex Animation */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
          <Vortex backgroundColor="transparent" baseHue={270} rangeY={150} particleCount={400} />
        </div>
        {/* Glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>

        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center space-y-6"
          >
            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold leading-tight pb-2 flex items-center justify-center gap-1"
            >
              <span className="relative inline-flex items-center translate-y-[3px]">
                <Image
                  src="/integration_logos/stripe_logo.png"
                  alt="Stripe"
                  width={180}
                  height={75}
                  className="h-12 md:h-16 w-auto object-contain"
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
                  width={1200}
                  height={500}
                  className="h-[30rem] md:h-[42rem] w-auto object-contain absolute top-1/2 -translate-y-1/2 -left-[15px] scale-[2.25]"
                />
                <span className="invisible h-12 md:h-16 w-[140px]"></span>
              </span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Con Stripe integrado en Expo360, accede a más de 100 métodos de pago internacionales y maximiza tus ventas en tiempo real
            </motion.p>

            {/* Stripe Hero Image */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 relative h-80 md:h-96 rounded-2xl border border-purple-500/30 overflow-hidden group"
            >
              <Image
                src="/stripe_hero.png"
                alt="Stripe Payment Methods"
                fill
                className="object-cover object-top"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent"></div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center mb-4"
            >
              Beneficios Principales
            </motion.h2>
            <motion.div 
              variants={fadeInUp}
              className="h-1 w-24 bg-linear-to-r from-purple-600 to-blue-600 mx-auto"
            ></motion.div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="bg-linear-to-br from-purple-600/10 to-blue-600/10 border border-purple-500/30 rounded-xl p-6 hover:border-purple-500/60 transition-all duration-300"
              >
                <div className="text-purple-400 mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                <p className="text-gray-300">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Payment Methods Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-black via-purple-900/5 to-black">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="mb-12"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold text-center mb-4"
            >
              Métodos de Pago Disponibles
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-gray-300 text-center max-w-2xl mx-auto"
            >
              Más de 100 formas de pago para que tus clientes elijan la que prefieren
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            {paymentMethods.map((category, categoryIdx) => (
              <motion.div
                key={categoryIdx}
                variants={fadeInUp}
                className="bg-linear-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-3xl">{category.icon}</span>
                  <h3 className="text-2xl font-bold text-purple-300">{category.category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.methods.map((method, methodIdx) => (
                    <div key={methodIdx} className="bg-black/40 rounded-lg p-4 border border-white/5 hover:border-purple-500/20 transition-all">
                      {method.logo && (
                        <div className="mb-3 h-12 flex items-center justify-center bg-white/5 rounded-md p-2">
                          <img 
                            src={method.logo} 
                            alt={method.name}
                            className="max-h-10 max-w-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-white mb-2">{method.name}</h4>
                      <p className="text-gray-400 text-sm">{method.description}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="bg-linear-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-center"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              ¿Listo para Maximizar tus Ventas?
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-white/90 mb-8"
            >
              Elige el Plan Anual y desbloquea todas las capacidades de Stripe con Expo360
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Ver Planes de Precios
                <ArrowRight className="w-5 h-5" />
              </a>
              <a
                href="mailto:info0@interzekt.com?subject=Stripe%20Mexico%20Benefits"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Contactar Soporte
              </a>
            </motion.div>
          </motion.div>
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
