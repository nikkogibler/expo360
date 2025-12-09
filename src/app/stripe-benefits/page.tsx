'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { CreditCard, Wallet, Clock, TrendingUp, Lock, ArrowRight } from 'lucide-react';

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
        { name: 'Apple Pay', description: 'Pago rápido y seguro desde dispositivos Apple', logo: '/integration_logos/apple-pay-logo.png' },
        { name: 'Google Pay', description: 'Cartera digital integrada en Android y navegadores', logo: '/integration_logos/google_pay.png' },
        { name: 'PayPal', description: 'Método de pago confiable utilizado por millones globalmente', logo: '/integration_logos/paypal-logo.png' },
        { name: 'WeChat Pay', description: 'Acceso a mercados de Asia con la cartera digital #1', logo: '/integration_logos/wechat-pay-logo.png' },
        { name: 'Amazon Pay', description: 'Experiencia de compra rápida con datos de Amazon', logo: '/integration_logos/amazon-pay-logo.png' }
      ]
    },
    {
      category: 'Compra Ahora, Paga Después',
      icon: '📅',
      methods: [
        { name: 'Klarna', description: 'Pagos flexibles en 3, 6 o 12 cuotas sin interés', logo: '/integration_logos/klarna-logo.png' },
        { name: 'Afterpay/Clearpay', description: 'Divide pagos en 4 cuotas quincenales sin interés', logo: '/integration_logos/afterpay-logo.png' },
        { name: 'Affirm', description: 'Opciones de pago flexible para clientes en EE.UU. y Canadá', logo: '/integration_logos/affirm-logo.png' },
        { name: 'Zip', description: 'Planes de pago flexibles semanales, bisemanales o mensuales', logo: '/integration_logos/zip-logo.png' }
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
        { name: 'SPEI', description: 'Transferencias bancarias instantáneas en México - ideal para B2B', logo: '/integration_logos/spei-logo.png' }
      ]
    },
    {
      category: 'Débito Directo',
      icon: '💰',
      methods: [
        { name: 'Débito directo SEPA', description: 'Pagos recurrentes en 36 países europeos con costos bajos', logo: '/integration_logos/sepa-logo.png' },
        { name: 'Débito directo Bacs', description: 'Método principal en Reino Unido para pagos puntuales y recurrentes', logo: '/integration_logos/bacs-logo.png' },
        { name: 'ACH Direct Debit', description: 'Costos de transacción reducidos para pagos en EE.UU.', logo: '/integration_logos/ach-logo.png' }
      ]
    },
    {
      category: 'Tarjetas',
      icon: '🎫',
      methods: [
        { name: 'Visa', description: 'Red de tarjetas más grande del mundo con mayor aceptación', logo: '/integration_logos/visa-logo.png' },
        { name: 'Mastercard', description: 'Tarjeta principal aceptada en más de 190 países', logo: '/integration_logos/mastercard-logo.png' },
        { name: 'American Express', description: 'Tarjeta premium con clientes de alto valor en 130+ países', logo: '/integration_logos/amex-logo.png' }
      ]
    },
    {
      category: 'Métodos Especiales',
      icon: '⭐',
      methods: [
        { name: 'Meses sin intereses', description: 'Fracciona compras en pagos mensuales fijos en México', logo: null },
        { name: 'Criptomonedas estables', description: 'Acepta monedas estables para alcance global (Preview)', logo: '/integration_logos/crypto-logo.png' },
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 py-6 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Expo360
          </Link>
          <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors">
            Volver a Precios
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20"></div>
        
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
              className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
            >
              Stripe: Tu Puerta a Pagos Globales
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
      <footer className="relative border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2025 Expo360 × Stripe Integration. Powered by Interzekt.</p>
        </div>
      </footer>
    </div>
  );
};

export default StripeBenefitsPage;
