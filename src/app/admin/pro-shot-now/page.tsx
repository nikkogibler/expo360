"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import BurgerMenu from '@/components/BurgerMenu';
import AdminMenu from '@/components/AdminMenu';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ProShotNowLanding() {
  const router = useRouter();
  const [burgerOpen, setBurgerOpen] = useState(false);
  
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start relative"
      style={{
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      {/* Header with Back Arrow, Logo (left) and Hamburger Menu (right) */}
      <div className="w-full max-w-6xl mx-auto flex flex-row items-center justify-between mb-4 px-6" style={{ marginTop: 24, position: 'relative', zIndex: 10 }}>
  <div className="flex flex-row items-center gap-3" style={{ marginLeft: '-39px' }}>
          <button
            onClick={() => router.push('/admin')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: '8px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '7px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#333';
              e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div onClick={() => router.push('/admin/pro-shot-now')} style={{ cursor: 'pointer' }}>
            <Image
              src="/logo.png"
              alt="Kusam Logo"
              width={120}
              height={30}
              style={{ objectFit: 'contain', height: 'auto', opacity: 0.8 }}
              priority
            />
          </div>
        </div>
  <div className="flex flex-row items-center" style={{ marginRight: '16px', marginTop: '12px', position: 'relative' }}>
          <BurgerMenu isOpen={burgerOpen} onClick={() => setBurgerOpen((o) => !o)} />
          <AdminMenu open={burgerOpen} setOpen={setBurgerOpen} currentPage="pro-shot-now" />
        </div>
      </div>
  {/* Main content centered vertically and horizontally, but slightly higher */}
  <div className="flex-1 w-full flex items-center justify-center" style={{ minHeight: 0, marginTop: '-110px' }}>
        <div className="w-full max-w-5xl mx-auto flex flex-row gap-12 justify-center items-center">
          <Link href="/admin/pro-shot-now/optimizador" className="flex-1">
            <div className="aspect-square w-[332px] h-[332px] bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer border border-amber-200 flex items-center justify-center">
              <Image src="/admin/optimizador1.png" alt="Optimizador de Fotos" width={332} height={332} className="object-cover w-full h-full" />
            </div>
          </Link>
          <Link href="/admin/image-library" className="flex-1">
            <div className="aspect-square w-[332px] h-[332px] bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer border border-amber-200 flex items-center justify-center">
              <Image src="/admin/libreria1.png" alt="Libreria de Imagenes" width={332} height={332} className="object-cover w-full h-full" />
            </div>
          </Link>
          <Link href="/admin/pro-shot-now/prompts" className="flex-1">
            <div className="aspect-square w-[332px] h-[332px] bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer border border-amber-200 flex items-center justify-center">
              <Image src="/admin/prompts.png" alt="Prompts" width={332} height={332} className="object-cover w-full h-full" />
            </div>
          </Link>
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full flex justify-center items-center py-4" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, background: 'transparent', fontWeight: 500, fontSize: 16, letterSpacing: 0.2, color: '#4B2E09' }}>
        <span style={{ fontWeight: 'bold' }}>ProShotNow™</span> by <a
          href="https://interzekt.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, rgb(139, 92, 246), rgb(37, 99, 235), rgb(236, 72, 153))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            textDecoration: 'none',
            padding: '0px 2px',
            marginLeft: 4,
          }}
        >
          Interzekt.com
        </a>
      </footer>
    </div>
  );
}
