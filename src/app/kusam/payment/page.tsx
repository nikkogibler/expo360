// src/app/kusam/payment/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// --- NEW: Import initMercadoPago and Wallet components from Mercado Pago SDK for React ---
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'; 

// Interface for Product (needs price, id, and name for Mercado Pago title)
interface Product {
  id: string;
  price: number;
  name: string; // --- CHANGE: ADD name here for Mercado Pago item title ---
}

// Interface for CustomerFavorite (needs product_id and quantity)
interface CustomerFavorite {
  product_id: string;
  quantity: number;
  is_liked: boolean;
  fabric_color_id: string | null;
  frame_color_id: string | null;
}

export default function KusamPaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState('credit_card');
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // --- NEW: State for Mercado Pago Preference ID ---
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  // --- NEW: State for customer email, assumed to be available from session or DB ---
  const [customerEmail, setCustomerEmail] = useState<string | null>(null);

  const formatCurrency = useCallback((amount: number) => {
    return `$${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} MXN`;
  }, []);

  // --- NEW: Initialize Mercado Pago SDK with your Public Key ---
  useEffect(() => {
    // REPLACE 'YOUR_MERCADO_PAGO_PUBLIC_KEY' with your actual Mercado Pago Public Key
    initMercadoPago('TEST-7ff29468-76a2-44c3-93ee-33c64819c4d6', { locale: 'es-MX' });
  }, []);

  useEffect(() => {
    async function fetchAndCalculateTotal() {
      setLoadingTotal(true);
      setPaymentError(null);
      setCalculatedTotal(0);
      setPreferenceId(null); // Reset preference ID on total recalculation

      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
      // --- NEW: Fetch customer email (example: from supabase auth session or DB) ---
      // If you have Supabase auth session and the user is logged in:
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setCustomerEmail(user.email);
      } else {
        // Fallback or handle case where email isn't readily available
        setCustomerEmail('guest@example.com'); // --- CHANGE THIS TO A MORE APPROPRIATE FALLBACK OR FETCH FROM YOUR CRM/DB ---
      }


      if (!customerId) {
        setPaymentError('No se encontró el ID de cliente. Por favor, inicie sesión o regrese al carrito.');
        setLoadingTotal(false);
        return;
      }

      try {
        const { data: likedFavorites, error: favoritesError } = await supabase
          .from('customer_favorites')
          .select('product_id, quantity')
          .eq('customer_id', customerId)
          .eq('is_liked', true);

        if (favoritesError) {
          throw favoritesError;
        }

        if (!likedFavorites || likedFavorites.length === 0) {
          setPaymentError('No tienes productos favoritos para calcular un total.');
          setLoadingTotal(false);
          return;
        }

        const uniqueProductIds = [...new Set(likedFavorites.map(fav => fav.product_id))];

        // Make sure to select 'name' here for the Mercado Pago item title
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, price, name'); // --- CHANGE: ADD 'name' here ---

        if (productsError) {
          throw productsError;
        }

        const typedProductsData: Product[] = productsData as Product[];

        const productPriceAndNameMap = new Map<string, { price: number; name: string }>(); // Map to store price and name
        (typedProductsData || []).forEach(product => {
          productPriceAndNameMap.set(product.id, { price: product.price, name: product.name });
        });

        let total = 0;
        (likedFavorites as CustomerFavorite[]).forEach(fav => {
          const productDetails = productPriceAndNameMap.get(fav.product_id);
          if (productDetails !== undefined) {
            total += productDetails.price * fav.quantity;
          } else {
            console.warn(`Product price or name not found for ID: ${fav.product_id}`);
          }
        });

        setCalculatedTotal(total);

      } catch (err: unknown) {
        console.error('Error calculating total:', err);
        let errorMessage = 'Error desconocido al calcular el total.';
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as PostgrestError).message === 'string') {
          errorMessage = (err as PostgrestError).message;
        }
        setPaymentError(`Error al calcular el total: ${errorMessage}`);
      } finally {
        setLoadingTotal(false);
      }
    }

    fetchAndCalculateTotal();
  }, [formatCurrency]);


  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    },
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotal <= 0) {
      alert('No hay productos en el carrito para procesar el pago o el total es cero.');
      return;
    }

    const paymentMethodText = selectedMethod === 'credit_card' ? 'Tarjeta de Crédito' :
                              selectedMethod === 'direct_deposit' ? 'Depósito Directo' :
                              selectedMethod === 'mercadopago' ? 'MercadoPago' :
                              'Transferencia Bancaria';

    alert(`Procesando su pago de ${formatCurrency(calculatedTotal)} con ${paymentMethodText}. ¡Gracias por su compra. Su comprobante de transacción y los datos de envío serán enviadas a su correo electrónico. ¡Hasta luego! 👋`);
    // In a real app, this would integrate with payment gateways
  };

  // --- NEW: Specific handler for Mercado Pago ---
  const handleMercadoPagoPaymentClick = async () => {
    setPaymentError(null);
    if (calculatedTotal <= 0) {
      setPaymentError('No hay productos en el carrito para procesar el pago con Mercado Pago o el total es cero.');
      return;
    }

    const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;

    if (!customerId) {
      setPaymentError('No se encontró el ID de cliente para Mercado Pago. Por favor, inicie sesión o regrese al carrito.');
      return;
    }

    try {
      // Re-fetch liked items and product details for the preference creation
      // This ensures the data is fresh and complete for Mercado Pago
      const { data: likedFavorites, error: favoritesError } = await supabase
        .from('customer_favorites')
        .select('product_id, quantity')
        .eq('customer_id', customerId)
        .eq('is_liked', true);

      if (favoritesError) {
        throw favoritesError;
      }

      if (!likedFavorites || likedFavorites.length === 0) {
        setPaymentError('No tienes productos favoritos para procesar el pago con Mercado Pago.');
        return;
      }

      const uniqueProductIds = [...new Set(likedFavorites.map(fav => fav.product_id))];
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, price, name'); // Ensure 'name' is selected for the item title

      if (productsError) {
        throw productsError;
      }

      const productDetailsMap = new Map<string, { price: number; name: string }>();
      (productsData || []).forEach(product => {
        productDetailsMap.set(product.id, { price: product.price, name: product.name });
      });

      const itemsForPreference = likedFavorites.map(fav => {
        const details = productDetailsMap.get(fav.product_id);
        if (!details) {
          // Fallback title if product name not found, though it should be
          console.warn(`Product details (name, price) not found for ID: ${fav.product_id}. Using generic title.`);
          return {
              id: fav.product_id,
              title: `Producto ID: ${fav.product_id}`,
              quantity: fav.quantity,
              unit_price: 0, // Fallback price if not found
          };
        }
        return {
          id: fav.product_id,
          title: details.name, // Use product name as title
          quantity: fav.quantity,
          unit_price: details.price,
        };
      });

      // Call your Supabase Edge Function
      // For local development with `npm run dev`, Next.js can proxy /api/function-name to the Supabase URL
      // But for Vercel deployment, you should use the full Supabase Edge Function URL.
      // For now, let's use the local API route which can be configured to proxy:

console.log('Sending to Edge Function:');
console.log('itemsForPreference:', itemsForPreference);
console.log('calculatedTotal:', calculatedTotal);
console.log('customerId:', customerId);
console.log('customerEmail:', customerEmail);

const response = await fetch('https://dpbxyauaobvcdwdgzcxc.supabase.co/functions/v1/create-mercadopago-preference', {          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              items: itemsForPreference,
              totalAmount: calculatedTotal,
              customerId: customerId,
              customerEmail: customerEmail, // Pass customer email to Edge Function
          }),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Fallo al crear la preferencia de Mercado Pago.');
      }

      const data = await response.json();
      setPreferenceId(data.preferenceId); // Set the preference ID received from the backend

    } catch (err: unknown) {
      console.error('Error al iniciar el pago con Mercado Pago:', err);
      let errorMessage = 'Error al iniciar el pago con Mercado Pago.';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      setPaymentError(errorMessage);
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
        style={{ opacity: 0.1 }}
      />

      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6 text-center">
          <Image
            src="/kusam_main.webp"
            alt="Kusam Outdoor Solutions Logo"
            width={180}
            height={45}
            priority
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Confirmar Compra
        </h1>

        {loadingTotal ? (
          <p className="text-center text-gray-600 text-lg mb-4">Calculando total...</p>
        ) : paymentError ? (
          <p className="text-center text-red-600 text-lg mb-4">{paymentError}</p>
        ) : (
          <p className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Total a Pagar: <span className="text-green-600">{formatCurrency(calculatedTotal)}</span>
          </p>
        )}


        {/* Payment Method Tabs */}
        <div className="flex justify-center flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
          <button
            onClick={() => setSelectedMethod('credit_card')}
            className={`px-3 py-2 text-base font-medium rounded-md ${selectedMethod === 'credit_card' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            Tarjeta de Crédito
          </button>
          <button
            onClick={() => setSelectedMethod('mercadopago')}
            className={`px-3 py-2 text-base font-medium rounded-md ${selectedMethod === 'mercadopago' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            MercadoPago
          </button>
          <button
            onClick={() => setSelectedMethod('bank_transfer')}
            className={`px-3 py-2 text-base font-medium rounded-md ${selectedMethod === 'bank_transfer' ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
          >
            Transferencia Bancaria
          </button>
        </div>

        {/* Payment Method Content */}
        {selectedMethod === 'credit_card' && (
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <Image src="/payments/visa.svg" alt="Visa" width={50} height={30} />
              <Image src="/payments/mastercard.svg" alt="Mastercard" width={50} height={30} />
              <Image src="/payments/amex.svg" alt="American Express" width={50} height={30} />
              <Image src="/payments/paypal.svg" alt="PayPal" width={50} height={30} />
            </div>
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Número de Tarjeta</label>
              <input
                type="text"
                id="cardNumber"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength={19}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Fecha de Vencimiento (MM/AA)</label>
                <input
                  type="text"
                  id="expiryDate"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value.replace(/\D/g, '').replace(/^(\d{2})(\d{0,2})$/, '$1/$2').trim())}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="MM/AA"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                <input
                  type="text"
                  id="cvc"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
                  placeholder="XXX"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="cardName" className="block text-sm font-medium text-gray-700">Nombre en la Tarjeta</label>
              <input
                type="text"
                id="cardName"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500"
                placeholder="Nombre Completo"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={loadingTotal || calculatedTotal === 0}
            >
              {loadingTotal ? 'Calculando...' : `Pagar ${formatCurrency(calculatedTotal)}`}
            </button>
          </form>
        )}

        {selectedMethod === 'mercadopago' && (
          <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pagar con MercadoPago</h3>
            <Image src="/payments/mercadopago.svg" alt="MercadoPago Logo" width={150} height={40} className="mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Será redirigido de forma segura a la plataforma de MercadoPago para completar su pago.
            </p>
            {!preferenceId ? ( // --- CHANGE: Conditionally render button or Wallet component ---
              <button
                onClick={handleMercadoPagoPaymentClick} // --- CHANGE: Use the new specific handler ---
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                disabled={loadingTotal || calculatedTotal === 0}
              >
                {loadingTotal ? 'Calculando...' : `Preparar Pago con MercadoPago (${formatCurrency(calculatedTotal)})`}
              </button>
            ) : (
              <div className="flex justify-center mt-4">
                {/* --- NEW: Render Mercado Pago Wallet component if preferenceId exists --- */}
<Wallet initialization={{ preferenceId: preferenceId }} customization={{ valueProp: 'smart_option' }} />              </div>
            )}
            {paymentError && <p className="text-red-600 mt-4">{paymentError}</p>}
          </div>
        )}

        {selectedMethod === 'bank_transfer' && (
          <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Transferencia Bancaria</h3>
            <div className="flex justify-center items-center space-x-4 mb-4">
                <Image src="/payments/banorte.svg" alt="Banorte Logo" width={90} height={30} />
                <Image src="/payments/bbva.svg" alt="BBVA Logo" width={63} height={21} />
                <Image src="/payments/citi.svg" alt="CitiBanamex Logo" width={90} height={30} />
                <Image src="/payments/banregio.svg" alt="Banregio Logo" width={63} height={21} />
            </div>
            {loadingTotal ? (
               <p className="text-gray-700 mb-2">Calculando monto...</p>
            ) : paymentError ? (
               <p className="text-red-700 mb-2">{paymentError}</p>
            ) : (
                <p className="text-gray-700 mb-2">
                    **Banco:** Banco Kusam Mx<br/>
                    **Cuenta CLABE:** 012345678901234567<br/>
                    **Beneficiario:** Kusam Outdoor S.A. de C.V.<br/>
                    **Monto:** {formatCurrency(calculatedTotal)}
                </p>
            )}
            <p className="text-sm text-gray-600 mt-4">
              Por favor, realice la transferencia y envíe el comprobante a <span className="font-semibold">ventas01@kusam.com.mx</span> para confirmar su orden.
            </p>
            <button
              onClick={handlePaymentSubmit}
              className="mt-6 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={loadingTotal || calculatedTotal === 0}
            >
              {loadingTotal ? 'Calculando...' : 'Completa Tu Pago'}
            </button>
          </div>
        )}

        <Link href="/kusam/cart" passHref>
            <p className="text-center text-sm text-blue-600 hover:underline mt-6 cursor-pointer">
                Regresar a &quot;Mis Favoritos&quot;
            </p>
        </Link>
      </motion.div>
    </div>
  );
}