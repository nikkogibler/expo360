import { useState, useEffect } from 'react';

// Image optimization utilities for better loading performance

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageOptimizer {
  private static createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  private static getOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    if (width > maxWidth) {
      height = (height * maxWidth) / width;
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = (width * maxHeight) / height;
      height = maxHeight;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  static async compressImage(
    imageUrl: string,
    options: ImageOptimizationOptions = {}
  ): Promise<string> {
    const {
      maxWidth = 800,
      maxHeight = 600,
      quality = 0.8,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          const { width, height } = this.getOptimalDimensions(
            img.naturalWidth,
            img.naturalHeight,
            maxWidth,
            maxHeight
          );

          const canvas = this.createCanvas(width, height);
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          // Apply smoothing for better quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(img, 0, 0, width, height);
          
          const mimeType = format === 'webp' ? 'image/webp' : 
                          format === 'png' ? 'image/png' : 'image/jpeg';
          
          const compressedDataUrl = canvas.toDataURL(mimeType, quality);
          resolve(compressedDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  static getImageInfo(imageUrl: string): Promise<{
    width: number;
    height: number;
    size: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        // Estimate file size (not exact, but useful for decisions)
        const estimatedSize = img.naturalWidth * img.naturalHeight * 3; // Rough estimate
        
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: estimatedSize
        });
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
      img.src = imageUrl;
    });
  }

  static shouldOptimize(width: number, height: number): boolean {
    const maxDimension = Math.max(width, height);
    const totalPixels = width * height;
    
    // Optimize if image is larger than 1200px in any dimension
    // or has more than 1 megapixel
    return maxDimension > 1200 || totalPixels > 1000000;
  }
}

// Progressive image loading hook
export function useProgressiveImage(src: string, options?: ImageOptimizationOptions) {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    if (!src) return;

    let isCancelled = false;
    
    const loadImage = async () => {
      try {
        setIsOptimizing(true);
        setError(null);
        
        // Get image info first
        const imageInfo = await ImageOptimizer.getImageInfo(src);
        
        if (isCancelled) return;
        
        // Decide whether to optimize
        const shouldOptimize = ImageOptimizer.shouldOptimize(
          imageInfo.width, 
          imageInfo.height
        );
        
        if (shouldOptimize && options) {
          console.log(`🔧 Optimizing large image: ${imageInfo.width}x${imageInfo.height}`);
          const optimizedSrc = await ImageOptimizer.compressImage(src, options);
          if (!isCancelled) {
            setImageSrc(optimizedSrc);
            setIsLoaded(true);
          }
        } else {
          // Use original image if it's already small enough
          setImageSrc(src);
          setIsLoaded(true);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          // Fallback to original image on optimization failure
          setImageSrc(src);
          setIsLoaded(true);
        }
      } finally {
        if (!isCancelled) {
          setIsOptimizing(false);
        }
      }
    };

    loadImage();
    
    return () => {
      isCancelled = true;
    };
  }, [src, options]);

  return { imageSrc, isLoaded, error, isOptimizing };
}
