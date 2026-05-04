import { NextResponse } from 'next/server';

import { getCurrentUserContext } from '@/lib/expo360/auth';
import { listClientLeads } from '@/lib/expo360/repositories';
import type { Lead } from '@/lib/expo360/types';

function csvCell(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function leadRow(lead: Lead) {
  return [
    lead.createdAt || '',
    lead.fullName,
    lead.email,
    lead.phone || '',
    lead.company || '',
    lead.status,
    lead.selectedProductIds.join(', '),
    lead.message || '',
    lead.notes || '',
    lead.sourceSlug,
  ]
    .map(csvCell)
    .join(',');
}

export async function GET() {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const leads = await listClientLeads(user.clientId, 1000);
  const csv = [
    [
      'fecha',
      'nombre',
      'correo',
      'telefono',
      'empresa',
      'etapa',
      'productos',
      'mensaje',
      'notas',
      'pagina_origen',
    ]
      .map(csvCell)
      .join(','),
    ...leads.map(leadRow),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="prospectos-expo360.csv"',
    },
  });
}
