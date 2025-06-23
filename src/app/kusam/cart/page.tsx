'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

// --- CartItemCard Component (MODIFIED) ---
interface ItemProps {
  // id here represents the customer_favorites.id (the row ID in the cart)
  id: string; // The ID of the customer_favorites entry
  productId: string; // The product_id from the customer_favorites entry
  name: string;
  imageUrl: string;
  notes: string; // Formatted string for display (e.g., config details, liked status)
  quantity: number; // The quantity of this item
  isLiked: boolean; // Denotes if it's just a 'liked' placeholder
}

interface CartItemCardProps {
  item: ItemProps;
  index: number; // For staggered animation
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, index }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, type: 'spring', stiffness: 100 } },
  };

  // Determine the product page URL. For Pancho, it's specific.
  // For a real app, you'd likely have a product slug or dynamic route.
  // Assuming 'pancho' is a placeholder path for any product detail page.
  const productDetailPath = `/kusam/test-catalog/pancho?favoriteId=${item.id}`;

  return (
    <Link href={productDetailPath} passHref> {/* Wrap the card in a Link */}
      <motion.div
        className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center cursor-pointer" // Add cursor-pointer
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
        <div className="relative w-32 h-32 mb-3">
          <Image
            src={item.imageUrl}
            alt={item.name}
            layout="fill"
            objectFit="contain"
            className="rounded-md"
          />
        </div>
        <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{item.name}</h3>
        {/* Display Quantity if it's more than 1 */}
        {item.quantity > 1 && (
          <p className="text-sm font-bold text-gray-700 mt-1">Cantidad: {item.quantity}</p>
        )}
        {item.notes && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {item.notes}
          </p>
        )}
        {/* Optional: Add an "Edit" button that performs the same navigation */}
        {/* <button className="mt-2 text-blue-500 text-xs">Edit</button> */}
      </motion.div>
    </Link>
  );
};
// --- End CartItemCard Component ---


// --- ConfirmationModal Component (unchanged) ---
interface ConfirmationModalProps {
  onClose: () => void;
  onSubmitOrder: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onSubmitOrder }) => {
  const router = useRouter();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
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
        style={{ opacity: 0.1 }}
      />
      
      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full relative z-20"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Qué excelente selección!
        </h2>
        <p className="text-gray-700 text-lg mb-6">
          Tu lista ha sido enviada a nuestros asesores.
        </p>
        <p className="text-gray-800 text-lg font-semibold mb-6">
          Completa tu orden **HOY** <br /> y
          recibirás{' '}
          <span className="text-4xl font-extrabold text-green-700 animate-pulse drop-shadow-[0_0_16px_rgba(59,130,246,0.7)] align-middle">
            5%
          </span>{' '}
          de descuento. Haz:
        </p>
        <button
          onClick={handleOrderClick}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
          style={{
            backgroundImage: `url('/wood/var5.png')`,
            backgroundSize: '100px 100px',
            backgroundRepeat: 'repeat',
            backgroundBlendMode: 'normal',
            backgroundColor: '#6b7280',
          }}
        >
          CLICK AQUI
        </button>
        <p className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline" onClick={onClose}>
          O cierra esta ventana y uno de nuestros asesores te contactará.
        </p>
      </motion.div>
    </div>
  );
};
// --- End ConfirmationModal Component ---


export default function KusamCartPage() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter();

  const [favoriteItems, setFavoriteItems] = useState<ItemProps[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  // NEW: State to store variants for lookup
  const [allVariants, setAllVariants] = useState<any[]>([]);

  // NEW: Helper function to get variant value from ID
  const getVariantValue = (variantId: string | null): string => {
    if (!variantId) return '';
    const variant = allVariants.find(v => v.id === variantId);
    return variant ? variant.value : 'Unknown';
  };

  useEffect(() => {
    async function fetchFavorites() {
      setLoadingFavorites(true);
      setFavoritesError(null);
      try {
        const customerId = typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : null;

        if (!customerId) {
          setFavoritesError('No customer ID found in local storage. Please visit a product page first.');
          setLoadingFavorites(false);
          return;
        }

        // 1. Fetch ALL product variants first to use for lookup
        const { data: allVariantsData, error: variantsError } = await supabase
          .from('product_variants')
          .select('id, value'); // Only need ID and value for lookup

        if (variantsError) {
          throw variantsError;
        }
        setAllVariants(allVariantsData || []);


        // 2. Fetch favorite entries for the current customer
        const { data: rawFavorites, error: favoritesError } = await supabase
          .from('customer_favorites')
          .select('*')
          .eq('customer_id', customerId);

        if (favoritesError) {
          throw favoritesError;
        }

        if (!rawFavorites || rawFavorites.length === 0) {
          console.log('No favorite items found for this customer.');
          setFavoriteItems([]);
          setLoadingFavorites(false);
          return;
        }

        // 3. Extract unique product_ids to fetch product details efficiently
        const uniqueProductIds = [...new Set(rawFavorites.map(fav => fav.product_id))];

        // 4. Fetch product details for all unique product_ids
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', uniqueProductIds);

        if (productsError) {
          throw productsError;
        }

        const productMap = new Map();
        if (productsData) {
          productsData.forEach(product => {
            productMap.set(product.id, product);
          });
        }

        // 5. Combine favorite data with product data and format notes
        const combinedItems: ItemProps[] = rawFavorites.map(fav => {
          const product = productMap.get(fav.product_id);
          if (product) {
            let notesString = '';
            if (fav.is_liked) {
              notesString = 'Solo "Me Gusta"'; // If it's just a liked item
            } else {
              // Format notes string with fabric/frame/quantity
              const fabric = getVariantValue(fav.fabric_color_id);
              const frame = getVariantValue(fav.frame_color_id);
              
              if (fabric && frame) {
                notesString = `${fabric}, ${frame}`;
              } else if (fabric) { // Fallback if only one is selected
                notesString = `${fabric}`;
              } else if (frame) {
                notesString = `${frame}`;
              }
            }

            return {
              id: fav.id, // Pass the ID of THIS specific customer_favorites entry
              productId: product.id, // Also pass the product ID
              name: product.name,
              imageUrl: product.image_url,
              notes: notesString,
              quantity: fav.quantity,
              isLiked: fav.is_liked,
            };
          }
          return null;
        }).filter(item => item !== null) as ItemProps[];

        setFavoriteItems(combinedItems);
      } catch (err: any) {
        console.error('Error fetching favorite items:', err.message);
        setFavoritesError(`Could not load your favorite items: ${err.message}`);
      } finally {
        setLoadingFavorites(false);
      }
    }

    fetchFavorites();
  }, []); // Re-run when customerId changes (if you add customer login, etc.)


  const containerVariants = {
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

  const handleSubmitQuote = () => {
    setShowConfirmationModal(true);
  };

  const handleOrderCompletionClick = () => {
    router.push('/kusam/payment');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 pt-10 pb-10 bg-white">
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
                  src="/expo_mueble.png"
                  alt="Expo Mueble Internacional Logo"
                  width={90}
                  height={18}
                  className="inline-block"
              />
          </span>.
        </p>

        {loadingFavorites ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">Cargando tus favoritos...</p>
          </div>
        ) : favoritesError ? (
          <div className="text-center py-10 text-red-600 text-lg">
            <p>Error: {favoritesError}</p>
          </div>
        ) : favoriteItems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg">Aún no tienes piezas favoritas. ¡Acércate a un producto para marcarlo!</p>
            <Link href="/kusam/catalog">
              <p className="mt-4 text-blue-600 hover:underline">Ver catálogo</p>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {favoriteItems.map((item, index) => (
              <CartItemCard key={item.id} item={item} index={index} />
            ))}
          </div>
        )}

        <div className="mb-8 text-center p-4 bg-blue-50 rounded-md border-blue-200 border">
            <p className="text-blue-800 text-lg font-semibold">
                OFERTA EXCLUSIVA: Todas las compras completadas en <span className="inline-flex items-center align-middle mx-1">
                    <Image
                        src="/expo_mueble.png"
                        alt="Expo Mueble Internacional Logo"
                        width={100}
                        height={20}
                        className="inline-block"
                    />
                </span> reciben un <span className="font-bold text-xl">DESCUENTO ESPECIAL de 5%</span>.
            </p>
            <p className="text-blue-700 text-sm mt-1">
                Acércate a uno de nuestros asesores si tienes dudas o necesitas más información. <br></br>**En Kusam Outdoor Solutions estamos para servirte.**
            </p>
        </div>

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

        <Link href="/kusam" passHref>
            <p className="text-center text-sm text-blue-600 hover:underline mt-4 cursor-pointer">
                Regresar al inicio de la demo
            </p>
        </Link>
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