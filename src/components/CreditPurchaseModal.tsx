'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CREDIT_PACKAGES, CreditPackage } from '@/config/creditPackages';

interface CreditPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  remainingCredits: number;
}

export default function CreditPurchaseModal({ 
  isOpen, 
  onClose, 
  remainingCredits 
}: CreditPurchaseModalProps) {
  const [isLoading, setIsLoading] = useState(false);

    const handlePurchase = async (packageData: CreditPackage) => {
    setIsLoading(true);
    try {
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // You could add a toast notification here for errors
      alert('No se pudo procesar la compra. Por favor intenta de nuevo.');
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
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Recarga tus Créditos
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Te quedan {remainingCredits} créditos • Agrega más para seguir creando
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Packages Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CREDIT_PACKAGES.map((pkg) => {
                    const estimatedPrice = getEstimatedPrice(pkg.credits);
                    
                    return (
                      <motion.div
                        key={pkg.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 border rounded-2xl cursor-pointer transition-all duration-200 ${
                          pkg.popular 
                            ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200' 
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                        } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                        onClick={() => !isLoading && handlePurchase(pkg)}
                      >
                        {/* Badge */}
                        {pkg.badge && (
                          <div className={`absolute -top-3 left-6 px-3 py-1 rounded-full text-xs font-semibold ${
                            pkg.badge === 'Más Elegido' 
                              ? 'bg-amber-500 text-white' 
                              : 'bg-green-500 text-white'
                          }`}>
                            {pkg.badge}
                          </div>
                        )}

                        {/* Loading spinner for processing */}
                        {isLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-2xl">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                          </div>
                        )}

                        <div className="text-center">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {pkg.name}
                          </h3>
                          
                          <div className="mb-4">
                            <div className="text-3xl font-bold text-amber-600">
                              {pkg.credits}
                            </div>
                            <div className="text-sm text-gray-600">créditos</div>
                          </div>

                          <p className="text-gray-600 text-sm mb-4">
                            {pkg.description}
                          </p>

                          <div className="mb-4">
                            <div className="text-lg font-semibold text-gray-900">
                              ${estimatedPrice}
                            </div>
                            <div className="text-xs text-gray-500">
                              ~${getCostPerCredit(pkg.credits, estimatedPrice)} por crédito
                            </div>
                          </div>

                          <div className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                            pkg.popular
                              ? 'bg-amber-600 hover:bg-amber-700 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white'
                          } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}>
                            {isLoading ? 'Procesando...' : 'Recargar Ahora'}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Payment Security Info */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Pago 100% seguro con Stripe
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Créditos disponibles al instante
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-purple-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Todas las tarjetas aceptadas
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