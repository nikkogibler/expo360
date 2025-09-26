// Debug Credit System
// Add this to your browser console on the admin page to test

// Test 1: Check if credit service can be imported
console.log('Testing credit service...');

// Test 2: Try to fetch credits directly
fetch('/api/test-credits', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ action: 'getCurrentCredits' })
}).then(res => res.json()).then(data => {
  console.log('Credit API test result:', data);
}).catch(err => {
  console.error('Credit API test failed:', err);
});

// Test 3: Check if Supabase connection works
if (window.supabase || typeof supabase !== 'undefined') {
  console.log('Supabase is available');
  // Try direct query
  supabase.from('admin_credits')
    .select('total_credits, used_credits, remaining_credits')
    .then(result => {
      console.log('Direct Supabase query result:', result);
    });
} else {
  console.log('Supabase not available in global scope');
}