import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export interface ClientData {
  id: string;
  name: string;
  slug: string;
  logo_path?: string;
  trial_status?: string;
}

export function useUserClient() {
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    async function fetchClient() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Get the client mapping for this user
        const { data: userClient, error: mapError } = await supabase
          .from('user_clients')
          .select('client_id')
          .eq('user_id', user.id)
          .single();

        if (mapError) throw mapError;
        if (!userClient) {
            // No client found for user
            setLoading(false);
            return;
        }

        // Get the client details
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', userClient.client_id)
          .single();

        if (clientError) throw clientError;

        setClient(clientData);
      } catch (err: any) {
        console.error('Error fetching user client:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClient();
  }, [supabase]);

  return { client, loading, error };
}
