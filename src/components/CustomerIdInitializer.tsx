// src/components/CustomerIdInitializer.tsx
'use client';

import { useEffect } from 'react';
// REMOVE: import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';

export default function CustomerIdInitializer() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const clearSessionFlag = searchParams.get('clear_session');

    if (clearSessionFlag === 'true') {
      console.log('CustomerIdInitializer: Detected clear_session=true. Clearing existing kusam_customer_id.');
      localStorage.removeItem('kusam_customer_id');
      // OPTIONAL: Clean the URL after clearing, to prevent re-clearing on refresh.
      // This will cause a navigation though, so consider if that's desired.
      // if (window.location.search.includes('clear_session')) {
      //   window.history.replaceState({}, document.title, window.location.pathname);
      // }
    }

    // IMPORTANT: REMOVED the logic to generate a new uuidv4 if currentCustomerId is null.
    // This component will no longer automatically create IDs for new visitors.
    // The main KusamLeadFormPage will now be responsible for this.

    console.log('CustomerIdInitializer: Finished execution. localStorage kusam_customer_id after initializer:', localStorage.getItem('kusam_customer_id'));

  }, [searchParams]); // Depend on searchParams

  return null; // This component doesn't render any UI
}