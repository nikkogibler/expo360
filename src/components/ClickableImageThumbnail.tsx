"use client";
import React, { useState } from 'react';
import SafeImage from './SafeImage';
import ImageGallerySelector from './ImageGallerySelector';
import ImagePreviewModal from './ImagePreviewModal';

interface ClickableImageThumbnailProps {
  promptId: string;
  currentImageUrl?: string;
  onImageUpdate: (newImageUrl: string) => void;
  width: number;
  height: number;
  className?: string;
  promptText?: string; // Optional prompt text for preview modal
  // Pre-loaded gallery images to avoid re-fetching
  galleryImages?: Array<{ name: string; url: string; thumbnailUrl: string; created_at: string }>;
  galleryLoading?: boolean;
  galleryError?: string | null;
}

export default function ClickableImageThumbnail({
  promptId,
  currentImageUrl,
  onImageUpdate,
  width,
  height,
  className = "",
  promptText,
  galleryImages,
  galleryLoading,
  galleryError
}: ClickableImageThumbnailProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleImageClick = () => {
    setShowPreview(true);
  };

  const handleReplaceImage = () => {
    setShowGallery(true);
  };

  const handleImageSelect = async (newImageUrl: string) => {
    if (newImageUrl === currentImageUrl) {
      return; // No change needed
    }

    // Clean the URL by removing any surrounding quotes
    const cleanedUrl = newImageUrl.replace(/^["']|["']$/g, '');

    setUpdating(true);
    try {
      console.log('Updating image for prompt:', promptId, 'to:', cleanedUrl);
      console.log('Original URL:', newImageUrl);
      console.log('Cleaned URL:', cleanedUrl);
      
      // Update the database
      const response = await fetch('/api/update-prompt-image', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Referer': window.location.href // Ensure referer is set for auth check
        },
        body: JSON.stringify({ promptId, imageUrl: cleanedUrl })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to update image`);
      }

      const result = await response.json();
      console.log('Update successful:', result);
      console.log('Updating UI with cleaned URL:', cleanedUrl);

      // Add cache-busting parameter to force browser to reload the new image
      const cacheBustedUrl = `${cleanedUrl}${cleanedUrl.includes('?') ? '&' : '?'}t=${Date.now()}`;
      console.log('Cache-busted URL:', cacheBustedUrl);

      // Update the UI with the cache-busted URL
      onImageUpdate(cacheBustedUrl);
      
    } catch (error) {
      console.error('Error updating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to update image: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
  };

  return (
    <>
      <div 
        className={`relative cursor-pointer group ${className}`}
        onClick={handleImageClick}
        title="Click to change image"
      >
        <SafeImage
          src={currentImageUrl || ''}
          alt="Prompt output"
          width={width}
          height={height}
          className="w-16 h-16 object-cover rounded shadow border border-amber-200 group-hover:opacity-80 transition-opacity"
        />
        

        
                {/* Hover overlay - fixed to not block image */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-all rounded flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </div>
        </div>

        {/* Loading overlay */}
        {updating && (
          <div className="absolute inset-0 bg-white bg-opacity-80 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && currentImageUrl && (
        <ImagePreviewModal
          imageUrl={currentImageUrl}
          promptText={promptText}
          onClose={() => setShowPreview(false)}
          onReplaceImage={handleReplaceImage}
        />
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <ImageGallerySelector
          currentImageUrl={currentImageUrl}
          onImageSelect={handleImageSelect}
          onClose={handleCloseGallery}
          preloadedImages={galleryImages}
          preloadedLoading={galleryLoading}
          preloadedError={galleryError}
        />
      )}
    </>
  );
}