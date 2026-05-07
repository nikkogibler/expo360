const { createClient } = require('@supabase/supabase-js');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://dpbxyauaobvcdwdgzcxc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwYnh5YXVhb2J2Y2R3ZGd6Y3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1OTIwMDMsImV4cCI6MjA2NTE2ODAwM30.3TuY9szqBxmWZiAOYpnQ7tF0g2jWsqfW393WkOW81qQ'
);

function testImageUrl(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const request = client.get(url, (res) => {
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        accessible: res.statusCode === 200
      });
    });
    
    request.on('error', (err) => {
      resolve({
        url,
        status: 'ERROR',
        error: err.message,
        accessible: false
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        accessible: false
      });
    });
  });
}

function checkLocalFile(relativePath) {
  // Remove leading slash and check if file exists in public folder
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  const fullPath = path.join(__dirname, 'public', cleanPath);
  
  try {
    const stats = fs.statSync(fullPath);
    return {
      exists: true,
      size: stats.size,
      path: fullPath
    };
  } catch (err) {
    return {
      exists: false,
      error: err.message,
      path: fullPath
    };
  }
}

async function debugImages() {
  try {
    console.log('🔍 Fetching products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('name, image_url, sku')
      .eq('is_active', true)
      .limit(50);
    
    if (error) throw error;
    
    console.log(`📦 Found ${data.length} products\n`);
    
    console.log('🌐 Testing image URLs...\n');
    
    for (let i = 0; i < data.length; i++) {
      const product = data[i];
      console.log(`${i + 1}. ${product.name} (${product.sku})`);
      
      if (product.image_url && product.image_url.trim()) {
        const trimmedUrl = product.image_url.trim();
        
        // Check if file exists locally
        const localCheck = checkLocalFile(trimmedUrl);
        
        if (localCheck.exists) {
          console.log(`   ✅ LOCAL FILE EXISTS - Size: ${localCheck.size} bytes`);
          console.log(`   📂 Path: ${localCheck.path}`);
        } else {
          console.log(`   ❌ LOCAL FILE MISSING - ${localCheck.error}`);
          console.log(`   📂 Expected: ${localCheck.path}`);
        }
        
        // Test via HTTP (assuming your dev server is running on 3006)
        const fullUrl = `http://localhost:3006${trimmedUrl}`;
        const result = await testImageUrl(fullUrl);
        
        if (result.accessible) {
          console.log(`   🌐 HTTP ACCESSIBLE - Status: ${result.status}, Type: ${result.contentType}`);
        } else {
          console.log(`   🌐 HTTP FAILED - Status: ${result.status}${result.error ? `, Error: ${result.error}` : ''}`);
        }
        
        console.log(`   🔗 Database URL: ${trimmedUrl}`);
        console.log(`   🔗 Full URL: ${fullUrl}`);
      } else {
        console.log('   ⚠️  NO IMAGE URL OR EMPTY');
      }
      console.log('');
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

debugImages();
