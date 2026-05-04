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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Vercel Blob is not configured. Add BLOB_READ_WRITE_TOKEN.');
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    throw new Error('File is too large. Keep uploads under 8 MB for v1.');
  }

  const fileName = safeFileName(file.name);
  const path = `clients/${clientId}/${kind}/${Date.now()}-${fileName}`;

  return put(path, file, {
    access: 'public',
    addRandomSuffix: true,
  });
}
