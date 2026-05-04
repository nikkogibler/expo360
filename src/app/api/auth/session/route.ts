import { NextResponse } from 'next/server';

import { getFirebaseAdminAuth, getFirebaseAdminDb } from '@/lib/firebase/admin';
import { getPlatformAdminEmails } from '@/lib/expo360/auth';
import { FIREBASE_SESSION_COOKIE } from '@/lib/expo360/session-cookie';

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };

    if (!idToken) {
      return NextResponse.json({ error: 'Missing Firebase token.' }, { status: 400 });
    }

    const auth = getFirebaseAdminAuth();
    const db = getFirebaseAdminDb();
    const decoded = await auth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Firebase user is missing an email.' }, { status: 403 });
    }

    const userRef = db.collection('users').doc(decoded.uid);
    const userDoc = await userRef.get();
    const platformAdminEmails = getPlatformAdminEmails();
    const isInterzektAdmin = platformAdminEmails.includes(email);

    if (!userDoc.exists && !isInterzektAdmin) {
      return NextResponse.json(
        { error: 'This account is not assigned to an Expo360 workspace yet.' },
        { status: 403 }
      );
    }

    const userData = userDoc.exists ? userDoc.data() : {};
    const role = isInterzektAdmin ? 'interzekt_admin' : userData?.role;

    if (role !== 'interzekt_admin' && role !== 'smb_admin') {
      return NextResponse.json({ error: 'This account does not have access.' }, { status: 403 });
    }

    if (isInterzektAdmin) {
      await userRef.set(
        {
          email,
          displayName: decoded.name || userData?.displayName || email,
          role: 'interzekt_admin',
          updatedAt: new Date(),
        },
        { merge: true }
      );
    }

    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_MAX_AGE_SECONDS * 1000,
    });

    const response = NextResponse.json({
      ok: true,
      role,
      redirectTo: role === 'interzekt_admin' ? '/admin' : '/studio',
    });

    response.cookies.set(FIREBASE_SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Firebase session error:', error);
    return NextResponse.json({ error: 'Unable to create a session.' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });

  response.cookies.set(FIREBASE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
