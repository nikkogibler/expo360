
'use client';
import ImageStandardizer from '../../../../components/ImageStandardizer';
import HamburgerMenu from '../../../../components/HamburgerMenu';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function OptimizadorPage() {
  const router = useRouter();
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-start px-4 py-10"
      style={{
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      {/* Header with Back Arrow, Logo (left) and Hamburger Menu (right) */}
      <div className="w-full max-w-3xl mx-auto flex flex-row items-center justify-between mb-2" style={{ position: 'relative' }}>
        <div className="flex flex-row items-center gap-2" style={{ marginLeft: '-32px' }}>
          <button
            onClick={() => router.push('/admin/pro-shot-now')}
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
              src="/kusam_main.webp"
              alt="Kusam Logo"
              width={120}
              height={30}
              style={{ objectFit: 'contain', height: 'auto', opacity: 0.8 }}
              priority
            />
          </div>
        </div>
        <div className="flex flex-row items-center" style={{ marginRight: '-32px' }}>
          <HamburgerMenu />
        </div>
      </div>
      {/* Optimizador header image */}
  <div className="w-full max-w-3xl mx-auto mb-0 flex justify-center items-center" style={{ minHeight: '180px' }}>
        <img
          src="/admin/optimizador_header.png"
          alt="Optimizador Header"
          style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 8 }}
        />
      </div>
      <div className="w-full max-w-3xl mx-auto p-6">
        <ImageStandardizer onBack={() => { router.push('/admin/pro-shot-now'); }} />
      </div>
    </div>
  );
}
