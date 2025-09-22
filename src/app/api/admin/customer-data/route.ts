import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side admin client
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(request: NextRequest) {
  try {
    console.log('=== ADMIN API: Fetching customer favorites data ===');
    
    // Get date range parameter
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    console.log('Date filter:', startDate);
    
    // Step 1: Get customer_favorites data with optional date filtering
    let favoritesQuery = supabaseAdmin
      .from('customer_favorites')
      .select('*');
    
    if (startDate) {
      favoritesQuery = favoritesQuery.gte('created_at', startDate);
    }
    
    const { data: favoritesData, error: favoritesError } = await favoritesQuery;
    
    console.log('Raw customer_favorites data:', favoritesData);
    console.log('Customer_favorites error:', favoritesError);
    
    if (favoritesError) {
      console.error('SUPABASE ERROR in customer_favorites:', favoritesError);
      return NextResponse.json({ error: favoritesError.message }, { status: 500 });
    }
    
    if (!favoritesData || favoritesData.length === 0) {
      console.log('No customer_favorites data found');
      return NextResponse.json({
        favoriteProducts: [],
        fabricColors: [],
        frameColors: []
      });
    }
    
    // Step 2: Get product details for the favorites
    const productIds = [...new Set(favoritesData.map(fav => fav.product_id))];
    console.log('Unique Product IDs to fetch:', productIds);
    
    const { data: productsData, error: productsError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .in('id', productIds);
    
    console.log('Products data:', productsData);
    console.log('Products error:', productsError);
    
    if (productsError) {
      console.error('SUPABASE ERROR in products:', productsError);
      return NextResponse.json({ error: productsError.message }, { status: 500 });
    }
    
    // Step 3: Process the data
    const productNameMap: Record<string, string> = {};
    (productsData || []).forEach((product: { id: string; name: string }) => {
      productNameMap[product.id] = product.name;
    });
    
    // Count favorites per product
    const productCounts: Record<string, number> = {};
    favoritesData.forEach((favorite: { product_id?: string }) => {
      if (favorite.product_id) {
        productCounts[favorite.product_id] = (productCounts[favorite.product_id] || 0) + 1;
      }
    });
    
    // Transform for charts
    const favoriteProducts = Object.entries(productCounts)
      .map(([productId, count]) => ({
        product_name: productNameMap[productId] || `Product ${productId.slice(0, 8)}...`,
        favorite_count: count
      }))
      .sort((a, b) => b.favorite_count - a.favorite_count)
      .slice(0, 10); // Top 10
    
    // Count fabric colors
    const fabricMap: Record<string, number> = {};
    const frameMap: Record<string, number> = {};
    
    favoritesData.forEach((row: { fabric_color?: string; frame_color?: string }) => {
      if (row.fabric_color) {
        fabricMap[row.fabric_color] = (fabricMap[row.fabric_color] || 0) + 1;
      }
      if (row.frame_color) {
        frameMap[row.frame_color] = (frameMap[row.frame_color] || 0) + 1;
      }
    });
    
    const fabricColors = Object.entries(fabricMap).map(([color, count]) => ({ color, count }));
    const frameColors = Object.entries(frameMap).map(([color, count]) => ({ color, count }));
    
    console.log('Final processed data:', {
      favoriteProducts,
      fabricColors,
      frameColors
    });
    
    return NextResponse.json({
      favoriteProducts,
      fabricColors,
      frameColors
    });
    
  } catch (error) {
    console.error('❌ CRITICAL ERROR in admin API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}