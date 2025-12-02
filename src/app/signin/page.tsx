'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, Eye, EyeOff, Github, Chrome } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Add your authentication logic here
      console.log('Sign in attempt:', { email, password });
      // For now, just show a message
      setError('Sign-in functionality coming soon. Contact info0@interzekt.com');
    } catch (err) {
      setError('An error occurred during sign-in');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-purple-900 to-slate-900"></div>

      {/* Animated background elements */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
        animate={{
          x: [0, -50, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-grid-pattern"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="w-full max-w-sm"
        >
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
              <motion.div variants={itemVariants}>
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

              {/* Remember me and forgot password */}
              <motion.div
                variants={itemVariants}
                className="flex items-center justify-between text-xs"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer" />
                  <span className="text-gray-300">Recuérdame</span>
                </label>
                <a href="#" className="text-purple-400 hover:text-purple-300 transition">
                  ¿Olvidaste tu contraseña?
                </a>
              </motion.div>

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm"
                >
                  {error}
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={isLoading}
                className="w-full py-2 bg-linear-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:shadow-2xl hover:shadow-purple-600/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group text-sm"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <motion.div
              variants={itemVariants}
              className="my-0.5 flex items-center gap-2"
            >
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="text-gray-400 text-xs">O</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </motion.div>

            {/* Social buttons */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-1.5"
            >
              <button className="flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-300 group">
                <Chrome className="w-3 h-3" />
                <span className="text-xs font-semibold hidden sm:inline">Google</span>
              </button>
              <button className="flex items-center justify-center gap-1 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-all duration-300 group">
                <Github className="w-3 h-3" />
                <span className="text-xs font-semibold hidden sm:inline">GitHub</span>
              </button>
            </motion.div>

            {/* Sign up link */}
            <motion.p
              variants={itemVariants}
              className="text-center mt-0.5 text-gray-300 text-xs"
            >
              ¿No tienes cuenta?{' '}
              <Link
                href="/"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Regístrate
              </Link>
            </motion.p>

            {/* Back to home */}
            <motion.div
              variants={itemVariants}
              className="mt-0.5 pt-0.5 border-t border-white/10 text-center"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-xs"
              >
                ← Volver al inicio
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
