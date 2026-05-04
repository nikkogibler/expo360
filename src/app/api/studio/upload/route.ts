import { NextResponse } from 'next/server';

import { uploadClientAsset } from '@/lib/blob/storage';
import { getCurrentUserContext } from '@/lib/expo360/auth';

export async function POST(request: Request) {
  const user = await getCurrentUserContext();

  if (user?.role !== 'smb_admin' || !user.clientId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const kindValue = String(formData.get('kind') || 'products');
    const kind =
      kindValue === 'logos'
        ? 'logos'
        : kindValue === 'event-pages'
          ? 'event-pages'
          : 'products';

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Missing upload file.' }, { status: 400 });
    }

    const blob = await uploadClientAsset({
      clientId: user.clientId,
      kind,
      file,
    });

    return NextResponse.json({ url: blob.url, pathname: blob.pathname });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to upload this file.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
