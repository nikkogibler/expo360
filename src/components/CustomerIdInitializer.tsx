// src/components/CustomerIdInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';

export default function CustomerIdInitializer() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  
  // Use a ref to prevent this logic from running more than once on initial load.
  const hasCheckedStatus = useRef(false);

  useEffect(() => {
    // Only run this logic once on component mount.
    if (hasCheckedStatus.current) return;
    hasCheckedStatus.current = true;

    const checkCustomerStatusAndRedirect = async () => {
      // If we're already on the landing page, we don't need to check anything.
      if (pathname === '/kusam') {
        console.log('On landing page, no redirection needed.');
        return;
      }

      const customerId = localStorage.getItem('kusam_customer_id');

      // Case 1: No customer ID exists in local storage.
      if (!customerId) {
        console.log('No customer ID found, redirecting to landing page.');
        // This will redirect to the sign-up form and save the original URL in the query.
        const redirectPath = `/kusam?redirect_from=${encodeURIComponent(pathname)}&${searchParams.toString()}`;
        router.push(redirectPath);
        return;
      }

      // Case 2: Customer ID exists, but we need to check if their profile is complete.
      console.log('Checking customer status in Supabase for ID:', customerId);
      const { data: customer, error } = await supabase
        .from('customers')
        .select('name, email, whatsapp')
        .eq('customer_id', customerId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching customer status:', error);
        return;
      }
      
      const isAnonymous = !customer || !customer.name || customer.email?.endsWith('@temp.com');
      
      // If the user has a customer ID but is still considered anonymous, redirect them.
      if (isAnonymous) {
        console.log('Customer is anonymous, redirecting to landing page for signup.');
        // This preserves the product page link so they can be sent back there later.
        const redirectPath = `/kusam?redirect_from=${encodeURIComponent(pathname)}&${searchParams.toString()}`;
        router.push(redirectPath);
      }
    };

    checkCustomerStatusAndRedirect();
  }, [searchParams, pathname, router]);

  return null;
}