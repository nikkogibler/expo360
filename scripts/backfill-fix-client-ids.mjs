import { createClient } from '@supabase/supabase-js';
import process from 'process';

// Usage:
// 1) Dry-run (safe):
//    NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-fix-client-ids.mjs
// 2) Apply suggested mappings (use after review):
//    NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-fix-client-ids.mjs --apply

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE;
const APPLY_FLAG = process.argv.includes('--apply');

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment. Aborting.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function fetchAllClients() {
  const { data, error } = await supabase.from('clients').select('id,slug');
  if (error) throw error;
  const map = new Map();
  (data || []).forEach(c => map.set(c.id, c.slug));
  return map;
}

async function fetchAllProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data || [];
}

async function fetchAllVariableTypes() {
  const { data, error } = await supabase.from('variable_types').select('*');
  if (error) throw error;
  return data || [];
}

async function findClientBySlug(slug) {
  const { data, error } = await supabase.from('clients').select('id,slug').eq('slug', slug).limit(1);
  if (error) return null;
  return (data && data[0]) || null;
}

function extractPossibleSlugFromMetadata(meta) {
  if (!meta) return null;
  if (typeof meta === 'object') {
    return meta.client_slug || meta.clientId || meta.client || meta.clientSlug || null;
  }
  try {
    const parsed = JSON.parse(meta);
    return parsed?.client_slug || parsed?.clientId || parsed?.client || null;
  } catch (e) {
    return null;
  }
}

async function processProducts(clientsMap) {
  console.log('Scanning products for missing/invalid client_id...');
  const products = await fetchAllProducts();
  const problematic = products.filter(p => !p.client_id || !clientsMap.has(p.client_id));
  console.log(`Found ${problematic.length} problematic product(s).`);
  for (const p of problematic) {
    console.log('---');
    console.log('Product id:', p.id);
    console.log('SKU:', p.sku, 'Name:', p.name);
    console.log('Existing client_id:', p.client_id);
    console.log('metadata:', p.metadata || p);
    const guess = extractPossibleSlugFromMetadata(p.metadata);
    if (guess) {
      console.log('Heuristic slug found in metadata:', guess);
      const client = await findClientBySlug(guess);
      if (client) {
        console.log(' -> Found client for slug:', client.id, client.slug);
        if (APPLY_FLAG) {
          console.log('Applying update to product', p.id, '->', client.id);
          const { error } = await supabase.from('products').update({ client_id: client.id }).eq('id', p.id);
          if (error) console.error('Failed to update product', p.id, error.message || error);
        } else {
          console.log('Run with --apply to set this product.client_id to', client.id);
        }
      } else {
        console.log('No client found for slug', guess);
      }
    } else {
      console.log('No heuristic slug present in metadata');
    }
  }
}

async function processVariableTypes(clientsMap) {
  console.log('Scanning variable_types for missing/invalid client_id...');
  const vts = await fetchAllVariableTypes();
  const problematic = vts.filter(v => !v.client_id || !clientsMap.has(v.client_id));
  console.log(`Found ${problematic.length} problematic variable_type(s).`);
  for (const v of problematic) {
    console.log('---');
    console.log('VariableType id:', v.id, 'key:', v.key, 'label:', v.label);
    console.log('Existing client_id:', v.client_id);
    console.log('metadata:', v.metadata || v);
    const guess = extractPossibleSlugFromMetadata(v.metadata);
    if (guess) {
      console.log('Heuristic slug found in metadata:', guess);
      const client = await findClientBySlug(guess);
      if (client) {
        console.log(' -> Found client for slug:', client.id, client.slug);
        if (APPLY_FLAG) {
          console.log('Applying update to variable_type', v.id, '->', client.id);
          const { error } = await supabase.from('variable_types').update({ client_id: client.id }).eq('id', v.id);
          if (error) console.error('Failed to update variable_type', v.id, error.message || error);
        } else {
          console.log('Run with --apply to set this variable_type.client_id to', client.id);
        }
      } else {
        console.log('No client found for slug', guess);
      }
    } else {
      console.log('No heuristic slug present in metadata');
    }
  }
}

async function main() {
  try {
    console.log('Loading clients...');
    const clientsMap = await fetchAllClients();
    console.log(`Loaded ${clientsMap.size} clients.`);

    await processProducts(clientsMap);
    await processVariableTypes(clientsMap);

    console.log('\nDone. Review the logs above. To apply suggested fixes run with --apply.');
  } catch (err) {
    console.error('Fatal error:', err.message || err);
    process.exit(1);
  }
}

main();
