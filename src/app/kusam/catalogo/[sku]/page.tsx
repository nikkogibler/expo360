// src/app/kusam/catalogo/[sku]/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { trackProductView, trackProductFavorite, trackProductCustomization } from '../../../../utils/googleAnalytics';

// Utility function to preload images
const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};


interface GlobalProductOption {
  id: string;
  name: string;
  type: string;
  value_data: { image_url?: string };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  has_fabric_colors: boolean;
  available_fabric_colors: string[] | null;
  has_frame_finish: boolean;
  available_frame_finishes: string[] | null;
}

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

interface ProductPageParams {
  sku: string;
}

interface ProductDetailPageProps {
  params: Promise<ProductPageParams>;
}

const ProductDetailPage = ({ params }: ProductDetailPageProps) => {
  const router = useRouter();
  const currentSearchParams = useSearchParams();

  const { sku } = React.use(params);

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

  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [imageKey, setImageKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string; x: number; y: number; isTapped: boolean } | null>(null);
  const [canHover, setCanHover] = useState(false);
  const dragConstraintsRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanHover(window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    }
    
    // Simplifies ID handling:
    // 1. Get the customer ID from local storage.
    // 2. If it doesn't exist, create a new one.
    // The CustomerIdInitializer component handles redirecting if this ID is for an anonymous user.
    let currentCustomerId = localStorage.getItem('kusam_customer_id');
    if (!currentCustomerId) {
      currentCustomerId = uuidv4();
      localStorage.setItem('kusam_customer_id', currentCustomerId);
      console.log('Generated new customer ID:', currentCustomerId);
    } else {
      console.log('Using customer ID from localStorage:', currentCustomerId);
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
        setImageLoading(true);
        setImageError(false);
        setImageKey(prev => prev + 1);
        setRetryCount(0);

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

          // Track product view with Google Analytics
          trackProductView(productData.id, productData.name);
          console.log('📊 Tracked product view:', productData.name);

          if (productData.image_url) {
            preloadImage(productData.image_url)
              .then(() => {
                console.log('Product image preloaded successfully:', productData.image_url);
              })
              .catch((error) => {
                console.warn('Failed to preload product image:', error.message);
              });
          }

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
                JSON.parse(option.value_data) as { image_url?: string } :
                option.value_data
            })) as GlobalProductOption[];
          }

          let filteredFrameColors: GlobalProductOption[] = [];
          let filteredFabricColors: GlobalProductOption[] = [];

          if (productData.has_fabric_colors && Array.isArray(productData.available_fabric_colors) && productData.available_fabric_colors.length > 0) {
            const productFabricNamesUpper = productData.available_fabric_colors.map((name: string) => name.trim().toUpperCase());
            filteredFabricColors = allFetchedGlobalOptions.filter(opt =>
              opt.type.toLowerCase() === 'fabric_color' && productFabricNamesUpper.includes(opt.name.trim().toUpperCase())
            );
          }

          if (productData.has_frame_finish && Array.isArray(productData.available_frame_finishes) && productData.available_frame_finishes.length > 0) {
            const productFrameNamesUpper = productData.available_frame_finishes.map((name: string) => name.trim().toUpperCase());
            filteredFrameColors = allFetchedGlobalOptions.filter(opt =>
              opt.type.toLowerCase() === 'finish' && productFrameNamesUpper.includes(opt.name.trim().toUpperCase())
            );
          }

          setFrameColorOptions(filteredFrameColors);
          setFabricColorOptions(filteredFabricColors);

          if (favoriteIdFromUrl && currentCustomerId && productData) {
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
  }, [sku, currentSearchParams, isLiked]);

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
      .maybeSingle();

    if (selectError) {
      console.error("Error al verificar cliente existente:", selectError.message);
      return cId;
    }

    if (!existingCustomer) {
      console.log("Cliente no encontrado, intentando insertar nuevo cliente.");
      
      // Determine anonymous customer name based on URL params
      const fromParam = currentSearchParams.get('from');
      let anonymousName = 'Visitante Anónimo de la Expo'; // Default
      let landingSource = 'Expo Mueble Internacional'; // Default
      
      if (fromParam === 'evento-especial') {
        anonymousName = 'Visitante Anónimo Evento Especial';
        landingSource = 'Evento Especial';
      }
      
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ 
          customer_id: cId, 
          email: `${cId}@temp.com`, 
          name: anonymousName,
          landing_source: landingSource
        })
        .select()
        .single();

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
    let existingLikedEntry: CustomerFavorite | null = null;

    // Check for an existing liked entry for the same product to prevent multiple likes
    const { data: likedEntry, error: likedEntryError } = await supabase
        .from('customer_favorites')
        .select('*')
        .eq('customer_id', currentCustomerId)
        .eq('product_id', product.id)
        .eq('is_liked', true)
        .maybeSingle<CustomerFavorite>();

    if (likedEntryError && likedEntryError.code !== 'PGRST116') {
        console.error("Error checking for existing liked entry:", likedEntryError.message);
    }
    existingLikedEntry = likedEntry;

    // The explicitFavId is used for editing an existing entry
    if (explicitFavId) {
        const { data, error } = await supabase
            .from('customer_favorites')
            .select('*')
            .eq('id', explicitFavId)
            .eq('customer_id', currentCustomerId)
            .maybeSingle<CustomerFavorite>();
        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching explicitFavId:", error.message);
        }
        existingEntry = data;
    }

    try {
      if (isInterestedAction) {
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
          
          // Track product favorite with Google Analytics
          trackProductFavorite(product.id, product.name);
          console.log('📊 Tracked product favorite:', product.name);
        } else {
          console.log('Inserting new configured favorite item.');
          const { data, error } = await supabase
            .from('customer_favorites')
            .insert([favoriteDataToSave])
            .select();
          if (error) throw error;
          console.log('New configured favorite item registered successfully in Supabase:', data);
          
          // Track product favorite with Google Analytics
          trackProductFavorite(product.id, product.name);
          console.log('📊 Tracked product favorite:', product.name);
          
          // Track product customization if colors were selected
          if (selectedFabricName || selectedFrameName) {
            trackProductCustomization(product.id, product.name, selectedFabricName || undefined, selectedFrameName || undefined);
            console.log('📊 Tracked product customization:', product.name, { fabric: selectedFabricName, frame: selectedFrameName });
          }
        }
        setIsLiked(true);
      } else if (isLikeAction) {
        const newLikedState = !isLiked;

        if (existingLikedEntry) {
          console.log(`Toggling is_liked on existing entry ${existingLikedEntry.id} to: ${newLikedState}`);
          const { data, error } = await supabase
            .from('customer_favorites')
            .update({ is_liked: newLikedState })
            .eq('id', existingLikedEntry.id)
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

  const getGlobalOptionDetailsById = (id: string, options: GlobalProductOption[]) => {
    const option = options.find(opt => opt.id === id);
    return {
      name: option?.name || 'N/A',
      image_url: option?.value_data?.image_url || null,
    };
  };

  const handleDecrement = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleMouseEnterSwatch = (e: React.MouseEvent, imageUrl: string, imageName: string) => {
    if (canHover) {
      setPreviewImage({ src: imageUrl, alt: imageName, x: e.clientX, y: e.clientY, isTapped: false });
    }
  };

  const handleMouseLeaveSwatch = () => {
    if (canHover && previewImage && !previewImage.isTapped) {
      setPreviewImage(null);
    }
  };

  const handleMouseMoveSwatch = (e: React.MouseEvent) => {
    if (canHover && previewImage && !previewImage.isTapped) {
      setPreviewImage(prev => prev ? { ...prev, x: e.clientX + 15, y: e.clientY + 15 } : null);
    }
  };

  const handlePreviewDismiss = () => {
    setPreviewImage(null);
  };

  const handleSwatchSelection = (optionId: string, imageUrl: string | undefined, optionName: string, type: 'fabric' | 'frame') => {
    if (type === 'fabric') {
      setSelectedFabricColorId(optionId);
    } else {
      setSelectedFrameColorId(optionId);
    }

    if (imageUrl) {
      if (previewImage && previewImage.src === imageUrl && previewImage.isTapped) {
        setPreviewImage(null);
      } else {
        setPreviewImage({
          src: imageUrl,
          alt: optionName,
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          isTapped: true
        });
      }
    } else {
      setPreviewImage(null);
    }
  };

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
      className="min-h-screen text-gray-800 flex flex-col items-center py-8 px-4"
      style={{
        backgroundImage: 'url("/vine_2b.png")',
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto'
      }}
    >
      <div ref={dragConstraintsRef} className="fixed inset-0 z-40 pointer-events-none" />

      <div className="mb-6">
        <Image
          src="/kusam_main.webp"
          alt="Kusam Logo"
          width={120}
          height={40}
          className="h-auto"
          priority
        />
      </div>

      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="relative w-full pt-[177.77%] bg-white">
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <div className="flex flex-col items-center space-y-3">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
                <p className="text-sm text-gray-600">Cargando imagen...</p>
              </div>
            </div>
          )}
          {imageError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-600">
              <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-center px-4">No se pudo cargar la imagen</p>
              {retryCount >= 2 && (
                <p className="text-xs text-center px-4 text-gray-500">
                  (Intentos automáticos: {retryCount}/2)
                </p>
              )}
              <button 
                onClick={() => {
                  setImageError(false);
                  setImageLoading(true);
                  setImageKey(prev => prev + 1);
                  setRetryCount(0);
                }}
                className="mt-2 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
              >
                Reintentar manualmente
              </button>
            </div>
          )}
          <Image
            key={`product-image-${imageKey}`}
            src={product.image_url}
            alt={product.name}
            fill
            style={{ objectFit: 'contain' }}
            className={`absolute inset-0 rounded-t-lg cursor-pointer transition-opacity duration-300 ${
              imageLoading || imageError ? 'opacity-0' : 'opacity-100'
            }`}
            onClick={handleLikeToggle}
            priority
            sizes="(max-width: 640px) 100vw, 400px"
            onLoad={() => {
              console.log('Product image loaded successfully:', product.image_url);
              setImageLoading(false);
              setImageError(false);
            }}
            onError={(e) => {
              console.error('Failed to load product image:', product.image_url);
              console.error('Error details:', e);
              setImageLoading(false);
              setImageError(true);
              if (retryCount < 2) {
                const retryDelay = Math.pow(2, retryCount) * 1000;
                console.log(`Auto-retrying image load in ${retryDelay}ms (attempt ${retryCount + 1}/2)`);
                setTimeout(() => {
                  setRetryCount(prev => prev + 1);
                  setImageError(false);
                  setImageLoading(true);
                  setImageKey(prev => prev + 1);
                }, retryDelay);
              }
            }}
            onLoadStart={() => {
              console.log('Starting to load product image:', product.image_url);
            }}
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

      <div 
        className="w-full max-w-sm rounded-lg shadow-xl p-6 relative"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
        }}
      >
        <div 
          className="absolute inset-0 rounded-lg opacity-30"
          style={{
            backgroundImage: 'url("/vine_2b.png")',
            backgroundRepeat: 'repeat',
            backgroundSize: 'auto',
            zIndex: -1
          }}
        ></div>
        <h1
          className="text-3xl font-extrabold mb-2 text-center"
          style={{
            backgroundImage: `url('/wood/var3.png')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {product.name}
        </h1>

<p className="text-lg font-semibold text-gray-700 mb-4 text-center">
  ${new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(product.price)}{' '}MXN
</p>

        <p className="text-base text-gray-600 mb-6 text-center leading-relaxed">
          {product.description}
        </p>

        {fabricColorOptions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Colores de Tela</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {fabricColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSwatchSelection(option.id, option.value_data.image_url, option.name, 'fabric')}
                  onMouseEnter={(e) => option.value_data.image_url && handleMouseEnterSwatch(e, option.value_data.image_url, option.name)}
                  onMouseLeave={handleMouseLeaveSwatch}
                  onMouseMove={handleMouseMoveSwatch}
                  className={`relative w-10 h-10 rounded-full border-2 focus:outline-none overflow-hidden flex items-center justify-center transition-all duration-200
                    ${selectedFabricColorId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}
                    ${!option.value_data.image_url ? 'bg-gray-200' : ''}`}
                  title={option.name}
                >
                  {option.value_data.image_url ? (
                    <Image
                      src={option.value_data.image_url}
                      alt={option.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-full"
                      sizes="40px"
                      onError={() => {
                        console.error('Failed to load fabric color image:', option.value_data.image_url);
                      }}
                    />
                  ) : (
                    null
                  )}
                  {selectedFabricColorId === option.id && (
                    <span className="absolute inset-0 flex justify-center items-center text-white text-xl bg-black bg-opacity-30 rounded-full">✓</span>
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

        {frameColorOptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Colores de Estructura</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {frameColorOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSwatchSelection(option.id, option.value_data.image_url, option.name, 'frame')}
                  onMouseEnter={(e) => option.value_data.image_url && handleMouseEnterSwatch(e, option.value_data.image_url, option.name)}
                  onMouseLeave={handleMouseLeaveSwatch}
                  onMouseMove={handleMouseMoveSwatch}
                  className={`relative w-10 h-10 rounded-full border-2 focus:outline-none overflow-hidden flex items-center justify-center transition-all duration-200
                    ${selectedFrameColorId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}
                    ${!option.value_data.image_url ? 'bg-gray-200' : ''}`}
                  title={option.name}
                >
                  {option.value_data.image_url ? (
                    <Image
                      src={option.value_data.image_url}
                      alt={option.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      className="rounded-full"
                      sizes="40px"
                      onError={() => {
                        console.error('Failed to load frame color image:', option.value_data.image_url);
                      }}
                    />
                  ) : (
                    null
                  )}
                  {selectedFrameColorId === option.id && (
                    <span className="absolute inset-0 flex justify-center items-center text-white text-xl bg-black bg-opacity-30 rounded-full">✓</span>
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

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3 text-center">Cantidad</h2>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={handleDecrement}
              className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Disminuir cantidad"
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className="w-24 p-2 border border-gray-300 rounded-md shadow-sm text-center text-gray-900 text-xl font-bold
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
            backgroundColor: '#6b7280',
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

      <div className="mt-8 w-full max-w-sm">
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => router.push('/kusam/catalogo')}
            className="py-3 px-2 bg-white border-2 border-amber-700 text-amber-700 rounded-lg font-medium text-xs shadow-sm hover:bg-amber-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span>Catálogo</span>
          </button>

          <button
            onClick={() => router.push('/kusam/cart')}
            className="py-3 px-2 bg-white border-2 border-green-500 text-green-600 rounded-lg font-medium text-xs shadow-sm hover:bg-green-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.51-2.54 5.57-8.16 11.17L12 21.35z" />
            </svg>
            <span>Favoritos</span>
          </button>
          
          <button
            onClick={() => router.push('/kusam')}
            className="py-3 px-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-medium text-xs shadow-sm hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Inicio</span>
          </button>
        </div>

        {editingFavoriteId && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379-1.561-2.6-2.978-2.106a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Editando selección
            </span>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-sm text-gray-500 max-w-sm px-4">
        <span className="font-medium text-gray-700">{product.name}</span>
      </div>

      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handlePreviewDismiss}
            drag={canHover}
            dragConstraints={dragConstraintsRef}
            dragElastic={0.1}
            dragTransition={{ bounceStiffness: 100, bounceDamping: 10 }}
            className="fixed z-50 p-2 bg-white rounded-lg shadow-xl border border-gray-200 cursor-pointer"
            style={{
              left: previewImage.isTapped ? '50%' : previewImage.x,
              top: previewImage.isTapped ? '50%' : previewImage.y,
              transform: previewImage.isTapped ? 'translate(-50%, -50%)' : 'translate(15px, 15px)',
              width: previewImage.isTapped ? '133px' : '80px',
              height: previewImage.isTapped ? '133px' : '80px',
            }}
          >
            <Image
              src={previewImage.src}
              alt={previewImage.alt}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-md"
              sizes="200px"
              onError={() => {
                console.error('Failed to load preview image:', previewImage.src);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductDetailPage;