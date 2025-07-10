// This file must be named 'page.tsx' and be located inside a folder like 'lupita'
// within 'src/app/kusam/test-catalog/' for Next.js App Router to recognize it as a route.
// Ensure your project has a 'tsconfig.json' in the root for TypeScript to work correctly.

'use client'; // This directive marks the component as a Client Component.

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

// Interface for product data structure (reused from Pancho's page)
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  packagingVariants: { name: string; hex: string; }[];
  accessoryOptions: { name: string; hex: string; }[];
}

// DUMMY PRODUCT DATA - NOW FOR LUPITA: JUSTICE IN MOTION!
const DUMMY_PRODUCT: Product = {
  id: 'prod_lupita_justice_in_motion_001',
  name: 'Lupita: Justice in Motion Action Figure (Collector’s Edition)',
  description: 'Ultra-photorealistic action figure of Mexican action heroine Lupita — posed heroically inside highly detailed collector packaging. Lupita is the quick-witted, bighearted legend of the barrio, always ready to help her neighbors and outsmart any villain (or nosy official). She rocks a patched denim jacket covered in sassy activist pins (one says “Lawyer Up, Buttercup!”), cargo pants with mysteriously bottomless pockets, and a bright yellow scarf she claims is both fashionable and foolproof for escaping sticky situations. She has sharp, mischievous eyes, a no-nonsense jawline, and oversized hoop earrings big enough to double as escape tools.',
  price: 199.99, // A fitting price for a Collector's Edition action figure
  imageUrl: '/test-products/lupita.png', // Assuming you'll upload Lupita's image here!
  // Customization options reimagined for Lupita
  packagingVariants: [
    { name: 'Standard Edition Packaging w/ Chispa bubble', hex: '#F0FFFF' }, // Alice Blue
    { name: 'Mural Art Background Variant', hex: '#FF6F61' }, // Living Coral
    { name: 'Papel Picado Special Edition', hex: '#BADA55' }, // Badass Green
  ],
  accessoryOptions: [
    { name: 'Megaphone & Legal Documents', hex: '#B8860B' }, // Dark Goldenrod
    { name: 'Protest Banner (Both Sides)', hex: '#4682B4' }, // Steel Blue
    { name: 'Chispa (Mini Vest w/ Pouch)', hex: '#800080' }, // Purple
  ],
};

export default function LupitaProductPage() { // Renamed the component for clarity
  const router = useRouter();
  const [selectedPackaging, setSelectedPackaging] = useState(DUMMY_PRODUCT.packagingVariants[0].name);
  const [selectedAccessory, setSelectedAccessory] = useState(DUMMY_PRODUCT.accessoryOptions[0].name);
  const [isAddingToFavorites, setIsAddingToFavorites] = useState(false);

  const product = DUMMY_PRODUCT; // Using dummy data.

  const handleImInterested = async () => {
    setIsAddingToFavorites(true);
    console.log('Customer interested in:', {
      productId: product.id,
      packagingVariant: selectedPackaging,
      accessoryOption: selectedAccessory,
      customerId: typeof window !== 'undefined' ? localStorage.getItem('kusam_customer_id') : 'N/A_ServerSide',
    });

    await new Promise(resolve => setTimeout(resolve, 1500));
    router.push('/kusam/my-favorite-pieces');
  };

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Product details loading...</p>
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
      {/* Product Image Section - Adapted for 9:16 aspect ratio */}
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="relative w-full pt-[177.77%] bg-gray-200"> {/* 16 / 9 * 100% = 177.77% */}
          <Image
            src={product.imageUrl}
            alt={product.name}
            layout="fill"
            objectFit="contain" // Ensures the entire image fits
            className="absolute inset-0 rounded-t-lg"
          />
        </div>
        <div className="p-4 bg-gray-100 flex justify-center items-center">
          <span className="text-sm text-gray-600">Catch Lupita in action!</span>
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
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Collector Packaging Variant</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {product.packagingVariants.map((variant) => (
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

        {/* Customization Options: Accessory Options */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Accessory Options</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {product.accessoryOptions.map((option) => (
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
          {isAddingToFavorites ? 'Adding to Favorites...' : "I'm Interested in Lupita!"}
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