"use client";

import React, { useEffect } from "react";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/utils/supabase';

export default function EventoEspecialLanding() {
  const router = useRouter();

  useEffect(() => {
    // Create anonymous customer immediately on landing
    const initializeCustomer = async () => {
      // Check if customer already exists
      let customerId = localStorage.getItem('kusam_customer_id');
      
      if (!customerId) {
        // Generate new customer ID
        customerId = uuidv4();
        localStorage.setItem('kusam_customer_id', customerId);
        console.log('[EventoEspecial] Generated new customer ID:', customerId);
        
        // Create anonymous customer in database
        try {
          const { error } = await supabase
            .from('customers')
            .insert({
              customer_id: customerId,
              email: `${customerId}@temp.com`,
              name: 'Visitante Anónimo Evento Especial',
              landing_source: 'Evento Especial'
            });
          
          if (error) {
            console.error('[EventoEspecial] Error creating customer:', error);
          } else {
            console.log('[EventoEspecial] Created anonymous customer with Evento Especial attribution');
          }
        } catch (err) {
          console.error('[EventoEspecial] Exception creating customer:', err);
        }
      } else {
        console.log('[EventoEspecial] Using existing customer ID:', customerId);
      }
    };
    
    initializeCustomer();
    
    // Hold for 3 seconds, then redirect
    const timer = setTimeout(() => {
      router.replace('/kusam/catalogo?from=evento-especial');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center bg-white">
      {/* Full-page hero image with responsive sizes */}
      <div className="relative w-full h-full max-h-screen flex items-center justify-center p-4">
        <Image
          src="/kusam_ad_16_9_optimized.webp"
          alt="Evento Especial Kusam"
          width={1920}
          height={1080}
          priority
          quality={90}
          className="hero-image"
          style={{
            opacity: 0,
            animation: 'fadeInFromWhite 3s ease-in-out forwards'
          }}
        />
      </div>
      
      <style jsx global>{`
        .hero-image {
          width: auto;
          height: auto;
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
        }
        
        @keyframes fadeInFromWhite {
          0% {
            opacity: 0;
            filter: brightness(5);
          }
          100% {
            opacity: 1;
            filter: brightness(1);
          }
        }
        
        /* Mobile optimization - use smaller image */
        @media (max-width: 768px) {
          .hero-image {
            max-width: 98vw;
            max-height: 98vh;
          }
        }
      `}</style>
    </div>
  );
}
