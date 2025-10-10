// src/components/CustomerIdInitializer.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { adminList } from '../config/adminList';

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
      // Check if we've already verified this customer in this session
      const customerId = localStorage.getItem('kusam_customer_id');
      if (customerId && typeof window !== 'undefined') {
        const sessionKey = `customer_verified_${customerId}`;
        const isVerified = sessionStorage.getItem(sessionKey);
        if (isVerified === 'true') {
          console.log('[CustomerIdInitializer] Customer already verified in this session, skipping check.');
          return;
        }
      }
      // Exempt authenticated admins from all customer redirects
      const getCookie = (name: string): string | null => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          const part = parts.pop();
          if (part) {
            return part.split(';').shift() ?? null;
          }
        }
        return null;
      };
      const email = getCookie('user_email');
      const decodedEmail = email ? decodeURIComponent(email) : null;
      if (decodedEmail && adminList.includes(decodedEmail)) {
        console.log('Authenticated admin detected, skipping all customer redirects.');
        return;
      }
      // Only skip redirect logic for admin pages
      const isAdminPage = pathname.startsWith('/admin');
      if (isAdminPage) {
        console.log('On admin page, no redirection needed.');
        return;
      }

      // Case 1: No customer ID exists in local storage.
      if (!customerId) {
        // Do NOT redirect if on /evento-especial
        if (pathname === '/evento-especial') {
          console.log('No customer ID found on /evento-especial, but no redirect needed.');
          return;
        }
        console.log('No customer ID found, redirecting to landing page.');
        // Redirect to the correct event landing page
        let eventLanding = '/kusam';
        if (pathname.startsWith('/saltillo')) eventLanding = '/saltillo';
        else if (pathname.startsWith('/vasconcelos')) eventLanding = '/vasconcelos';
        const redirectPath = `${eventLanding}?redirect_from=${encodeURIComponent(pathname)}&${searchParams.toString()}`;
        router.push(redirectPath);
        return;
      }

      // Case 2: Customer ID exists, check if their profile is complete.
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

      console.log('[CustomerIdInitializer] Customer data:', customer);
      
      // Helper function to check if customer name is anonymous
      const isAnonymousName = (name: string | null | undefined): boolean => {
        if (!name) return true;
        return name.startsWith('Visitante Anónimo');
      };
      
      // Consider customer confirmed if they have a real name (not anonymous), whatsapp, and email is either empty or not a temp email
      const isAnonymous = !customer || isAnonymousName(customer.name) || !customer.whatsapp || (customer.email && customer.email.endsWith('@temp.com'));
      console.log('[CustomerIdInitializer] isAnonymous:', isAnonymous, 'pathname:', pathname);

      // If customer is NOT anonymous, mark them as verified in sessionStorage
      if (!isAnonymous && customerId) {
        const sessionKey = `customer_verified_${customerId}`;
        sessionStorage.setItem(sessionKey, 'true');
        console.log('[CustomerIdInitializer] Customer verified and marked in session.');
      }

      // If on /evento-especial and customer is confirmed, redirect to event catalog
      if (pathname === '/evento-especial' && !isAnonymous) {
        console.log('[CustomerIdInitializer] Redirecting to /kusam/catalogo');
        router.push('/kusam/catalogo');
        return;
      }

      // If the user has a customer ID but is still considered anonymous, redirect them.
      if (isAnonymous) {
        // Do NOT redirect if on /evento-especial
        if (pathname === '/evento-especial') {
          console.log('Customer is anonymous on /evento-especial, no redirect.');
          return;
        }
        console.log('Customer is anonymous, redirecting to landing page for signup.');
        let eventLanding = '/kusam';
        if (pathname.startsWith('/saltillo')) eventLanding = '/saltillo';
        else if (pathname.startsWith('/vasconcelos')) eventLanding = '/vasconcelos';
        const redirectPath = `${eventLanding}?redirect_from=${encodeURIComponent(pathname)}&${searchParams.toString()}`;
        router.push(redirectPath);
      }
    };

    checkCustomerStatusAndRedirect();
  }, [searchParams, pathname, router]);

  return null;
}