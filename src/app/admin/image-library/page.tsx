"use client";

import React, { useEffect, useState } from 'react';
type ImageItem = string | { src: string; alt?: string };
import DomeGallery from '../../../components/DomeGallery';
import Dock, { DockItemData } from '../../../components/Dock';
import { FaHome, FaImages, FaUserShield } from 'react-icons/fa';
import { supabase } from '@/utils/supabase';

const ImageLibraryPage = () => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      const imageItems = (data || [])
        .filter(item => item.name.match(/\.png$|\.jpg$|\.jpeg$/i))
        .map(item => {
          const publicUrl = supabase.storage.from('product-images').getPublicUrl(item.name).data.publicUrl;
          console.log('[ImageLibraryPage] Found image:', item.name, 'URL:', publicUrl);
          return {
            src: publicUrl,
            alt: item.name
          };
        });
      console.log('[ImageLibraryPage] Total images found:', imageItems.length);
      setImages(imageItems);
      setLoading(false);
    }
    fetchImages();
  }, []);

  // Dock items for navigation
  const dockItems: DockItemData[] = [
    {
      icon: <FaHome size={28} />,
      label: 'Dashboard',
      onClick: () => window.location.href = '/admin',
    },
    {
      icon: <FaImages size={28} />,
      label: 'Librería de Imágenes',
      onClick: () => window.location.href = '/admin/image-library',
    },
    {
      icon: <FaUserShield size={28} />,
      label: 'Admin',
      onClick: () => window.location.href = '/admin/user-management',
    },
  ];

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
        justifyContent: 'center',
        overflow: 'auto',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1200, height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <div className="text-xl text-gray-600">Cargando galería...</div>
        ) : (
          <DomeGallery images={images} fit={0.5} minRadius={520} padFactor={0.18} overlayBlurColor="#f8f5f0" openedImageWidth="480px" openedImageHeight="480px" imageBorderRadius="32px" openedImageBorderRadius="32px" grayscale={false} />
        )}
      </div>
      {/* Dock at the bottom */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
        <Dock items={dockItems} />
      </div>
    </div>
  );
};

export default ImageLibraryPage;
