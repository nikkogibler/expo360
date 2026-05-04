import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { updateClientBranding } from '@/lib/expo360/repositories';

export async function PATCH(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const bundle = await updateClientBranding(user.clientId, body);

  return NextResponse.json({ bundle });
}
