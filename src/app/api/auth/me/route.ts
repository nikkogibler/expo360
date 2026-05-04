import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';

export async function GET() {
  const user = await getCurrentUserContext();

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}
