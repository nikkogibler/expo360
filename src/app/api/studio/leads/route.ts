import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { listClientLeads } from '@/lib/expo360/repositories';

export async function GET() {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const leads = await listClientLeads(user.clientId);

  return NextResponse.json({ leads });
}
