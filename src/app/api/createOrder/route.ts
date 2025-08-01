import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export async function POST(request: Request) {
  const { customerId, totalAmount } = await request.json();

  const { data, error } = await supabaseAdmin
    .from('orders')
    .insert([{ customer_id: customerId, total_amount: totalAmount, status: 'Began Payment Process' }])
    .select('order_id');

  console.log('Order insert data:', data);
  console.log('Order insert error:', error);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const orderId = Array.isArray(data) && data.length > 0 ? data[0].order_id : null;
  return NextResponse.json({ orderId }, { status: 200 });
}