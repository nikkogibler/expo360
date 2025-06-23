// This file must be named 'page.tsx' and be located inside a folder like 'src/app/kusam/test-catalog/[sku]/
// for Next.js App Router to recognize it as a dynamic route. `[sku]` will capture the SKU from the URL.

'use client';

// IMPORTS: Added 'use' from React
import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/utils/supabase';

// NEW INTERFACE: GlobalProductOption to match your new table structure
interface GlobalProductOption {
  id: string; // UUID of the global option
  name: string; // e.g., "Madera Clara", "Azul Cielo"
  type: string; // e.g., "finish", "fabric_color"
  // UPDATED: value_data should be an object after parsing in useEffect
  value_data: { hex_code?: string; [key: string]: any }; // Guaranteed to be an object after initial fetch
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Existing Product Interface (remains the same)
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
}

export default function ProductDetailPage({ params }: { params: { sku: string } }) {
  // CORRECTED: Unwrap the params object directly using React.use()
  // Next.js passes 'params' as a Suspense-compatible 'thenable' object.
  const { sku } = use(params);

  const router = useRouter();
  const searchParams = useSearchParams();

  // State for core product data
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // UPDATED: State for dynamically loaded global options
  const [frameColorOptions, setFrameColorOptions] = useState<GlobalProductOption[]>([]);
  const [fabricColorOptions, setFabricColorOptions] = useState<GlobalProductOption[]>([]);

  // UPDATED: State for selected option IDs (these will map to global_product_options IDs)
  const [selectedFrameColorId, setSelectedFrameColorId] = useState<string>(''); // Stores ID of selected frame color
  const [selectedFabricColorId, setSelectedFabricColorId] = useState<string>(''); // Stores ID of selected fabric color

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [showPopUpHeart, setShowPopUpHeart] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // State to know if we are editing an existing item from the cart
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);

  useEffect(() => {
    let currentCustomerId = localStorage.getItem('kusam_customer_id');
    if (!currentCustomerId) {
      currentCustomerId = uuidv4();
      localStorage.setItem('kusam_customer_id', currentCustomerId);
    }
    setCustomerId(currentCustomerId);

    const favoriteIdFromUrl = searchParams.get('favoriteId');
    if (favoriteIdFromUrl) {
      setEditingFavoriteId(favoriteIdFromUrl);
    }

    async function fetchData() {
      // sku is now available directly after unwrapping resolvedParams
      if (!sku) {
        setProductError('SKU del producto no proporcionado.');
        setLoadingProduct(false);
        return;
      }

      try {
        setLoadingProduct(true);
        setProductError(null);

        // 1. Fetch core product data based on SKU
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

          // NEW: Fetch global product options (frame_color and fabric_color)
          const { data: globalOptionsRawData, error: globalOptionsFetchError } = await supabase
            .from('global_product_options')
            .select('*')
            .in('type', ['finish', 'fabric_color']); // Fetch options for these types

          if (globalOptionsFetchError) {
            console.warn('Error al obtener opciones globales:', globalOptionsFetchError.message);
            // Don't throw, just proceed without global options
          }

          let fetchedFrameColors: GlobalProductOption[] = [];
          let fetchedFabricColors: GlobalProductOption[] = [];

          if (globalOptionsRawData) {
            // IMPORTANT: Parse value_data from string to object for each option
            // This ensures value_data is always an object after this point
            const globalOptionsData = globalOptionsRawData.map(option => ({
                ...option,
                value_data: typeof option.value_data === 'string' ? JSON.parse(option.value_data) : option.value_data
            })) as GlobalProductOption[];


            fetchedFrameColors = globalOptionsData.filter(opt => opt.type.toLowerCase() === 'finish');
            fetchedFabricColors = globalOptionsData.filter(opt => opt.type.toLowerCase() === 'fabric_color');
            setFrameColorOptions(fetchedFrameColors);
            setFabricColorOptions(fetchedFabricColors);
          }


          // 3. Logic to check if product is already liked/favorited by this customer
          if (currentCustomerId && productData.id) {
            const { data: existingFavorite, error: checkFavoriteError } = await supabase
              .from('customer_favorites')
              .select('*')
              .eq('customer_id', currentCustomerId)
              .eq('product_id', productData.id)
              .maybeSingle();

            if (checkFavoriteError) {
              console.error("Error al verificar el estado de favoritos:", checkFavoriteError.message);
            } else {
              if (existingFavorite) {
                setIsLiked(existingFavorite.is_liked || false);
              } else {
                setIsLiked(false);
              }
            }
          }

          // --- NEW/UPDATED LOGIC: Pre-fill if editing existing favorite OR set sane defaults ---
          if (favoriteIdFromUrl && currentCustomerId && productData) {
            const { data: existingFavorite, error: favoriteError } = await supabase
              .from('customer_favorites')
              .select('*')
              .eq('id', favoriteIdFromUrl)
              .eq('customer_id', currentCustomerId)
              .single();

            if (favoriteError) {
              console.error("Error al obtener el favorito existente para precargar:", favoriteError.message);
              setProductError('No se pudo cargar la selección existente. Por favor, inténtelo de nuevo.');
              setEditingFavoriteId(null);
              // Fallback to defaults or clear selections if existing cannot be loaded
              // UPDATED: Use fetchedGlobalOptions for defaults
              setSelectedFrameColorId(fetchedFrameColors.length > 0 ? fetchedFrameColors[0].id : '');
              setSelectedFabricColorId(fetchedFabricColors.length > 0 ? fetchedFabricColors[0].id : '');
              setQuantity(1);
              setIsLiked(false);
            } else if (existingFavorite) {
              // PRE-FILL UI WITH DATA FROM EXISTING FAVORITE
              // UPDATED: Map fabric_color_id from favorites to selectedFabricColorId
              // And frame_color_id from favorites to selectedFrameColorId (was accessory)
              setSelectedFabricColorId(existingFavorite.fabric_color_id || ''); // This was selectedPackagingId
              setSelectedFrameColorId(existingFavorite.frame_color_id || '');   // This was selectedAccessoryId

              setQuantity(existingFavorite.quantity || 1);
              setIsLiked(existingFavorite.is_liked || false);
              console.log("Formulario precargado exitosamente para editar favorito:", existingFavorite);
            }
          } else {
            // NOT editing, set default options (first available for each, or clear if none)
            // UPDATED: Use fetchedGlobalOptions for defaults
            setSelectedFrameColorId(fetchedFrameColors.length > 0 ? fetchedFrameColors[0].id : '');
            setSelectedFabricColorId(fetchedFabricColors.length > 0 ? fetchedFabricColors[0].id : '');
            setQuantity(1);
            if (isLiked === null) {
                setIsLiked(false);
            }
          }
        } else {
          setProductError('Producto no encontrado en la base de datos.');
        }
      } catch (err: any) {
        setProductError(`Error al obtener detalles del producto o variantes: ${err.message}`);
        console.error('Error en fetchData:', err.message);
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchData();
  }, [sku, searchParams, customerId]);


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
      console.error("ensureCustomerExists: Error al verificar cliente existente:", selectError.message);
      return cId;
    }

    if (!existingCustomer || existingCustomer.length === 0) {
      console.log("ensureCustomerExists: Cliente no encontrado, intentando insertar nuevo cliente.");
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ customer_id: cId, email: `${cId}@temp.com`, name: 'Visitante Anónimo de la Expo' })
        .select();

      if (insertError) {
        console.error("ensureCustomerExists: Error al insertar nuevo cliente:", insertError.message);
      } else {
        console.log("ensureCustomerExists: Nuevo cliente creado en Supabase:", newCustomer);
      }
    } else {
        console.log("ensureCustomerExists: Cliente ya existe:", existingCustomer);
    }
    return cId;
  };

  const logProductFavorite = async (
    isLikeAction: boolean,
    isInterestedAction: boolean,
    configQuantity: number = 1,
    existingFavId: string | null = null
  ) => {
    console.log("logProductFavorite: Intentando registrar favorito...");
    if (!product || !customerId) {
        console.error("logProductFavorite: Producto o ID de cliente no disponible. No se puede registrar el favorito del producto.");
        return;
    }

    const currentCustomerId = await ensureCustomerExists(customerId);
    if (!currentCustomerId) {
      console.error("logProductFavorite: No se pudo obtener una ID de cliente válida para registrar el favorito.");
      return;
    }

    let favoriteData: any = {
      customer_id: currentCustomerId,
      product_id: product.id,
      quantity: configQuantity,
      is_liked: isLikeAction,
      // UPDATED: Store the IDs of the selected global options
      fabric_color_id: selectedFabricColorId || null,
      frame_color_id: selectedFrameColorId || null,
    };

    if (isLikeAction) {
      // When just liking, ensure custom options and quantity are reset/nullified
      favoriteData.fabric_color_id = null;
      favoriteData.frame_color_id = null;
      favoriteData.quantity = 1;
    }

    try {
        if (existingFavId && isInterestedAction) {
            console.log('Actualizando artículo favorito existente:', existingFavId);
            const { data, error } = await supabase
                .from('customer_favorites')
                .update(favoriteData)
                .eq('id', existingFavId)
                .select();

            if (error) throw error;
            console.log('Favorito actualizado exitosamente en Supabase:', data);
        } else if (isInterestedAction) {
            const { data: existingLikedItem, error: selectError } = await supabase
                .from('customer_favorites')
                .select('id')
                .eq('customer_id', currentCustomerId)
                .eq('product_id', product.id)
                .is('fabric_color_id', null)
                .is('frame_color_id', null)
                .eq('is_liked', true)
                .maybeSingle();

            if (selectError) {
                console.error('Error al verificar el elemento "me gusta" existente:', selectError.message);
            }

            if (existingLikedItem) {
                console.log('Actualizando elemento "me gusta" existente a elemento configurado:', existingLikedItem.id);
                const { data, error } = await supabase
                    .from('customer_favorites')
                    .update(favoriteData)
                    .eq('id', existingLikedItem.id)
                    .select();
                if (error) throw error;
                console.log('Favorito de producto (actualizado) registrado exitosamente en Supabase:', data);
            } else {
                const { data: existingConfiguredItem, error: selectConfiguredError } = await supabase
                    .from('customer_favorites')
                    .select('id')
                    .eq('customer_id', currentCustomerId)
                    .eq('product_id', product.id)
                    // UPDATED: Check for existing configured items by actual fabric/frame color IDs
                    // To be more precise, you might compare selectedFabricColorId and selectedFrameColorId here
                    // For now, checking if they are NOT null is a good start.
                    .not('fabric_color_id', 'is', null)
                    .not('frame_color_id', 'is', null)
                    .maybeSingle();

                if (selectConfiguredError) {
                    console.error('Error al verificar el elemento configurado existente:', selectConfiguredError.message);
                }

                if (existingConfiguredItem) {
                    console.log('Actualizando elemento configurado existente:', existingConfiguredItem.id);
                    const { data, error } = await supabase
                        .from('customer_favorites')
                        .update(favoriteData)
                        .eq('id', existingConfiguredItem.id)
                        .select();
                    if (error) throw error;
                    console.log('Favorito de producto (configurado) ACTUALIZADO exitosamente en Supabase:', data);
                } else {
                    console.log('Insertando nuevo elemento configurado.');
                    const { data, error } = await supabase
                        .from('customer_favorites')
                        .insert([favoriteData])
                        .select();
                    if (error) throw error;
                    console.log('Favorito de producto (nuevo configurado) registrado exitosamente en Supabase:', data);
                }
            }
        } else if (isLikeAction) {
            if (isLiked) {
                // If it was liked and now unliking, delete the simple 'liked' entry
                const { data: deletedData, error: deleteError } = await supabase
                    .from('customer_favorites')
                    .delete()
                    .eq('customer_id', currentCustomerId)
                    .eq('product_id', product.id)
                    .eq('is_liked', true)
                    // Ensure we delete only simple 'liked' entries (not configured ones)
                    .is('fabric_color_id', null)
                    .is('frame_color_id', null);

                if (deleteError) throw deleteError;
                console.log('Favorito de producto (ya no me gusta) eliminado exitosamente:', deletedData);
            } else {
                // If it was not liked and now liking, check if a configured item exists
                const { data: existingConfigured, error: checkConfigError } = await supabase
                    .from('customer_favorites')
                    .select('id')
                    .eq('customer_id', currentCustomerId)
                    .eq('product_id', product.id)
                    // Check for any existing configured item
                    .not('fabric_color_id', 'is', null)
                    .not('frame_color_id', 'is', null)
                    .maybeSingle();

                if (checkConfigError) {
                    console.error('Error al verificar el elemento configurado existente antes de dar "me gusta":', checkConfigError.message);
                }

                if (existingConfigured) {
                    console.log('Ya existe un elemento configurado para este producto. No se agregará un "me gusta" simple.');
                } else {
                    // No configured item, so insert a simple 'liked' entry
                    const { data, error } = await supabase
                        .from('customer_favorites')
                        .insert([favoriteData])
                        .select();

                    if (error) throw error;
                    console.log('Favorito de producto (me gusta) registrado exitosamente en Supabase:', data);
                }
            }
        }
    } catch (error: any) {
      console.error('logProductFavorite: Error de operación de Supabase:', error);
      console.error('logProductFavorite: Mensaje de error:', error.message);
      console.error('logProductFavorite: Código de error:', error.code);
      console.error('logProductFavorite: Sugerencia de error:', error.hint);
    }
  };


  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    console.log("handleImInterested: Botón clickeado. Registrando elemento configurado...");
    // Pass selectedFabricColorId and selectedFrameColorId to logProductFavorite, which will use them from state
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
  // UPDATED: Now works with GlobalProductOption interface and gets hex_code from value_data directly
  const getGlobalOptionDetailsById = (id: string, options: GlobalProductOption[]) => {
    const option = options.find(opt => opt.id === id);
    return {
      name: option?.name || 'N/A',
      // value_data is guaranteed to be an object here due to pre-parsing in useEffect
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
                <path d="M12 21.35l-1.84-1.68C4.54 14.07 2 12.01 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.51-2.54 5.57-8.16 11.17L12 21.35z"/>
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
                  <path d="M12 21.35l-1.84-1.68C4.54 14.07 2 12.01 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.51-2.54 5.57-8.16 11.17L12 21.35z"/>
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
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2 text-center">
          {product.name}
        </h1>
        <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
          ${product.price.toFixed(2)}
        </p>
        <p className="text-base text-gray-600 mb-6 text-center leading-relaxed">
          {product.description}
        </p>

        {/* Customization Options: Fabric Colors (formerly Packaging Variants) */}
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
            ${isAddingToFavorites ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'}`
          }
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
}