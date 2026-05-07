// update-admin-metadata.js
// Usage: node update-admin-metadata.js <USER_ID>

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_ID = process.argv[2];

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}
if (!USER_ID) {
  console.error('Usage: node update-admin-metadata.js <USER_ID>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function makeAdmin() {
  const { data, error } = await supabase.auth.admin.updateUserById(USER_ID, {
    app_metadata: { is_admin: true }
  });
  if (error) {
    console.error('Error updating user:', error);
  } else {
    console.log('User updated:', data);
  }
}

makeAdmin();
