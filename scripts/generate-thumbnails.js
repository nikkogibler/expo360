/**
 * Generate Thumbnails Script
 * 
 * This script:
 * 1. Reads all images from product-images bucket
 * 2. Downloads each image
 * 3. Resizes to 300x300 thumbnail
 * 4. Uploads to product-images/thumbnails/ folder
 * 
 * Run with: node scripts/generate-thumbnails.js
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      process.env[key] = value;
    }
  });
}

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const THUMBNAIL_SIZE = 300;
const THUMBNAIL_QUALITY = 80;

async function generateThumbnails() {
  console.log('🚀 Starting thumbnail generation...\n');

  try {
    // List all files in product-images bucket (excluding thumbnails folder)
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', {
        limit: 1000,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (listError) {
      throw new Error(`Failed to list files: ${listError.message}`);
    }

    // Filter out thumbnails folder and non-image files
    const imageFiles = files.filter(file => {
      const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
      const notThumbnailFolder = file.name !== 'thumbnails';
      return isImage && notThumbnailFolder && !file.name.startsWith('thumbnails/');
    });

    console.log(`📦 Found ${imageFiles.length} images to process\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileName = file.name;
      const thumbnailPath = `thumbnails/${fileName}`;

      console.log(`[${i + 1}/${imageFiles.length}] Processing: ${fileName}`);

      try {
        // Check if thumbnail already exists
        const { data: existingFile } = await supabase.storage
          .from('product-images')
          .list('thumbnails', {
            search: fileName
          });

        if (existingFile && existingFile.length > 0) {
          console.log(`  ⏭️  Thumbnail already exists, skipping\n`);
          skipCount++;
          continue;
        }

        // Get public URL for the original image
        const { data: urlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        if (!urlData || !urlData.publicUrl) {
          throw new Error('Could not get public URL');
        }

        // Download the image
        console.log(`  📥 Downloading...`);
        const response = await fetch(urlData.publicUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const imageBuffer = await response.buffer();

        // Generate thumbnail using sharp
        console.log(`  🔧 Resizing to ${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}...`);
        const thumbnailBuffer = await sharp(imageBuffer)
          .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: THUMBNAIL_QUALITY })
          .toBuffer();

        // Upload thumbnail
        console.log(`  📤 Uploading thumbnail...`);
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(thumbnailPath, thumbnailBuffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        console.log(`  ✅ Success!\n`);
        successCount++;

      } catch (error) {
        console.error(`  ❌ Error: ${error.message}\n`);
        errorCount++;
      }

      // Add a small delay to avoid rate limiting
      if (i < imageFiles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully generated: ${successCount}`);
    console.log(`⏭️  Skipped (already exists): ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📦 Total processed: ${imageFiles.length}`);
    console.log('='.repeat(50) + '\n');

    if (successCount > 0) {
      console.log('🎉 Thumbnail generation complete!');
      console.log('📁 Thumbnails are available at: product-images/thumbnails/');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
generateThumbnails();
