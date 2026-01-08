import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CREDIT_PACKAGES } from '@/config/creditPackages';
import { EVENT_PASSES } from '@/config/eventPasses';

/**
 * Get Stripe client (deferred initialization)
 * Returns null if STRIPE_SECRET_KEY is not configured
 */
function getStripeClient(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-08-27.basil',
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Stripe session - Start');
    
    // Check if Stripe secret key is configured
    const stripe = getStripeClient();
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { priceId, credits, packageName, passId, passName, billingType } = body;
    console.log('Request data:', body);

    // Check if this is an event pass purchase
    const isEventPass = !!passId;
    
    if (isEventPass) {
      // Validate the event pass
      const validPass = EVENT_PASSES.find(p => p.priceId === priceId);
      if (!validPass) {
        console.error('Invalid event pass price ID:', priceId);
        return NextResponse.json(
          { error: 'Invalid event pass' },
          { status: 400 }
        );
      }

      const isRecurring = billingType === 'recurring';
      
      console.log('Creating Stripe checkout session for event pass...');
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: isRecurring ? 'subscription' : 'payment',
        success_url: `${request.nextUrl.origin}/admin/purchase-result?purchase=success&type=event_pass&passId=${passId}`,
        cancel_url: `${request.nextUrl.origin}/admin/purchase-result?purchase=cancelled`,
        metadata: {
          type: 'event_pass',
          passId: validPass.id,
          passName: validPass.name,
          billingType: billingType || 'one-time',
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      console.log('Stripe session created successfully for event pass:', session.id);
      return NextResponse.json({ url: session.url });
    }

    // Legacy: Credit package purchase
    // Validate the price ID exists in our configuration
    const validPackage = CREDIT_PACKAGES.find(pkg => pkg.priceId === priceId);
    if (!validPackage) {
      console.error('Invalid price ID:', priceId);
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Verify credits match the package
    if (validPackage.credits !== credits) {
      console.error('Credits mismatch:', { expected: validPackage.credits, received: credits });
      return NextResponse.json(
        { error: 'Credits mismatch for selected package' },
        { status: 400 }
      );
    }

    console.log('Creating Stripe checkout session for credits...');
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.nextUrl.origin}/admin/purchase-result?purchase=success&credits=${credits}`,
      cancel_url: `${request.nextUrl.origin}/admin/purchase-result?purchase=cancelled`,
      metadata: {
        type: 'credits',
        credits: credits.toString(),
        packageName,
        packageId: validPackage.id,
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    console.log('Stripe session created successfully:', session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}