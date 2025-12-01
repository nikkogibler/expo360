"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useClient } from '@/context/ClientContext';

interface EventoEspecialPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EventoEspecialPopup({ isOpen, onClose }: EventoEspecialPopupProps) {
  const [showPopup, setShowPopup] = useState(false);
  const { logoUrl: ctxLogo } = useClient();

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure smooth animation
      const timer = setTimeout(() => setShowPopup(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowPopup(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowPopup(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* Popup Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-md"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              {/* Header Image */}
              <div className="relative h-48 bg-linear-to-br from-amber-50 to-amber-100">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image
                    src={ctxLogo || '/logo.png'}
                    alt={ctxLogo ? 'Client Furniture' : 'YOUR COMPANY Furniture'}
                    width={120}
                    height={120}
                    className="object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                  ¡Bienvenido al Evento Especial! 🎉
                </h2>
                
                <p className="text-gray-600 text-center mb-4 leading-relaxed">
                  Estás viendo nuestro catálogo completo de muebles de lujo. Explora nuestra colección y descubre piezas únicas para tu hogar.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="shrink-0">
                      <span className="text-2xl">✨</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-800 mb-1">Ofertas Especiales</h3>
                      <p className="text-sm text-amber-700">
                        Durante este evento, aprovecha descuentos exclusivos y promociones especiales en productos seleccionados.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-linear-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Explorar Catálogo
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}