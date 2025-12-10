#!/usr/bin/env node

/**
 * SEO Metadata Cache Revalidation Script
 * Run: npm run revalidate-seo
 * 
 * This script triggers on-demand revalidation of SEO metadata
 * without waiting for the ISR 60-second window.
 */

const https = require('https');
require('dotenv').config();

const REVALIDATE_URL = process.env.REVALIDATE_URL || 'https://expo360.vercel.app/api/revalidate-seo';
const REVALIDATE_SECRET = process.env.REVALIDATE_SECRET;

if (!REVALIDATE_SECRET) {
  console.error('❌ Error: REVALIDATE_SECRET environment variable not set');
  console.error('Set it with: export REVALIDATE_SECRET="your_secret_here"');
  console.error('Or in .env.local: REVALIDATE_SECRET=your_secret_here');
  process.exit(1);
}

console.log('🔄 Triggering SEO metadata revalidation...');
console.log(`📍 Endpoint: ${REVALIDATE_URL}`);

const postData = JSON.stringify({
  secret: REVALIDATE_SECRET,
});

const options = {
  hostname: new URL(REVALIDATE_URL).hostname,
  port: 443,
  path: new URL(REVALIDATE_URL).pathname,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (res.statusCode === 200) {
        console.log('✅ Revalidation successful!');
        console.log(`⏰ Timestamp: ${response.timestamp}`);
        console.log(`📄 Paths revalidated: ${response.paths.length}`);
        response.paths.forEach((path) => {
          console.log(`   • ${path}`);
        });
        console.log('\n💡 Tip: Sitemap and metadata will regenerate on next request');
      } else {
        console.error(`❌ Revalidation failed with status ${res.statusCode}`);
        console.error(response.error || 'Unknown error');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error);
      console.error('Response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.error('\nMake sure:');
  console.error('1. The site is deployed and running');
  console.error('2. REVALIDATE_SECRET is set in environment');
  console.error('3. API route src/app/api/revalidate-seo/route.ts exists');
  process.exit(1);
});

req.write(postData);
req.end();
