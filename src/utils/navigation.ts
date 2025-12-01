export const getMainPage = () => {
  if (typeof window === 'undefined') return '/main';

  const storageKey = getCustomerStorageKey();
  const customerId = localStorage.getItem(storageKey) || localStorage.getItem('customer_id');

  // If there's a customer ID, they should be taken to the instructions page
  return customerId ? '/main/instructions' : '/main';
};

/**
 * Checks if a customer is currently logged in.
 * @returns {boolean} True if a customer ID is found in local storage, false otherwise.
 */
export const isCustomerLoggedIn = (): boolean => {
  if (typeof window === 'undefined') return false;
  const storageKey = getCustomerStorageKey();
  return localStorage.getItem(storageKey) !== null || localStorage.getItem('customer_id') !== null;
};


export const isReturningCustomer = (): boolean => {
  if (typeof window === 'undefined') return false;
  // Determine the dynamic per-client storage key. If the current path is
  // under `/c/{slug}` we use `{slug}_customer_id`. Otherwise fall back to
  // `expo360_customer_id` for compatibility.
  const storageKey = getCustomerStorageKey();
  // Migrate old kusam key if present
  const old = localStorage.getItem('kusam_customer_id');
  if (old && !localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, old);
  }
  return localStorage.getItem(storageKey) !== null;
};

/**
 * Compute the per-client customer storage key. Priority:
 * 1. `window.__CLIENT_SLUG__` (optional global set by ClientProvider)
 * 2. Pathname `/c/{slug}`
 * 3. Fallback `expo360_customer_id`
 */
function getCustomerStorageKey() {
  if (typeof window === 'undefined') return 'expo360_customer_id';
  // global override set by ClientProvider (not required)
  const globalSlug = (window as any).__CLIENT_SLUG__;
  if (globalSlug && typeof globalSlug === 'string') return `${globalSlug}_customer_id`;
  // parse pathname: /c/{slug}/...
  try {
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (parts.length >= 2 && parts[0] === 'c') {
      const slug = parts[1];
      if (slug) return `${slug}_customer_id`;
    }
  } catch (e) {
    // ignore
  }
  return 'expo360_customer_id';
}
