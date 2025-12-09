import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/onboarding/create-trial
 * 
 * Trial Model Onboarding:
 * 1. Creates client with trial status and 30-day expiry
 * 2. Creates admin user in Supabase Auth
 * 3. Maps user to client (user_clients)
 * 4. Creates one "expo event" for the trial
 * 5. Returns redirect to admin dashboard
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract form fields
    const { companyName, email, password, contactName, phone, locationName } = body;

    // Validate required fields
    if (!companyName || !email || !password || !contactName || !phone || !locationName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
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

    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        display_name: contactName,
        phone: phone,
      },
    });

    if (authError || !authData.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: `Failed to create user: ${authError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Step 2: Create client record with trial status
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30 days from now

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .insert({
        id: crypto.randomUUID().toString(),
        slug: `${companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`, // Unique slug
        name: companyName,
        trial_status: 'active',
        trial_end_date: trialEndDate.toISOString(),
        metadata: {
          contact_name: contactName,
          phone: phone,
          trial_location: locationName,
          created_at: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (clientError || !clientData) {
      console.error('Client creation error:', clientError);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to create client: ${clientError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    const clientId = clientData.id;

    // Step 3: Create user_client mapping
    const { error: mappingError } = await supabase
      .from('user_clients')
      .insert({
        user_id: userId,
        client_id: clientId,
      });

    if (mappingError) {
      console.error('User-client mapping error:', mappingError);
      await supabase.from('clients').delete().eq('id', clientId);
      await supabase.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Failed to set up user access: ${mappingError.message}` },
        { status: 500 }
      );
    }

    // Step 4: Create default expo/event for trial
    // This is the ONE expo landing page the trial client gets
    // We check if the table exists first by trying to select from it, or just try insert and ignore error if table missing
    // But for now we assume it exists or we handle the error gracefully
    
    let expoId = null;
    
    try {
        const { data: expoData, error: expoError } = await supabase
        .from('expos') 
        .insert({
            id: crypto.randomUUID().toString(),
            client_id: clientId,
            name: `${locationName} - Trial Event`,
            location: locationName,
            status: 'active',
            trial_expo: true, 
            metadata: {
            created_at: new Date().toISOString(),
            trial: true,
            },
        })
        .select()
        .single();
        
        if (!expoError && expoData) {
            expoId = expoData.id;
        } else {
            console.warn('Expo creation failed (table might be missing):', expoError);
        }
    } catch (e) {
        console.warn('Expo creation skipped:', e);
    }

    // Success response
    return NextResponse.json(
      {
        success: true,
        clientId: clientId,
        userId: userId,
        expoId: expoId,
        trialEndDate: trialEndDate.toISOString(),
        message: 'Trial workspace created successfully',
        redirectUrl: `/admin?client=${clientId}&expo=${expoId || 'new'}&trial=true`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Onboarding failed. Please try again.' },
      { status: 500 }
    );
  }
}
