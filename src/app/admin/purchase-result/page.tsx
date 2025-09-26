'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function PurchaseResultContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'cancelled'>('loading');
  const [credits, setCredits] = useState<number | null>(null);

  useEffect(() => {
    const purchase = searchParams.get('purchase');
    const creditsPurchased = searchParams.get('credits');

    if (purchase === 'success') {
      setStatus('success');
      if (creditsPurchased) {
        setCredits(parseInt(creditsPurchased));
      }
    } else if (purchase === 'cancelled') {
      setStatus('cancelled');
    }

    // Redirect to admin page after 3 seconds
    const timeout = setTimeout(() => {
      window.location.href = '/admin';
    }, 3000);

    return () => clearTimeout(timeout);
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Procesando recarga...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">¡Recarga Exitosa!</h1>
            {credits && (
              <p className="text-xl text-green-200 mb-4">
                Se agregaron <span className="font-bold">{credits} créditos</span> a tu cuenta
              </p>
            )}
            <p className="text-white/80 mb-6">
              Tu recarga se procesó correctamente. Los créditos ya están listos para usar.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white/90 text-sm">
                Regresarás automáticamente al panel en unos segundos...
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-white text-green-900 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Regresar al Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="mb-6">
            <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Recarga Cancelada</h1>
            <p className="text-white/80 mb-6">
              Tu recarga fue cancelada. No se realizó ningún cargo a tu tarjeta.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6">
              <p className="text-white/90 text-sm">
                Puedes intentar recargar nuevamente cuando gustes desde tu panel.
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/admin'}
              className="bg-white text-orange-900 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
            >
              Regresar al Panel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function PurchaseResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-xl">Cargando...</p>
        </div>
      </div>
    }>
      <PurchaseResultContent />
    </Suspense>
  );
}