'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Check, ArrowRight, Zap, Users, TrendingUp, Lock, Clock, Smartphone } from 'lucide-react';

const LandingPage = () => {
  const [annualBillingSelected, setAnnualBillingSelected] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
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

  const industryOptions = [
    'Muebles y Decoración',
    'Tecnología',
    'Moda',
    'Automotriz',
    'Alimentos y Bebidas',
    'Belleza y Cosméticos',
    'Construcción',
    'Otro'
  ];

  const interestOptions = [
    'Captura de Clientes',
    'Ventas en Tiempo Real',
    'Análisis de Datos',
    'Integraciones',
    'Soporte Dedicado'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      // Send form data to your backend or email service
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmissionSuccess(true);
        setStatusMessage('¡Gracias! Nos pondremos en contacto pronto.');
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
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setSubmissionSuccess(false);
        setStatusMessage('Hubo un error. Por favor intenta de nuevo.');
      }
    } catch (_error) {
      setSubmissionSuccess(false);
      setStatusMessage('Error de conexión. Por favor intenta más tarde.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // const fadeInDown = {
  //   hidden: { opacity: 0, y: -30 },
  //   visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  // };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } }
  };

  // ==================== CONTACT MODAL ====================
  const ContactModal = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isModalOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-9999 flex items-center justify-center p-4 ${
        isModalOpen ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
      onClick={() => setIsModalOpen(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={isModalOpen ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="sticky top-0 bg-white z-10">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-20"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src="/solicita.jpeg"
            alt="Solicita una Demostración Personalizada"
            width={600}
            height={100}
            className="w-full h-auto"
          />
        </div>

        {/* Form Content */}
        <div className="p-8">
          <p className="text-gray-600 mb-6">Completa el formulario para ver <img src="/expo360.png" alt="Expo360" className="inline h-10 mx-1" /> en acción y recibir una propuesta personalizada.</p>

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
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
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
        </div>
      </motion.div>
    </motion.div>
  );

  // ==================== HEADER NAVIGATION ====================
  const Header = () => (
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
            <a href="#features" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Características
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Precios
            </a>
            <a href="#faq" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Preguntas
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
              href="#pricing"
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
            >
              Registrarse
            </a>
          </motion.div>
        </div>
      </div>
    </header>
  );

  // ==================== HERO SECTION ====================
  const HeroSection = () => (
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900"></div>
      
      {/* Animated grid background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Floating orbs for visual interest */}
      <motion.div 
        className="absolute top-20 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          y: [0, 30, 0],
          x: [0, 20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{ 
          y: [0, -30, 0],
          x: [0, -20, 0]
        }}
        transition={{ duration: 8, repeat: Infinity, delay: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <motion.div
          className="text-center max-w-3xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Eyebrow text */}
          <motion.div variants={fadeInUp} className="inline-block mb-6">
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2 backdrop-blur-sm">
              <p className="text-purple-200 text-sm font-semibold">🚀 Transforma Tus Exposiciones Hoy</p>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            De Visitantes a Ventas: <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">En Minutos, No Meses</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
          >
            Transforma tus ferias comerciales y exhibiciones en experiencias digitales interactivas que capturen datos de clientes, permitan ventas en tiempo real y proporcionen atribución post-evento instantánea.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a
              href="#pricing"
              className="group relative px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 flex items-center gap-2"
            >
              <span className="relative z-10">Comienza Ahora</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 border-2 border-gray-400 text-white font-semibold rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
            >
              Contáctanos
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-gray-400 pt-8"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Variables de Colores/Acabados</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Dashboard Intuitivo</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Análisis de Ventas</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          variants={fadeInUp}
          className="mt-16 relative"
        >
          <div className="bg-linear-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-1 border border-purple-500/20">
            <div className="bg-slate-800 rounded-xl aspect-video flex items-center justify-center overflow-hidden relative">
              <Image
                src="/kusam_hero2.png"
                alt="Expo360 Dashboard Preview"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          
          {/* Decorative blur effect */}
          <div className="absolute -bottom-4 -right-4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl -z-10"></div>
        </motion.div>
      </div>
    </div>
  );

  // ==================== 3-STEP PROCESS ====================
  const StepsSection = () => (
    <div className="relative py-20 md:py-32 overflow-hidden">
      {/* Video background */}
      <video 
        autoPlay 
        muted 
        loop
        className="absolute inset-0 w-full h-full object-cover"
        style={{ position: 'absolute', top: 0, left: 0 }}
      >
        <source src="/expo_not_loop.mp4" type="video/mp4" />
      </video>
      
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/55"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            De Idea a Realidad en 3 Pasos
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-200 max-w-2xl mx-auto"
          >
            Mientras tus competidores siguen planificando, tú ya estás vendiendo.
          </motion.p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-4xl mx-auto">
          {[
            {
              number: '01',
              title: 'Regístrate',
              description: 'Crea tu cuenta de ',
              hasLogo: true,
              descriptionAfter: ' y cuéntanos sobre tu evento. Solo toma 2 minutos.'
            },
            {
              number: '02',
              title: 'Configura MyExpo360',
              description: 'Carga tus productos, personaliza tu marca y configura tu panel de control.'
            },
            {
              number: '03',
              title: 'Lanza tu Expo',
              description: 'Ve en vivo en tu evento. Comienza a capturar clientes y a habilitar ventas en tiempo real.'
            }
          ].map((step, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={scaleIn}
              className="relative"
            >
              {/* Connector line */}
              {idx < 2 && (
                <div className="hidden md:block absolute top-16 -right-8 w-16 h-0.5 bg-linear-to-r from-purple-400 to-transparent"></div>
              )}

              <div className="bg-white border-2 border-gray-200 rounded-xl p-8 hover:border-purple-400 transition-colors duration-300 h-full">
                {/* Step number */}
                <div className="mb-6">
                  <span className="text-5xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                  {step.hasLogo && (
                    <>
                      <img src="/expo360.png" alt="Expo360" className="inline h-10 mx-1" />
                      {step.descriptionAfter}
                    </>
                  )}
                  {!step.hasLogo && step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== KEY BENEFITS SECTION ====================
  const BenefitsSection = () => (
    <div className="relative py-20 md:py-32 bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full filter blur-3xl"
        animate={{ y: [0, 50, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Más Allá de Capturar Datos
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Captura contactos, personaliza tus ventas, cierra con confianza. Todo bajo tu control, en una plataforma sencilla y fácil de usar.
          </motion.p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Captura Información de Clientes',
              description: 'Recopila instantáneamente datos de visitantes, preferencias e información de contacto en una plataforma unificada.'
            },
            {
              icon: Smartphone,
              title: 'Ventas Móviles Directas',
              description: 'Permite que los clientes compren directamente desde sus teléfonos en tu stand. Sin retrasos en el pago.'
            },
            {
              icon: TrendingUp,
              title: 'Atribución en Tiempo Real',
              description: 'Rastrea qué clientes se convirtieron post-evento con precisión absoluta. Sabe qué funciona.'
            },
            {
              icon: Zap,
              title: 'Cotizaciones Instantáneas',
              description: 'Genera cotizaciones personalizadas en segundos. Cierra tratos mientras tus clientes están emocionados.'
            },
            {
              icon: Lock,
              title: 'Posees Tus Datos',
              description: 'Sin bloqueo de proveedor. Exporta datos de clientes en cualquier momento via CSV. Tus datos, tu control.'
            },
            {
              icon: Clock,
              title: 'Basado en la Nube y Rápido',
              description: 'Implementa en minutos. Sin descargas, sin configuración complicada. En vivo y listo para funcionar.'
            }
          ].map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <motion.div
                key={idx}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                transition={{ delay: idx * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-8 backdrop-blur-sm hover:bg-white/10 hover:border-purple-500/50 transition-all duration-300"
              >
                <div className="mb-4">
                  <Icon className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {benefit.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==================== PRICING SECTION ====================
  const PricingSection = () => (
    <div id="pricing" className="relative py-20 md:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Precios Simples y Transparentes
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            Elige lo que mejor funcione para tu negocio. Sin tarifas ocultas.
          </motion.p>

          {/* Billing toggle */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-12">
            <div className="bg-white/10 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setAnnualBillingSelected(false)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  !annualBillingSelected
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-300'
                }`}
              >
                Una Sola Expo
              </button>
              <button
                onClick={() => setAnnualBillingSelected(true)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  annualBillingSelected
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-300'
                }`}
              >
                Plan Anual
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* One-Time Card */}
          {!annualBillingSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-linear-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Más Popular
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Una Sola Expo
              </h3>
              <p className="text-gray-300 mb-6">
                Perfecto para probar o para una única exposición
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-white">$15,000</div>
                <p className="text-gray-300 mt-2">MXN pago único</p>
                <p className="text-green-400 text-sm mt-3 font-semibold">
                  + 1 mes de acceso a todas las funciones premium
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Página de destino para 1 expo',
                  'Panel de administración con 2 usuarios',
                  'Hasta 500 productos',
                  'Capturas de clientes ilimitadas',
                  'Cotizaciones y ventas en tiempo real',
                  '1 mes completo de acceso premium'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                    <span className="text-gray-200">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20Uso%20Único"
                className="block w-full py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg text-center hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
              >
                Comienza Ahora
              </a>

              {/* Data export note */}
              <p className="text-xs text-gray-400 mt-4 text-center">
                El primer mes incluye acceso completo. Después puedes continuar con el plan anual.
              </p>
            </motion.div>
          )}

          {/* Annual Plan Card */}
          {annualBillingSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-linear-to-br from-purple-600 to-blue-600 rounded-2xl p-8 relative overflow-hidden shadow-2xl md:col-span-2 lg:col-span-1"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Best Value
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Plan Anual
              </h3>
              <p className="text-purple-100 mb-6">
                Exposiciones ilimitadas, eventos y ubicaciones todo el año
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-white">$84,999</div>
                <p className="text-purple-100 mt-2">MXN por año</p>
                <p className="text-purple-200 text-sm mt-3">
                  (Tasa fija garantizada)
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Exposiciones comerciales y eventos ilimitados',
                  'Hasta 5 ubicaciones físicas',
                  'Productos y usuarios ilimitados',
                  'Capturas de clientes ilimitadas',
                  'Cotización y ventas en tiempo real',
                  'Soporte continuo de Interzekt',
                  'Incorporación prioritaria'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20Plan%20Anual"
                className="block w-full py-3 bg-white text-purple-600 font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-300"
              >
                Desbloquea Acceso Ilimitado
              </a>

              {/* Billing note */}
              <p className="text-xs text-purple-200 mt-4 text-center">
                Compromiso de 12 meses con tarjeta registrada
              </p>
            </motion.div>
          )}

          {/* Show both when neither selected, but let toggle control display */}
          {annualBillingSelected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-linear-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Popular
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Una Sola Expo
              </h3>
              <p className="text-gray-600 mb-6">
                Perfecto para probar o para una única exposición
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-slate-900">$15,000</div>
                <p className="text-gray-600 mt-2">MXN pago único</p>
                <p className="text-green-600 text-sm mt-3 font-semibold">
                  + 1 mes de acceso a todas las funciones premium
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Página de destino para 1 expo',
                  'Panel de administración con 2 usuarios',
                  'Hasta 500 productos',
                  'Capturas de clientes ilimitadas',
                  'Cotizaciones y ventas en tiempo real',
                  '1 mes completo de acceso premium'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20Una%20Sola%20Expo"
                className="block w-full py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg text-center hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
              >
                Comienza Ahora
              </a>

              {/* Data export note */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                El primer mes incluye acceso completo. Después puedes continuar con el plan anual.
              </p>
            </motion.div>
          )}
        </div>

        {/* FAQ note */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
          className="text-center mt-16"
        >
          <p className="text-gray-600">
            ¿Tienes preguntas? <a href="https://wa.me/528186931122" className="text-purple-600 font-semibold hover:underline">Chatea con nosotros en WhatsApp</a>
          </p>
        </motion.div>
      </div>
    </div>
  );

  // ==================== QUICK FEATURES SECTION ====================
  const FeaturesSection = () => (
    <div className="relative py-20 md:py-32 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Background animation */}
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"
        animate={{ x: [0, 30, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Construido para Velocidad y Simplicidad
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Características de nivel empresarial sin complejidad
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {[
            {
              title: 'Sin Descargas Necesarias',
              description: 'Completamente basado en la nube. Funciona en cualquier dispositivo, en cualquier lugar, en cualquier momento.'
            },
            {
              title: 'Implementación Ultrarrápida',
              description: 'Actívate en minutos. Comienza inmediatamente sin configuraciones complejas.'
            },
            {
              title: 'Análisis en Tiempo Real',
              description: 'Observa el compromiso del cliente en vivo. Realiza un seguimiento de lo que importa durante tu evento.'
            },
            {
              title: 'Diseño Centrado en Dispositivos Móviles',
              description: 'Experiencia perfecta en tabletas y teléfonos. Tus clientes nunca tendrán fricción.'
            }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              transition={{ delay: idx * 0.1 }}
              className="border-l-2 border-purple-500/50 pl-6"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  // ==================== SOCIAL PROOF SECTION ====================
  const SocialProofSection = () => (
    <div className="relative py-16 md:py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="text-center"
        >
          <motion.p 
            variants={fadeInUp}
            className="text-gray-600 font-semibold mb-6"
          >
            Confiado por equipos de ventas en empresas líderes
          </motion.p>
          
          {/* Placeholder for company logos */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60"
          >
            {['Company A', 'Company B', 'Company C', 'Company D'].map((company, idx) => (
              <div key={idx} className="text-gray-400 font-semibold text-lg">
                {company}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // ==================== FINAL CTA SECTION ====================
  const FinalCTASection = () => (
    <div className="relative py-20 md:py-32 bg-linear-to-br from-purple-600 via-blue-600 to-purple-700 overflow-hidden">
      {/* Decorative elements */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full filter blur-3xl"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight"
          >
            ¿Listo para Transformar Tus Exposiciones?
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto"
          >
            Únete a equipos de ventas visionarios que están capturando más clientes, cerrando más tratos y siendo dueños de sus datos de clientes.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="mailto:info0@interzekt.com?subject=Expo360%20-%20Listo%20para%20Comenzar"
              className="group relative px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
            >
              <span>Comienza Ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://wa.me/528186931122?text=Quiero%20aprender%20más%20sobre%20Expo360"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Programar una Demo
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );

  // ==================== FOOTER ====================
  const FooterSection = () => (
    <footer className="bg-slate-900 border-t border-slate-800 py-12">
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
          <p>© 2024 Expo360 por Interzekt. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition">Twitter</a>
            <a href="#" className="hover:text-white transition">LinkedIn</a>
            <a href="#" className="hover:text-white transition">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="overflow-hidden bg-white">
      <ContactModal />
      <div className="relative">
        <Header />
        <HeroSection />
      </div>
      <StepsSection />
      <BenefitsSection />
      <PricingSection />
      <FeaturesSection />
      <SocialProofSection />
      <FinalCTASection />
      <FooterSection />
    </div>
  );
};

export default LandingPage;