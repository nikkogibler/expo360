'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ArrowRight, Eye, EyeOff, Layers, Lock, Mail, Users, Zap } from 'lucide-react';

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

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 85, damping: 18 },
  },
};

const features = [
  { icon: Layers, label: 'Páginas de evento personalizadas' },
  { icon: Users, label: 'Gestión de leads y prospectos' },
  { icon: Zap, label: 'Catálogos y publicación en tiempo real' },
];

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
      variants={container}
      className="relative min-h-dvh overflow-hidden bg-[#08071a] text-white"
    >
      {/* Ambient depth blobs — pointer-events-none, fixed to avoid scroll repaint */}
      <div className="pointer-events-none fixed inset-0" aria-hidden>
        <div className="absolute -left-32 -top-32 h-[680px] w-[680px] rounded-full bg-purple-700/20 blur-[160px]" />
        <div className="absolute -bottom-24 right-0 h-[560px] w-[560px] rounded-full bg-indigo-600/15 blur-[130px]" />
        <div className="absolute left-[38%] top-[30%] h-80 w-80 rounded-full bg-violet-500/8 blur-[90px]" />
      </div>

      {/* Fine dot grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.065) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
        aria-hidden
      />

      {/* Radial vignette to frame the content */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(8,7,26,0.75) 100%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-dvh w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_440px] lg:gap-20 lg:px-10">

        {/* ── Left: Brand + Copy ── */}
        <motion.section
          variants={fadeUp}
          className="flex flex-col items-center text-center md:items-start md:text-left"
        >
          <div className="inline-flex items-center gap-2.5 rounded-full border border-purple-400/20 bg-purple-500/11 px-4 py-1.5">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-300" />
            </span>
            <span className="text-[10.5px] font-semibold uppercase tracking-[0.22em] text-purple-200/75">
              Acceso privado
            </span>
          </div>

          <h1 className="mt-7 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-white md:text-[3rem] lg:text-[3.5rem]">
            Tu plataforma<br />
            <span className="text-purple-300">de eventos</span>,<br />
            en un solo lugar.
          </h1>

          <p className="mt-5 max-w-[320px] text-[0.9rem] leading-relaxed text-white/40">
            Gestiona páginas de eventos, productos, leads y publicación desde un panel unificado.
          </p>

          <ul className="mt-9 flex flex-col gap-3.5">
            {features.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/7 bg-white/4">
                  <Icon className="h-3.5 w-3.5 text-purple-300/70" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-white/40">{label}</span>
              </li>
            ))}
          </ul>
        </motion.section>

        {/* ── Right: Form card ── */}
        <motion.section
          variants={fadeUp}
          className="mx-auto w-full max-w-[440px] rounded-2xl border border-white/8 bg-white/4 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_48px_96px_-24px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
        >
          <div className="flex flex-col items-center gap-3 pb-2">
            <Link href="/" className="inline-flex">
              <img
                src="/expo360_logo.png"
                alt="Expo360"
                className="h-40 w-auto object-contain drop-shadow-[0_4px_28px_rgba(139,92,246,0.55)]"
              />
            </Link>
            <div>
              <p className="text-center text-[10.5px] font-semibold uppercase tracking-[0.22em] text-purple-300/55">
                Acceso seguro
              </p>
              <h2 className="mt-1.5 text-center text-[1.5rem] font-semibold tracking-tight text-white">
                Iniciar sesión
              </h2>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" data-testid="signin-form">
            {error ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-red-400/20 bg-red-500/8 px-4 py-3 text-sm text-red-200/80"
                data-testid="signin-error"
              >
                {error}
              </motion.div>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="email-field" className="block text-[0.8rem] font-medium text-white/50">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/22"
                  strokeWidth={1.5}
                />
                <input
                  id="email-field"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                  data-testid="signin-email"
                  className="h-11 w-full rounded-xl border border-white/7 bg-white/6 pl-10 pr-4 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/18 focus:border-purple-400/40 focus:bg-white/9 focus:ring-2 focus:ring-purple-400/12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password-field" className="block text-[0.8rem] font-medium text-white/50">
                Contraseña
              </label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/22"
                  strokeWidth={1.5}
                />
                <input
                  id="password-field"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  data-testid="signin-password"
                  className="h-11 w-full rounded-xl border border-white/7 bg-white/6 pl-10 pr-12 text-sm text-white outline-none transition-all duration-200 placeholder:text-white/18 focus:border-purple-400/40 focus:bg-white/9 focus:ring-2 focus:ring-purple-400/12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/22 transition-all hover:bg-white/[0.07] hover:text-white/55"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.5} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              data-testid="signin-submit"
              className="group mt-2 inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-purple-600 px-5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_24px_-4px_rgba(124,58,237,0.6)] transition-all duration-200 hover:bg-purple-500 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_28px_-4px_rgba(124,58,237,0.7)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <span>{isLoading ? 'Entrando...' : 'Entrar'}</span>
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </button>
          </form>

          <div className="mt-7 border-t border-white/6 pt-5">
            <p className="text-[0.75rem] leading-relaxed text-white/22">
              Solo para administradores y cuentas Studio con acceso por invitación.
            </p>
          </div>
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
