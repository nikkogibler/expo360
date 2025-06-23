// src/components/CustomerIdInitializer.tsx
'use client'; // This component MUST be a Client Component

import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function CustomerIdInitializer() {
  useEffect(() => {
    let currentCustomerId = localStorage.getItem('kusam_customer_id');

    if (!currentCustomerId) {
      currentCustomerId = uuidv4();
      localStorage.setItem('kusam_customer_id', currentCustomerId);
      console.log('CustomerIdInitializer: Generated and set a new kusam_customer_id in localStorage:', currentCustomerId);
    } else {
      console.log('CustomerIdInitializer: Found existing kusam_customer_id in localStorage:', currentCustomerId);
    }
  }, []); // Run only once on mount

  // This component doesn't render any UI, it's purely for side effects
  return null;
}