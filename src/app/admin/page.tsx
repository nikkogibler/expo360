import MagicBento from '../../components/AdminDashboard';
import LogoOnboarding from '../../components/LogoOnboarding';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export default async function AdminPage() {
  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/signin');
  }

  // Fetch user's client
  const { data: userClient } = await supabase
    .from('user_clients')
    .select('client_id')
    .eq('user_id', user.id)
    .maybeSingle();

  let client = null;
  let logoUrl: string | undefined;

  if (userClient) {
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', userClient.client_id)
      .single();
      
    client = clientData;

    if (client && client.logo_path) {
       // Try to get signed URL first (if bucket is private)
       // Or public URL. The bucket 'expo360-clients-assets' might be private.
       // Since we are authenticated here, we can try signed URL.
       
       const { data: signedData } = await supabase.storage
        .from('expo360-clients-assets')
        .createSignedUrl(client.logo_path, 60 * 60);
        
       if (signedData?.signedUrl) {
         logoUrl = signedData.signedUrl;
       } else {
         // Fallback to public URL
         const { data: publicData } = supabase.storage
          .from('expo360-clients-assets')
          .getPublicUrl(client.logo_path);
         logoUrl = publicData.publicUrl;
       }
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
      }}
    >
      <MagicBento client={client} logoUrl={logoUrl} />
      <LogoOnboarding client={client} />
    </div>
  );
}
