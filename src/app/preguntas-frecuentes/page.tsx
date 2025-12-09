'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 py-6 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            Expo360
          </Link>
          <Link href="/#pricing" className="text-gray-300 hover:text-white transition-colors">
            Ver Precios
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
      <footer className="relative border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center text-gray-400 text-sm">
          <p>&copy; 2025 Expo360. Powered by Interzekt.</p>
        </div>
      </footer>
    </div>
  );
};

export default PreguntasFrecuentesPage;
