// src/components/CustomerIdInitializer.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function CustomerIdInitializer() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const initialize = async () => {
            // Skip initialization on client preview routes and admin routes
            if (pathname?.startsWith('/c/') || pathname?.startsWith('/admin')) {
                return;
            }

            const customerId = localStorage.getItem('customer_id');
            const sourceQrCode = searchParams.get('source_qr_code');
            const clearSession = searchParams.get('clear_session');

            if (clearSession === 'true') {
                localStorage.removeItem('customer_id');
                // Do not redirect to root, just clear and let the page handle the rest
                // router.push('/'); 
                return;
            }

            if (customerId) {
                // If a customer ID exists, we might not need to do anything here
                // unless we want to validate it or fetch data.
                // For now, we assume it's valid.
                return;
            }

            if (sourceQrCode) {
                try {
                    const { data, error } = await supabase
                        .from('customers')
                        .insert({ landing_source: sourceQrCode })
                        .select()
                        .single();

                    if (error) throw error;

                    localStorage.setItem('customer_id', data.id);
                    router.push(`/main/catalogo?customer_id=${data.id}`);
                } catch (error) {
                    console.error('Error creating customer from QR code:', error);
                }
                return;
            }

            // This part handles redirection for specific events, like 'evento-especial'
            const eventParam = searchParams.get('event');
            if (eventParam) {
                let eventLanding = '/main';
                if (eventParam === 'evento-especial') {
                    eventLanding = '/evento-especial';
                }
                router.push(eventLanding);
                return;
            }

            // If no customer ID, no QR code, and no event, we might want to
            // create a new anonymous customer or redirect to a landing page.
            // Let's create an anonymous customer.
            try {
                const { data, error } = await supabase
                    .from('customers')
                    .insert({ name: `Visitante Anónimo ${uuidv4()}` })
                    .select()
                    .single();

                if (error) throw error;

                localStorage.setItem('customer_id', data.id);
                // Decide where to redirect anonymous users.
                // Redirecting to the main page might be a good default.
                // router.push(`/main/catalogo?customer_id=${data.id}`);

            } catch (error) {
                console.error('Error creating anonymous customer:', error);
            }
        };

        initialize();
    }, [router, searchParams]);

    return null;
}