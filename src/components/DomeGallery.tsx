"use client";
import Image from 'next/image';

type ImageItem = string | { src: string; alt?: string };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: 'auto' | 'min' | 'max' | 'width' | 'height';
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  openedImageWidth?: string;
  openedImageHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

// --- Begin DomeGallery implementation ---
// Full implementation pasted from user prompt

const DEFAULT_IMAGES: ImageItem[] = [
  {
    src: 'https://images.unsplash.com/photo-1755331039789-7e5680e26e8f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Abstract art'
  },
  {
    src: 'https://images.unsplash.com/photo-1755569309049-98410b94f66d?q=80&w=772&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Modern sculpture'
  },
  {
    src: 'https://images.unsplash.com/photo-1755497595318-7e5e3523854f?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Digital artwork'
  },
  {
    src: 'https://images.unsplash.com/photo-1755353985163-c2a0fe5ac3d8?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Contemporary art'
  },
  {
    src: 'https://images.unsplash.com/photo-1745965976680-d00be7dc0377?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Geometric pattern'
  },
  {
    src: 'https://images.unsplash.com/photo-1752588975228-21f44630bb3c?q=80&w=774&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    alt: 'Textured surface'
  },
  {
    src: 'https://pbs.twimg.com/media/Gyla7NnXMAAXSo_?format=jpg&name=large',
    alt: 'Social media image'
  }
];

// const DEFAULTS = {
//   maxVerticalRotationDeg: 5,
//   dragSensitivity: 20,
//   enlargeTransitionMs: 300,
//   segments: 35
// };

// --- Begin DomeGallery implementation ---
// (Full code from user prompt pasted below)



import React, { useState } from 'react';


function DomeGallery({ images = DEFAULT_IMAGES }: DomeGalleryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ src: string; alt?: string } | null>(null);

  if (!images || images.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#4B2E09', fontSize: '1.5rem', padding: '2rem' }}>
        No images to display in the gallery.
      </div>
    );
  }

  const openModal = (img: ImageItem) => {
    if (typeof img === 'string') {
      setSelectedImage({ src: img });
    } else {
      setSelectedImage(img);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedImage(null);
  };

  const handleDownload = async () => {
    if (!selectedImage) return;
    try {
      const response = await fetch(selectedImage.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = selectedImage.alt || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download image.');
    }
  };

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2mm',
          width: '100%',
          padding: '2rem 0',
          justifyItems: 'center',
          alignItems: 'center',
        }}
      >
        {images.map((img, idx) => {
          const src = typeof img === 'string' ? img : img.src;
          const alt = typeof img === 'string' ? '' : img.alt || '';
          return (
            <div
              key={src + idx}
              style={{
                boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#fff',
                transition: 'transform 0.25s cubic-bezier(.25,1,.5,1)',
                cursor: 'pointer',
                width: '220px',
                height: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
              }}
              className="gallery-card"
              onClick={() => openModal(img)}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.06)';
                (e.currentTarget as HTMLDivElement).style.zIndex = '2';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                (e.currentTarget as HTMLDivElement).style.zIndex = '1';
              }}
            >
              <Image
                src={src}
                alt={alt}
                width={220}
                height={220}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '20px',
                  boxShadow: '0 2px 8px 0 rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.2s',
                }}
              />
            </div>
          );
        })}
      </div>
      {modalOpen && selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 8px 32px 0 rgba(0,0,0,0.25)',
              maxWidth: '90vw',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt || ''}
              width={810}
              height={810}
              style={{
                maxWidth: '85vw',
                maxHeight: '81vh',
                borderRadius: '16px',
                objectFit: 'contain',
                marginBottom: '1rem',
              }}
            />
            <button
              onClick={handleDownload}
              style={{
                background: '#4B2E09',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                marginBottom: '0.5rem',
              }}
              type="button"
            >
              Download
            </button>
            <button
              onClick={closeModal}
              style={{
                background: 'transparent',
                color: '#4B2E09',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default DomeGallery;
