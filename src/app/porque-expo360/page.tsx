'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, 
  Users, 
  TrendingUp, 
  Clock, 
  Shield, 
  Smartphone,
  BarChart3,
  Globe,
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const PorqueExpo360Page = () => {
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

  const benefits = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'Captura de Datos Instantánea',
      description: 'Recopila información de tus clientes en tiempo real durante ferias y exposiciones. Sin papel, sin errores, sin demoras.'
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Ventas en Tiempo Real',
      description: 'Genera cotizaciones y cierra ventas directamente desde tu expo. Conecta con Stripe para procesar pagos al instante.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Gestión de Clientes',
      description: 'Organiza y segmenta a tus prospectos automáticamente. Accede a su historial de interacciones desde cualquier lugar.'
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Experiencia Mobile-First',
      description: 'Diseñado para funcionar perfectamente en cualquier dispositivo. Tu equipo puede operar desde tablets o smartphones.'
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Analíticas y Reportes',
      description: 'Métricas detalladas de rendimiento, conversiones y ROI de cada evento. Toma decisiones basadas en datos reales.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Seguridad Empresarial',
      description: 'Tus datos están protegidos con encriptación de nivel bancario. Cumplimos con estándares internacionales de seguridad.'
    }
  ];

  const differentiators = [
    {
      title: 'Diseñado para Ferias Comerciales',
      description: 'A diferencia de CRMs genéricos, Expo360 está específicamente optimizado para el entorno único de las exposiciones y ferias.'
    },
    {
      title: 'Implementación en Minutos',
      description: 'No necesitas meses de configuración. Tu equipo puede empezar a usar Expo360 el mismo día con onboarding guiado.'
    },
    {
      title: 'Integración con Stripe México',
      description: 'Acepta pagos con tarjetas, OXXO, SPEI y más de 100 métodos de pago sin complicaciones técnicas.'
    },
    {
      title: 'Soporte en Español',
      description: 'Atención personalizada en tu idioma. Nuestro equipo está basado en México y entiende las necesidades locales.'
    }
  ];

  const stats = [
    { value: '500+', label: 'Productos por cuenta' },
    { value: '∞', label: 'Capturas de clientes' },
    { value: '5', label: 'Ubicaciones físicas' },
    { value: '24/7', label: 'Soporte disponible' }
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
              <Sparkles className="w-4 h-4" />
              La plataforma #1 para ferias comerciales
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-4xl md:text-6xl font-bold bg-linear-to-r from-purple-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight pb-2"
            >
              ¿Por Qué Elegir Expo360?
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            >
              Transforma tus ferias comerciales en máquinas de ventas. Captura leads, genera cotizaciones y cierra tratos — todo desde una sola plataforma.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-12 px-4 sm:px-6 lg:px-8 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, idx) => (
              <motion.div key={idx} variants={fadeInUp} className="text-center">
                <div className="text-4xl md:text-5xl font-bold bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <p className="text-gray-400 mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
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
              Beneficios Clave
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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

      {/* Differentiators Section */}
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
              Lo Que Nos Hace Diferentes
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-gray-300 text-center max-w-2xl mx-auto"
            >
              Expo360 no es solo otro CRM — es una solución completa diseñada exclusivamente para el mundo de las exposiciones.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {differentiators.map((item, idx) => (
              <motion.div
                key={idx}
                variants={fadeInUp}
                className="flex gap-4 bg-white/5 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-all"
              >
                <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.description}</p>
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
              ¿Listo para Transformar tus Expos?
            </motion.h2>
            
            <motion.p 
              variants={fadeInUp}
              className="text-lg text-white/90 mb-8"
            >
              Únete a las empresas que ya están maximizando sus resultados en ferias comerciales
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-all duration-300"
              >
                Ver Planes y Precios
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/preguntas-frecuentes"
                className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-white/20 text-white font-semibold rounded-lg border border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Preguntas Frecuentes
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

export default PorqueExpo360Page;
