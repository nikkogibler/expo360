import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { createProduct, getClientBundle } from '@/lib/expo360/repositories';

export async function GET() {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const bundle = await getClientBundle(user.clientId);

  return NextResponse.json({ products: bundle?.products || [] });
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || '').trim();

  if (!name) {
    return NextResponse.json({ error: 'Product name is required.' }, { status: 400 });
  }

  const bundle = await createProduct(user.clientId, {
    ...body,
    name,
  });

  return NextResponse.json({ bundle });
}
