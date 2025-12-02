'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    jobTitle: '',
    phone: '',
    industry: '',
    interests: [] as string[],
    eventName: '',
    howDidYouHear: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const interestOptions = [
    'Catálogos Digitales Interactivos',
    'Procesamiento de Pagos en Tiempo Real',
    'Integración CRM para Exposiciones',
    'Generación de Cotizaciones Automáticas',
    'Experiencias QR Personalizadas',
    'Analytics de Visitantes',
    'Gestión de Inventario para Ferias',
    'Soluciones Multi-Industria'
  ];

  const industryOptions = [
    'Agricultura y Ganadería',
    'Alimentación y Bebidas',
    'Arte y Entretenimiento',
    'Automotriz',
    'Belleza y Cuidado Personal',
    'Biotecnología',
    'Construcción y Arquitectura',
    'Consultoría',
    'Decoración de Interiores',
    'Diseño y Mobiliario',
    'Educación',
    'Electrónicos y Tecnología',
    'Energía y Utilities',
    'Farmacéutica',
    'Finanzas y Banca',
    'Fitness y Deportes',
    'Gobierno y Sector Público',
    'Hogar y Muebles',
    'Hotelería y Turismo',
    'Inmobiliaria',
    'Joyería y Lujo',
    'Logística y Transporte',
    'Manufactura',
    'Marketing y Publicidad',
    'Medios y Comunicación',
    'Medicina y Salud',
    'Minería',
    'Moda y Textiles',
    'Muebles y Decoración',
    'Música',
    'ONG y Sin Fines de Lucro',
    'Petróleo y Gas',
    'Productos Químicos',
    'Recursos Humanos',
    'Retail y Comercio',
    'Seguridad',
    'Seguros',
    'Servicios Financieros',
    'Servicios Legales',
    'Servicios Profesionales',
    'Software y TI',
    'Telecomunicaciones',
    'Veterinaria',
    'Otro'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInterestChange = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('Enviando tu información...');

    try {
      const response = await fetch('/api/onboarding/create-trial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          submittedAt: new Date().toISOString(),
          source: 'Onboarding Form'
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setStatusMessage('¡Gracias! Tu información ha sido enviada exitosamente.');
        setSubmissionSuccess(true);
        setTimeout(() => {
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            company: '',
            jobTitle: '',
            phone: '',
            industry: '',
            interests: [],
            eventName: '',
            howDidYouHear: ''
          });
          setStatusMessage('');
          setSubmissionSuccess(false);
        }, 3000);
      } else {
        setStatusMessage(result.message || 'Error al enviar. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Submission error:', error);
      setStatusMessage('Ocurrió un error. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" as const }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Image
                src="/expo360_logo.png"
                alt="Expo360"
                width={120}
                height={60}
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column - Information */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Qué es Expo360?
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Expo360 by Interzekt™ redefine la forma en que las empresas exhiben sus productos en ferias, exposiciones y salas de exhibición. Nuestra plataforma digital interactiva transforma las exhibiciones de productos tradicionales en experiencias personalizadas y dinámicas, que cautivan y convierten a los visitantes en clientes.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Experiencia Digital Completa</h3>
                  <p className="text-gray-600">Catálogos interactivos con códigos QR, carrito digital y favoritos personalizables</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pagos y Cotizaciones Integrados</h3>
                  <p className="text-gray-600">Procesamiento seguro con Stripe, MercadoPago y cotizaciones en tiempo real</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 rounded-lg p-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Múltiples Industrias</h3>
                  <p className="text-gray-600">Ideal para muebles, equipo, retail y más con integración CRM automática</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-3">¿Listo para tu Próxima Exposición?</h3>
              <p className="text-gray-700 mb-4">
                Ya seas un expositor que busca maximizar la interacción en su stand, el dueño de una sala de exhibición que quiere mejorar la experiencia del cliente, o un negocio minorista que une las compras físicas y digitales, <strong>Expo360 es tu solución definitiva.</strong>
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Convierte a tus visitantes en clientes desde el primer escaneo hasta la venta final
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Form */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Solicita una Demostración Personalizada</h2>
              <p className="text-gray-600">Completa el formulario para ver <img src="/expo360.png" alt="Expo360" className="inline h-10 mx-1" /> en acción y recibir una propuesta personalizada.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de WhatsApp
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1">
                  Industria
                </label>
                <select
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona tu industria</option>
                  {industryOptions.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Áreas de Interés (Selecciona todas las que apliquen)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {interestOptions.map((interest) => (
                    <label key={interest} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.interests.includes(interest)}
                        onChange={() => handleInterestChange(interest)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{interest}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Evento/Feria Comercial
                </label>
                <input
                  type="text"
                  id="eventName"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="¿Dónde nos encontraste?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">
                  ¿Cómo te enteraste de nosotros?
                </label>
                <select
                  id="howDidYouHear"
                  name="howDidYouHear"
                  value={formData.howDidYouHear}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecciona una opción</option>
                  <option value="Stand de Feria Comercial">Stand de Feria Comercial</option>
                  <option value="Folleto/Volante">Folleto/Volante</option>
                  <option value="Referencia">Referencia</option>
                  <option value="Búsqueda en Línea">Búsqueda en Línea</option>
                  <option value="Redes Sociales">Redes Sociales</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? 'Enviando...' : 'Ver Demostración de Expo360'}
              </button>

              {statusMessage && (
                <div className={`text-center p-3 rounded-md ${
                  submissionSuccess 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {statusMessage}
                </div>
              )}
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Seguro y Privado
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Sin Spam Garantizado
                </span>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                Al enviar este formulario, aceptas nuestra política de privacidad y términos de servicio.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
