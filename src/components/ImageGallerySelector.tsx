"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import SafeImage from './SafeImage';

interface ImageGallerySelectorProps {
  currentImageUrl?: string;
  onImageSelect: (newImageUrl: string) => void;
  onClose: () => void;
  // Pre-loaded images from parent component
  preloadedImages?: Array<{ name: string; url: string; thumbnailUrl: string; created_at: string }>;
  preloadedLoading?: boolean;
  preloadedError?: string | null;
}

export default function ImageGallerySelector({ 
  currentImageUrl, 
  onImageSelect, 
  onClose,
  preloadedImages,
  preloadedLoading,
  preloadedError
}: ImageGallerySelectorProps) {
  const [images, setImages] = useState<Array<{ name: string; url: string; thumbnailUrl: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(currentImageUrl || '');

  // Use preloaded images if available, otherwise fetch
  useEffect(() => {
    if (preloadedImages) {
      setImages(preloadedImages);
      setLoading(preloadedLoading || false);
      setError(preloadedError || null);
    } else {
      fetchImages();
    }
  }, [preloadedImages, preloadedLoading, preloadedError]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      setError(null);

      // List all images from the product-images bucket
      const { data: files, error: listError } = await supabase.storage
        .from('product-images')
        .list('', { 
          limit: 200, 
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) {
        throw listError;
      }

      // Filter for image files and generate public URLs (excluding thumbnails folder)
      const imageFiles = files
        .filter(file => {
          const isImage = file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i);
          const notThumbnailFolder = file.name !== 'thumbnails';
          return isImage && notThumbnailFolder;
        })
        .map(file => {
          // Get the full-size image URL
          const { data: urlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(file.name);
          
          // Try to get thumbnail URL (thumbnails folder)
          const { data: thumbnailData } = supabase.storage
            .from('product-images')
            .getPublicUrl(`thumbnails/${file.name}`);
          
          return {
            name: file.name,
            url: urlData.publicUrl,
            thumbnailUrl: thumbnailData.publicUrl, // Use for display
            created_at: file.created_at || ''
          };
        });

      setImages(imageFiles);
    } catch (err) {
      console.error('Error fetching images:', err);
      setError(err instanceof Error ? err.message : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleConfirmSelection = () => {
    if (selectedImage) {
      onImageSelect(selectedImage);
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Select Image</h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 text-xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500">Loading images...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-40">
              <div className="text-red-500">Error: {error}</div>
            </div>
          )}

          {!loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {images.map((image) => (
                <div
                  key={image.name}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                    selectedImage === image.url
                      ? 'border-blue-500 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleImageClick(image.url)}
                >
                  <div className="w-full h-32 flex items-center justify-center bg-gray-50">
                    <SafeImage
                      src={image.thumbnailUrl}
                      alt={image.name}
                      width={120}
                      height={120}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  
                  {/* Selection indicator */}
                  {selectedImage === image.url && (
                    <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                      <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                        ✓
                      </div>
                    </div>
                  )}

                  {/* Current image indicator */}
                  {currentImageUrl === image.url && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded">
                      Current
                    </div>
                  )}

                  {/* Image name tooltip */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 truncate opacity-0 hover:opacity-100 transition-opacity">
                    {image.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && images.length === 0 && (
            <div className="flex items-center justify-center h-40">
              <div className="text-gray-500">No images found in the gallery</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {selectedImage ? (
              <span>
                Selected: {images.find(img => img.url === selectedImage)?.name || 'Unknown'}
              </span>
            ) : (
              <span>Click an image to select it</span>
            )}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={!selectedImage}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Select Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}