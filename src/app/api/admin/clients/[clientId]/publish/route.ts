import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { setEventPagePublishState } from '@/lib/expo360/repositories';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'interzekt_admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { clientId } = await params;
  const body = await request.json();
  const bundle = await setEventPagePublishState(clientId, Boolean(body.published));

  return NextResponse.json({ bundle });
}
