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
    'Furniture & Décor',
    'Technology',
    'Fashion',
    'Automotive',
    'Food & Beverage',
    'Beauty & Cosmetics',
    'Construction',
    'Other'
  ];

  const interestOptions = [
    'Customer Capture',
    'Real-Time Sales',
    'Data Analytics',
    'Integrations',
    'Dedicated Support'
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
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmissionSuccess(true);
        setStatusMessage('Thank you! We\'ll be in touch soon.');
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
        setStatusMessage('There was an error. Please try again.');
      }
    } catch (error) {
      setSubmissionSuccess(false);
      setStatusMessage('Connection error. Please try later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const fadeInDown = {
    hidden: { opacity: 0, y: -30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

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
            alt="Request a Personalized Demo"
            width={600}
            height={100}
            className="w-full h-auto"
          />
        </div>

        {/* Form Content */}
        <div className="p-8">
          <p className="text-gray-600 mb-6">Fill out the form to see Expo360 in action and receive a personalized proposal.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
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
                  Last Name *
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
                Email *
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
                  Company *
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
                  Job Title
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
                WhatsApp Number
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
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select your industry</option>
                {industryOptions.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Interest (Select all that apply)
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
                Event/Trade Show Name
              </label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="Where did you hear about us?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="howDidYouHear" className="block text-sm font-medium text-gray-700 mb-1">
                How did you hear about us?
              </label>
              <select
                id="howDidYouHear"
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an option</option>
                <option value="Trade Show Booth">Trade Show Booth</option>
                <option value="Brochure/Flyer">Brochure/Flyer</option>
                <option value="Referral">Referral</option>
                <option value="Online Search">Online Search</option>
                <option value="Social Media">Social Media</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-linear-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-md hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? 'Sending...' : 'View Expo360 Demo'}
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
                Safe & Secure
              </span>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No Spam Guaranteed
              </span>
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">
              By submitting this form, you agree to our privacy policy and terms of service.
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
              Features
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Pricing
            </a>
            <a href="#faq" className="text-gray-300 hover:text-white transition text-sm font-medium">
              Questions
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
              href="mailto:info0@interzekt.com?subject=Expo360%20-%20Sign%20In"
              className="hidden sm:inline-block px-6 py-2 text-sm font-semibold rounded-lg transition-all duration-300 bg-linear-to-r from-blue-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent"
            >
              Sign In
            </a>
            <a
              href="mailto:info0@interzekt.com?subject=Expo360%20-%20Sign%20Up"
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
            >
              Sign Up
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
              <p className="text-purple-200 text-sm font-semibold">🚀 Transform Your Expos Today</p>
            </div>
          </motion.div>

          {/* Main headline */}
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          >
            Convert Visitors Into <span className="bg-linear-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Paying Customers</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p 
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed"
          >
            Turn your trade shows and exhibitions into interactive digital experiences that capture customer data, enable real-time sales, and provide instant post-event attribution.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <a
              href="mailto:info0@interzekt.com?subject=Expo360%20-%20Ready%20to%20Get%20Started"
              className="group relative px-8 py-4 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg overflow-hidden hover:shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 flex items-center gap-2"
            >
              <span className="relative z-10">Get Started</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </a>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-8 py-4 border-2 border-gray-400 text-white font-semibold rounded-lg hover:border-white hover:bg-white/5 transition-all duration-300 flex items-center gap-2"
            >
              Contact Us
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
              <span>Color & Finish Variables</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Intuitive Dashboard</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-gray-600"></div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <span>Sales Analytics</span>
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
    <div className="relative py-20 md:py-32 bg-white overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white"></div>
      
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
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            From Idea to Reality in 3 Steps
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            While your competitors are still planning, you're already selling.
          </motion.p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 max-w-4xl mx-auto">
          {[
            {
              number: '01',
              title: 'Sign Up',
              description: 'Create your Expo360 account and tell us about your event. Takes just 2 minutes.'
            },
            {
              number: '02',
              title: 'Set Up MyExpo360',
              description: 'Upload your products, customize your branding, and configure your dashboard.'
            },
            {
              number: '03',
              title: 'Launch for Expo',
              description: 'Go live at your event. Start capturing customers and enabling real-time sales.'
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
            Beyond Data Capture
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Capture leads, personalize your sales, close with confidence. Everything under your control, on a simple and easy-to-use platform.
          </motion.p>
        </motion.div>

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Capture Customer Info',
              description: 'Instantly collect visitor data, preferences, and contact information in one unified platform.'
            },
            {
              icon: Smartphone,
              title: 'Direct Mobile Sales',
              description: 'Let customers purchase directly from their phones at your booth. No checkout delays.'
            },
            {
              icon: TrendingUp,
              title: 'Real-Time Attribution',
              description: 'Track which customers converted post-event with pinpoint accuracy. Know what works.'
            },
            {
              icon: Zap,
              title: 'Instant Quoting',
              description: 'Generate personalized quotes in seconds. Close deals while your customers are excited.'
            },
            {
              icon: Lock,
              title: 'You Own Your Data',
              description: 'No vendor lock-in. Export customer data anytime via CSV. Your data, your control.'
            },
            {
              icon: Clock,
              title: 'Cloud-Based & Fast',
              description: 'Deploy in minutes. No downloads, no complicated setup. Live and ready to go.'
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
    <div className="relative py-20 md:py-32 bg-white overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-gray-50 to-white"></div>

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
            className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Choose what works best for your business. No hidden fees.
          </motion.p>

          {/* Billing toggle */}
          <motion.div variants={fadeInUp} className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => setAnnualBillingSelected(false)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  !annualBillingSelected
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600'
                }`}
              >
                One-Time Use
              </button>
              <button
                onClick={() => setAnnualBillingSelected(true)}
                className={`px-6 py-2 rounded-md font-semibold transition-all ${
                  annualBillingSelected
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-gray-600'
                }`}
              >
                Annual Plan
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
              className="bg-linear-to-br from-white to-gray-50 border-2 border-gray-200 rounded-2xl p-8 relative overflow-hidden"
            >
              {/* Badge */}
              <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                Most Popular
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                One-Time Use
              </h3>
              <p className="text-gray-600 mb-6">
                Perfect for trying us out or hosting a single event
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-slate-900">$750</div>
                <p className="text-gray-600 mt-2">USD + 30-day free trial included</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Landing page for 1 expo',
                  'Admin dashboard with 2 users',
                  'Up to 500 products',
                  'Unlimited customer captures',
                  'Real-time quoting & sales',
                  '30 days of access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20One-Time%20Use"
                className="block w-full py-3 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg text-center hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-300"
              >
                Get Started Now
              </a>

              {/* Data export note */}
              <p className="text-xs text-gray-500 mt-4 text-center">
                After 30 days, export your data via CSV or continue with annual plan
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
                Annual Plan
              </h3>
              <p className="text-purple-100 mb-6">
                Unlimited expos, events & locations year-round
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-white">$4,500</div>
                <p className="text-purple-100 mt-2">USD per year</p>
                <p className="text-purple-200 text-sm mt-3">
                  Or <span className="font-semibold">$84,999 MXN/year</span> (locked rate)
                </p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Unlimited trade shows & events',
                  'Up to 5 brick-and-mortar locations',
                  'Unlimited products & users',
                  'Unlimited customer captures',
                  'Real-time quoting & sales',
                  'Ongoing Interzekt support',
                  'Priority onboarding'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20Annual%20Plan"
                className="block w-full py-3 bg-white text-purple-600 font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-300"
              >
                Unlock Unlimited Access
              </a>

              {/* Billing note */}
              <p className="text-xs text-purple-200 mt-4 text-center">
                12-month commitment with card on file
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
                One-Time Use
              </h3>
              <p className="text-gray-600 mb-6">
                Perfect for testing or a single event
              </p>

              {/* Price */}
              <div className="mb-8">
                <div className="text-5xl font-bold text-slate-900">$750</div>
                <p className="text-gray-600 mt-2">USD flat fee</p>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  'Landing page for 1 expo',
                  'Admin dashboard with 2 users',
                  'Up to 500 products',
                  'Unlimited customer captures',
                  'Real-time quoting & sales',
                  '30 days of access'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="mailto:info0@interzekt.com?subject=Expo360%20-%20One-Time%20Use"
                className="block w-full py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded-lg text-center hover:bg-gray-100 transition-all duration-300"
              >
                Start Your Trial
              </a>
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
            Have questions? <a href="https://wa.me/528186931122" className="text-purple-600 font-semibold hover:underline">Chat with us on WhatsApp</a>
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
            Built for Speed & Simplicity
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Enterprise-grade features without the complexity
          </motion.p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
          {[
            {
              title: 'No Downloads Needed',
              description: 'Completely cloud-based. Works on any device, anywhere, anytime.'
            },
            {
              title: 'Lightning-Fast Deployment',
              description: 'Go live in minutes. Get started immediately without complex setups.'
            },
            {
              title: 'Real-Time Analytics',
              description: 'Watch customer engagement happen live. Track what matters during your event.'
            },
            {
              title: 'Mobile-First Design',
              description: 'Perfect experience on tablets and phones. Customers never have friction.'
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
            Trusted by sales teams at leading companies
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
            Ready to Transform Your Expos?
          </motion.h2>

          <motion.p 
            variants={fadeInUp}
            className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto"
          >
            Join forward-thinking sales teams who are capturing more customers, closing more deals, and owning their customer data.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="mailto:info0@interzekt.com?subject=Expo360%20-%20Ready%20to%20Get%20Started"
              className="group relative px-10 py-4 bg-white text-purple-600 font-bold rounded-lg hover:shadow-2xl transition-all duration-300 flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="https://wa.me/528186931122?text=I%20want%20to%20learn%20more%20about%20Expo360"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              Schedule a Demo
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
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Features</a></li>
              <li><a href="#" className="hover:text-white transition">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">About</a></li>
              <li><a href="#" className="hover:text-white transition">Blog</a></li>
              <li><a href="#" className="hover:text-white transition">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition">Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition">Terms</a></li>
              <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© 2024 Expo360 by Interzekt. All rights reserved.</p>
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
