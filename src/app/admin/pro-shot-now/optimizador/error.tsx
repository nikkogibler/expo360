"use client";

import { useEffect } from 'react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Optionally log error to an error reporting service
    // console.error(error);
  }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">¡Algo salió mal!</h2>
      <p className="mb-4">{error?.message || 'Ha ocurrido un error inesperado.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-amber-600 text-white rounded"
      >
        Reintentar
      </button>
    </div>
  );
}
