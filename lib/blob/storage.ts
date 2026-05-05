import 'server-only';

import { put } from '@vercel/blob';

const MAX_UPLOAD_SIZE = 8 * 1024 * 1024;

function safeFileName(fileName: string) {
  const clean = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return clean || 'asset';
}

export async function uploadClientAsset({
  clientId,
  kind,
  file,
}: {
  clientId: string;
  kind: 'logos' | 'products' | 'event-pages';
  file: File;
}) {
  // Support the named token first; fall back to the generic Vercel convention.
  // Later we can swap in a per-customer token here without touching call sites.
  const token =
    process.env.PRODUCT_IMAGES_READ_WRITE_TOKEN ??
    process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error(
      'Vercel Blob is not configured. Add PRODUCT_IMAGES_READ_WRITE_TOKEN to your environment.'
    );
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('File is too large. Keep uploads under 8 MB for v1.');
  }

  const fileName = safeFileName(file.name);
  const path = `clients/${clientId}/${kind}/${Date.now()}-${fileName}`;

  return put(path, file, {
    access: 'public',
    addRandomSuffix: true,
    token,
  });
}
