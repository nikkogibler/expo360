'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
// import jsPDF or html2canvas here later for PDF export
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
const EXPO_DISCOUNT = 0.15;
export default function QuotePage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteDate, setQuoteDate] = useState<string>('');

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
        (prodData || []).forEach((p: Product) => { prodMap[p.id] = p; });
        setProducts(prodMap);

        // Fetch customer name using customer_id from localStorage (matches both tables)
        let customerNameValue = '';
        if (customerId) {
          const { data: customerData, error: customerErr } = await supabase
            .from('customers')
            .select('name')
            .eq('customer_id', customerId)
            .maybeSingle();
          if (!customerErr && customerData && customerData.name) {
            customerNameValue = customerData.name;
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
        // Format as 'Fecha: 2 de Agosto 2025'
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        const dia = dateObj.getDate();
        const mes = meses[dateObj.getMonth()];
        const anio = dateObj.getFullYear();
        const fechaFormateada = `Fecha: ${dia} de ${mes.charAt(0).toUpperCase() + mes.slice(1)} ${anio}`;
        setQuoteDate(fechaFormateada);
      } catch (err: any) {
        setError(err.message || 'Error al cargar la cotización.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Calculate totals
  const subtotal = favorites.reduce((sum, fav) => {
    const prod = products[fav.product_id];
    return prod ? sum + prod.price * fav.quantity : sum;
  }, 0);
  const discount = subtotal * EXPO_DISCOUNT;
  const subtotalAfterDiscount = subtotal - discount;
  const iva = subtotalAfterDiscount * IVA_RATE;
  const totalConDescuento = subtotalAfterDiscount + iva;
  const ivaSinDescuento = subtotal * IVA_RATE;
  const totalSinDescuento = subtotal + ivaSinDescuento;

  // Format currency
  const formatCurrency = useCallback((amount: number) =>
    amount.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' }),
  []);

  // Placeholder for PDF download
  const handleDownloadPDF = () => {
    alert('Funcionalidad de descarga PDF próximamente.');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8 px-2">
      <div className="bg-white shadow-lg rounded-lg max-w-3xl w-full p-8 relative text-black">
        {/* Letterhead */}
        <div className="flex items-center justify-between mb-8 border-b pb-4">
          <div className="flex flex-col gap-1">
            <Image src="/kusam_main.webp" alt="Kusam Logo" width={160} height={40} />
            <div className="text-black text-base font-semibold mt-2">Cliente: {customerName || '---'}</div>
            <div className="text-black text-sm">{quoteDate || 'Fecha: ---'}</div>
          </div>
          <div className="text-right text-sm text-black">
            <div><span className="font-bold">RFC:</span> {RFC}</div>
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
                          <td className="border px-2 py-1 font-semibold flex items-center gap-2">
                            <Image src={prod.image_url} alt={prod.name} width={40} height={40} className="rounded" />
                            <span>{prod.name}</span>
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
                        <span><span className="font-semibold">Tela:</span> {fav.fabric_color || '-'}</span>
                        <span><span className="font-semibold">Estructura:</span> {fav.frame_color || '-'}</span>
                        <span><span className="font-semibold">Cantidad:</span> {fav.quantity}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-black/80">
                        <span><span className="font-semibold">Precio Unitario:</span> {formatCurrency(prod.price)}</span>
                        <span><span className="font-semibold">Total:</span> {formatCurrency(prod.price * fav.quantity)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Discounted Quote + Button */}
            <div className="flex flex-col md:flex-row gap-[13px] md:gap-[21px] mb-[21px] w-full">
              <div className="flex-1 bg-green-50 border border-green-400 rounded-[21px] p-[21px] shadow-sm flex flex-col justify-between min-w-[233px]">
                <div className="text-green-900 text-[21px] font-bold mb-[13px] flex items-center gap-[8px]">
                  <svg className="w-[18px] h-[21px] text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ¡Completa Tu Compra Hoy!
                </div>
                <div className="flex flex-col items-end gap-[5px] text-[13px] text-green-900">
                  <div><span className="font-semibold">Subtotal:</span> {formatCurrency(subtotal)}</div>
                  <div><span className="font-semibold">Descuento Expo 15%:</span> <span className="text-green-700">-{formatCurrency(discount)}</span></div>
                  <div><span className="font-semibold">Subtotal con Descuento:</span> {formatCurrency(subtotalAfterDiscount)}</div>
                  <div><span className="font-semibold">IVA 16%:</span> {formatCurrency(iva)}</div>
                  <div className="text-[18px] font-extrabold mt-[8px] text-green-700 drop-shadow"><span className="font-semibold">TOTAL CON DESCUENTO:</span> {formatCurrency(totalConDescuento)}</div>
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
                  ¡QUIERO MI DESCUENTO!
                </button>
              </div>
            </div>
            {/* Non-discounted Quote + Button */}
            <div className="flex flex-col md:flex-row gap-[13px] md:gap-[21px] mb-[21px] w-full">
              <div className="flex-1 bg-gray-50 border border-gray-300 rounded-[18px] p-[21px] shadow-sm flex flex-col justify-between min-w-[233px]">
                <div className="text-gray-800 text-[21px] font-bold mb-[13px]">No estas seguro? 🧐 </div>
                <div className="text-gray-700 text-sm mb-[8px]">Solo las compras completadas hoy reciben descuento.</div>
                <div className="flex flex-col items-end gap-[5px] text-[13px] text-gray-800">
                  <div><span className="font-semibold">Subtotal:</span> {formatCurrency(subtotal)}</div>
                  <div><span className="font-semibold">IVA 16%:</span> {formatCurrency(ivaSinDescuento)}</div>
                  <div className="text-[18px] font-extrabold mt-[8px] text-red-700 drop-shadow"><span className="font-semibold">TOTAL SIN DESCUENTO:</span> {formatCurrency(totalSinDescuento)}</div>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="mt-[21px] w-full px-6 py-3 border-2 border-black text-black rounded-lg font-semibold transition-colors shadow-none bg-transparent hover:bg-gray-100"
                  style={{ background: 'none' }}
                >
                  Descargar Cotización (PDF)
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
