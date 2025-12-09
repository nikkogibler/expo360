'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Github, Chrome, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(searchParams.get('message') === 'account_created' ? 'Account created! Please sign in.' : '');
  const [successMessage, setSuccessMessage] = useState(searchParams.get('message') === 'account_created' ? 'Account created successfully! Please sign in.' : '');

  // Initialize Supabase client
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data.user) {
        // Set the user email cookie for the admin layout to check
        await fetch('/api/auth/set-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.user.email }),
        });
        // Redirect to admin dashboard
        router.push('/admin');
        router.refresh(); // Refresh to update server components with new session
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An unexpected error occurred during sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-sm relative"
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute -top-10 right-0 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Card */}
        <div className="bg-linear-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl">
          {/* Logo and header */}
          <motion.div
            variants={itemVariants}
            className="text-center mb-0 -mt-20"
          >
            <Link href="/" className="inline-block mb-0">
              <img src="/expo360_logo.png" alt="Expo360" className="h-80 mx-auto" />
            </Link>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-1 -mt-20">
              
              {/* Messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg mb-4"
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-500/20 border border-green-500/50 text-green-200 text-xs p-3 rounded-lg mb-4"
                >
                  {successMessage}
                </motion.div>
              )}

              {/* Email Field */}
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Correo
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full pl-12 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm"
                    required
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div variants={itemVariants} className="pt-4">
                <label className="block text-xs font-semibold text-gray-200 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Forgot Password Link */}
              <motion.div variants={itemVariants} className="flex justify-end pt-2">
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-300 hover:text-purple-200 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </motion.div>

              {/* Submit Button */}
              <motion.div variants={itemVariants} className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-linear-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Iniciar Sesión
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </motion.div>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-gray-400">
                O continúa con
              </span>
            </div>
          </motion.div>

          {/* Social Login */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 group">
              <Github className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
            <button className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-200 group">
              <Chrome className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </button>
          </motion.div>

          {/* Sign Up Link */}
          <motion.div variants={itemVariants} className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              ¿No tienes una cuenta?{' '}
              <Link
                href="/onboarding"
                className="text-purple-300 hover:text-purple-200 font-semibold transition-colors"
              >
                Regístrate
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
