// src/app/kusam/payment/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { getDiscountForLandingSource } from '../../../config/discountConfig';

// --- NEW: Import initMercadoPago and Wallet components from Mercado Pago SDK for React ---
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// --- NEW: Import CustomerInfoForm and utilities ---
import CustomerInfoForm from '@/components/CustomerInfoForm';
import { isCustomerInfoComplete, Customer } from '@/utils/nameParser';

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
  // State for dynamic discount banner and rate
  // Removed unused state variable: landingPageBanner
  const [discountRate, setDiscountRate] = useState<number>(0);
  const [selectedMethod, setSelectedMethod] = useState('mercadopago');
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [calculatedTotal, setCalculatedTotal] = useState<number>(0);
  const [originalTotal, setOriginalTotal] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // Removed unused state variable: customerLandingSource
  
  // --- ADD MISSING STATE VARIABLES ---
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [customerEmail, setCustomerEmail] = useState<string>('');

  // --- NEW: Customer info form state ---
  const [customerInfoComplete, setCustomerInfoComplete] = useState(false);
  const [showCustomerInfoForm, setShowCustomerInfoForm] = useState(false);
  const [customerData, setCustomerData] = useState<Customer | null>(null);

  // --- ADD MISSING formatCurrency FUNCTION ---
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, []);

  // --- NEW: Initialize Mercado Pago SDK with your Public Key ---
  useEffect(() => {
    // REPLACE 'YOUR_MERCADO_PAGO_PUBLIC_KEY' with your actual Mercado Pago Public Key
    initMercadoPago('TEST-7ff29468-76a2-44c3-93ee-33c64819c4d6', { locale: 'es-MX' });
  }, []);

  // --- NEW: Check customer info completeness ---
  useEffect(() => {
    async function checkCustomerInfo() {
      const customerId = localStorage.getItem('kusam_customer_id');
      
      if (!customerId) {
        setPaymentError('No se encontró el ID de cliente. Por favor, inicie sesión o regrese al carrito.');
        setLoadingTotal(false);
        return;
      }
      
      try {
        const { data: customer, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', customerId)
          .single();
        
        if (error) throw error;
        
        setCustomerData(customer);
        
        // Check if info is complete using utility function
        const isComplete = isCustomerInfoComplete(customer);
        
        setCustomerInfoComplete(isComplete);
        setShowCustomerInfoForm(!isComplete);
        
        console.log('[Payment Page] Customer info complete:', isComplete);
      } catch (error) {
        console.error('[Payment Page] Error checking customer info:', error);
      }
    }
    
    checkCustomerInfo();
  }, []);

  useEffect(() => {
    async function fetchAndCalculateTotal() {
      setLoadingTotal(true);
      setPaymentError(null);
      setCalculatedTotal(0);
      setOriginalTotal(0);
      setDiscountAmount(0);
      setPreferenceId(null);

      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
      const { data: { user } } = await supabase.auth.getUser();
      setCustomerEmail(user?.email || 'guest@example.com');

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
        if (favoritesError) throw favoritesError;
        if (!likedFavorites || likedFavorites.length === 0) {
          setPaymentError('No tienes productos favoritos para calcular un total.');
          setLoadingTotal(false);
          return;
        }

        // Fetch customer landing source
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('landing_source')
          .eq('customer_id', customerId)
          .maybeSingle();
        if (customerError) console.warn('Could not fetch customer data for discount calculation:', customerError);
        const landingSource = customerData?.landing_source || null;
  // Removed: setCustomerLandingSource(landingSource);

        // Fetch discount from landing_pages
        let localDiscountRate: number | null = null;
        if (landingSource) {
          const { data: landingPages, error: landingPageError } = await supabase
            .from('landing_pages')
            .select('*');
          if (landingPageError) console.warn('Error fetching landing_pages:', landingPageError);
          if (Array.isArray(landingPages)) {
            const matched = landingPages.find(lp =>
              typeof lp.name === 'string' &&
              lp.name.trim().toLowerCase() === landingSource.trim().toLowerCase()
            );
            if (matched && typeof matched.discount_applied === 'number') {
              localDiscountRate = matched.discount_applied;
            }
          }
        }
        if (localDiscountRate === null) {
          // Config returns decimal (0.15), convert to percentage (15)
          const configDiscount = getDiscountForLandingSource(landingSource);
          localDiscountRate = configDiscount * 100;
        }
  // Removed: setLandingPageBanner(localLandingPageBanner);
        setDiscountRate(localDiscountRate || 0);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, price, name');
        if (productsError) throw productsError;
        const typedProductsData: Product[] = productsData as Product[];
        const productPriceAndNameMap = new Map<string, { price: number; name: string }>();
        (typedProductsData || []).forEach(product => {
          productPriceAndNameMap.set(product.id, { price: product.price, name: product.name });
        });

        // Calculate discounted item prices and sum for total
        let originalAmount = 0;
        let discountedTotal = 0;
        (likedFavorites as CustomerFavorite[]).forEach(fav => {
          const productDetails = productPriceAndNameMap.get(fav.product_id);
          if (productDetails !== undefined) {
            const itemSubtotal = productDetails.price * fav.quantity;
            originalAmount += itemSubtotal;
            // Discount and round each item price, then sum
            const discountedUnitPrice = Number((productDetails.price * (1 - (localDiscountRate || 0) / 100)).toFixed(2));
            discountedTotal += discountedUnitPrice * fav.quantity;
          } else {
            console.warn(`Product price or name not found for ID: ${fav.product_id}`);
          }
        });

        // Calculate total discount
        const discount = originalAmount - discountedTotal;
        setOriginalTotal(originalAmount);
        setDiscountAmount(discount);
        setCalculatedTotal(discountedTotal);

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

  // --- NEW: Handler when customer info form is completed ---
  const handleCustomerInfoComplete = async () => {
    // Refresh customer data
    const customerId = localStorage.getItem('kusam_customer_id');
    
    if (customerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('customer_id', customerId)
        .single();
      
      setCustomerData(customer);
    }
    
    setCustomerInfoComplete(true);
    setShowCustomerInfoForm(false);
    
    console.log('[Payment Page] Customer info form completed, showing payment methods');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (calculatedTotal <= 0) {
      alert('No hay productos en el carrito para procesar el pago o el total es cero.');
      return;
    }

    const paymentMethodText = selectedMethod === 'direct_deposit' ? 'Depósito Directo' :
                              selectedMethod === 'mercadopago' ? 'MercadoPago' :
                              'Transferencia Bancaria';

    alert(`Procesando su pago de ${formatCurrency(calculatedTotal)} con ${paymentMethodText}. ¡Gracias por su compra. Su comprobante de transacción y los datos de envío serán enviadas a su correo electrónico. ¡Hasta luego! 👋`);
    // In a real app, this would integrate with payment gateways
  };

  // --- NEW: Specific handler for Mercado Pago ---
  const handleMercadoPagoPaymentClick = async () => {
    console.log('🔥 FRONTEND: Handler called');
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
      // 1. Create order in Supabase
      console.log('🔥 FRONTEND: About to create order');
      const orderRes = await fetch('/api/createOrder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, totalAmount: calculatedTotal })
      });
      console.log('🔥 FRONTEND: Order response status:', orderRes.status);
      const orderJson = await orderRes.json();
      console.log('🔥 FRONTEND: Order response:', orderJson);
      const { orderId } = orderJson;
      console.log('Order ID from Supabase:', orderId); // Should be a UUID

      // 2. Re-fetch liked items and product details for the preference creation
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

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, price, name');

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
            console.warn(`Product details not found for ID: ${fav.product_id}`);
            return {
              id: fav.product_id,
              title: `Producto ID: ${fav.product_id}`,
              quantity: fav.quantity,
              unit_price: 0,
            };
          }
          // Apply discount to each item price
          const discountedPrice = details.price * (1 - (discountRate / 100));
          return {
            id: fav.product_id,
            title: details.name,
            quantity: fav.quantity,
            unit_price: Number(discountedPrice.toFixed(2)),
          };
        });

      // 3. Create MercadoPago preference via Edge Function
      const response = await fetch('https://dpbxyauaobvcdwdgzcxc.supabase.co/functions/v1/create-mercadopago-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          orderId,
          items: itemsForPreference,
          totalAmount: calculatedTotal,
          customerId,
          customerEmail,
        }),
      });

      const responseText = await response.text();
      if (!response.ok) {
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch {
          throw new Error(`HTTP ${response.status}: ${responseText}`);
        }
        throw new Error(errorData.error || 'Failed to create MercadoPago preference');
      }

      const data = JSON.parse(responseText);
      if (!data.preferenceId) {
        throw new Error('No preference ID received from server');
      }
      setPreferenceId(data.preferenceId);

    } catch (err: unknown) {
      console.error('🔥 FRONTEND: Error:', err);
      setPaymentError('Fallo al crear la preferencia de Mercado Pago.');
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

        {/* Removed dynamic discount banner from payment page. */}

        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Confirmar Compra
        </h1>

        {/* ALWAYS show total at top if calculated */}
        {!loadingTotal && !paymentError && calculatedTotal > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-200 sticky top-0 z-10">
            {/* Pricing display with discount */}
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-xl font-bold text-gray-800">{formatCurrency(originalTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-blue-600">Descuento ({discountRate}%):</span>
                <span className="text-xl font-bold text-blue-600">-{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mb-2">
              <span className="text-green-600">Total a Pagar:</span>
              <span className="text-xl font-bold text-green-600">{formatCurrency(calculatedTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="w-full flex justify-center items-center mb-2 mt-4">
                <span className="text-base font-normal text-green-600 text-center w-full block">
                  💰 ¡Ahorras {formatCurrency(discountAmount)} con este descuento!
                </span>
              </div>
            )}
          </div>
        )}

        {/* CONDITIONAL RENDERING: Show loading, error, customer form, or payment methods */}
        {loadingTotal ? (
          <p className="text-center text-gray-600 text-lg mb-4">Calculando total...</p>
        ) : paymentError ? (
          <p className="text-center text-red-600 text-lg mb-4">{paymentError}</p>
        ) : showCustomerInfoForm && !customerInfoComplete ? (
          /* SHOW CUSTOMER INFO FORM */
          <CustomerInfoForm 
            customer={customerData}
            totalAmount={calculatedTotal}
            onComplete={handleCustomerInfoComplete}
          />
        ) : (
          /* SHOW PAYMENT METHODS */
          <>
            {/* Payment Method Tabs - Remove credit_card option */}
            <div className="flex justify-center flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
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

        {/* Payment Method Content - Remove credit_card section */}
        {selectedMethod === 'mercadopago' && (
          <div className="text-center p-4 bg-gray-50 rounded-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Pagar con MercadoPago</h3>
            <Image src="/payments/mercadopago.svg" alt="MercadoPago Logo" width={150} height={40} className="mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Será redirigido de forma segura a la plataforma de MercadoPago para completar su pago.
            </p>
            {!preferenceId ? (
              <button
                onClick={handleMercadoPagoPaymentClick}
                className="w-full py-3 px-4 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                disabled={loadingTotal || calculatedTotal === 0}
              >
                {loadingTotal ? 'Calculando...' : `Paga con MercadoPago ${formatCurrency(calculatedTotal)}`}
              </button>
            ) : (
              <div className="flex justify-center mt-4">
                <Wallet initialization={{ preferenceId: preferenceId }} customization={{ valueProp: 'smart_option' }} />
              </div>
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
                    Banco: BANREGIO<br/>
                    Número de Cuenta: 985957550050<br/>
                    Clabe: 058580000151560424<br/>
                    Beneficiario: <b style={{ fontSize: '1.25em' }}>KUSAMDECOR</b><br/>
                    Monto: {formatCurrency(calculatedTotal)}MXN<br/>
                    RFC: KUS160726FWA<br/>
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

            <Link href="/kusam/quote" passHref>
                <p className="text-center text-sm text-red-600 hover:underline mt-6 cursor-pointer">
                    <b className="text-red-600">No quiero descuento. </b>
                    <b className="text-black">Dame mi cotización desglozada.</b>
                </p>
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}