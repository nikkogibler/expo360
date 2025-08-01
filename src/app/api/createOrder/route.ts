import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export async function POST(request: Request) {
  const { customerId, totalAmount, cartItems } = await request.json();

  // Step 1: Create the new order record with a 'pending' status.
  // We are NOT touching the customer_favorites table here.
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert([{ customer_id: customerId, total_amount: totalAmount, status: 'Began Payment Process' }])
    .select('order_id');

  if (orderError) {
    console.error('Failed to create order:', orderError.message);
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  const orderId = Array.isArray(orderData) && orderData.length > 0 ? orderData[0].order_id : null;
  if (!orderId) {
    return NextResponse.json({ error: 'Order ID was not returned' }, { status: 500 });
  }
  
  // Return the new orderId to the frontend so it can be used for the Mercado Pago preference.
  return NextResponse.json({ orderId }, { status: 200 });
}