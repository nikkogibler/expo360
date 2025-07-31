// src/app/api/getOrder/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('order_id');
  if (!orderId) {
    return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('order_id, status, total_amount')
    .eq('order_id', orderId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'Order not found' }, { status: 404 });
  }

  return NextResponse.json({ order: data }, { status: 200 });
}