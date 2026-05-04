import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import {
  leadStatuses,
  updateClientLead,
} from '@/lib/expo360/repositories';
import type { LeadStatus } from '@/lib/expo360/types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> }
) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { leadId } = await params;
  const body = await request.json();
  const status = body.status as LeadStatus | undefined;

  if (status && !leadStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid lead status.' }, { status: 400 });
  }

  const lead = await updateClientLead(user.clientId, leadId, {
    status,
    notes: typeof body.notes === 'string' ? body.notes : undefined,
  });

  return NextResponse.json({ lead });
}
