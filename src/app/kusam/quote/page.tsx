'use client';

import { useEffect, useState, useCallback } from 'react';
import jsPDF from 'jspdf';
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
  // Background pattern and overlay (not angled)
  // This will be rendered as a fixed background behind the main content
  // No rotation, 25% white overlay
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

  // PDF download logic: build PDF from data, not screenshot
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDownloadPDF = async () => {

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let y = 50;

    // Watermark pattern: Kusam logo at 45deg, 30% opacity, repeated
    try {
      const watermarkBase64 =
        'data:image/webp;base64,UklGRiIAAABXRUJQVlA4ICwAAACwAgCdASoCAAIALmk0mk0iIiIiIgBoSywA/veff/0PP8bA//LwYAAA'; // Placeholder, replace with your Kusam logo base64 (webp or png recommended)
      const logoSize = 120;
      const xStep = 200;
      const yStep = 200;
      const angle = 45 * Math.PI / 180;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      for (let x = -logoSize; x < pageWidth + logoSize; x += xStep) {
        for (let yW = -logoSize; yW < pageHeight + logoSize; yW += yStep) {
          // Transformation matrix for rotation and translation
          // [a, b, c, d, e, f] = [cos, sin, -sin, cos, x, y]
          pdf.addImage(
            watermarkBase64,
            'auto',
            0,
            0,
            logoSize,
            logoSize,
            undefined,
            'NONE',
            {
              opacity: 0.3,
              matrix: [cos, sin, -sin, cos, x + logoSize / 2, yW + logoSize / 2]
            }
          );
        }
      }
    } catch {
      // Watermark failed, skip
    }

    // Logo (base64-embedded for reliability)
    try {
      // Real Kusam logo as base64 (JPG)
      const kusamLogoBase64 =
        'data:image/jpeg;base64,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';
      pdf.addImage(kusamLogoBase64, 'auto', 40, y, 120, 32);
    } catch {
      // Logo failed to load, skip
    }
    y += 48;

    // Customer info
    pdf.setFontSize(13);
    pdf.setTextColor('#111111');
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Cliente:`, 40, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${customerName || '---'}`, 100, y);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Fecha:`, 40, y + 18);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${quoteDate?.replace('Fecha: ', '') || '---'}`, 100, y + 18);

    pdf.setFont('helvetica', 'bold');
    y += 30;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Kusam Outdoor Solutions', 40, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text('www.kusam.com.mx', 40, y + 18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('RFC:', 40, y + 36);
    pdf.setFont('helvetica', 'normal');
    pdf.text(RFC, 90, y + 36);
    y += 54;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#000000ff');
    pdf.text('Cotización de Muebles Kusam', pageWidth / 2, y, { align: 'center' });
    y += 40;

    // Table header with improved alignment and vertical lines
    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor('#f0fdf4');
    pdf.rect(40, y - 12, pageWidth - 80, 20, 'F');
    pdf.setTextColor('#166534');
    // Column x positions (Cantidad moved right, no vertical lines)
    const colX = [45, 170, 240, 375, 460, 560];
    pdf.text('Producto', colX[0], y);
    pdf.text('Tela', colX[1], y);
    pdf.text('Estructura', colX[2], y);
    pdf.text('Cantidad', colX[3], y, { align: 'right' });
    pdf.text('Precio Unitario', colX[4], y, { align: 'right' });
    pdf.text('Total', colX[5], y, { align: 'right' });
    y += 14;
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#111111');

    // Table rows with improved alignment and spacing

    favorites.forEach((fav) => {
      const prod = products[fav.product_id];
      if (!prod) return;
      if (y > 720) {
        pdf.addPage();
        y = 50;
      }
      // Truncate product name if too long
      let prodName = prod.name;
      if (prodName.length > 28) prodName = prodName.slice(0, 25) + '...';
      pdf.text(prodName, colX[0], y);
      pdf.text((fav.fabric_color || '-').slice(0, 12), colX[1], y);
      pdf.text((fav.frame_color || '-').slice(0, 12), colX[2], y);
      pdf.text(String(fav.quantity), colX[3], y, { align: 'right' });
      pdf.text(formatCurrency(prod.price), colX[4], y, { align: 'right' });
      pdf.text(formatCurrency(prod.price * fav.quantity), colX[5], y, { align: 'right' });
      y += 22;
    });

    // Always start totals on a new page
    pdf.addPage();
    y = 50;

    // Discounted totals (vertical order)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#166534');
    pdf.text('¡Completa Tu Compra Hoy!', 45, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#111111');
    y += 18;
    pdf.text(`Subtotal: ${formatCurrency(subtotal)}`, 45, y);
    y += 18;
    pdf.text(`Descuento Expo 15%: -${formatCurrency(discount)}`, 45, y);
    y += 18;
    pdf.text(`Subtotal con Descuento: ${formatCurrency(subtotalAfterDiscount)}`, 45, y);
    y += 18;
    pdf.text(`IVA 16%: ${formatCurrency(iva)}`, 45, y);
    y += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor('#166534');
    pdf.text(`TOTAL CON DESCUENTO: ${formatCurrency(totalConDescuento)}`, 45, y);
    pdf.setFontSize(9.5);

    y += 36;
    // Non-discounted totals (vertical order)
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#d97706');
    pdf.text('Si no compras hoy:', 45, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#111111');
    y += 18;
    pdf.text(`Subtotal: ${formatCurrency(subtotal)}`, 45, y);
    y += 18;
    pdf.text(`IVA 16%: ${formatCurrency(ivaSinDescuento)}`, 45, y);
    y += 18;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor('#b91c1c');
    pdf.text(`TOTAL SIN DESCUENTO: ${formatCurrency(totalSinDescuento)}`, 45, y);
    pdf.setFontSize(9.5);

    pdf.save('cotizacion-kusam.pdf');
  };

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
                {/* Print dialog share/save instruction for mobile */}
                <div className="flex flex-col items-center mb-2 mt-2">
                  <span className="flex items-center gap-2 text-black/80 text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-share">
                      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                      <polyline points="16 6 12 2 8 6"></polyline>
                      <line x1="12" y1="2" x2="12" y2="15"></line>
                    </svg>
                    <span>
                      <strong>Tip:</strong> En tu teléfono, después de tocar <span className="underline">Imprimir</span>, usa el botón de <span className="underline">compartir</span> <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{display:'inline',verticalAlign:'middle'}}><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg> que aparece en las opciones de impresión para <span className="underline">guardar como PDF o imagen</span> esta cotización en tu dispositivo.
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-[10px] w-full px-6 py-3 border-2 border-black text-black rounded-lg font-semibold transition-colors shadow-none bg-transparent hover:bg-gray-100"
                  style={{ background: 'none' }}
                >
                  Imprimir o Guardar Cotización (PDF)
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
