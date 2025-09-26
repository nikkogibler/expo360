import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CREDIT_PACKAGES } from '@/config/creditPackages';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

export async function POST(request: NextRequest) {
  try {
    const { priceId, credits, packageName } = await request.json();

    // Validate the price ID exists in our configuration
    const validPackage = CREDIT_PACKAGES.find(pkg => pkg.priceId === priceId);
    if (!validPackage) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Verify credits match the package
    if (validPackage.credits !== credits) {
      return NextResponse.json(
        { error: 'Credits mismatch for selected package' },
        { status: 400 }
      );
    }

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
        credits: credits.toString(),
        packageName,
        packageId: validPackage.id,
      },
      // Optional: Customer email for receipt
      // customer_email: userEmail, // We could get this from auth if needed
      allow_promotion_codes: true,
      billing_address_collection: 'required',
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}