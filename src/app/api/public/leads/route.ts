import { NextResponse } from 'next/server';

import { createLeadForSlug } from '@/lib/expo360/repositories';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug || '').trim();

    if (!slug) {
      return NextResponse.json({ error: 'Missing event landing page.' }, { status: 400 });
    }

    const lead = await createLeadForSlug(slug, {
      fullName: String(body.fullName || ''),
      email: String(body.email || ''),
      phone: String(body.phone || ''),
      company: String(body.company || ''),
      message: String(body.message || ''),
      selectedProductIds: Array.isArray(body.selectedProductIds)
        ? body.selectedProductIds
        : [],
    });

    return NextResponse.json({ lead });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to capture this lead.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
