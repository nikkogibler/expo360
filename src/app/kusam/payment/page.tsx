// src/app/kusam/payment/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
// Import PostgrestError for type narrowing in catch blocks if needed,
// though it might not be explicitly used in this particular catch for err: unknown
import { PostgrestError } from '@supabase/supabase-js';


// Interface for Product (needs price and id)
interface Product {
  id: string;
  price: number;
}

// Interface for CustomerFavorite (needs product_id and quantity)
interface CustomerFavorite {
  product_id: string;
  quantity: number;
  is_liked: boolean; // We'll rely on this being true
  fabric_color_id: string | null; // Keep for context, but not for filtering the sum
  frame_color_id: string | null; // Keep for context, but not for filtering the sum
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

  const formatCurrency = useCallback((amount: number) => {
    return `$${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} MXN`;
  }, []);

  useEffect(() => {
    async function fetchAndCalculateTotal() {
      setLoadingTotal(true);
      setPaymentError(null);
      setCalculatedTotal(0);

      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;

      if (!customerId) {
        setPaymentError('No se encontró el ID de cliente. Por favor, inicie sesión o regrese al carrito.');
        setLoadingTotal(false);
        return;
      }

      try {
        // 1. Fetch all customer favorites that are marked as 'is_liked'
        // This implicitly includes items configured with options, as they also set is_liked to true
        const { data: likedFavorites, error: favoritesError } = await supabase
          .from('customer_favorites')
          .select('product_id, quantity') // Only need these for calculation
          .eq('customer_id', customerId)
          .eq('is_liked', true); // <-- Filter only by is_liked = true

        if (favoritesError) {
          throw favoritesError;
        }

        if (!likedFavorites || likedFavorites.length === 0) {
          setPaymentError('No tienes productos favoritos para calcular un total.');
          setLoadingTotal(false);
          return;
        }

        // 2. Extract unique product IDs from the liked items
        const uniqueProductIds = [...new Set(likedFavorites.map(fav => fav.product_id))];

        // 3. Fetch product prices for these IDs
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, price')
          .in('id', uniqueProductIds);

        if (productsError) {
          throw productsError;
        }

        // FIX 1: Explicitly cast productsData to Product[] to satisfy no-unused-vars for Product interface
        const typedProductsData: Product[] = productsData as Product[];

        const productPriceMap = new Map<string, number>();
        (typedProductsData || []).forEach(product => { // Use typedProductsData here
          productPriceMap.set(product.id, product.price);
        });

        // 4. Calculate total based on liked favorites and their prices
        let total = 0;
        (likedFavorites as CustomerFavorite[]).forEach(fav => { // Iterate over 'likedFavorites'
          const productPrice = productPriceMap.get(fav.product_id);
          if (productPrice !== undefined) {
            total += productPrice * fav.quantity;
          } else {
            console.warn(`Product price not found for ID: ${fav.product_id}`);
          }
        });

        setCalculatedTotal(total);

      } catch (err: unknown) { // FIX 2: Changed `any` to `unknown`
        console.error('Error calculating total:', err);
        // Optional: add more robust error message extraction if needed, similar to product page
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
            <button
              onClick={handlePaymentSubmit}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={loadingTotal || calculatedTotal === 0}
            >
              {loadingTotal ? 'Calculando...' : `Proceder a MercadoPago (${formatCurrency(calculatedTotal)})`}
            </button>
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