'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';

import { getFirebaseClientAuth } from '@/lib/firebase/client';

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}

function getSignInMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === 'auth/operation-not-allowed') {
      return 'Firebase Email/Password sign-in is disabled. Enable it in Firebase Authentication > Sign-in method, then try again.';
    }

    if (error.code === 'auth/invalid-credential') {
      return 'Firebase rejected this email/password. I reset the seeded dev credentials to fixed passwords; run npm run seed:firebase again and use the new password.';
    }

    if (error.code === 'auth/network-request-failed') {
      return 'Firebase Auth could not be reached from the browser. Check your network and Firebase project config.';
    }

    return `${error.message} (${error.code})`;
  }

  return 'Unable to sign in. Check the Firebase Auth setup and try again.';
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const auth = getFirebaseClientAuth();
      const credential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );
      const idToken = await credential.user.getIdToken();
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to sign in.');
        return;
      }

      router.push(safeNextPath(searchParams.get('next')) || result.redirectTo || '/studio');
      router.refresh();
    } catch (signinError) {
      console.error('Firebase sign-in error:', signinError);
      setError(getSignInMessage(signinError));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#071014] text-white">
      <div className="absolute inset-0 bg-[url('/admin/interzekt_dashboard_background.png')] bg-cover bg-center opacity-45" />
      <div className="absolute inset-0 bg-[#071014]/75" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 lg:grid-cols-[1fr_410px] lg:px-8">
        <section className="hidden max-w-2xl lg:block">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/expo360_logo.png" alt="Expo360" className="h-20 w-auto" />
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.22em] text-[#f4c15d]">
            Interzekt Console
          </p>
          <h1 className="mt-4 text-5xl font-semibold leading-tight">
            Expo360
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/72">
            Master admin and SMB Studio access for event landing pages.
          </p>
        </section>

        <section className="mx-auto w-full max-w-[410px] rounded-lg border border-white/15 bg-white/[0.08] p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <img src="/expo360_logo.png" alt="Expo360" className="h-16 w-auto lg:hidden" />
            <div className="hidden lg:block">
              <p className="text-sm font-medium text-[#f4c15d]">Secure access</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Sign in</h2>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-white/10">
              <ShieldCheck className="h-5 w-5 text-[#f4c15d]" />
            </div>
          </div>

          <div className="mt-4 lg:hidden">
            <p className="text-sm font-medium text-[#f4c15d]">Secure access</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Sign in</h2>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" data-testid="signin-form">
            {error ? (
              <div className="rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm leading-6 text-red-100" data-testid="signin-error">
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-white/80">Email</span>
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  data-testid="signin-email"
                  className="h-11 w-full rounded-md border border-white/15 bg-white/10 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f4c15d] focus:ring-2 focus:ring-[#f4c15d]/20"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-white/80">Password</span>
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  data-testid="signin-password"
                  className="h-11 w-full rounded-md border border-white/15 bg-white/10 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#f4c15d] focus:ring-2 focus:ring-[#f4c15d]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              data-testid="signin-submit"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#f4c15d] px-4 text-sm font-semibold text-[#101820] transition hover:bg-[#ffd879] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-white/55">
            Invite-only access for Interzekt admins and SMB Studio accounts.
          </p>
        </section>
      </div>
    </main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
