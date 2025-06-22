// This file must be named 'page.tsx' and be located inside a folder like 'pancho'
// within 'src/app/kusam/test-catalog/' for Next.js App Router to recognize it as a route.
// Ensure your project has a 'tsconfig.json' in the root for TypeScript to work correctly.

'use client'; // This directive marks the component as a Client Component.

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Interface for product data structure
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  fabricColors: { name: string; hex: string; }[];
  frameColors: { name: string; hex: string; }[];
}

// Dummy Product Data - REPLACE THIS WITH YOUR ACTUAL PRODUCT DATA
// In a real application, this data would likely come from Supabase via an async fetch.
const DUMMY_PRODUCT: Product = {
  id: 'prod_001',
  name: 'Dining Table', // Unique name for this specific page
  description: 'A robust and elegantly designed dining table, perfect for gatherings. Crafted from sustainable materials with a finish that complements any decor.',
  price: 2499.99,
  imageUrl: '/kusam_main.webp', // UPDATED: Changed path to your new image location
  fabricColors: [ // For tables, these might represent tabletop materials or accents
    { name: 'Light Oak', hex: '#E7CFA8' },
    { name: 'Dark Walnut', hex: '#5C3A21' },
    { name: 'White Marble', hex: '#F0F0F0' },
  ],
  frameColors: [ // Frame colors for the table base
    { name: 'Matte Black', hex: '#333333' },
    { name: 'Brushed Stainless', hex: '#A8A8A8' },
    { name: 'Gold Accent', hex: '#D4AF37' },
  ],
};

export default function PanchoProductPage() { // Renamed the component for clarity
  const router = useRouter();
  const [selectedFabric, setSelectedFabric] = useState(DUMMY_PRODUCT.fabricColors[0].name);
  const [selectedFrame, setSelectedFrame] = useState(DUMMY_PRODUCT.frameColors[0].name);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false); // To show loading state

  const product = DUMMY_PRODUCT; // Using dummy data. In production, fetch dynamically.

  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    //
    // TODO: Implement actual logic here following the project requirements:
    // 1. Capture customer_id from localStorage (e.g., localStorage.getItem('kusam_customer_id'))
    // 2. Send product.id, selectedFabric, selectedFrame, and customer_id to Supabase
    //    (e.g., via a Supabase client query or an API route). This data goes to a
    //    "favorites" or "interests" table.
    // 3. Automated submission of this data to Airtable via N8N.
    // 4. Potentially update inventory in Supabase (backend logic, no client UI for this phase).
    //
    console.log('Customer interested in:', {
      productId: product.id,
      fabric: selectedFabric,
      frame: selectedFrame,
      customerId: typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : 'N/A_ServerSide',
    });

    // Simulate API call delay for demonstration purposes
    await new Promise(resolve => setTimeout(resolve, 1500));

    // After successful addition, navigate to the 'My Favorite Pieces' page
    router.push('/kusam/my-favorite-pieces');
  };

  // Basic check in case product data isn't loaded (less likely with dummy data)
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Loading product details...</p>
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
        {/*
          Changes for 9:16 aspect ratio:
          1. Use 'pt-[177.77%]' for the aspect ratio trick (16/9 = 1.7777, so 177.77% padding-top).
             This makes the div maintain a 9:16 portrait aspect ratio.
          2. Change objectFit="cover" to objectFit="contain" on the Image component.
             This ensures the entire image is visible, introducing letterboxing if the image aspect
             doesn't exactly match the container, which is what 'contain' means.
          3. Use 'absolute inset-0' for the Image to fill its aspect-ratio-controlled parent.
        */}
        <div className="relative w-full pt-[177.77%] bg-gray-200"> {/* 16 / 9 * 100% = 177.77% */}
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="contain" // Changed from "cover" to "contain"
            className="absolute inset-0 rounded-t-lg" // Added absolute inset-0
          />
        </div>
        <div className="p-4 bg-gray-100 flex justify-center items-center">
          <span className="text-sm text-gray-600">Explore customization options below</span>
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

        {/* Customization Options: Fabric (Tabletop) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Tabletop / Main Material</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {product.fabricColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedFabric(color.name)}
                className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                  ${selectedFabric === color.name ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                  {selectedFabric === color.name && (
                    <span className="flex justify-center items-center text-white text-xl">✓</span>
                  )}
              </button>
            ))}
          </div>
          <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{selectedFabric}</span></p>
        </div>

        {/* Customization Options: Frame (Base) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Base / Frame Color</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {product.frameColors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedFrame(color.name)}
                className={`w-10 h-10 rounded-full border-2 focus:outline-none transition-all duration-200
                  ${selectedFrame === color.name ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300 hover:border-blue-300'}`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              >
                {selectedFrame === color.name && (
                  <span className="flex justify-center items-center text-white text-xl">✓</span>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-center text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{selectedFrame}</span></p>
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
          {isAddingToFavorites ? 'Adding to Favorites...' : "I'm Interested!"}
        </motion.button>
      </div>

      {/* Back to Products/Home button - Adjust path as needed */}
      <button
        onClick={() => router.push('/kusam/catalog')} // Assuming you'll have a general catalog page
        className="mt-6 text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors duration-200"
      >
        ← Back to all products
      </button>
    </motion.div>
  );
}