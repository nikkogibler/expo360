'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { EVENT_PASSES, EventPass } from '@/config/eventPasses';

interface PublishEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PublishEventModal({ 
  isOpen, 
  onClose
}: PublishEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPass, setSelectedPass] = useState<string | null>(null);

  const handlePurchase = async (pass: EventPass) => {
    setIsLoading(true);
    setSelectedPass(pass.id);
    
    try {
      console.log('Creating checkout session for pass:', pass);
      
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: pass.priceId,
          passId: pass.id,
          passName: pass.name,
          billingType: pass.billingType || 'one-time',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Open Stripe Checkout in new tab
      window.open(data.url, '_blank', 'noopener,noreferrer');
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMessage}. Por favor intenta de nuevo.`);
    } finally {
      setIsLoading(false);
      setSelectedPass(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-linear-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                  disabled={isLoading}
                >
                  <svg className="w-6 h-6 text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-purple-500/20 to-blue-500/20 rounded-full border border-purple-500/30 mb-4">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-purple-300">¡Tu showroom está listo!</span>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Publica Tu Evento
                  </h2>
                  <p className="text-gray-400 max-w-lg mx-auto">
                    Tu showroom virtual está completo. Selecciona un plan para publicarlo y comenzar a recibir visitantes.
                  </p>
                </div>
              </div>

              {/* Plans Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {EVENT_PASSES.map((pass) => {
                    const isRecurring = pass.billingType === 'recurring';
                    const isProcessing = isLoading && selectedPass === pass.id;
                    
                    return (
                      <motion.div
                        key={pass.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                          pass.popular 
                            ? 'bg-linear-to-br from-purple-600/30 via-blue-600/20 to-cyan-600/30 border-2 border-purple-500/50 ring-2 ring-purple-500/20' 
                            : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
                        } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={() => !isLoading && handlePurchase(pass)}
                      >
                        {/* Popular Badge */}
                        {pass.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-linear-to-r from-purple-500 to-blue-500 rounded-full text-xs font-bold text-white shadow-lg">
                            {pass.badge}
                          </div>
                        )}

                        {/* Loading overlay */}
                        {isProcessing && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}

                        <div className="text-center pt-2">
                          {/* Plan Name */}
                          <h3 className="text-lg font-bold text-white mb-1">
                            {pass.name}
                          </h3>
                          
                          {/* Duration */}
                          <div className="text-sm text-gray-400 mb-4">
                            {pass.duration}
                          </div>

                          {/* Price */}
                          <div className="mb-4">
                            {isRecurring ? (
                              <>
                                <div className="text-3xl font-bold text-white">
                                  {formatPrice(pass.monthlyAmount || 0)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  por mes (12 cuotas)
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Total: {formatPrice(pass.price)}
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="text-3xl font-bold text-white">
                                  {formatPrice(pass.price)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  pago único
                                </div>
                              </>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="text-left space-y-2 mb-5">
                            {pass.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                                <svg className="w-4 h-4 text-green-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {feature}
                              </li>
                            ))}
                          </ul>

                          {/* CTA Button */}
                          <div className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 ${
                            pass.popular
                              ? 'bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}>
                            {isProcessing ? 'Procesando...' : 'Seleccionar Plan'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Trust Badges */}
                <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                  <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pago seguro con Stripe
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Tarjetas, OXXO, SPEI
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Cancelación fácil
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Al continuar, aceptas los{' '}
                    <a href="/terminos" className="text-purple-400 hover:underline">términos de servicio</a>
                    {' '}y la{' '}
                    <a href="/privacidad" className="text-purple-400 hover:underline">política de privacidad</a>
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
