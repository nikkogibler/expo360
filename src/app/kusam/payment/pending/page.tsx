'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({
    paymentId: '',
    status: '',
    paymentType: ''
  });

  useEffect(() => {
    // Extract payment information from URL parameters
    setPaymentInfo({
      paymentId: searchParams.get('payment_id') || '',
      status: searchParams.get('status') || 'in_process',
      paymentType: searchParams.get('payment_type_id') || ''
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
    hidden: { scale: 0, rotate: 0 },
    visible: {
      scale: 1,
      rotate: 360,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
        delay: 0.5
      }
    }
  };

  const spinnerVariants: Variants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear"
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

        {/* Pending Icon */}
        <motion.div
          className="mb-6"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
            <motion.svg 
              className="w-10 h-10 text-yellow-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              variants={spinnerVariants}
              animate="animate"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </motion.svg>
          </div>
        </motion.div>

        {/* Pending Message */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Pago en Proceso
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Tu pago está siendo procesado. Te notificaremos por correo electrónico cuando se complete la transacción.
        </p>

        {/* Payment Details */}
        {paymentInfo.paymentId && (
          <div className="bg-yellow-50 p-4 rounded-md mb-6 text-left">
            <h3 className="font-semibold text-yellow-800 mb-2">Detalles del Pago:</h3>
            <p className="text-sm text-yellow-700">
              <span className="font-medium">ID de Pago:</span> {paymentInfo.paymentId}
            </p>
            <p className="text-sm text-yellow-700">
              <span className="font-medium">Estado:</span> En proceso
            </p>
            {paymentInfo.paymentType && (
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Método:</span> {
                  paymentInfo.paymentType === 'bank_transfer' ? 'Transferencia Bancaria' :
                  paymentInfo.paymentType === 'ticket' ? 'Pago en Efectivo' :
                  'Tarjeta de Crédito'
                }
              </p>
            )}
          </div>
        )}

        {/* Instructions based on payment type */}
        <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">¿Qué sigue?</h3>
          {paymentInfo.paymentType === 'bank_transfer' ? (
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Completa la transferencia bancaria</li>
              <li>• Envía el comprobante por correo</li>
              <li>• Te confirmaremos la recepción del pago</li>
            </ul>
          ) : paymentInfo.paymentType === 'ticket' ? (
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Dirígete a un OXXO, Walmart o 7-Eleven</li>
              <li>• Presenta tu código de pago</li>
              <li>• Realiza el pago en efectivo</li>
            </ul>
          ) : (
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Estamos validando tu pago</li>
              <li>• Recibirás una confirmación por correo</li>
              <li>• El proceso puede tomar unos minutos</li>
            </ul>
          )}
        </div>

        {/* Time Expectations */}
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="font-semibold text-gray-800 mb-2">Tiempo Estimado:</h3>
          <p className="text-sm text-gray-600">
            {paymentInfo.paymentType === 'bank_transfer' ? 
              'El procesamiento puede tomar de 1 a 3 días hábiles' :
              paymentInfo.paymentType === 'ticket' ?
              'Tienes 3 días para completar el pago' :
              'El procesamiento se completa en pocos minutos'
            }
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/kusam/catalogo" className="block">
            <button className="w-full py-3 px-4 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors">
              Continuar Comprando
            </button>
          </Link>
          
          <Link href="/kusam/cart" className="block">
            <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Ver Mis Favoritos
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
            ¿Preguntas sobre tu pago?
          </p>
          <p className="text-sm text-gray-500">
            <a href="mailto:ventas01@kusam.com.mx" className="text-blue-600 hover:underline">
              ventas01@kusam.com.mx
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}