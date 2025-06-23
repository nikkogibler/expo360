// This file must be named 'page.tsx' and be located inside a folder like 'pancho'
// within 'src/app/kusam/test-catalog/' for Next.js App Router to recognize it as a route.

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // For generating unique customer IDs
import { supabase } from '@/utils/supabase'; // Correct Supabase import

// Define the interface for Product Variants (from your Supabase schema)
interface ProductVariant {
  id: string; // UUID from Supabase (THIS IS WHAT WE'LL STORE IN DB FOR VARIANTS)
  product_id: string; // Foreign key linking to products table
  type: string; // 'packaging', 'accessory', 'fabric', 'frame' etc.
  value: string; // e.g., 'Standard Edition Packaging', 'Red Fabric'
  hex_code?: string; // Optional hex code for color representation
  additional_price?: number; // Optional price impact
  image_url?: string; // Optional image for the variant
  created_at: string;
  updated_at: string;
}

// Define the interface based on your Supabase 'products' table schema
// This remains unchanged and describes the core product data.
interface Product {
  id: string; // The UUID from Supabase's 'products' table
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  image_url: string; // Changed from imageUrl to image_url to match Supabase
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function PanchoProductPage() {
  const router = useRouter();
  // State for core product data fetched from Supabase
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // State for dynamically loaded variants
  const [packagingVariants, setPackagingVariants] = useState<ProductVariant[]>([]);
  const [accessoryOptions, setAccessoryOptions] = useState<ProductVariant[]>([]);

  // State for selected options, NOW STORING THE ID, NOT THE VALUE
  const [selectedPackagingId, setSelectedPackagingId] = useState<string>(''); // Stores ID of selected packaging variant
  const [selectedAccessoryId, setSelectedAccessoryId] = useState<string>(''); // Stores ID of selected accessory variant

  // Quantity
  const [quantity, setQuantity] = useState<number>(1);

  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPopUpHeart, setShowPopUpHeart] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // NEW/UPDATED: State to know if we are editing an existing item from the cart
  const [editingFavoriteId, setEditingFavoriteId] = useState<string | null>(null);


  // Hardcoded Pancho Product ID - This is the ID from your INSERT statement
  const PANCHO_PRODUCT_ID = '0e9ad1fc-25cf-47f9-8e8a-a965f8a6edd4';

  // Effect to get/set customerId from localStorage AND fetch all product-related data
  useEffect(() => {
    // Customer ID logic (remains the same)
    let currentCustomerId = localStorage.getItem('kusam_customer_id');
    if (!currentCustomerId) {
      currentCustomerId = uuidv4(); // Generate a new UUID
      localStorage.setItem('kusam_customer_id', currentCustomerId);
    }
    setCustomerId(currentCustomerId);

    // Get favoriteId from URL query parameters
    const searchParams = new URLSearchParams(window.location.search);
    const favoriteIdFromUrl = searchParams.get('favoriteId');
    if (favoriteIdFromUrl) {
      setEditingFavoriteId(favoriteIdFromUrl);
    }


    // Async function to fetch both product and its variants
    async function fetchData() {
      try {
        setLoadingProduct(true);
        setProductError(null); // Clear any previous errors

        // 1. Fetch Pancho's core product data
        const { data: productData, error: productFetchError } = await supabase
          .from('products')
          .select('*')
          .eq('id', PANCHO_PRODUCT_ID)
          .single();

        if (productFetchError) {
          throw productFetchError;
        }

        if (productData) {
          setProduct(productData as Product);

          // 2. Fetch specific variants for Pancho
          const { data: variantsData, error: variantsFetchError } = await supabase
            .from('product_variants')
            .select('*') // Select all columns
            .eq('product_id', PANCHO_PRODUCT_ID); // Filter by Pancho's product ID

          if (variantsFetchError) {
            throw variantsFetchError;
          }

          let fetchedPackaging: ProductVariant[] = [];
          let fetchedAccessories: ProductVariant[] = [];

          if (variantsData) {
            fetchedPackaging = variantsData.filter(v => v.type.toLowerCase() === 'packaging');
            fetchedAccessories = variantsData.filter(v => v.type.toLowerCase() === 'accessory');
            setPackagingVariants(fetchedPackaging);
            setAccessoryOptions(fetchedAccessories);
          }

          // --- NEW/UPDATED LOGIC: Pre-fill if editing existing favorite OR set sane defaults ---
          if (favoriteIdFromUrl && currentCustomerId) {
            // If we are editing, fetch the specific favorite item
            const { data: existingFavorite, error: favoriteError } = await supabase
              .from('customer_favorites')
              .select('*')
              .eq('id', favoriteIdFromUrl)
              .eq('customer_id', currentCustomerId) // Crucial: ensure current user owns this favorite
              .single();

            if (favoriteError) {
              console.error("Error fetching existing favorite for pre-fill:", favoriteError.message);
              setProductError('Could not load existing selection. Please try again.');
              setEditingFavoriteId(null); // Clear editing state if error
              // Fallback to defaults or clear selections if existing cannot be loaded
              setSelectedPackagingId(fetchedPackaging.length > 0 ? fetchedPackaging[0].id : '');
              setSelectedAccessoryId(fetchedAccessories.length > 0 ? fetchedAccessories[0].id : '');
              setQuantity(1);
              setIsLiked(false);
            } else if (existingFavorite) {
              // PRE-FILL UI WITH DATA FROM EXISTING FAVORITE
              setSelectedPackagingId(existingFavorite.fabric_color_id || '');
              setSelectedAccessoryId(existingFavorite.frame_color_id || '');
              setQuantity(existingFavorite.quantity || 1);
              setIsLiked(existingFavorite.is_liked || false);
              console.log("Successfully pre-filled form for editing favorite:", existingFavorite);
            }
          } else {
            // NOT editing, set default options (first available for each, or clear if none)
            setSelectedPackagingId(fetchedPackaging.length > 0 ? fetchedPackaging[0].id : '');
            setSelectedAccessoryId(fetchedAccessories.length > 0 ? fetchedAccessories[0].id : '');
            setQuantity(1); // Default quantity for new items
            setIsLiked(false); // Default liked state for new items
          }
           // --- END NEW/UPDATED LOGIC ---

        } else {
          setProductError('Pancho product not found in database.');
        }
      } catch (err: any) {
        setProductError(`Error fetching Pancho's details or variants: ${err.message}`);
        console.error('Error in fetchData:', err.message);
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchData();
  }, []); // Run once on component mount for both customer ID and product data


  // Function to ensure customer exists in 'customers' table or create them if not
  const ensureCustomerExists = async (cId: string): Promise<string> => {
    console.log("ensureCustomerExists: Checking/Creating customer with ID", cId);
    if (!cId) {
      console.error("ensureCustomerExists: Attempted to ensure customer existence with null customer ID.");
      return "";
    }
    const { data: existingCustomer, error: selectError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', cId)
      .limit(1);

    if (selectError) {
      console.error("ensureCustomerExists: Error checking for existing customer:", selectError.message);
      return cId;
    }

    if (!existingCustomer || existingCustomer.length === 0) {
      console.log("ensureCustomerExists: Customer not found, attempting to insert new customer.");
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ customer_id: cId, email: `${cId}@temp.com`, name: 'Anonymous Expo Visitor' })
        .select();

      if (insertError) {
        console.error("ensureCustomerExists: Error inserting new customer:", insertError.message);
      } else {
        console.log("ensureCustomerExists: New customer created in Supabase:", newCustomer);
      }
    } else {
        console.log("ensureCustomerExists: Customer already exists:", existingCustomer);
    }
    return cId;
  };

  // Function to log product favorite/interest into the 'customer_favorites' table
  const logProductFavorite = async (
    isLikeAction: boolean,
    isInterestedAction: boolean,
    configQuantity: number = 1,
    existingFavId: string | null = null // This is the ID of the customer_favorites entry we might be updating
  ) => {
    console.log("logProductFavorite: Attempting to log favorite...");
    if (!product || !customerId) {
        console.error("logProductFavorite: Product or Customer ID not available. Cannot log product favorite.");
        return;
    }

    const currentCustomerId = await ensureCustomerExists(customerId);
    if (!currentCustomerId) {
      console.error("logProductFavorite: Could not obtain a valid customer ID for logging favorite.");
      return;
    }

    // Determine the data to be inserted/updated
    let favoriteData: any = {
      customer_id: currentCustomerId,
      product_id: product.id,
      quantity: configQuantity,
      is_liked: isLikeAction,
      fabric_color_id: selectedPackagingId || null, // Ensure to store ID, default to null
      frame_color_id: selectedAccessoryId || null,   // Ensure to store ID, default to null
    };

    // If it's a "like" action, variant IDs should be NULL, quantity 1
    if (isLikeAction) {
      favoriteData.fabric_color_id = null;
      favoriteData.frame_color_id = null;
      favoriteData.quantity = 1;
    }

    try {
        if (existingFavId && isInterestedAction) {
            // SCENARIO: We are EDITING an existing fully configured favorite item
            console.log('Updating existing favorite item:', existingFavId);
            const { data, error } = await supabase
                .from('customer_favorites')
                .update(favoriteData) // Use the prepared favoriteData object
                .eq('id', existingFavId) // TARGET THE SPECIFIC ROW
                .select();

            if (error) throw error;
            console.log('Favorite successfully UPDATED in Supabase:', data);
        } else if (isInterestedAction) {
            // SCENARIO: Adding a new configured item OR upgrading a 'liked' placeholder
            // Check for existing 'is_liked: true' placeholder for this product
            const { data: existingLikedItem, error: selectError } = await supabase
                .from('customer_favorites')
                .select('id')
                .eq('customer_id', currentCustomerId)
                .eq('product_id', product.id)
                .eq('is_liked', true)
                .maybeSingle();

            if (selectError) {
                console.error('Error checking for existing liked item:', selectError.message);
            }

            if (existingLikedItem) {
                // Found a 'liked' placeholder AND this is a configuring action, so update it
                console.log('Upgrading existing liked item to configured item:', existingLikedItem.id);
                const { data, error } = await supabase
                    .from('customer_favorites')
                    .update(favoriteData) // Use the prepared favoriteData object
                    .eq('id', existingLikedItem.id) // Update by the specific row ID
                    .select();
                if (error) throw error;
                console.log('Product favorite (upgraded) successfully logged to Supabase:', data);
            } else {
                // No existing 'liked' placeholder, so insert a new configured item
                console.log('Inserting new configured item.');
                const { data, error } = await supabase
                    .from('customer_favorites')
                    .insert([favoriteData])
                    .select();
                if (error) throw error;
                console.log('Product favorite (new configured) successfully logged to Supabase:', data);
            }
        } else if (isLikeAction) {
            // SCENARIO: Handling the LIKE/UNLIKE action (heart button)
            if (isLiked) { // UI state 'isLiked' means user is clicking to UNLIKE
                // Delete the simple liked item for this product for this customer
                const { data: deletedData, error: deleteError } = await supabase
                    .from('customer_favorites')
                    .delete()
                    .eq('customer_id', currentCustomerId)
                    .eq('product_id', product.id)
                    .eq('is_liked', true)
                    .is('fabric_color_id', null)
                    .is('frame_color_id', null);

                if (deleteError) throw deleteError;
                console.log('Product favorite (unliked) successfully deleted:', deletedData);
            } else { // UI state 'isLiked' is false, meaning user clicking to LIKE
                // Insert the simple liked item
                const { data, error } = await supabase
                    .from('customer_favorites')
                    .insert([favoriteData])
                    .select();

                if (error) throw error;
                console.log('Product favorite (liked) successfully logged to Supabase:', data);
            }
        }
    } catch (error: any) {
      console.error('logProductFavorite: Supabase Operation Error:', error);
      console.error('logProductFavorite: Error message:', error.message);
      console.error('logProductFavorite: Error code:', error.code);
      console.error('logProductFavorite: Error hint:', error.hint);
    }
  };


  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    console.log("handleImInterested: Button clicked. Logging configured item...");
    await logProductFavorite(false, true, quantity, editingFavoriteId); // Pass editingFavoriteId
    console.log('handleImInterested: Logging complete. Redirecting to cart.');
    router.push('/kusam/cart');
  };

  const handleLikeToggle = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState); // Update UI immediately

    if (newLikedState) { // If user is liking
      setShowPopUpHeart(true);
      setTimeout(() => {
        setShowPopUpHeart(false);
      }, 1000);
    }
    // For liked item, quantity is always 1, variants are null. editingFavoriteId is irrelevant here.
    await logProductFavorite(true, false, 1, null);
  };

  // Helper to get the value for display from an ID
  const getVariantValueById = (id: string, variants: ProductVariant[]) => {
    return variants.find(v => v.id === id)?.value || 'N/A';
  };

  // --- Loading and Error States for Product Data ---
  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Cargando Pancho's awesome figure details...</p>
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
        <p className="text-gray-700 text-lg">Product not found.</p>
      </div>
    );
  }

  // --- Main Product Display ---
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

          <button
            onClick={handleLikeToggle}
            className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all duration-200 ease-in-out
              ${isLiked ? 'bg-red-500 text-white transform scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:hover:text-red-500 hover:scale-110'}`}
            aria-label={isLiked ? "Unlike product" : "Like product"}
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
          <span className="text-sm text-gray-600">See Pancho in all his glory!</span>
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

        {/* Customization Options: Packaging Variants */}
        {packagingVariants.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Collector Packaging Variant</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {packagingVariants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedPackagingId(variant.id)}
                  className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                    ${selectedPackagingId === variant.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                  style={{ backgroundColor: variant.hex_code || '#CCCCCC' }}
                  title={variant.value}
                >
                    {selectedPackagingId === variant.id && (
                      <span className="flex justify-center items-center text-white text-xl">✓</span>
                    )}
                </button>
              ))}
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{getVariantValueById(selectedPackagingId, packagingVariants)}</span></p>
          </div>
        )}

        {/* Customization Options: Accessory Options */}
        {accessoryOptions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Accessory Options</h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {accessoryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedAccessoryId(option.id)}
                  className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                    ${selectedAccessoryId === option.id ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                  style={{ backgroundColor: option.hex_code || '#DDDDDD' }}
                  title={option.value}
                >
                  {selectedAccessoryId === option.id && (
                    <span className="flex justify-center items-center text-white text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{getVariantValueById(selectedAccessoryId, accessoryOptions)}</span></p>
          </div>
        )}
        
        {/* Quantity Selector */}
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Quantity</h2>
            <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md text-center text-gray-900 text-xl font-bold"
            />
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
            : editingFavoriteId // Check if we are editing an existing item
              ? 'Actualizar Selección' // If editing, show "Update Selection"
              : "¡Interesado en Pancho!"} {/* Otherwise, show "I'm Interested" */}
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