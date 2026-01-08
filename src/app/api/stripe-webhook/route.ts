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
        
        // Determine purchase type from metadata
        const purchaseType = session.metadata?.type || 'credits';
        const customerEmail = session.customer_details?.email;

        if (!customerEmail) {
          console.error('No customer email found in checkout session');
          return NextResponse.json(
            { error: 'No customer email found' },
            { status: 400 }
          );
        }

        // Find the user by email
        const { data: userData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          return NextResponse.json(
            { error: 'Failed to fetch user data' },
            { status: 500 }
          );
        }

        const targetUser = userData.users.find((u) => u.email === customerEmail);
        
        if (!targetUser) {
          console.error('User not found for email:', customerEmail);
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        // Handle EVENT PASS purchase
        if (purchaseType === 'event_pass') {
          const passId = session.metadata?.passId;
          const passName = session.metadata?.passName;
          const billingType = session.metadata?.billingType;
          
          console.log(`Processing event pass purchase: ${passName} (${passId}) for ${customerEmail}`);

          // Find the user's client
          const { data: userClient, error: clientError } = await supabaseAdmin
            .from('user_clients')
            .select('client_id')
            .eq('user_id', targetUser.id)
            .maybeSingle();

          if (clientError || !userClient) {
            console.error('Error finding user client:', clientError);
            return NextResponse.json(
              { error: 'User client not found' },
              { status: 404 }
            );
          }

          // Calculate subscription end date
          let subscriptionEndDate: string;
          if (passId === 'single-event') {
            // 60 days for single event
            subscriptionEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
          } else {
            // 12 months for yearly plans
            subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
          }

          // Update client subscription status
          const { error: updateError } = await supabaseAdmin
            .from('clients')
            .update({
              subscription_status: 'active',
              subscription_end_date: subscriptionEndDate,
              trial_status: 'upgraded',
              upgraded_at: new Date().toISOString(),
            })
            .eq('id', userClient.client_id);

          if (updateError) {
            console.error('Error updating client subscription:', updateError);
            return NextResponse.json(
              { error: 'Failed to update subscription status' },
              { status: 500 }
            );
          }

          console.log(`Successfully activated ${passName} for client ${userClient.client_id}. Expires: ${subscriptionEndDate}`);
          break;
        }

        // Handle CREDITS purchase (legacy)
        const credits = parseInt(session.metadata?.credits || '0');
        const packageName = session.metadata?.packageName;

        if (!credits) {
          console.error('No credits found in session metadata');
          return NextResponse.json(
            { error: 'Invalid credits in metadata' },
            { status: 400 }
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

      // Handle subscription events (for monthly billing)
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only process subscription invoices (not one-time payments)
        // @ts-expect-error - Stripe API version mismatch
        if (invoice.subscription || invoice.billing_reason === 'subscription_cycle') {
          const customerEmail = invoice.customer_email;
          console.log(`Subscription payment received for ${customerEmail}`);
          // The subscription stays active, no action needed
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log(`Subscription cancelled: ${subscription.id}`);
        
        // Find user and deactivate their subscription
        // This would require storing stripe_customer_id in your database
        // For now, just log it - manual intervention may be needed
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