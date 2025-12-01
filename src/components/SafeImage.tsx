"use client";
import React, { useState, useEffect } from 'react';

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

export default function SafeImage({ 
  src, 
  alt, 
  width, 
  height, 
  className = "",
  fallbackIcon
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [correctedSrc, setCorrectedSrc] = useState(src);
  const [timedOut, setTimedOut] = useState(false);

  // Reset state when src prop changes
  useEffect(() => {
    setCorrectedSrc(src);
    setHasError(false);
    setIsLoading(true);
    setTimedOut(false);
  }, [src]);

  // Add timeout for loading images
  useEffect(() => {
    if (isLoading && !hasError && !timedOut) {
      const timeout = setTimeout(() => {
        console.warn('Image loading timed out:', correctedSrc);
        setTimedOut(true);
        setIsLoading(false);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isLoading, hasError, timedOut, correctedSrc]);

  // Default fallback icon
  const defaultFallbackIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21,15 16,10 5,21"/>
    </svg>
  );

  const handleError = async () => {
    // Try to fix the URL if it looks like a problematic expo360-furniture URL
    if (src && src.includes('expo360-furniture') && !hasError) {
      try {
        const response = await fetch('/api/fix-image-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fix-single', url: src })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.wasChanged && result.correctedUrl !== src) {
            console.log('Attempting URL correction:', { original: src, corrected: result.correctedUrl });
            setCorrectedSrc(result.correctedUrl);
            setIsLoading(true); // Try loading again with corrected URL
            return; // Don't set error yet, let the corrected URL try to load
          }
        }
      } catch (error) {
        console.warn('Could not fix image URL:', error);
      }
    }
    
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    setTimedOut(false);
  };

  // Basic URL validation
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // If invalid URL, error occurred, or timed out, show fallback
  if (!correctedSrc || !isValidUrl(correctedSrc) || hasError || timedOut) {
    return (
      <div 
        className={`bg-gray-200 rounded flex items-center justify-center text-gray-400 border border-gray-300 ${className}`}
        style={className?.includes('w-full') ? {} : { width, height }}
      >
        <div className="text-center">
          {fallbackIcon || defaultFallbackIcon}
          {timedOut && (
            <div className="text-xs mt-1 text-gray-500">Timeout</div>
          )}
        </div>
      </div>
    );
  }

  // Debug what we're getting
  console.log('SafeImage debug:', { src, correctedSrc, hasError, isLoading, isValidUrl: correctedSrc ? isValidUrl(correctedSrc) : false });

  // If no valid URL, show fallback
  if (!correctedSrc || correctedSrc === '' || !isValidUrl(correctedSrc) || hasError) {
    console.log('Showing fallback for:', correctedSrc);
    return (
      <div 
        className={`bg-gray-200 rounded flex items-center justify-center text-gray-400 border border-gray-300 ${className}`}
        style={{ width, height }}
      >
        {fallbackIcon || defaultFallbackIcon}
      </div>
    );
  }

  return (
    <div 
      className="relative" 
      style={className?.includes('w-full') ? {} : { width, height }}
    >
      {isLoading && (
        <div 
          className={`absolute inset-0 bg-gray-100 rounded flex items-center justify-center text-gray-400 border border-gray-300 animate-pulse ${className}`}
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full animate-bounce"></div>
        </div>
      )}
      <img
        src={correctedSrc}
        key={correctedSrc} // Force re-render when URL changes
        alt={alt}
        {...(className?.includes('w-full') ? {} : { width, height })}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200 object-cover`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}