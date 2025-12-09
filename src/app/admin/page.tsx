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

  const backgroundConfig = client?.theme?.backgroundConfig;
  const legacyColor = client?.theme?.dashboardBgColor;
  
  let backgroundImage = "url('/vine_2b.png')";
  let backgroundSize = '400px 400px';
  let backgroundRepeat = 'repeat';
  
  if (backgroundConfig) {
    if (backgroundConfig.type === 'solid' && backgroundConfig.colors?.[0]) {
      const color = backgroundConfig.colors[0];
      backgroundImage = `linear-gradient(${color}E6, ${color}E6), url('/vine_2b.png')`;
      backgroundSize = 'cover, 400px 400px';
      backgroundRepeat = 'no-repeat, repeat';
    } else if (backgroundConfig.type === 'gradient' && backgroundConfig.colors?.length > 0) {
      const direction = backgroundConfig.direction || 'to bottom';
      const colors = backgroundConfig.colors.map((c: string) => `${c}E6`).join(', ');
      backgroundImage = `linear-gradient(${direction}, ${colors}), url('/vine_2b.png')`;
      backgroundSize = 'cover, 400px 400px';
      backgroundRepeat = 'no-repeat, repeat';
    }
  } else if (legacyColor) {
    backgroundImage = `linear-gradient(${legacyColor}E6, ${legacyColor}E6), url('/vine_2b.png')`;
    backgroundSize = 'cover, 400px 400px';
    backgroundRepeat = 'no-repeat, repeat';
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage,
        backgroundRepeat,
        backgroundSize,
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed', // Keeps background fixed during scroll
      }}
    >
      <MagicBento client={client} logoUrl={logoUrl} />
      <LogoOnboarding client={client} />
    </div>
  );
}
