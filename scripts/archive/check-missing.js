const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://dpbxyauaobvcdwdgzcxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnh5YXVhb2J2Y2R3ZGd6Y3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTIwMDMsImV4cCI6MjA2NTE2ODAwM30.3TuY9szqBxmWZiAOYpnQ7tF0g2jWsqfW393WkOW81qQ'
);

function checkLocalFile(relativePath) {
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const fullPath = path.join(__dirname, 'public', cleanPath);
  
  try {
    const stats = fs.statSync(fullPath);
    return { exists: true, size: stats.size, path: fullPath };
  } catch (err) {
    return { exists: false, error: err.message, path: fullPath };
  }
}

async function findMissingImages() {
  try {
    console.log('🔍 Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('name, image_url, sku')
      .eq('is_active', true);
    
    if (error) throw error;
    
    console.log(`📦 Found ${data.length} products total\n`);
    
    const missing = [];
    const existing = [];
    
    for (const product of data) {
      if (product.image_url && product.image_url.trim()) {
        const localCheck = checkLocalFile(product.image_url.trim());
        
        if (localCheck.exists) {
          existing.push({
            name: product.name,
            sku: product.sku,
            url: product.image_url,
            size: localCheck.size
          });
        } else {
          missing.push({
            name: product.name,
            sku: product.sku,
            url: product.image_url,
            expectedPath: localCheck.path
          });
        }
      }
    }
    
    console.log(`✅ EXISTING IMAGES: ${existing.length}`);
    console.log(`❌ MISSING IMAGES: ${missing.length}\n`);
    
    if (missing.length > 0) {
      console.log('🚨 MISSING IMAGE FILES:');
      missing.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.sku})`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Expected: ${item.expectedPath}\n`);
      });
    }
    
    // Check file sizes for potential issues
    const largeSizes = existing.filter(item => item.size > 500000); // > 500KB
    const smallSizes = existing.filter(item => item.size < 1000); // < 1KB
    
    if (largeSizes.length > 0) {
      console.log(`📊 LARGE FILES (>500KB): ${largeSizes.length}`);
      largeSizes.slice(0, 5).forEach(item => {
        console.log(`   ${item.name}: ${Math.round(item.size / 1024)}KB`);
      });
      console.log('');
    }
    
    if (smallSizes.length > 0) {
      console.log(`📊 SMALL FILES (<1KB): ${smallSizes.length}`);
      smallSizes.forEach(item => {
        console.log(`   ${item.name}: ${item.size} bytes`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

findMissingImages();
