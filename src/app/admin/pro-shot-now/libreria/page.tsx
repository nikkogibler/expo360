
import React from 'react';
import DomeGallery from '../../../../components/DomeGallery';

export default function LibreriaPage() {
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
      <div className="w-full max-w-3xl mx-auto p-6 text-center">
        <DomeGallery />
      </div>
    </div>
  );
}
