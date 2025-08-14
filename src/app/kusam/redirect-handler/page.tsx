// src/app/redirect-handler/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function RedirectHandlerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function handleRedirect() {
      const sku = searchParams.get('sku');
      if (!sku) {
        // If no SKU is provided, redirect to the main catalog page
        router.replace('/catalog');
        return;
      }

      // 1. Ensure a customer ID exists in local storage
      let customerId = localStorage.getItem('expo360_customer_id');
      if (!customerId) {
        customerId = uuidv4();
        localStorage.setItem('expo360_customer_id', customerId);
      }

      try {
        // 2. Fetch the product ID from Supabase using the SKU
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id')
          .eq('sku', sku)
          .single();

        if (productError || !productData) {
          console.error('Product not found for SKU:', sku);
          router.replace(`/catalog/${sku}`);
          return;
        }

        const productId = productData.id;

        // 3. Log the product as a favorite to the existing session
        const { data: existingFavorite, error: fetchError } = await supabase
          .from('customer_favorites')
          .select('*')
          .eq('customer_id', customerId)
          .eq('product_id', productId)
          .maybeSingle();

        if (fetchError) {
          console.error('Error fetching existing favorite:', fetchError);
        }

        const favoriteDataToSave = {
          customer_id: customerId,
          product_id: productId,
          quantity: 1, // Default quantity
          is_liked: true,
          fabric_color_id: null,
          frame_color_id: null,
          fabric_color: null,
          frame_color: null,
        };

        if (existingFavorite) {
          await supabase
            .from('customer_favorites')
            .update(favoriteDataToSave)
            .eq('id', existingFavorite.id);
        } else {
          await supabase
            .from('customer_favorites')
            .insert([favoriteDataToSave]);
        }

        // 4. Redirect to the final product page
        setLoading(false);
        router.replace(`/catalog/${sku}`);
      } catch (error) {
        console.error('Error handling redirect:', error);
        setLoading(false);
        router.replace(`/catalog/${sku}`);
      }
    }

    handleRedirect();
  }, [router, searchParams]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-700 text-lg">Cargando producto...</p>
      </div>
    );
  }

  return null;
}