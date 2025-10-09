"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function EventoEspecialLanding() {
  const router = useRouter();

  useEffect(() => {
    // Hold for 3 seconds, then redirect
    const timer = setTimeout(() => {
      router.replace('/kusam/catalogo?from=evento-especial');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
      >
        <source src="/leaves1.mp4" type="video/mp4" />
      </video>
      
      {/* Light overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-40" />
      
      {/* Main image in center */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Image
          src="/Gemini_Generated_Image_hbwdq4hbwdq4hbwd.png"
          alt="Evento Especial"
          width={1200}
          height={900}
          className="w-full h-full object-contain"
          priority
          style={{
            opacity: 0,
            animation: 'fadeInFromWhite 3s ease-in-out forwards'
          }}
        />
      </div>
      
      <style jsx global>{`
        @keyframes fadeInFromWhite {
          0% {
            opacity: 0;
            filter: brightness(5);
          }
          100% {
            opacity: 1;
            filter: brightness(1);
          }
        }
      `}</style>
    </div>
  );
}
