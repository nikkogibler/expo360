
import React from 'react';
import Link from 'next/link';

export default function ProShotNowLanding() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-2xl mx-auto flex flex-row gap-12 justify-center items-center">
        <Link href="/admin/pro-shot-now/optimizador" className="flex-1">
          <div className="aspect-square w-64 h-64 bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer border border-amber-200 flex items-center justify-center">
            <img src="/admin/optimizador1.png" alt="Optimizador de Fotos" className="object-cover w-full h-full" />
          </div>
        </Link>
  <Link href="/admin/image-library" className="flex-1">
          <div className="aspect-square w-64 h-64 bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer border border-amber-200 flex items-center justify-center">
            <img src="/admin/libreria1.png" alt="Libreria de Imagenes" className="object-cover w-full h-full" />
          </div>
        </Link>
      </div>
    </div>
  );
}
