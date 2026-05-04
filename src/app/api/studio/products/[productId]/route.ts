import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { deleteProduct, updateProduct } from '@/lib/expo360/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { productId } = await params;
  const body = await request.json();
  const bundle = await updateProduct(user.clientId, productId, body);

  return NextResponse.json({ bundle });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { productId } = await params;
  const bundle = await deleteProduct(user.clientId, productId);

  return NextResponse.json({ bundle });
}
