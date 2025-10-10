/**
 * Utility for generating thumbnails from images
 * Can be used in both server-side scripts and API routes
 */

import sharp from 'sharp';

/**
 * Generate a 200x200 thumbnail from an image buffer
 * @param imageBuffer - Buffer containing the original image data
 * @returns Buffer containing the resized thumbnail
 */
export async function generateThumbnail(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const thumbnail = await sharp(imageBuffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    
    return thumbnail;
  } catch (error) {
    console.error('[thumbnailGenerator] Error generating thumbnail:', error);
    throw new Error(`Failed to generate thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get thumbnail filename from original filename
 * @param originalFilename - Original image filename
 * @returns Thumbnail path with thumbnails/ prefix
 */
export function getThumbnailPath(originalFilename: string): string {
  return `thumbnails/${originalFilename}`;
}

/**
 * Extract filename from Supabase public URL
 * @param publicUrl - Full Supabase public URL
 * @returns Just the filename portion
 */
export function extractFilenameFromUrl(publicUrl: string): string | null {
  try {
    // Example: https://[project].supabase.co/storage/v1/object/public/product-images/filename.jpg
    const match = publicUrl.match(/\/product-images\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('[thumbnailGenerator] Error extracting filename:', error);
    return null;
  }
}
