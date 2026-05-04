import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import {
  createSmbWorkspace,
  listClientsWithSummary,
} from '@/lib/expo360/repositories';

export async function GET() {
  const user = await getCurrentUserContext();

  if (user?.role !== 'interzekt_admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const clients = await listClientsWithSummary();
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'interzekt_admin') {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const body = await request.json();
  const name = String(body.name || '').trim();
  const adminEmail = String(body.adminEmail || '').trim();
  const adminName = String(body.adminName || '').trim();
  const slug = String(body.slug || '').trim();

  if (!name || !adminEmail) {
    return NextResponse.json(
      { error: 'SMB customer name and admin email are required.' },
      { status: 400 }
    );
  }

  const result = await createSmbWorkspace({
    name,
    adminEmail,
    adminName,
    slug,
  });

  return NextResponse.json(result);
}
