// This file must be named 'page.tsx' and be located inside a folder like 'pancho'
// within 'src/app/kusam/test-catalog/' for Next.js App Router to recognize it as a route.

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid'; // For generating unique customer IDs
import { supabase } from '@/utils/supabase'; // Correct Supabase import

// Define the interface based on your Supabase 'products' table schema
// Removed packagingVariants and accessoryOptions as they are not directly in your provided INSERT statement
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
  // If you later add 'variants' or 'accessories' as JSONB fields in Supabase,
  // or fetch them from another table, you'll add them here.
}

// --- DUMMY_PRODUCT IS REMOVED ---

export default function PanchoProductPage() {
  const router = useRouter();
  // State for product fetched from Supabase
  const [product, setProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Initializing these with empty or default values *before* product loads
  // We'll update the options dynamically once product data is available
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [selectedAccessory, setSelectedAccessory] = useState('');

  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showPopUpHeart, setShowPopUpHeart] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);

  // Hardcoded Pancho Product ID - This is the ID from your INSERT statement
  const PANCHO_PRODUCT_ID = '0e9ad1fc-25cf-47f9-8e8a-a965f8a6edd4';

  // Effect to get/set customerId from localStorage AND fetch product data
  useEffect(() => {
    // Customer ID logic
    let currentCustomerId = localStorage.getItem('kusam_customer_id');
    if (!currentCustomerId) {
      currentCustomerId = uuidv4(); // Generate a new UUID
      localStorage.setItem('kusam_customer_id', currentCustomerId);
    }
    setCustomerId(currentCustomerId);

    // Fetch Pancho product data from Supabase
    async function fetchPanchoProduct() {
      try {
        setLoadingProduct(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', PANCHO_PRODUCT_ID) // Query using the hardcoded ID
          .single(); // Expecting one product

        if (error) {
          throw error;
        }

        if (data) {
          setProduct(data as Product); // Cast to our interface
          // Initialize selections with dummy/default data if product has loaded
          // YOU WILL NEED TO ADAPT THIS WHEN YOU HAVE REAL VARIANT LOGIC
          setSelectedPackaging('Standard Edition Packaging'); // Default for now
          setSelectedAccessory('With Molotov & Protest Sign'); // Default for now
        } else {
          setProductError('Pancho product not found in database.');
        }
      } catch (err: any) {
        setProductError(`Error fetching Pancho: ${err.message}`);
        console.error('Error fetching Pancho product:', err.message);
      } finally {
        setLoadingProduct(false);
      }
    }

    fetchPanchoProduct(); // Call the product fetch function
  }, []); // Run once on component mount for both customer ID and product data

  // Function to ensure customer exists in 'customers' table or create them if not
  const ensureCustomerExists = async (cId: string): Promise<string> => {
    if (!cId) {
      console.error("Attempted to ensure customer existence with null customer ID.");
      return "";
    }
    const { data: existingCustomer, error: selectError } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('customer_id', cId)
      .limit(1);

    if (selectError) {
      console.error("Error checking for existing customer:", selectError.message);
      return cId;
    }

    if (!existingCustomer || existingCustomer.length === 0) {
      // Customer does not exist, insert a basic record
      const { data: newCustomer, error: insertError } = await supabase
        .from('customers')
        .insert({ customer_id: cId, email: `${cId}@temp.com`, name: 'Anonymous Expo Visitor' })
        .select(); // Use .select() to return the inserted data

      if (insertError) {
        console.error("Error inserting new customer:", insertError.message);
      } else {
        console.log("New customer created in Supabase:", newCustomer);
      }
    }
    return cId;
  };

  // Function to log product favorite/interest into the 'customer_favorites' table
  const logProductFavorite = async (isLike: boolean, isInterested: boolean) => {
    if (!product || !customerId) {
        console.error("Product or Customer ID not available. Cannot log product favorite.");
        return;
    }

    const currentCustomerId = await ensureCustomerExists(customerId);
    if (!currentCustomerId) {
      console.error("Could not obtain a valid customer ID for logging favorite.");
      return;
    }

    const { data, error } = await supabase
      .from('customer_favorites')
      .insert([
        {
          customer_id: currentCustomerId,
          product_id: product.id, // Now using the fetched product's ID
          // YOU WILL NEED TO ADAPT THESE LINES WHEN YOU HAVE REAL VARIANT LOGIC
          fabric_color: selectedPackaging,
          frame_color: selectedAccessory,
          notes: isLike ? 'User liked this product' : (isInterested ? 'User expressed interest' : 'Interaction recorded'),
        },
      ]);

    if (error) {
      console.error('Error logging product favorite into Supabase:', error.message);
      console.trace();
    } else {
      console.log('Product favorite successfully logged to Supabase:', data);
    }
  };


  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    await logProductFavorite(false, true);
    console.log('Customer interested in:', {
      productId: product?.id, // Use optional chaining in case product is null
      packagingVariant: selectedPackaging,
      accessoryOption: selectedAccessory,
      customerId: customerId,
    });
    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/kusam/my-favorite-pieces');
  };

  const handleLikeToggle = async () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    console.log(`Product ${product?.name} ${newLikedState ? 'liked' : 'unliked'}!`);
    await logProductFavorite(newLikedState, false);

    if (newLikedState) {
      setShowPopUpHeart(true);
      setTimeout(() => {
        setShowPopUpHeart(false);
      }, 1000);
    }
  };

  // --- Loading and Error States for Product Data ---
  if (loadingProduct) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Loading Pancho's awesome figure details...</p>
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

  // If product is null after loading, something went wrong
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
            src={product.image_url} // Use product.image_url from fetched data
            alt={product.name}
            layout="fill"
            objectFit="contain"
            className="absolute inset-0 rounded-t-lg cursor-pointer"
            onClick={handleLikeToggle}
          />

          <button
            onClick={handleLikeToggle}
            className={`absolute top-4 right-4 p-2 rounded-full shadow-lg transition-all duration-200 ease-in-out
              ${isLiked ? 'bg-red-500 text-white transform scale-110' : 'bg-white text-gray-400 hover:text-red-500 hover:scale-110'}`}
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
      <div className="w-full max_w_sm bg-white rounded-lg shadow-xl p-6">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2 text-center">
          {product.name} {/* Use product.name from fetched data */}
        </h1>
        <p className="text-lg font-semibold text-gray-700 mb-4 text-center">
          ${product.price.toFixed(2)} {/* Use product.price from fetched data */}
        </p>
        <p className="text-base text-gray-600 mb-6 text-center leading-relaxed">
          {product.description} {/* Use product.description from fetched data */}
        </p>

        {/* Customization Options: Packaging Variants - TEMPORARY HARDCODING */}
        {/* IMPORTANT: YOU WILL NEED TO REPLACE THESE WITH REAL DATA OR LOGIC */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Collector Packaging Variant</h2>
          <div className="flex flex-wrap gap-3 justify-center">
             {[
                { name: 'Standard Edition Packaging', hex: '#EAEAEA' },
                { name: 'Variant Cover (Comic Style)', hex: '#FFD700' },
                { name: 'Glow-in-the-Dark Box Accents', hex: '#00FF00' },
             ].map((variant) => (
              <button
                key={variant.name}
                onClick={() => setSelectedPackaging(variant.name)}
                className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                  ${selectedPackaging === variant.name ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                style={{ backgroundColor: variant.hex }}
                title={variant.name}
              >
                  {selectedPackaging === variant.name && (
                    <span className="flex justify-center items-center text-white text-xl">✓</span>
                  )}
              </button>
            ))}
          </div>
          <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{selectedPackaging}</span></p>
        </div>

        {/* Customization Options: Accessory Options - TEMPORARY HARDCODING */}
        {/* IMPORTANT: YOU WILL NEED TO REPLACE THESE WITH REAL DATA OR LOGIC */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Accessory Options</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {[
                { name: 'With Molotov & Protest Sign', hex: '#FF6347' },
                { name: 'With Walkie-Talkie & Frijol', hex: '#8A2BE2' },
                { name: 'Limited Edition "Desert Standoff" Diorama Base', hex: '#D2B48C' },
            ].map((option) => (
              <button
                key={option.name}
                onClick={() => setSelectedAccessory(option.name)}
                className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                  ${selectedAccessory === option.name ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                style={{ backgroundColor: option.hex }}
                title={option.name}
              >
                {selectedAccessory === option.name && (
                  <span className="flex justify-center items-center text-white text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{selectedAccessory}</span></p>
        </div>

        {/* "I'm Interested" Button */}
        <motion.button
          onClick={handleImInterested}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300
            ${isAddingToFavorites ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300'}`
          }
          disabled={isAddingToFavorites}
        >
          {isAddingToFavorites ? 'Adding to Favorites...' : "I'm Interested in Pancho!"}
        </motion.button>
      </div>

      {/* Back to Products/Home button */}
      <button
        onClick={() => router.push('/kusam/catalog')}
        className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-200"
      >
        ← Back to all products
      </button>
    </motion.div>
  );
}