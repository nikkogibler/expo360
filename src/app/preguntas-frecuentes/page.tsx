'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Vortex } from '@/ui/vortex';
import { ChevronDown, HelpCircle, ArrowRight } from 'lucide-react';

const PreguntasFrecuentesPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

  const faqCategories = [
    {
      category: 'General',
      questions: [
        {
          question: '¿Qué es Expo360?',
          answer: 'Expo360 es una plataforma integral diseñada específicamente para ferias comerciales y exposiciones. Permite capturar datos de clientes, generar cotizaciones en tiempo real, procesar ventas y obtener analíticas detalladas de cada evento — todo desde una sola herramienta.'
        },
        {
          question: '¿Para quién está diseñado Expo360?',
          answer: 'Expo360 es ideal para empresas que participan en ferias comerciales, exposiciones, showrooms y eventos B2B. Desde fabricantes de muebles hasta distribuidores de tecnología, cualquier negocio que necesite capturar leads y vender en eventos puede beneficiarse.'
        },
        {
          question: '¿Necesito conocimientos técnicos para usar Expo360?',
          answer: 'No. Expo360 está diseñado para ser intuitivo y fácil de usar. Ofrecemos onboarding guiado y soporte en español para que tu equipo pueda empezar a trabajar en minutos, no en semanas.'
        }
      ]
    },
    {
      category: 'Precios y Planes',
      questions: [
        {
          question: '¿Cuánto cuesta Expo360?',
          answer: 'Ofrecemos dos opciones principales: Una Sola Expo por $15,000 MXN (pago único con 1 mes de acceso), ideal para probar la plataforma. Y el Plan Anual por $84,999 MXN/año que incluye expos ilimitadas, hasta 5 ubicaciones físicas y soporte continuo.'
        },
        {
          question: '¿Hay costos ocultos?',
          answer: 'No. Nuestros precios son transparentes y todo incluido. Las únicas tarifas adicionales serían las comisiones estándar de Stripe si decides procesar pagos (aproximadamente 3.6% + $3 MXN por transacción).'
        },
        {
          question: '¿Puedo cambiar de plan después?',
          answer: 'Sí. Si empiezas con Una Sola Expo y decides continuar, puedes actualizar al Plan Anual en cualquier momento. Tu historial de datos se mantiene intacto.'
        },
        {
          question: '¿Ofrecen descuentos para múltiples años?',
          answer: 'Sí, para compromisos de 2 o más años ofrecemos descuentos especiales. Contáctanos para una cotización personalizada según tus necesidades.'
        }
      ]
    },
    {
      category: 'Funcionalidades',
      questions: [
        {
          question: '¿Cuántos productos puedo cargar?',
          answer: 'El Plan Anual incluye productos ilimitados. El plan de Una Sola Expo permite hasta 500 productos, más que suficiente para la mayoría de las exposiciones.'
        },
        {
          question: '¿Puedo usar Expo360 sin conexión a internet?',
          answer: 'Expo360 requiere conexión a internet para funcionar en tiempo real. Sin embargo, recomendamos tener un plan de datos móviles como respaldo en caso de que el WiFi del evento falle.'
        },
        {
          question: '¿Cómo funciona la captura de clientes?',
          answer: 'Tus visitantes pueden escanear un código QR o acceder a tu landing page personalizada. Ahí pueden explorar tu catálogo, solicitar cotizaciones y dejar sus datos de contacto automáticamente.'
        },
        {
          question: '¿Puedo personalizar la apariencia de mi página?',
          answer: 'Sí. Expo360 permite personalizar colores, logos, imágenes de productos y textos para que tu página refleje la identidad de tu marca.'
        }
      ]
    },
    {
      category: 'Pagos e Integraciones',
      questions: [
        {
          question: '¿Qué métodos de pago acepta Expo360?',
          answer: 'A través de nuestra integración con Stripe México, puedes aceptar tarjetas de crédito/débito (Visa, Mastercard, Amex), pagos en OXXO, transferencias SPEI, y más de 100 métodos de pago adicionales.'
        },
        {
          question: '¿Necesito una cuenta de Stripe?',
          answer: 'Sí, para procesar pagos en tiempo real necesitarás crear una cuenta de Stripe (es gratis). Nosotros te guiamos en el proceso de configuración.'
        },
        {
          question: '¿Expo360 se integra con otros sistemas?',
          answer: 'Actualmente Expo360 funciona como plataforma independiente con exportación de datos vía CSV. Para integraciones personalizadas con ERPs o CRMs, ofrecemos soluciones Enterprise a medida.'
        },
        {
          question: '¿Cómo recibo el dinero de mis ventas?',
          answer: 'Los pagos procesados a través de Stripe se depositan directamente en tu cuenta bancaria, típicamente en 2-3 días hábiles. Stripe maneja toda la seguridad y cumplimiento.'
        }
      ]
    },
    {
      category: 'Soporte y Seguridad',
      questions: [
        {
          question: '¿Qué tipo de soporte ofrecen?',
          answer: 'El Plan Anual incluye soporte prioritario vía email y WhatsApp en español. Para planes Enterprise, ofrecemos soporte dedicado 24/7 y un gerente de cuenta asignado.'
        },
        {
          question: '¿Mis datos están seguros?',
          answer: 'Absolutamente. Usamos encriptación de nivel bancario (AES-256), servidores seguros y cumplimos con estándares internacionales de privacidad. Tus datos nunca se comparten con terceros.'
        },
        {
          question: '¿Qué pasa con mis datos si cancelo?',
          answer: 'Si decides no continuar, puedes exportar todos tus datos vía CSV antes de que tu cuenta expire. Mantenemos los datos por 30 días adicionales como respaldo.'
        },
        {
          question: '¿Ofrecen capacitación para mi equipo?',
          answer: 'Sí. Todos los planes incluyen onboarding inicial. El Plan Anual incluye sesiones de capacitación adicionales y los planes Enterprise incluyen entrenamiento personalizado ilimitado.'
        }
      ]
    }
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let globalIndex = 0;

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Page Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900/20 via-black to-blue-900/20 pointer-events-none"></div>
      <div className="relative z-10">
      {/* Navigation Header */}
      <header className="relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0.5">
          <div className="flex items-center justify-between">
            {/* Logo - Left */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link href="/">
                <Image
                  src="/expo360_logo.png"
                  alt="Expo360 Logo"
                  width={120}
                  height={120}
                  className="rounded-lg scale-150"
                />
              </Link>
            </motion.div>

            {/* Center Nav Links */}
            <motion.nav
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="hidden md:flex items-center gap-8 absolute left-1/2 transform -translate-x-1/2"
            >
              <Link href="/porque-expo360" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                ¿Porqué Expo360?
              </Link>
              <Link href="/#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1">
                Precios
              </Link>
              <Link 
                href="/onboarding"
                className="text-gray-300 hover:text-white transition text-sm font-medium leading-normal py-1"
              >
                Contáctanos
              </Link>
            </motion.nav>

            {/* Right Auth Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex gap-3"
            >
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
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-300 text-sm font-medium">
              <HelpCircle className="w-4 h-4" />
              Centro de Ayuda
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight pb-2"
            >
              Preguntas Frecuentes
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Encuentra respuestas a las preguntas más comunes sobre Expo360
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-12"
          >
            {faqCategories.map((category, catIdx) => {
              return (
                <motion.div key={catIdx} variants={fadeInUp}>
                  <h2 className="text-2xl font-bold mb-6 text-purple-300">{category.category}</h2>
                  <div className="space-y-4">
                    {category.questions.map((faq, qIdx) => {
                      const currentIndex = globalIndex++;
                      return (
                        <div
                          key={qIdx}
                          className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-purple-500/30 transition-all"
                        >
                          <button
                            onClick={() => toggleQuestion(currentIndex)}
                            className="w-full flex items-center justify-between p-6 text-left"
                          >
                            <span className="font-semibold text-white pr-4">{faq.question}</span>
                            <ChevronDown 
                              className={`w-5 h-5 text-purple-400 shrink-0 transition-transform duration-300 ${
                                openIndex === currentIndex ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          <AnimatePresence>
                            {openIndex === currentIndex && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <p className="px-6 pb-6 text-gray-300 leading-relaxed">
                                  {faq.answer}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Still Have Questions CTA */}
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
              ¿Aún Tienes Preguntas?
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-white/90 mb-8"
            >
              Nuestro equipo está listo para ayudarte. Contáctanos y te responderemos en menos de 24 horas.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="https://wa.me/528186931122?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20Expo360"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
                style={{ color: '#32dbbf' }}
              >
                Escríbenos Por WhatsApp
                <ArrowRight className="w-5 h-5" />
              </a>
              <Link
                href="/porque-expo360"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                ¿Por Qué Expo360?
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-transparent py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Características</a></li>
                <li><a href="#" className="hover:text-white transition">Precios</a></li>
                <li><a href="#" className="hover:text-white transition">Seguridad</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Acerca de</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Carreras</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Centro de Ayuda</a></li>
                <li><a href="#" className="hover:text-white transition">Documentación</a></li>
                <li><a href="#" className="hover:text-white transition">Estado</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition">Términos</a></li>
                <li><a href="#" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2025 <a href="/" className="bg-linear-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Expo360</a> por <a href="https://interzekt.com" target="_blank" rel="noopener noreferrer" className="bg-linear-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent hover:opacity-80 transition font-semibold">Interzekt.com</a>. Todos los derechos reservados.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Twitter</a>
              <a href="#" className="hover:text-white transition">LinkedIn</a>
              <a href="#" className="hover:text-white transition">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default PreguntasFrecuentesPage;
