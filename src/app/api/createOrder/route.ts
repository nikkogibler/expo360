import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export async function POST(request: Request) {
  const { customerId, totalAmount } = await request.json();

  // Step 1: Create the new order record and get the new order_id
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([{ customer_id: customerId, total_amount: totalAmount, status: 'pending' }])
    .select('order_id'); // Use select to get the newly created record's order_id

  if (orderError) {
    console.error('Failed to create order:', orderError.message);
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderId = Array.isArray(orderData) && orderData.length > 0 ? orderData[0].order_id : null;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID was not returned' }, { status: 500 });
  }
  
  // Step 2: Update the customer_favorites table
  // This updates all items in the customer's cart by setting their new order_id
  // and marking them as no longer liked (is_liked = false).
  const { error: updateError } = await supabaseAdmin
    .from('customer_favorites')
    .update({
      order_id: orderId,
      is_liked: false,
    })
    .eq('customer_id', customerId)
    .eq('is_liked', true); // Only update items that were in the cart

  if (updateError) {
    // IMPORTANT: In a real-world application, you would also want to handle
    // a rollback of the created order if this update fails.
    console.error('Failed to update favorites:', updateError.message);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(`Order ${orderId} created and cart items updated.`);
  return NextResponse.json({ orderId }, { status: 200 });
}