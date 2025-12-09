import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/set-email
 * Sets the user_email cookie after successful sign-in
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    // Set user_email cookie (expires in 7 days)
    response.cookies.set({
      name: 'user_email',
      value: email,
      httpOnly: false, // Accessible from client (needed for some checks)
      secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Set email error:', error);
    return NextResponse.json(
      { error: 'Failed to set email' },
      { status: 500 }
    );
  }
}
