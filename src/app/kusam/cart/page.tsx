'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useCallback, useRef, memo } from 'react';
import { useRouter } from 'next/navigation';

import { supabase } from '@/utils/supabase';

// --- Color Name to Hex Code Mapping (Hardcoded for now) ---
const colorNameToHex: { [key: string]: string } = {
  // Fabric Colors from your screenshots
  'DUNE': '#b9ad89',
  'ANTHRACITE': '#3d475e',
  'OASIS': '#74B75D',
  'APHRODITE': '#892855',
  'MOON': '#D8D2C9',
  'BLUE GETARIA': '#4052D6',
  'TERRA': '#E3655B',
  'BROWN': '#964B00',
  'PEARL': '#EAE0C8',
  'OCEAN': '#48BF91',
  'NIORD': '#4682B4',
  'AQUAMARINE': '#7FFFD4',
  'WHITE': '#F4F0EC',
  'GREEN': '#008000',
  'GARNET': '#733635',
  'EMERALD': '#50C878',
  'CAMEL': '#C19A6B',
  'LIGHT BLUE': '#87CEEB',
  'LIGHT GREY': '#D3D3D3',
  'BLUE OCEAN': '#00729e',
  'DARK BLUE': '#00008B',
  'WHITE GREY WASH': '#F2F3F5',
  'GRANITE': '#616161',
  'OVERSEA': '#4C9BB0',
  'GALLANT': '#37372c',
  
  // Finishes
  'GRAFITO': '#36454F',
  'BLANCO': '#FFFFFF',
  'RIVER': '#0072BB',
  'ARENA': '#C2B280',
  'GRIS TORMENTA': '#536878',
  'SCORIA': '#65000B',
  'OCEAN (Finish)': '#4F42B5', // Renamed to avoid clash with fabric 'OCEAN'
  'JADE': '#00a86b',
  'NEGRO': '#000000',
  'CREMA': '#FFDDC0',
  'CLAY': '#E3735E',
  'TORTORA': '#c3c2ac',
  'ECRU': '#C2B280', // Same hex as 'ARENA', keep for clarity
};

// --- CartItemCard Component (WRAPPED IN React.memo) ---

// NEW INTERFACE: This was the missing piece causing all the 'any' errors
interface RawFavorite {
  id: string; // From fav.id in the map
  product_id: string; // From fav.product_id
  quantity: number; // From fav.quantity
  customer_id: string; // Assuming this is part of the Supabase record

  // These are the specific fields accessed via fav['property'] that need to be typed
  fabric_color?: string; // Made optional as it might be null or undefined
  frame_color?: string; // Made optional
  is_liked?: boolean; // Made optional

  // These are accessed by ID, ensure they are also selected from Supabase
  fabric_color_id?: string; // Made optional
  frame_color_id?: string; // Made optional
}


interface ItemProps {
  id: string; 
  productId: string; 
  name: string;
  imageUrl: string;
  notes: string; 
  quantity: number; 
  isLiked: boolean; 
}

interface CartItemCardProps {
  item: ItemProps;
  index: number;
  onRemove: (itemId: string) => void; // Add this prop
}

interface ProductVariant {
  id: string; 
  value: string;
}

// interface GlobalProductOption { // This was correctly commented out previously
// value: string; 
// value_data: { 
// hex_code?: string; 
// };
// }

const CartItemCard = memo(function CartItemCard({ item, index, onRemove }: CartItemCardProps) {
  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, type: 'spring' as const, stiffness: 100 } },
  };

  const productDetailPath = `/kusam/catalogo/${item.productId}`;

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product page
    e.stopPropagation();
    onRemove(item.id);
  };

  const renderNotesWithColors = (notes: string) => {
    const parts = notes.split(',').map(part => part.trim()).filter(part => part);
    
    return (
      // Added `overflow-y-auto` to allow scrolling if notes exceed max height
      // Adjusted scrollbar classes for better visual (tailwind-scrollbar plugin needed if not already installed)
      <div className="flex flex-col items-center text-xs text-gray-600 mt-1 w-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 pr-1">
        {parts.map((part, i) => {
          const colorHex = colorNameToHex[part]; 
          const isTransparent = part.toLowerCase().includes('transparente') || part.toLowerCase().includes('clear');

          return (
            // Ensure each part stays on one line and centers horizontally
            <div key={i} className="flex items-center mb-0.5 last:mb-0 w-full justify-center flex-shrink-0 whitespace-nowrap"> 
              {colorHex ? (
                <span
                  className="w-3 h-3 rounded-full mr-1 border border-gray-300 flex-shrink-0"
                  style={{ backgroundColor: colorHex }}
                ></span>
              ) : isTransparent ? ( 
                <span
                  className="w-3 h-3 rounded-full mr-1 border border-gray-300 flex-shrink-0 bg-white" 
                ></span>
              ) : null}
              {/* Added `overflow-hidden text-ellipsis` for single line overflow */}
              <span className="overflow-hidden text-ellipsis">{part}</span> 
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Link href={productDetailPath} passHref>
      <motion.div
        className="bg-white p-2 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer overflow-hidden relative
                   w-full"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring' as const, stiffness: 300, damping: 10 }}
        style={{ height: '280px' }}
      >
        {/* Updated Remove button - now gray and discrete */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 w-5 h-5 bg-gray-400 hover:bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-normal transition-colors duration-200 z-10 shadow-sm opacity-70 hover:opacity-100"
          title="Quitar de favoritos"
          aria-label="Quitar de favoritos"
        >
          ×
        </button>

        <div className="relative w-28 h-28 mb-2 flex-shrink-0">
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
        
        <h3 className="text-sm font-semibold text-gray-800 text-center mt-auto flex-shrink-0 flex items-center justify-center px-1"
            style={{ minHeight: '40px', maxHeight: '40px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {item.name}
        </h3>
        {item.quantity > 1 && (
          <p className="text-xs font-bold text-gray-700 mt-1 flex-shrink-0">Cantidad: {item.quantity}</p>
        )}
        <div className="flex-shrink-0" style={{ minHeight: '50px', maxHeight: '70px', flexGrow: 1 }}>
            {item.notes && renderNotesWithColors(item.notes)} 
        </div>
      </motion.div>
    </Link>
  );
});


// --- ConfirmationModal Component (No changes needed) ---
interface ConfirmationModalProps {
  onClose: () => void;
  onSubmitOrder: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onSubmitOrder }) => {
// const router = useRouter(); 

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8 }
  };

  const handleOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
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
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full relative z-20"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* ADDED: Close button (X icon) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 rounded-full p-1"
          aria-label="Cerrar modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Qué excelente selección!
        </h2>
        <p className="text-gray-700 text-lg mb-6">
          Tu lista ha sido enviada a nuestros asesores.
        </p>
        <p className="text-gray-800 text-lg font-semibold mb-6">
          Completa tu orden <b>HOY</b>
        </p>
        <button
          onClick={handleOrderClick}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
          style={{
            backgroundImage: `url('/wood/var5.png')`,
            backgroundSize: '100px 100px',
            backgroundRepeat: 'repeat',
            backgroundColor: '#6b7280',
          }}
        >
          HAZ CLICK AQUI
        </button>
        <p className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline" onClick={onClose}>
        </p>
      </motion.div>
    </div>
  );
};


export default function KusamCartPage() {
  const [customerLandingSource, setCustomerLandingSource] = useState<string | null>(null);
  const [landingPageImageUrl, setLandingPageImageUrl] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter(); 

  const [favoriteItems, setFavoriteItems] = useState<ItemProps[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);
  const [hasCustomerId, setHasCustomerId] = useState<boolean | null>(null);

  const [allVariantsMap, setAllVariantsMap] = useState<Map<string, ProductVariant>>(new Map());
  
  const hasFetchedData = useRef(false);

  // FIX APPLIED HERE: Changed variantId parameter to allow `undefined`
  const getVariantValue = useCallback((variantId: string | null | undefined): string => { 
    if (!variantId) return '';
    const variant = allVariantsMap.get(variantId);
    return variant ? variant.value : 'Unknown';
  }, [allVariantsMap]);

  useEffect(() => {
    // Fetch landing_source (or name) and landing_pages image_url for dynamic image
    async function fetchLandingSourceAndImage() {
      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;
      if (!customerId) return;
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('landing_source, name')
        .eq('customer_id', customerId)
        .maybeSingle();
      if (!customerError && customerData) {
        // Use landing_source, fallback to name
        const landingSource = customerData.landing_source || customerData.name || null;
        setCustomerLandingSource(landingSource);
        if (landingSource) {
          const { data: landingPages, error: landingPageError } = await supabase
            .from('landing_pages')
            .select('name, image_url')
            .eq('name', landingSource)
            .maybeSingle();
          if (!landingPageError && landingPages && landingPages.image_url) {
            setLandingPageImageUrl(landingPages.image_url.replace(/^\/public/, ''));
          } else {
            setLandingPageImageUrl(null);
          }
        } else {
          setLandingPageImageUrl(null);
        }
      }
    }
    fetchLandingSourceAndImage();
    // Only proceed if data hasn't been fetched yet
    if (hasFetchedData.current) {
      console.log('--- useEffect (initCustomerAndFetchFavorites) skipped: Data already fetched ---');
      return; 
    }
    hasFetchedData.current = true; // Mark as fetched

    console.log('--- useEffect (initCustomerAndFetchFavorites) triggered ---'); 

    async function initCustomerAndFetchFavorites() {
      setLoadingFavorites(true);
      setFavoritesError(null);
      setFavoriteItems([]);

      const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;

      if (!customerId) {
        setHasCustomerId(false); 
        setLoadingFavorites(false); 
        console.log('No Customer ID found, stopping fetch.'); 
        return; 
      }

      setHasCustomerId(true);
      
      try {
        console.log('Fetching product_variants...'); 
        const { data: allVariantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, value');

        if (variantsError) {
          throw variantsError;
        }
        const newVariantsMap = new Map<string, ProductVariant>();
        (allVariantsData || []).forEach(v => newVariantsMap.set(v.id, v));
        setAllVariantsMap(newVariantsMap);
        console.log('Product_variants fetched and mapped.'); 

        console.log('Fetching customer_favorites...'); 
        // ADD THE FILTER HERE - only fetch liked items
        const { data: rawFavorites, error: favoritesError } = await supabase
          .from('customer_favorites')
          .select('*') 
          .eq('customer_id', customerId)
          .eq('is_liked', true); // ✅ Add this line

        if (favoritesError) {
          throw favoritesError;
        }

        console.log('Raw Favorites Data from Supabase (only is_liked=true):', rawFavorites);

        if (!rawFavorites || rawFavorites.length === 0) {
          console.log('No favorite items found for this customer.');
          setFavoriteItems([]);
          return; 
        }
        console.log('Processing combined items...'); 
        const uniqueProductIds = [...new Set(rawFavorites.map(fav => fav.product_id))];

        console.log('Fetching products...'); 
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, sku, name, image_url') 
          .in('id', uniqueProductIds);

        if (productsError) {
          throw productsError;
        }

        const productMap = new Map();
        (productsData || []).forEach(product => {
          productMap.set(product.id, product);
        });

        const combinedItems: ItemProps[] = (rawFavorites as RawFavorite[]).map((fav: RawFavorite) => {
          const product = productMap.get(fav.product_id);
          if (product) {
            let notesString = '';

            const directFabricColor = fav.fabric_color ?? ''; 
            const directFrameColor = fav.frame_color ?? '';   
            const isLikedFav = fav.is_liked ?? false; 

            console.log(`--- Item: ${product.name} (Fav ID: ${fav.id}) ---`);
            console.log(`  directFabricColor (raw): '${directFabricColor}'`);
            console.log(`  directFrameColor (raw): '${directFrameColor}'`);
            console.log(`  isLikedFav: ${isLikedFav}`);

            const variationParts: string[] = [];
            if (directFabricColor) {
              variationParts.push(directFabricColor);
            }
            if (directFrameColor) {
              variationParts.push(directFrameColor);
            }

            if (variationParts.length > 0) {
              notesString = variationParts.join(', '); 
            } else {
              const fabric = getVariantValue(fav.fabric_color_id); 
              const frame = getVariantValue(fav.frame_color_id);   
              
              const idResolvedParts: string[] = [];
              if (fabric) idResolvedParts.push(fabric);
              if (frame) idResolvedParts.push(frame);

              if (idResolvedParts.length > 0) {
                notesString = idResolvedParts.join(', ');
              }
            }

            // 'Solo "Me Gusta"' is definitively removed from notesString.
            // The `isLikedFav` property remains in the item object for other potential uses.

            return {
              id: fav.id,
              productId: product.sku,
              name: product.name,
              imageUrl: product.image_url,
              notes: notesString, // This will contain variations only, or be empty
              quantity: fav.quantity,
              isLiked: isLikedFav,
            };
          }
          return null;
        }).filter(item => item !== null) as ItemProps[];

        setFavoriteItems(combinedItems);
        console.log('All data processed and favorite items set.'); 
      } catch (err: unknown) { // Changed from 'any' to 'unknown'
        console.error('Error in initCustomerAndFetchFavorites:', (err as Error).message); // Safely accessed message
        setFavoritesError(`Could not load your favorite items: ${(err as Error).message}`);
      } finally {
        setLoadingFavorites(false);
        console.log('--- initCustomerAndFetchFavorites completed ---'); 
      }
    }

    initCustomerAndFetchFavorites();
  }, [getVariantValue]); 


  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    },
  };

  const handleSubmitQuote = () => {
    setShowConfirmationModal(true);
  };

  const handleOrderCompletionClick = () => {
    router.push('/kusam/payment');
  };

  // Add the remove handler that sets is_liked to false
  const handleRemoveItem = async (itemId: string) => {
    // Optimistic update - remove from UI immediately
    setFavoriteItems(prev => prev.filter(item => item.id !== itemId));
    

    try {
      // Instead of deleting, update is_liked to false
      const { error } = await supabase
        .from('customer_favorites')
        .update({ is_liked: false })
        .eq('id', itemId);

      if (error) {
        throw error;
      }

      console.log('Item unliked successfully - is_liked set to false');
      
    } catch (err: unknown) {
      console.error('Error unliking item:', err);
      
      // Revert optimistic update on error
      alert('Error al quitar el elemento de favoritos. La página se recargará.');
      window.location.reload(); // Simple fallback - you could implement more sophisticated error recovery
      
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 pt-10 pb-10 bg-white" style={{ minHeight: '800px' }}>
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
        className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20"
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

        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Mis Piezas Favoritas
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Aquí está la selección de productos Kusam que has capturado en{' '}
          <span className="inline-flex items-center align-middle mx-1">
            <Image
              src={landingPageImageUrl ? landingPageImageUrl.replace(/^\/public/, '') : '/expo_mueble.png'}
              alt={customerLandingSource ? customerLandingSource + ' Logo' : 'Expo Mueble Internacional Logo'}
              width={90}
              height={18}
              className="inline-block"
            />
          </span>.
        </p>

        {/* Updated Grid Container:
            - gap-x-4: Horizontal gap for desktop
            - gap-y-6: Vertical gap for more breathing room
            - grid-cols-2: On mobile, always 2 columns
            - sm:grid-cols-3 md:grid-cols-4: More columns on larger screens
            - px-2 sm:px-4 md:px-6: Responsive horizontal padding
            - justify-items-center: Centers items within their grid cells
        */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6 mb-8 min-h-[400px] px-2 sm:px-4 md:px-6 justify-items-center">
          {loadingFavorites ? (
            <div className="text-center py-10 col-span-full">
              <p className="text-gray-600 text-lg">Cargando tus favoritos...</p>
            </div>
          ) : favoritesError ? (
            <div className="text-center py-10 text-red-600 text-lg col-span-full">
              <p>Error: {favoritesError}</p>
            </div>
          ) : hasCustomerId === false ? (
            <div className="text-center py-10 col-span-full">
              <p className="text-gray-600 text-lg">No hay sesión activa. Por favor, <Link href="/kusam"><span className="text-blue-600 hover:underline cursor-pointer">inicie una sesión aquí</span></Link>.</p>
            </div>
          ) : favoriteItems.length === 0 ? (
            <div className="text-center py-10 col-span-full">
              <p className="text-gray-600 text-lg">Aún no tienes piezas favoritas. ¡Acércate a un producto para marcarlo!</p>
            </div>
          ) : (
            favoriteItems.map((item, index) => (
              <CartItemCard 
                key={item.id} 
                item={item} 
                index={index}
                onRemove={handleRemoveItem} // ✅ Pass the remove handler
              />
            ))
          )}
        </div>

        {/* 
            <p className="text-blue-800 text-lg font-semibold">
                OFERTA EXCLUSIVA: Todas las compras completadas en <span className="inline-flex items-center align-middle mx-1">
                    <Image
                        src="/expo_mueble.png"
                        alt="Expo Mueble Internacional Logo"
                        width={100}
                        height={20}
                        className="inline-block"
                    />
                </span> reciben un <span className="font-bold text-xl">DESCUENTO ESPECIAL de 15%</span>.
            </p>
        </div> */}

        <button
          onClick={handleSubmitQuote}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
          style={{
            backgroundImage: `url('/wood/var5.png')`,
            backgroundSize: '100px 100px',
            backgroundRepeat: 'repeat',
            backgroundColor: '#6b7280',
          }}
        >
          Solicita Tu Cotización
        </button>

        {/* Navigation Buttons - Same style as product detail page */}
        <div className="mt-6 w-full max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {/* Catalog Button - Brown outline */}
            <button
              onClick={() => router.push('/kusam/catalogo')}
              className="py-3 px-2 bg-white border-2 border-amber-700 text-amber-700 rounded-lg font-medium text-xs shadow-sm hover:bg-amber-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Catálogo</span>
            </button>
            
            {/* Home Button */}
            <button
              onClick={() => router.push('/kusam/instructions')}
              className="py-3 px-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-medium text-xs shadow-sm hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showConfirmationModal && (
          <ConfirmationModal
            onClose={() => setShowConfirmationModal(false)}
            onSubmitOrder={handleOrderCompletionClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}