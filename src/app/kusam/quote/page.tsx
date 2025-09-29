'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabase';
import { getDiscountForLandingSource, hasDiscount, getDiscountDisplayName } from '../../../config/discountConfig';

// Log quote event to Supabase
async function logQuoteEvent({
  eventType,
  customerId,
  quoteId = null,
  metadata = null,
}: {
  eventType: string;
  customerId: string | null;
  quoteId?: string | null;
  metadata?: unknown;
}) {
  if (!customerId) return;
  // Only allow one view_quote or print_or_download_quote event per customer
  if (eventType === 'view_quote' || eventType === 'print_or_download_quote') {
    const { data: existing } = await supabase
      .from('quote_events')
      .select('id')
      .eq('event_type', eventType)
      .eq('customer_id', customerId)
      .limit(1)
      .maybeSingle();
    if (existing) {
      console.log(`[logQuoteEvent] ${eventType} already logged for customer`, customerId);
      return; // Already logged
    }
  }
  console.log('[logQuoteEvent] Logging event', { eventType, customerId, quoteId, metadata });
  await supabase.from('quote_events').insert([
    {
      event_type: eventType,
      customer_id: customerId,
      quote_id: quoteId,
      metadata,
    },
  ]);
}

interface FavoriteItem {
  id: string;
  product_id: string;
  quantity: number;
  fabric_color?: string;
  frame_color?: string;
  is_liked?: boolean;
  fabric_color_id?: string;
  frame_color_id?: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  image_url: string;
  price: number;
}
const RFC = 'KUS2103258E2'; // Kusam Decor RFC
const IVA_RATE = 0.16;

export default function QuotePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string>('');
  const [customerLandingSource, setCustomerLandingSource] = useState<string | null>(null);

  // Fetch favorites and products
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
        if (!customerId) {
          setError('No se encontró el cliente.');
          setLoading(false);
          return;
        }
        // Only log view_quote once per session
        if (typeof window !== 'undefined') {
          const sessionKey = `kusam_view_quote_logged_${customerId}`;
          if (!sessionStorage.getItem(sessionKey)) {
            await logQuoteEvent({ eventType: 'view_quote', customerId });
            sessionStorage.setItem(sessionKey, '1');
          } else {
            console.log('[QuotePage] view_quote already logged this session for', customerId);
          }
        }

        // Fetch liked favorites
        const { data: favs, error: favErr } = await supabase
          .from('customer_favorites')
          .select('*')
          .eq('customer_id', customerId)
          .eq('is_liked', true);
        if (favErr) throw favErr;
        if (!favs || favs.length === 0) {
          setFavorites([]);
          setLoading(false);
          return;
        }
        const likedFavs = favs.filter((f: FavoriteItem) => f.is_liked === true);
        setFavorites(likedFavs);
        // Fetch product details
        const productIds = likedFavs.map((f: FavoriteItem) => f.product_id);
        const { data: prodData, error: prodErr } = await supabase
          .from('products')
          .select('id, sku, name, image_url, price')
          .in('id', productIds);
        if (prodErr) throw prodErr;
        const prodMap: Record<string, Product> = {};
        (prodData || []).forEach((p: Product) => {
          prodMap[p.id] = p;
        });
        setProducts(prodMap);

        // Fetch customer name and landing source using customer_id from localStorage
        let customerNameValue = '';
        if (customerId) {
          const { data: customerData, error: customerErr } = await supabase
            .from('customers')
            .select('name, landing_source')
            .eq('customer_id', customerId)
            .maybeSingle();
          if (!customerErr && customerData) {
            if (customerData.name) {
              customerNameValue = customerData.name;
            }
            setCustomerLandingSource(customerData.landing_source || null);
          }
        }
        setCustomerName(customerNameValue);

        // Fetch today's date from Supabase (server time)
        const { data: dateData, error: dateErr } = await supabase.rpc('get_today_date');
        let dateObj;
        if (!dateErr && dateData) {
          dateObj = new Date(dateData);
        } else {
          dateObj = new Date();
        }
        // Format as 'Fecha: 5 de Agosto 2025'
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dia = dateObj.getDate();
        const mes = meses[dateObj.getMonth()];
        const anio = dateObj.getFullYear();
        const fechaFormateada = `Fecha: ${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`;
        setQuoteDate(fechaFormateada);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error al cargar la cotización.');
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate totals with dynamic discount
  const subtotal = favorites.reduce((sum, fav) => {
    const prod = products[fav.product_id];
    return prod ? sum + prod.price * fav.quantity : sum;
  }, 0);
  
  // --- DISCOUNT DISABLED ---
  const discountRate = 0;
  const discount = 0;
  const subtotalAfterDiscount = subtotal;
  const iva = subtotal * IVA_RATE;
  const totalConDescuento = subtotal + iva;
  const ivaSinDescuento = iva;
  const totalSinDescuento = subtotal + iva;
  const customerHasDiscount = false;

  // Format currency
  const formatCurrency = useCallback(
    (amount: number) => amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
    []
  );

  return (
    <>
      {/* Print CSS to ensure watermark background is visible when printing */}
      <style>{`
        @media print {
          /* Force background images to print for watermark */
          .kusam-watermark {
            opacity: 0.08 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
      <div className="min-h-screen flex flex-col items-center py-8 px-2 relative overflow-hidden" style={{ background: '#fff' }}>
        <div className="bg-white shadow-lg rounded-lg max-w-3xl w-full p-8 relative text-black" style={{ zIndex: 2, overflow: 'hidden' }}>
          {/* Watermark background inside the data container */}
          <div
            className="kusam-watermark"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url('/kusam_main.webp')`,
              backgroundRepeat: 'repeat',
              backgroundSize: '180px',
              backgroundPosition: 'center',
              opacity: 0.05,
              zIndex: 0,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
          {/* Content above watermark */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Letterhead */}
            <div className="flex items-center justify-between mb-8 border-b pb-4">
              <div className="flex flex-col gap-1">
                <Image src="/kusam_main.webp" alt="Kusam Logo" width={160} height={40} />
                <div className="text-black text-base font-semibold mt-2">Cliente: {customerName || '---'}</div>
                <div className="text-black text-sm">{quoteDate || 'Fecha: ---'}</div>
              </div>
              <div className="text-right text-sm text-black">
                <div>
                  <span className="font-bold">RFC:</span> {RFC}
                </div>
                <div>Kusam Outdoor Solutions</div>
                <div>www.kusam.com.mx</div>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-4 text-center text-black">Cotización de Productos</h1>
            {loading ? (
              <div className="text-center text-black/60">Cargando cotización...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : favorites.length === 0 ? (
              <div className="text-center text-black/60">No hay productos en tu cotización.</div>
            ) : (
              <>
                {/* Responsive Table */}
                <div className="w-full mb-6">
                  <div className="hidden md:block">
                    <table className="w-full border text-sm text-black">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border px-2 py-1">Producto</th>
                          <th className="border px-2 py-1">Tela</th>
                          <th className="border px-2 py-1">Estructura</th>
                          <th className="border px-2 py-1">Cantidad</th>
                          <th className="border px-2 py-1">Precio Unitario</th>
                          <th className="border px-2 py-1">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {favorites.map((fav) => {
                          const prod = products[fav.product_id];
                          if (!prod) return null;
                          return (
                            <tr key={fav.id} className="text-center">
                              <td className="border px-2 py-1 font-semibold">
                                <div className="flex items-center gap-2">
                                  <Image src={prod.image_url} alt={prod.name} width={40} height={40} className="rounded" />
                                  <span>{prod.name}</span>
                                </div>
                              </td>
                              <td className="border px-2 py-1">{fav.fabric_color || '-'}</td>
                              <td className="border px-2 py-1">{fav.frame_color || '-'}</td>
                              <td className="border px-2 py-1">{fav.quantity}</td>
                              <td className="border px-2 py-1">{formatCurrency(prod.price)}</td>
                              <td className="border px-2 py-1">{formatCurrency(prod.price * fav.quantity)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {/* Mobile stacked version */}
                  <div className="md:hidden flex flex-col gap-4">
                    {favorites.map((fav) => {
                      const prod = products[fav.product_id];
                      if (!prod) return null;
                      return (
                        <div key={fav.id} className="bg-white border rounded-lg shadow-sm p-3 flex flex-col gap-2">
                          <div className="flex items-center gap-3">
                            <Image src={prod.image_url} alt={prod.name} width={40} height={40} className="rounded" />
                            <span className="font-semibold text-base text-black">{prod.name}</span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-black/80">
                            <span>
                              <span className="font-semibold">Tela:</span> {fav.fabric_color || '-'}
                            </span>
                            <span>
                              <span className="font-semibold">Estructura:</span> {fav.frame_color || '-'}
                            </span>
                            <span>
                              <span className="font-semibold">Cantidad:</span> {fav.quantity}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-sm text-black/80">
                            <span>
                              <span className="font-semibold">Precio Unitario:</span> {formatCurrency(prod.price)}
                            </span>
                            <span>
                              <span className="font-semibold">Total:</span> {formatCurrency(prod.price * fav.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Simple Quote, no discounts */}
                <div className="flex flex-col md:flex-row gap-[13px] md:gap-[21px] mb-[21px] w-full">
                  <div className="flex-1 bg-green-50 border border-green-400 rounded-[21px] p-[21px] shadow-sm flex flex-col justify-between min-w-[233px]">
                    <div className="text-green-900 text-[21px] font-bold mb-[13px] flex items-center gap-[8px]">
                      <svg className="w-[18px] h-[21px] text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      ¡Completa Tu Compra Hoy!
                    </div>
                    <div className="flex flex-col items-end gap-[5px] text-[13px] text-green-900">
                      <div>
                        <span className="font-semibold">Subtotal:</span> {formatCurrency(subtotal)}
                      </div>
                      <div>
                        <span className="font-semibold">IVA 16%:</span> {formatCurrency(iva)}
                      </div>
                      <div className="text-[18px] font-extrabold mt-[8px] text-green-700 drop-shadow">
                        <span className="font-semibold">TOTAL:</span> {formatCurrency(totalConDescuento)}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/kusam/payment')}
                      className="mt-[21px] w-full px-6 py-3 text-white rounded-lg font-semibold transition-colors shadow border-none"
                      style={{
                        backgroundImage: `url('/wood/var1.png')`,
                        backgroundSize: 'cover',
                        backgroundRepeat: 'repeat',
                        backgroundColor: '#6b7280',
                      }}
                    >
                      ¡PROCEDER AL PAGO!
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}