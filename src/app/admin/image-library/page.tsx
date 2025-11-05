"use client";

import React, { useEffect, useState } from 'react';
import BurgerMenu from '../../../components/BurgerMenu';
import AdminMenu from '../../../components/AdminMenu';
import Image from "next/image";
import { useRouter } from "next/navigation";
type ImageItem = string | { src: string; alt?: string };
import DomeGallery from '../../../components/DomeGallery';
import { LoaderOne } from '../../../components/ui/loader';
import { supabase } from '@/utils/supabase';

const ImageLibraryPage = () => {
  const router = useRouter();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [burgerOpen, setBurgerOpen] = useState(false);

  useEffect(() => {
    async function fetchImages() {
      console.log('[ImageLibraryPage] Fetching images from Supabase bucket...');
      const { data, error } = await supabase.storage.from('product-images').list('', { limit: 100 });
      if (error) {
        console.error('[ImageLibraryPage] Supabase list error:', error);
        setImages([]);
        setLoading(false);
        return;
      }
      console.log('[ImageLibraryPage] Supabase list data:', data);
      const mediaItems = (data || [])
        .filter(item => item.name.match(/\.(png|jpg|jpeg|mp4|webm|mov)$/i))
        .map(item => {
          const publicUrl = supabase.storage.from('product-images').getPublicUrl(item.name).data.publicUrl;
          console.log('[ImageLibraryPage] Found media:', item.name, 'URL:', publicUrl);
          return {
            src: publicUrl,
            alt: item.name
          };
        })
        .filter(item => {
          // Filter out items with invalid URLs or names
          if (!item.src || !item.alt) return false;
          // Filter out items with suspicious naming patterns that might indicate corruption
          if (item.alt.includes('---') && item.alt.split('---').length > 2) {
            console.warn('[ImageLibraryPage] Skipping potentially corrupted file:', item.alt);
            return false;
          }
          return true;
        });
      console.log('[ImageLibraryPage] Total valid media items found:', mediaItems.length);
      setImages(mediaItems);
      setLoading(false);
    }
    fetchImages();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'auto',
      }}
    >
      {/* Header with Back Arrow, Logo (left) and Hamburger Menu (right) */}
      <div className="w-full max-w-6xl mx-auto flex flex-row items-center justify-between mb-4 px-6" style={{ marginTop: 24, position: 'relative', zIndex: 10 }}>
  <div className="flex flex-row items-center gap-3" style={{ marginLeft: '-300px' }}>
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
              src="/logo.png"
              alt="Kusam Logo"
              width={120}
              height={30}
              style={{ objectFit: 'contain', height: 'auto', opacity: 0.8 }}
              priority
            />
          </div>
        </div>
  <div className="flex flex-row items-center" style={{ marginRight: '-202px', position: 'relative' }}>
          <BurgerMenu isOpen={burgerOpen} onClick={() => setBurgerOpen((o) => !o)} />
          <AdminMenu open={burgerOpen} setOpen={setBurgerOpen} currentPage="image-library" />
        </div>
      </div>
      <div style={{ width: '100%', maxWidth: 1600, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible', paddingBottom: '2rem' }}>
        {loading ? (
          <LoaderOne />
        ) : (
          <DomeGallery images={images} fit={0.5} minRadius={520} padFactor={0.18} overlayBlurColor="#f8f5f0" openedImageWidth="480px" openedImageHeight="480px" imageBorderRadius="32px" openedImageBorderRadius="32px" grayscale={false} />
        )}
      </div>
    </div>
  );
};

export default ImageLibraryPage;
