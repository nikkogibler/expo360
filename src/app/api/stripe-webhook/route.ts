import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../../../lib/supabaseAdmin';

function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: '2025-08-27.basil' });
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  const stripe = getStripeClient();
  
  if (!stripe || !webhookSecret) {
    console.error('Stripe is not configured for webhook processing');
    return NextResponse.json(
      { error: 'Stripe webhook not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Extract metadata
        const credits = parseInt(session.metadata?.credits || '0');
        const packageName = session.metadata?.packageName;

        if (!credits) {
          console.error('No credits found in session metadata');
          return NextResponse.json(
            { error: 'Invalid credits in metadata' },
            { status: 400 }
          );
        }

        // Add credits to the database
        // Note: You'll need to determine how to identify the user
        // This could be done through customer_email or by storing user_id in metadata
        const customerEmail = session.customer_details?.email;
        
        if (!customerEmail) {
          console.error('No customer email found in checkout session');
          return NextResponse.json(
            { error: 'No customer email found' },
            { status: 400 }
          );
        }

        // Find the user by email (you may need to adjust this based on your user table structure)
        const { data: user, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
          );
        }

        const targetUser = user.users.find((u) => u.email === customerEmail);
        
        if (!targetUser) {
          console.error('User not found for email:', customerEmail);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Add credits to the user's account
        const { error: creditError } = await supabaseAdmin
          .from('admin_credits')
          .upsert({
            user_id: targetUser.id,
            total_credits: credits,
            used_credits: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id',
            ignoreDuplicates: false
          });

        // If user exists, update their credits instead
        if (creditError && creditError.code === '23505') { // Unique violation
          const { data: existingCredits, error: fetchError } = await supabaseAdmin
            .from('admin_credits')
            .select('total_credits, used_credits')
            .eq('user_id', targetUser.id)
            .single();

          if (fetchError) {
            console.error('Error fetching existing credits:', fetchError);
            return NextResponse.json(
              { error: 'Failed to fetch existing credits' },
              { status: 500 }
            );
          }

          const { error: updateError } = await supabaseAdmin
            .from('admin_credits')
            .update({
              total_credits: existingCredits.total_credits + credits,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', targetUser.id);

          if (updateError) {
            console.error('Error updating credits:', updateError);
            return NextResponse.json(
              { error: 'Failed to update credits' },
              { status: 500 }
            );
          }
        } else if (creditError) {
          console.error('Error adding credits:', creditError);
          return NextResponse.json(
            { error: 'Failed to add credits' },
            { status: 500 }
          );
        }

        // Log the successful purchase
        console.log(`Successfully added ${credits} credits to user ${customerEmail} for package ${packageName}`);
        
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}