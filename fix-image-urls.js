/**
 * Script to clean image URLs in the database
 * Removes leading/trailing whitespace from image_url fields
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanImageUrls() {
  try {
    console.log('🔍 Fetching all products...');
    
    // Fetch all products
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, sku, image_url');

    if (fetchError) {
      throw fetchError;
    }

    console.log(`📦 Found ${products.length} products`);

    // Find products with whitespace in image_url
    const productsToFix = products.filter(p => {
      if (!p.image_url) return false;
      return p.image_url !== p.image_url.trim();
    });

    console.log(`🔧 Found ${productsToFix.length} products with whitespace in image_url`);

    if (productsToFix.length === 0) {
      console.log('✅ No products need fixing!');
      return;
    }

    // Show which products will be fixed
    console.log('\nProducts to fix:');
    productsToFix.forEach(p => {
      console.log(`  - ${p.name} (${p.sku})`);
      console.log(`    Before: "${p.image_url}"`);
      console.log(`    After:  "${p.image_url.trim()}"`);
    });

    console.log('\n🔄 Updating products...');

    // Update each product
    let successCount = 0;
    let errorCount = 0;

    for (const product of productsToFix) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: product.image_url.trim() })
        .eq('id', product.id);

      if (updateError) {
        console.error(`❌ Failed to update ${product.name}:`, updateError.message);
        errorCount++;
      } else {
        console.log(`✅ Updated ${product.name}`);
        successCount++;
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  ✅ Successfully updated: ${successCount}`);
    console.log(`  ❌ Failed: ${errorCount}`);
    console.log(`  📦 Total processed: ${productsToFix.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
cleanImageUrls()
  .then(() => {
    console.log('\n✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
