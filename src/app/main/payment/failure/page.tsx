'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState({
    paymentId: '',
    status: '',
    statusDetail: ''
  });

  useEffect(() => {
    // Extract error information from URL parameters
    setErrorInfo({
      paymentId: searchParams.get('payment_id') || '',
      status: searchParams.get('status') || 'rejected',
      statusDetail: searchParams.get('status_detail') || 'Pago rechazado'
    });
  }, [searchParams]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    },
  };

  const iconVariants: Variants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.5
      }
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/leaves1.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture={true}
        preload="auto"
        style={{ opacity: 0.1 }}
      />

      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <div className="mb-6">
          <Image
            src="/kusam_main.webp"
            alt="Kusam Outdoor Solutions Logo"
            width={180}
            height={45}
            priority
            className="mx-auto"
          />
        </div>

        {/* Error Icon */}
        <motion.div
          className="mb-6"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </motion.div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Pago No Procesado
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Lo sentimos, no pudimos procesar tu pago. Por favor, verifica tu información de pago e intenta nuevamente.
        </p>

        {/* Error Details */}
        {errorInfo.paymentId && (
          <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
            <h3 className="font-semibold text-red-800 mb-2">Detalles del Error:</h3>
            <p className="text-sm text-red-700">
              <span className="font-medium">Referencia:</span> {errorInfo.paymentId}
            </p>
            <p className="text-sm text-red-700">
              <span className="font-medium">Estado:</span> {errorInfo.status}
            </p>
            {errorInfo.statusDetail && (
              <p className="text-sm text-red-700">
                <span className="font-medium">Detalle:</span> {errorInfo.statusDetail}
              </p>
            )}
          </div>
        )}

        {/* Common Reasons */}
        <div className="bg-yellow-50 p-4 rounded-md mb-6 text-left">
          <h3 className="font-semibold text-yellow-800 mb-2">Posibles Causas:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Fondos insuficientes en la tarjeta</li>
            <li>• Datos de tarjeta incorrectos</li>
            <li>• Tarjeta bloqueada o vencida</li>
            <li>• Límite de compra excedido</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/kusam/payment" className="block">
            <button className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Intentar de Nuevo
            </button>
          </Link>
          
          <Link href="/kusam/cart" className="block">
            <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Volver al Carrito
            </button>
          </Link>
          
          <Link href="/kusam" className="block">
            <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Volver al Inicio
            </button>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            ¿Necesitas ayuda? Contáctanos:
          </p>
          <p className="text-sm text-gray-500">
            Email:{' '}
            <a href="mailto:ventas01@kusam.com.mx" className="text-blue-600 hover:underline">
              ventas01@kusam.com.mx
            </a>
          </p>
          <p className="text-sm text-gray-500">
            WhatsApp:{' '}
            <a href="https://wa.me/528110000000" className="text-blue-600 hover:underline">
              +52 81 1000 0000
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}