import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { getClientBundle, updateEventPage } from '@/lib/expo360/repositories';

export async function PATCH(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const current = await getClientBundle(user.clientId);

  if (!current) {
    return NextResponse.json({ error: 'Workspace not found.' }, { status: 404 });
  }

  const body = await request.json();
  const bundle = await updateEventPage(user.clientId, current.eventPage.id, body);

  return NextResponse.json({ bundle });
}
