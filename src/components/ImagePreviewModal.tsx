"use client";
import React from 'react';
import SafeImage from './SafeImage';

interface ImagePreviewModalProps {
  imageUrl: string;
  promptText?: string;
  onClose: () => void;
  onReplaceImage: () => void;
}

export default function ImagePreviewModal({
  imageUrl,
  promptText,
  onClose,
  onReplaceImage
}: ImagePreviewModalProps) {
  
  // Close on ESC key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-100 to-amber-50 px-6 py-4 border-b border-amber-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Image Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            title="Close preview"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50 flex items-center justify-center">
          <div className="relative max-w-full max-h-full">
            <SafeImage
              src={imageUrl}
              alt="Full resolution preview"
              width={800}
              height={800}
              className="max-w-full max-h-[60vh] object-contain rounded shadow-lg"
            />
          </div>
        </div>

        {/* Prompt Text (if provided) */}
        {promptText && (
          <div className="px-6 py-3 bg-gray-100 border-t border-gray-200">
            <p className="text-sm text-gray-700 font-medium mb-1">Associated Prompt:</p>
            <p className="text-xs text-gray-600 max-h-20 overflow-y-auto">{promptText}</p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Click outside or press ESC to close
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded transition-colors"
              style={{ 
                borderColor: 'rgba(140,108,94,0.7)',
                color: '#8C6C5E'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(140,108,94,0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Close
            </button>
            <button
              onClick={() => {
                onReplaceImage();
                onClose();
              }}
              className="px-4 py-2 rounded transition-colors text-white font-semibold"
              style={{ 
                backgroundColor: '#B8860B',
                borderColor: '#8C6C5E'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#9A7209'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#B8860B'}
            >
              🖼️ Replace Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
