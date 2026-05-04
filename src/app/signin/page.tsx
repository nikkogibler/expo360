'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
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
      return 'El acceso con correo y contraseña está desactivado en Firebase. Actívalo en Authentication > Sign-in method e intenta de nuevo.';
    }

    if (error.code === 'auth/invalid-credential') {
      return 'El correo o la contraseña no coinciden. Revisa tus datos e intenta de nuevo.';
    }

    if (error.code === 'auth/network-request-failed') {
      return 'No pudimos conectar con Firebase Auth. Revisa tu conexión y la configuración del proyecto.';
    }

    return `${error.message} (${error.code})`;
  }

  return 'No pudimos iniciar sesión. Revisa la configuración de Firebase Auth e intenta de nuevo.';
}

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0 },
};

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
        setError(result.error || 'No pudimos iniciar sesión.');
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
    <motion.main
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.08 }}
      className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 text-white"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="absolute inset-0 bg-grid-pattern"
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(168,85,247,0.28),transparent_32%),radial-gradient(circle_at_82%_76%,rgba(59,130,246,0.22),transparent_34%)]" />
      <div className="absolute inset-0 bg-slate-950/20" />

      <div className="relative mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-5 py-8 lg:grid-cols-[1fr_420px] lg:px-8">
        <motion.section
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
        >
          <Link href="/" className="inline-flex justify-center lg:justify-start">
            <img src="/expo360_logo.png" alt="Expo360" className="h-28 w-auto object-contain sm:h-32 lg:h-40" />
          </Link>
          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.2em] text-purple-200">
            Acceso privado
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
            Entra a tu plataforma de eventos.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-gray-300 lg:max-w-2xl">
            Administra páginas de evento, productos, prospectos y publicación desde un solo lugar.
          </p>
        </motion.section>

        <motion.section
          variants={fadeUp}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.08 }}
          className="mx-auto w-full max-w-[420px] rounded-lg border border-purple-300/25 bg-white/[0.09] p-6 shadow-2xl shadow-purple-950/35 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="hidden lg:block">
              <p className="text-sm font-semibold text-purple-200">Acceso seguro</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Iniciar sesión</h2>
            </div>
            <div className="lg:hidden">
              <p className="text-sm font-semibold text-purple-200">Acceso seguro</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Iniciar sesión</h2>
            </div>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-purple-300/25 bg-white/10">
              <ShieldCheck className="h-5 w-5 text-purple-200" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5" data-testid="signin-form">
            {error ? (
              <div className="rounded-md border border-red-400/35 bg-red-500/15 px-3 py-2 text-sm leading-6 text-red-100" data-testid="signin-error">
                {error}
              </div>
            ) : null}

            <label className="block">
              <span className="text-sm font-medium text-gray-200">Correo electrónico</span>
              <span className="relative mt-2 block">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  data-testid="signin-email"
                  className="h-11 w-full rounded-md border border-purple-200/20 bg-white/10 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-300 focus:ring-2 focus:ring-purple-400/25"
                />
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-200">Contraseña</span>
              <span className="relative mt-2 block">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-purple-200/70" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  data-testid="signin-password"
                  className="h-11 w-full rounded-md border border-purple-200/20 bg-white/10 pl-10 pr-11 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-purple-300 focus:ring-2 focus:ring-purple-400/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
              className="group relative inline-flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-md bg-linear-to-r from-purple-600 to-blue-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:shadow-purple-600/50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="relative z-10">{isLoading ? 'Entrando...' : 'Entrar'}</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition group-hover:translate-x-0.5" />
              <span className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 opacity-0 transition group-hover:opacity-100" />
            </button>
          </form>

          <p className="mt-6 text-sm leading-6 text-gray-300">
            Acceso por invitación para administradores y cuentas de Studio.
          </p>
        </motion.section>
      </div>
    </motion.main>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
