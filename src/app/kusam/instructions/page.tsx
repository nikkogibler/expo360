'use client';

import { motion, Variants, Transition } from 'framer-motion'; // Import Variants and Transition types
import Image from 'next/image';
import Link from 'next/link'; // Import Link for navigation

export default function KusamInstructionsPage() {
  // Explicitly type containerVariants as Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring", // This is correctly inferred as 'spring' literal now
        stiffness: 100,
        damping: 10,
        delay: 0.2
      } as Transition // Explicitly cast the transition object to Framer Motion's Transition type
    },
  };

  return (
    // Main container with white background
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/leaves1.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.1 }}
      />

      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6">
          <Image
            src="/kusam_main.webp"
            alt="Kusam Outdoor Solutions Logo"
            width={180}
            height={45}
            priority
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Gracias por Conectarte!
        </h1>
        <p className="text-gray-700 text-lg mb-6">
          Comienza a explorar el mobiliario de Kusam.
        </p>

        <p className="text-gray-800 font-semibold text-xl mb-4">
          Simplemente:
        </p>
        <div className="mb-8 p-4 bg-stone-100 rounded-md">
          <p className="text-gray-700 text-lg mb-3">
            1. Usa la cámara de tu smartphone para escanear los Códigos QR sobre cada pieza de mobiliario.
          </p>
          <p className="text-gray-700 text-lg">
            2. Haz click sobre &quot;Me Interesa&quot; en la página de cada producto para añadirlo a tu lista de favoritos.
          </p>
        </div>

        {/* Placeholder for an image or animation showing scanning a QR */}
        <div className="mb-8">
          <Image
            src="/qrcode_icon.svg"
            alt="Scan QR code example"
            width={150}
            height={150}
            className="mx-auto opacity-70"
          />
          <p className="text-sm text-gray-500 mt-2">
          </p>
        </div>

        <Link href="/kusam/cart" passHref>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-semibold bg-stone-400 text-white hover:bg-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
            style={{
              backgroundImage: `url('/wood/var4.png')`,
              backgroundSize: '100px 100px',
              backgroundRepeat: 'repeat',
            }}
          >
            Ir A Mis Favoritos
          </motion.button>
        </Link>
        <p className="text-xs text-gray-500 mt-3">
        </p>
      </motion.div>
    </div>
  );
}