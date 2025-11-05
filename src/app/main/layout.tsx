// src/app/kusam/layout.tsx
// This is a Server Component by default (no 'use client' needed)

import { Suspense } from 'react'; // Import Suspense from React

export default function KusamSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Wrap the children (which include /kusam/page.tsx and its sub-components)
    // in a Suspense boundary.
    // The fallback is what Next.js will render on the server initially
    // before the client-side code that uses useSearchParams hydrates.
    <Suspense fallback={<div>Cargando contenido de Kusam...</div>}>
      {children}
    </Suspense>
  );
}