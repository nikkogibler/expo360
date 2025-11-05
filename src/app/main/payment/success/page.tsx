'use client';

import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

// Discreetly notify webhook on page load with customer_id
const SUCCESS_WEBHOOK_URL = process.env.NEXT_PUBLIC_SUCCESS_WEBHOOK_URL;

function getSpanishPaymentStatus(status: string) {
  switch (status) {
    case 'approved':
      return 'Aprobado';
    case 'in_process':
      return 'En proceso';
    case 'rejected':
      return 'Rechazado';
    default:
      return status;
  }
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({
    paymentId: '',
    status: '',
    merchantOrder: ''
  });
  const [orderDetails, setOrderDetails] = useState<{ order_id: string; status: string; total_amount: number } | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState('');
  const orderIdRaw = searchParams.get('order_id');
  // Validate if orderId is a UUID (v4)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const orderId = orderIdRaw && uuidRegex.test(orderIdRaw) ? orderIdRaw : '';

  // Notify webhook on page load with complete customer data
  useEffect(() => {
    const sendWebhookNotification = async () => {
      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
      
      if (!customerId || !SUCCESS_WEBHOOK_URL) return;
      
      try {
        // Import supabase dynamically to avoid server-side issues
        const { supabase } = await import('@/utils/supabase');
        
        // Fetch complete customer data including shipping/billing addresses
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single();
        
        if (error) {
          console.error('Error fetching customer data for webhook:', error);
          // Fall back to just sending customer_id
          fetch(SUCCESS_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_id: customerId })
          }).catch(() => {});
          return;
        }
        
        // Send complete customer information to webhook
        fetch(SUCCESS_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: customerId,
            order_id: orderId || undefined,
            customer_info: {
              name: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.name || '',
              first_name: customer.first_name || '',
              last_name: customer.last_name || '',
              email: customer.email || '',
              whatsapp: customer.whatsapp || '',
              industry: customer.customer_type || '',
              landing_source: customer.landing_source || '',
              shipping_address: {
                street: customer.shipping_street || '',
                colonia: customer.shipping_colonia || '',
                city: customer.shipping_city || '',
                state: customer.shipping_state || '',
                postal_code: customer.shipping_postal_code || '',
                country: customer.shipping_country || 'México',
              },
              billing_address: customer.billing_same_as_shipping 
                ? 'Same as shipping' 
                : {
                    street: customer.billing_street || '',
                    colonia: customer.billing_colonia || '',
                    city: customer.billing_city || '',
                    state: customer.billing_state || '',
                    postal_code: customer.billing_postal_code || '',
                    country: customer.billing_country || 'México',
                  }
            }
          })
        }).catch(err => console.error('Webhook error:', err));
      } catch (err) {
        console.error('Error sending webhook notification:', err);
      }
    };
    
    sendWebhookNotification();
  }, [orderId]);

  useEffect(() => {
    // Extract payment information from URL parameters (typical MercadoPago response)
    setPaymentInfo({
      paymentId: searchParams.get('payment_id') || '',
      status: searchParams.get('status') || 'approved',
      merchantOrder: searchParams.get('merchant_order_id') || ''
    });
  }, [searchParams]);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) return;
      setOrderLoading(true);
      setOrderError('');
      try {
        const res = await fetch(`/api/getOrder?order_id=${orderId}`);
        const data = await res.json();

        if (!res.ok) {
          setOrderError(data.error || 'No se pudo obtener la orden.');
          return;
        }
        if (!data.order) {
          setOrderError('Orden no encontrada.');
          return;
        }
        setOrderDetails(data.order);
      } catch (err: unknown) {
        setOrderError(
          typeof err === 'object' && err !== null && 'message' in err
            ? String((err as { message?: string }).message)
            : 'Error al obtener la orden.'
        );
      } finally {
        setOrderLoading(false);
      }
    }
    fetchOrderDetails();
  }, [orderId]);

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
            src="/logo.png"
            alt="Kusam Outdoor Solutions Logo"
            width={180}
            height={45}
            priority
            className="mx-auto"
          />
        </div>

        {/* Success Icon */}
        <motion.div
          className="mb-6"
          variants={iconVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        {/* Success Messages */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Pago Exitoso! Gracias por tu compra.
        </h1>
        
        <p className="text-gray-600 mb-6 text-lg">
          Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu compra y la información de envío.
        </p>

        {/* Payment Details */}
        {(paymentInfo.paymentId || orderId) && (
          <div className="bg-gray-50 p-4 rounded-md mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-2">Detalles del Pago:</h3>
            {orderId && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Order ID Kusam:</span> {orderId.slice(-12)}
              </p>
            )}
            {orderLoading && <p className="text-sm text-gray-500">Cargando detalles de la orden...</p>}
            {orderError && <p className="text-sm text-red-600">{orderError}</p>}
            {orderDetails && (
              <>
          
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Monto Total:</span> ${orderDetails.total_amount.toFixed(2)} MXN
                </p>
              </>
            )}
            {paymentInfo.paymentId && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">ID de Pago:</span> {paymentInfo.paymentId}
              </p>
            )}
            {paymentInfo.merchantOrder && (
              <p className="text-sm text-gray-600">
                <span className="font-medium">Orden MercadoPago:</span> {paymentInfo.merchantOrder}
              </p>
            )}
            <p className="text-sm text-gray-600">
              <span className="font-medium">Estado de Pago:</span> {getSpanishPaymentStatus(paymentInfo.status || 'approved')}
            </p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 p-4 rounded-md mb-6 text-left">
          <h3 className="font-semibold text-blue-800 mb-2">Próximos Pasos:</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Recibirás un correo de confirmación en las próximas 72 horas</li>
            <li>• Te contactaremos para coordinar la entrega</li>
            <li>• El tiempo de entrega es de 6 a 7 semanas</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/kusam/catalogo" className="block">
            <button className="w-full py-3 px-4 bg-amber-700 text-white rounded-lg font-medium hover:bg-amber-800 transition-colors">
              Continuar Comprando
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
          <p className="text-sm text-gray-500">
            ¿Preguntas? Contáctanos en{' '}
            <a href="mailto:ventas01@kusam.com.mx" className="text-blue-600 hover:underline">
              ventas01@kusam.com.mx
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}