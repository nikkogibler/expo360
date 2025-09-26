'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { CREDIT_PACKAGES, CreditPackage } from '@/config/creditPackages';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreditPurchaseModal({ 
  isOpen, 
  onClose
}: CreditPurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);

    const handlePurchase = async (packageData: CreditPackage) => {
    setIsLoading(true);
    try {
      console.log('Attempting to create checkout session for package:', packageData);
      
      const response = await fetch('/api/create-stripe-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: packageData.priceId,
          credits: packageData.credits,
          packageName: packageData.name,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Open Stripe Checkout in new tab/window
      window.open(data.url, '_blank', 'noopener,noreferrer');
      
      // Close modal after a brief delay to show processing feedback
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // More detailed error message for debugging
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Error: ${errorMessage}. Por favor intenta de nuevo o contacta soporte.`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCostPerCredit = (credits: number, price: number) => {
    return (price / credits).toFixed(2);
  };

  // Updated prices for display with correct USD values
  const getEstimatedPrice = (credits: number) => {
    if (credits === 100) return 27.99;   // Recarga Básica
    if (credits === 200) return 49.99;   // Recarga Popular
    if (credits === 500) return 98.99;   // Recarga Profesional
    if (credits === 1300) return 199.98; // Recarga Empresarial
    return 0;
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-3 border-b border-gray-200 overflow-hidden max-h-55">
                <div className="relative flex items-center justify-center">
                  {/* Centered Content */}
                  <div className="text-center relative">
                    <Image
                      src="/admin/desbloquea.png" 
                      alt="Desbloquea Más Posibilidades" 
                      width={300}
                      height={272}
                      className="h-68 w-auto object-contain mx-auto transform translate-x-4 -translate-y-9"
                    />
                  </div>
                  
                  {/* Close Button - Absolute positioned */}
                  <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors z-20"
                    disabled={isLoading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Packages Grid */}
              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CREDIT_PACKAGES.map((pkg) => {
                    const estimatedPrice = getEstimatedPrice(pkg.credits);
                    
                    return (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-4 border rounded-2xl cursor-pointer transition-all duration-200 ${
                          pkg.popular 
                            ? 'border-cyan-400 bg-gradient-to-br from-cyan-50 via-purple-50 to-blue-50 ring-2 ring-gradient-to-r ring-from-cyan-200 ring-to-blue-200' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg bg-white'
                        } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={() => !isLoading && handlePurchase(pkg)}
                      >
                        {/* Badge */}
                        {pkg.badge && (
                          <div className={`absolute -top-3 left-4 px-3 py-1 rounded-full text-xs font-semibold ${
                            pkg.badge === 'Más Elegido' 
                              ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 text-white shadow-lg' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {pkg.badge}
                          </div>
                        )}

                        {/* Loading spinner for processing */}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                          </div>
                        )}

                        <div className="text-center">
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {pkg.name}
                          </h3>
                          
                          <div className="mb-3">
                            <div className={`text-2xl font-bold ${pkg.popular ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600' : 'text-gray-900'}`}>
                              {pkg.credits}
                            </div>
                            <div className="text-xs text-gray-600">créditos</div>
                          </div>

                          <p className="text-gray-600 text-xs mb-3 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            height: '32px'
                          }}>
                            {pkg.description}
                          </p>

                          <div className="mb-3">
                            <div className="text-lg font-semibold text-gray-900">
                              ${estimatedPrice} USD
                            </div>
                            <div className="text-xs text-gray-500">
                              ${getCostPerCredit(pkg.credits, estimatedPrice)} USD por crédito
                            </div>
                          </div>

                          <div className={`w-full py-2 px-3 rounded-lg font-medium transition-all duration-200 text-sm ${
                            pkg.popular
                              ? 'bg-gradient-to-r from-cyan-600 via-purple-600 to-blue-600 hover:from-cyan-700 hover:via-purple-700 hover:to-blue-700 text-white shadow-lg'
                              : 'bg-gray-900 hover:bg-black text-white'
                          } ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:shadow-lg transform hover:scale-105'}`}>
                            {isLoading ? 'Abriendo pago seguro...' : 'Recargar Ahora →'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Interzekt Logo */}
                <div className="flex justify-center mt-4">
                  <Image
                    src="/interzekt_logo1.png" 
                    alt="Interzekt" 
                    width={96}
                    height={96}
                    className="h-24 w-auto"
                  />
                </div>

                {/* Security Features */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pago 100% seguro
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Créditos al instante
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-purple-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Todas las tarjetas
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-orange-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Nueva ventana
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}