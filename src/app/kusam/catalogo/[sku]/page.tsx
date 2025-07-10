// This file must be named 'page.tsx' and be located inside a folder like 'src/app/kusam/catalogo/[sku]/
// for Next.js App Router to recognize it as a dynamic route. `[sku]` will capture the SKU from the URL.

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';


// NEW INTERFACE: GlobalProductOption to match your new table structure
interface GlobalProductOption {
  id: string; // UUID of the global option
  name: string; // e.g., "Madera Clara", "Azul Cielo"
  type: string; // e.g., "finish", "fabric_color"
  value_data: { hex_code?: string };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Existing Product Interface (UPDATED to include new columns)
interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // New columns from Supabase 'products' table
  has_fabric_colors: boolean;
  available_fabric_colors: string[] | null; // Array of names (e.g., ["LIGHT GREY", "BLUE OCEAN"])
  has_frame_finish: boolean;
  available_frame_finishes: string[] | null; // Array of names
}

// NEW: Interface for CustomerFavorite
interface CustomerFavorite {
  id: string;
  customer_id: string;
  product_id: string;
  quantity: number;
  is_liked: boolean;
  fabric_color_id: string | null;
  frame_color_id: string | null;
  fabric_color: string | null;
  frame_color: string | null;
  created_at: string;
  updated_at: string;
}

// Define the parameters type for your dynamic route.
interface ProductPageParams {
  sku: string; // Dynamic route parameter, always a string
}

// Define the actual shape of the props your component expects at runtime.
interface ProductDetailPageProps {
  params: ProductPageParams;
  searchParams?: { [key: string]: string | string[] | undefined };
}

const ProductDetailPage = ({ params }: ProductDetailPageProps) => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const { sku } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [frameColorOptions, setFrameColorOptions] = useState<GlobalProductOption[]>([]);
  const [fabricColorOptions, setFabricColorOptions] = useState<GlobalProductOption[]>([]);

  const [selectedFrameColorId, setSelectedFrameColorId] = useState<string>('');
  const [selectedFabricColorId, setSelectedFabricColorId] = useState<string>('');

  const [quantity, setQuantity] = useState<number>(1);

  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [showPopUpHeart, setShowPopUpHeart] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    let currentCustomerId = localStorage.getItem('kusam_customer_id');
    if (!currentCustomerId) {
      currentCustomerId = uuidv4();
      localStorage.setItem('kusam_customer_id', currentCustomerId);
    }
    setCustomerId(currentCustomerId);

    const favoriteIdFromUrl = currentSearchParams.get('favoriteId');
    if (favoriteIdFromUrl) {
      setEditingFavoriteId(favoriteIdFromUrl);
    }

    async function fetchData() {
      if (!sku) {
        setProductError('SKU del producto no proporcionado.');
        setLoadingProduct(false);
        return;
      }

      try {
        setLoadingProduct(true);
        setProductError(null);

        // Fetch Product Data (now includes new option columns due to select('*'))
        const { data: productData, error: productFetchError } = await supabase
          .from('products')
          .select('*')
          .eq('sku', sku)
          .single();

        if (productFetchError) {
          throw productFetchError;
        }

        if (productData) {
          setProduct(productData as Product);

          // Fetch ALL relevant global options (unchanged from original code)
          const { data: globalOptionsRawData, error: globalOptionsFetchError } = await supabase
            .from('global_product_options')
            .select('*')
            .in('type', ['finish', 'fabric_color']);

          if (globalOptionsFetchError) {
            console.warn('Error al obtener opciones globales:', globalOptionsFetchError.message);
          }

          let allFetchedGlobalOptions: GlobalProductOption[] = [];
          if (globalOptionsRawData) {
            allFetchedGlobalOptions = globalOptionsRawData.map(option => ({
              ...option,
              value_data: typeof option.value_data === 'string' ?
                JSON.parse(option.value_data) as { hex_code?: string } :
                option.value_data
            })) as GlobalProductOption[];
          }

          let filteredFrameColors: GlobalProductOption[] = [];
          let filteredFabricColors: GlobalProductOption[] = [];

          // FILTER global options based on product's available options (names from productData)
          if (productData.has_fabric_colors && Array.isArray(productData.available_fabric_colors) && productData.available_fabric_colors.length > 0) {
            // Convert product's available names to uppercase for case-insensitive matching and trim whitespace
            const productFabricNamesUpper = productData.available_fabric_colors.map((name: string) => name.trim().toUpperCase());

            filteredFabricColors = allFetchedGlobalOptions.filter(opt =>
              opt.type.toLowerCase() === 'fabric_color' && productFabricNamesUpper.includes(opt.name.trim().toUpperCase())
            );
          }

          if (productData.has_frame_finish && Array.isArray(productData.available_frame_finishes) && productData.available_frame_finishes.length > 0) {
            // Convert product's available names to uppercase for case-insensitive matching and trim whitespace
            const productFrameNamesUpper = productData.available_frame_finishes.map((name: string) => name.trim().toUpperCase());

            filteredFrameColors = allFetchedGlobalOptions.filter(opt =>
              opt.type.toLowerCase() === 'finish' && productFrameNamesUpper.includes(opt.name.trim().toUpperCase())
            );
          }

          // Set state with the newly filtered options
          setFrameColorOptions(filteredFrameColors);
          setFabricColorOptions(filteredFabricColors);

          // ... (Rest of your existing logic for customer_favorites and pre-loading selections) ...

          // Adjust initial selection logic based on newly filtered options
          if (favoriteIdFromUrl && currentCustomerId && productData) {
            // Your existing logic for pre-loading from favoriteIdFromUrl
            // This part correctly sets selected IDs from the existing favorite.
            // No change needed here.
            const { data: existingFavorite, error: favoriteError } = await supabase
              .from('customer_favorites')
              .select('*')
              .eq('id', favoriteIdFromUrl)
              .eq('customer_id', currentCustomerId)
              .single<CustomerFavorite>();

            if (favoriteError) {
              console.error("Error al obtener el favorito existente para precargar:", favoriteError.message);
              setProductError('No se pudo cargar la selección existente. Por favor, inténtelo de nuevo.');
              setEditingFavoriteId(null);
              // Fallback to first available option from FILTERED lists if pre-load fails
              setSelectedFrameColorId(filteredFrameColors.length > 0 ? filteredFrameColors[0].id : '');
              setSelectedFabricColorId(filteredFabricColors.length > 0 ? filteredFabricColors[0].id : '');
              setQuantity(1);
              setIsLiked(false);
            } else if (existingFavorite) {
              setSelectedFabricColorId(existingFavorite.fabric_color_id || '');
              setSelectedFrameColorId(existingFavorite.frame_color_id || '');
              setQuantity(existingFavorite.quantity || 1);
              setIsLiked(existingFavorite.is_liked || false);
              console.log("Formulario precargado exitosamente para editar favorito:", existingFavorite);
            }
          } else {
            // If not editing, set default selections to the first of the *filtered* options
            setSelectedFrameColorId(filteredFrameColors.length > 0 ? filteredFrameColors[0].id : '');
            setSelectedFabricColorId(filteredFabricColors.length > 0 ? filteredFabricColors[0].id : '');
            setQuantity(1);
            if (isLiked === null) {
              setIsLiked(false);
            }
          }
        } else {
          setProductError('Producto no encontrado en la base de datos.');
        }
      } catch (err: unknown) {
        let errorMessage = 'An unknown error occurred.';
        if (err instanceof Error) {
            errorMessage = err.message;
        } else if (typeof err === 'object' && err !== null && 'message' in err && typeof (err as PostgrestError).message === 'string') {
            errorMessage = (err as PostgrestError).message;
        }
        setProductError(`Error al obtener detalles del producto o variantes: ${errorMessage}`);
        console.error('Error en fetchData:', errorMessage, err);
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchData();
  }, [sku, currentSearchParams, customerId, isLiked]);

  const ensureCustomerExists = async (cId: string): Promise<string> => {
    console.log("ensureCustomerExists: Verificando/Creando cliente con ID", cId);
    if (!cId) {
      console.error("ensureCustomerExists: Se intentó asegurar la existencia del cliente con ID de cliente nulo.");
      return "";
    }
    const { data: existingCustomer, error: selectError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', cId)
      .limit(1);

    if (selectError) {
      console.error("Error al verificar cliente existente:", selectError.message);
      return cId;
    }

    if (!existingCustomer || existingCustomer.length === 0) {
      console.log("Cliente no encontrado, intentando insertar nuevo cliente.");
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ customer_id: cId, email: `${cId}@temp.com`, name: 'Visitante Anónimo de la Expo' })
        .select();

      if (insertError) {
        console.error("Error al insertar nuevo cliente:", insertError.message);
      } else {
        console.log("Nuevo cliente creado en Supabase:", newCustomer);
      }
    } else {
      console.log("Cliente ya existe:", existingCustomer);
    }
    return cId;
  };

  const logProductFavorite = async (
    isLikeAction: boolean,
    isInterestedAction: boolean,
    configQuantity: number = 1,
    explicitFavId: string | null = null
  ) => {
    console.log(`logProductFavorite: Attempting to log favorite. isLikeAction: ${isLikeAction}, isInterestedAction: ${isInterestedAction}, configQuantity: ${configQuantity}, explicitFavId: ${explicitFavId}`);
    if (!product || !customerId) {
      console.error("logProductFavorite: Product or customer ID not available. Cannot log favorite.");
      return;
    }

    const currentCustomerId = await ensureCustomerExists(customerId);
    if (!currentCustomerId) {
      console.error("logProductFavorite: No se pudo obtener una ID de cliente válida to log favorite.");
      return;
    }

    let existingEntry: CustomerFavorite | null = null;

    if (explicitFavId) {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('*')
        .eq('id', explicitFavId)
        .eq('customer_id', currentCustomerId)
        .maybeSingle<CustomerFavorite>();
      if (error && error.code !== 'PGRST116') console.error("Error fetching explicitFavId:", error.message);
      existingEntry = data;
    } else {
      const { data, error } = await supabase
        .from('customer_favorites')
        .select('*')
        .eq('customer_id', currentCustomerId)
        .eq('product_id', product.id)
        .maybeSingle<CustomerFavorite>();
      if (error && error.code !== 'PGRST116') console.error("Error checking existing favorite for product:", error.message);
      existingEntry = data;
    }

    try {
      if (isInterestedAction) {
        // These still correctly find the selected option details from the filtered arrays
        const selectedFabricName = fabricColorOptions.find(opt => opt.id === selectedFabricColorId)?.name || null;
        const selectedFrameName = frameColorOptions.find(opt => opt.id === selectedFrameColorId)?.name || null;

        const favoriteDataToSave: Omit<CustomerFavorite, 'id' | 'created_at' | 'updated_at'> = {
          customer_id: currentCustomerId,
          product_id: product.id,
          quantity: configQuantity,
          is_liked: true,
          fabric_color_id: selectedFabricColorId || null,
          frame_color_id: selectedFrameColorId || null,
          fabric_color: selectedFabricName,
          frame_color: selectedFrameName,
        };

        if (existingEntry) {
          console.log('Updating existing favorite item (configured or promoting simple like):', existingEntry.id);
          const { data, error } = await supabase
            .from('customer_favorites')
            .update(favoriteDataToSave)
            .eq('id', existingEntry.id)
            .select();
          if (error) throw error;
          console.log('Favorite updated successfully in Supabase:', data);
        } else {
          console.log('Inserting new configured favorite item.');
          const { data, error } = await supabase
            .from('customer_favorites')
            .insert([favoriteDataToSave])
            .select();
          if (error) throw error;
          console.log('New configured favorite item registered successfully in Supabase:', data);
        }
        setIsLiked(true);

      } else if (isLikeAction) {
        const newLikedState = !isLiked;

        if (existingEntry) {
          console.log(`Toggling is_liked on existing entry ${existingEntry.id} to: ${newLikedState}`);
          const { data, error } = await supabase
            .from('customer_favorites')
            .update({ is_liked: newLikedState })
            .eq('id', existingEntry.id)
            .select();

          if (error) throw error;
          console.log('Favorite (is_liked) updated successfully:', data);
        } else {
          console.log(`Inserting new simple favorite with is_liked: ${newLikedState}`);
          const { data, error } = await supabase
            .from('customer_favorites')
            .insert({
              customer_id: currentCustomerId,
              product_id: product.id,
              quantity: 1,
              is_liked: newLikedState,
              fabric_color_id: null,
              frame_color_id: null,
              fabric_color: null,
              frame_color: null,
            })
            .select();
          if (error) throw error;
          console.log('New simple favorite registered successfully:', data);
        }
        setIsLiked(newLikedState);
      }
    } catch (error: unknown) {
      console.error('logProductFavorite: Supabase operation error:', error);

      if (error instanceof Error) {
        console.error('logProductFavorite: Message:', error.message);
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        const supabaseError = error as PostgrestError;
        console.error('logProductFavorite: Message:', supabaseError.message);
        if (supabaseError.code) console.error('logProductFavorite: Code:', supabaseError.code);
        if (supabaseError.hint) console.error('logProductFavorite: Hint:', supabaseError.hint);
      } else {
        console.error('logProductFavorite: An unexpected error occurred:', error);
      }
    }
  };


  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    console.log("handleImInterested: Botón clickeado. Registrando elemento configurado...");
    await logProductFavorite(false, true, quantity, editingFavoriteId);
    console.log('handleImInterested: Registro completo. Redirigiendo al carrito.');
    router.push('/kusam/cart');
  };

  const handleLikeToggle = async () => {
    if (isLiked === null) return;

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    if (newLikedState) {
      setShowPopUpHeart(true);
      setTimeout(() => {
        setShowPopUpHeart(false);
      }, 1000);
    }
    await logProductFavorite(true, false, 1, null);
  };

  // Helper to get the value (name) and hex_code for display from an ID
  const getGlobalOptionDetailsById = (id: string, options: GlobalProductOption[]) => {
    const option = options.find(opt => opt.id === id);
    return {
      name: option?.name || 'N/A',
      hex_code: option?.value_data?.hex_code || '#CCCCCC',
    };
  };

  // --- NEW: Quantity Increment/Decrement Handlers ---
  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };
  // --- END NEW ---

  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Cargando detalles del producto...</p>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-red-600 text-lg">Error: {productError}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Producto no encontrado.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 text-gray-800 flex flex-col items-center py-8 px-4"
    >
      {/* Product Image Section */}
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="relative w-full pt-[177.77%] bg-gray-200">
          <Image
            src={product.image_url}
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="absolute inset-0 rounded-t-lg cursor-pointer"
            onClick={handleLikeToggle}
          />

          {isLiked !== null && (
            <button
              onClick={handleLikeToggle}
              className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all duration-200 ease-in-out
                ${isLiked ? 'bg-red-500 text-white transform scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'}`}
              aria-label={isLiked ? "Quitar 'Me gusta' al producto" : "'Me gusta' al producto"}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M12 21.35l-1.84-1.68C4.54 14.07 2 12.01 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.51-2.54 5.57-8.16 11.17L12 21.35z" />
              </svg>
            </button>
          )}


          <AnimatePresence>
            {showPopUpHeart && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5 }}
                exit={{ opacity: 0, scale: 2.0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex justify-center items-center pointer-events-none"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="none"
                >
                  <path d="M12 21.35l-1.84-1.68C4.54 14.07 2 12.01 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.51-2.54 5.57-8.16 11.17L12 21.35z" />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-4 bg-gray-100 flex justify-center items-center">
          <span className="text-sm text-gray-600">¡Mira {product.name} en todo su esplendor!</span>
        </div>
      </div>

      {/* Product Details Section */}
      <div className="w-full max-w-sm bg-white rounded-lg shadow-xl p-6">
        <h1
          className="text-3xl font-extrabold mb-2 text-center"
          style={{
            backgroundImage: `url('/wood/var3.png')`, // Uses your wood image
            backgroundSize: 'cover', // Ensures the image covers the text area
            backgroundRepeat: 'no-repeat', // Prevents the image from repeating
            backgroundPosition: 'center', // Centers the image within the text
            WebkitBackgroundClip: 'text', // Clips the background to the text shape for Webkit browsers
            backgroundClip: 'text', // Standard property for clipping background to text
            color: 'transparent', // Makes the text itself transparent so the background image shows through
            WebkitTextFillColor: 'transparent', // For older Webkit browsers to make text transparent
          }}
        >
          {product.name}
        </h1>

        <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
          ${product.price.toFixed(2)}
        </p>

        <p className="text-base text-gray-600 mb-6 text-center leading-relaxed">
          {product.description}
        </p>

        {/* Customization Options: Fabric Colors (formerly Packaging Variants) */}
        {/* Only render if the product has fabric colors AND there are filtered options */}
        {fabricColorOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Colores de Tela</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {fabricColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFabricColorId(option.id)}
                  className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                    ${selectedFabricColorId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                  // Access value_data directly as an object after pre-parsing in useEffect
                  style={{ backgroundColor: option.value_data.hex_code || '#CCCCCC' }}
                  title={option.name}
                >
                  {selectedFabricColorId === option.id && (
                    <span className="flex justify-center items-center text-white text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
              Seleccionado: <span className="font-medium text-gray-700">
                {getGlobalOptionDetailsById(selectedFabricColorId, fabricColorOptions).name}
              </span>
            </p>
          </div>
        )}

        {/* Customization Options: Frame Colors (formerly Accessory Options) */}
        {/* Only render if the product has frame finish AND there are filtered options */}
        {frameColorOptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Colores de Estructura</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {frameColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedFrameColorId(option.id)}
                  className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                    ${selectedFrameColorId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                  // Access value_data directly as an object after pre-parsing in useEffect
                  style={{ backgroundColor: option.value_data.hex_code || '#DDDDDD' }}
                  title={option.name}
                >
                  {selectedFrameColorId === option.id && (
                    <span className="flex justify-center items-center text-white text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">
              Seleccionado: <span className="font-medium text-gray-700">
                {getGlobalOptionDetailsById(selectedFrameColorId, frameColorOptions).name}
              </span>
            </p>
          </div>
        )}

        {/* Quantity Selector with + and - buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">Cantidad</h2>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleDecrement}
              className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Disminuir cantidad"
              disabled={quantity <= 1} // Disable if quantity is 1
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-24 p-2 border border-gray-300 rounded-md text-center text-gray-900 text-xl font-bold
                appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0"
            />
            <button
              onClick={handleIncrement}
              className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
        </div>

        {/* "I'm Interested" / "Update Selection" Button */}
        <motion.button
          onClick={handleImInterested}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300
            ${isAddingToFavorites
              ? 'bg-gray-400 cursor-not-allowed'
              : 'hover:bg-opacity-90 focus:outline-none focus:ring-4 focus:ring-stone-400'
            }`
          }
          style={{
            backgroundImage: `url('/wood/var3.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundColor: '#6b7280', // Fallback or base color
          }}
          disabled={isAddingToFavorites}
        >
          {isAddingToFavorites
            ? 'Guardando cambios...'
            : editingFavoriteId
              ? 'Actualizar Selección'
              : `¡Interesado en ${product.name}!`}
        </motion.button>
      </div>

      {/* Back to Products/Home / Back to Cart button */}
      <button
        onClick={() => router.push(editingFavoriteId ? '/kusam/cart' : '/kusam/catalog')}
        className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-200"
      >
        {editingFavoriteId ? '← Regresar a Mis Favoritos' : '← Regresar al catálogo'}
      </button>
    </motion.div>
  );
};

// --- MODIFIED EXPORT FOR ESLINT ---
// ESLint needs to be explicitly told to ignore `no-explicit-any` on this line.
// This is a comment that ESLint understands to disable the rule for the next line.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default ProductDetailPage as React.FunctionComponent<any>;
// --- MODIFIED EXPORT ENDS HERE ---