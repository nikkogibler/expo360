import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getFirebaseAdminAuth, getFirebaseAdminDb } from '@/lib/firebase/admin';
import { FIREBASE_SESSION_COOKIE } from '@/lib/expo360/session-cookie';
import type { Expo360Role, UserContext } from '@/lib/expo360/types';

export function getPlatformAdminEmails() {
  const configured = process.env.PLATFORM_ADMIN_EMAILS || 'nikkogibler@gmail.com';

  return configured
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getCurrentUserContext(): Promise<UserContext | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(FIREBASE_SESSION_COOKIE)?.value;

  if (!sessionCookie) return null;

  try {
    const decoded = await getFirebaseAdminAuth().verifySessionCookie(
      sessionCookie,
      true
    );
    const email = decoded.email?.toLowerCase();

    if (!email) return null;

    const userDoc = await getFirebaseAdminDb()
      .collection('users')
      .doc(decoded.uid)
      .get();
    const userData = userDoc.exists ? userDoc.data() : undefined;
    const platformAdminEmails = getPlatformAdminEmails();
    const isPlatformAdmin = platformAdminEmails.includes(email);
    const role = (isPlatformAdmin
      ? 'interzekt_admin'
      : userData?.role) as Expo360Role | undefined;

    if (role !== 'interzekt_admin' && role !== 'smb_admin') return null;

    return {
      uid: decoded.uid,
      email,
      displayName:
        typeof userData?.displayName === 'string'
          ? userData.displayName
          : decoded.name,
      role,
      clientId:
        typeof userData?.clientId === 'string'
          ? userData.clientId
          : undefined,
    };
  } catch {
    return null;
  }
}

export async function requireUserContext(allowedRoles?: Expo360Role[]) {
  const user = await getCurrentUserContext();

  if (!user) {
    redirect('/signin');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    redirect(user.role === 'interzekt_admin' ? '/admin' : '/studio');
  }

  return user;
}
