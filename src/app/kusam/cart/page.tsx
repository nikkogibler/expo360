'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter

// --- CartItemCard Component (unchanged) ---
interface ItemProps {
  id: string;
  name: string;
  imageUrl: string;
  notes: string;
}

interface CartItemCardProps {
  item: ItemProps;
  index: number; // For staggered animation
}

const CartItemCard: React.FC<CartItemCardProps> = ({ item, index }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { delay: index * 0.1, type: 'spring', stiffness: 100 } },
  };

  return (
    <motion.div
      className="bg-white p-4 rounded-lg shadow-md border border-gray-100 flex flex-col items-center text-center"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.05 }} // Pop effect on hover
      transition={{ type: 'spring', stiffness: 300, damping: 10 }} // Smooth hover transition
    >
      <div className="relative w-32 h-32 mb-3"> {/* Fixed size for thumbnails */}
        <Image
          src={item.imageUrl}
          alt={item.name}
          layout="fill" // Makes the image fill the parent div
          objectFit="contain" // Ensures the entire image is visible, scales down if needed
          className="rounded-md"
        />
      </div>
      <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{item.name}</h3> {/* line-clamp for neatness */}
      {item.notes && (
        <p className="text-xs text-gray-600 mt-1 line-clamp-2"> {/* line-clamp for neatness */}
          Notas: {item.notes}
        </p>
      )}
      {/* In a real app, you might have price, quantity, or remove buttons here */}
    </motion.div>
  );
};
// --- End CartItemCard Component ---


// --- ConfirmationModal Component (FINAL FIX: Consistent Leaves Video Background) ---
interface ConfirmationModalProps {
  onClose: () => void;
  onSubmitOrder: () => void; // This will now trigger the navigation
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ onClose, onSubmitOrder }) => {
  const router = useRouter(); // Initialize useRouter

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8 } // For exit animation
  };

  const handleOrderClick = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitOrder(); // Call the passed function, which will handle navigation
  };

  return (
    // MODAL BACKDROP: This div will be the full-screen container for the modal and its background.
    // It's fixed, fills the viewport, centers content, and has no background color itself.
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Background Video: ABSOLUTELY POSITIONED TO FILL THE CONTAINER */}
      <video
        className="absolute inset-0 w-full h-full object-cover" // Removed z-index as it's handled by order/stacking
        src="/leaves1.mp4" // Confirmed leaves video
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.1 }} // Set to subtle 0.1 opacity
      />
      {/* REMOVED: The intermediate overlay div that was causing issues */}
      
      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full relative z-20" // z-20 for modal content
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¡Qué excelente selección!
        </h2>
        <p className="text-gray-700 text-lg mb-6">
          Tu lista ha sido enviada a nuestros asesores.
        </p>
        <p className="text-gray-800 text-lg font-semibold mb-6">
          Completa tu orden **HOY** <br /> y
          recibirás{' '}
          <span className="text-4xl font-extrabold text-green-700 animate-pulse drop-shadow-[0_0_16px_rgba(59,130,246,0.7)] align-middle">
            5%
          </span>{' '}
          de descuento. Haz:
        </p>
        <button
          onClick={handleOrderClick}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
          style={{
            backgroundImage: `url('/wood/var5.png')`,
            backgroundSize: '100px 100px',
            backgroundRepeat: 'repeat',
            backgroundBlendMode: 'normal',
            backgroundColor: '#6b7280',
          }}
        >
          CLICK AQUI
        </button>
        <p className="text-sm text-gray-500 mt-4 cursor-pointer hover:underline" onClick={onClose}>
          O cierra esta ventana y uno de nuestros asesores te contactará.
        </p>
      </motion.div>
    </div>
  );
};
// --- End ConfirmationModal Component ---


export default function KusamCartPage() {
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const router = useRouter(); // Initialize useRouter here too

  const interestedItems = [
    { id: 'item1', name: 'Sofá Modular "Horizonte"', imageUrl: '/demo_furniture/couch.png', notes: 'Color de tela: Gris claro, Metal: Negro Mate' },
    { id: 'item2', name: 'Mesa de Centro "Esencia"', imageUrl: '/demo_furniture/stool.png', notes: 'Color de metal: Bronce Antiguo' },
    { id: 'item3', name: 'Sillón de Exterior "Confort"', imageUrl: '/demo_furniture/chair.png', notes: 'Color de tela: Azul Marino, Metal: Aluminio Cepillado' },
    { id: 'item4', name: 'Camastro "Serenidad"', imageUrl: '/demo_furniture/sun_bed.png', notes: '' },
    { id: 'item5', name: 'Asador "Big Green Egg"', imageUrl: '/demo_furniture/green_egg.png', notes: 'Modelo Large, con carrito' },
    { id: 'item6', name: 'Nevera Portátil "Chill Pro"', imageUrl: '/demo_furniture/cooler.png', notes: 'Capacidad 40L, color arena' },
    { id: 'item7', name: 'Módulo de Servicio "Chef Urbano"', imageUrl: '/demo_furniture/service.png', notes: 'Con fregadero integrado' },
    { id: 'item8', name: 'Mesita Auxiliar "Zen"', imageUrl: '/demo_furniture/mesita.png', notes: 'Material: Bambú' }
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    },
  };

  const handleSubmitQuote = () => {
    setShowConfirmationModal(true);
  };

  // MODIFIED: This now triggers the router.push directly
  const handleOrderCompletionClick = () => {
    router.push('/kusam/payment'); // Navigate to the payment page
  };

  return (
    // Main container with white background
    <div className="relative min-h-screen flex flex-col items-center p-4 pt-10 pb-10 bg-white">
      {/* Main Page Background Video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/leaves1.mp4" // This video remains for the main form page
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.1 }}
      />
      
      <motion.div
        className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6 text-center">
          <Image
            src="/kusam_main.webp"
            alt="Kusam Outdoor Solutions Logo"
            width={180}
            height={45}
            priority
            className="mx-auto"
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
          Mis Piezas Favoritas
        </h1>
        <p className="text-gray-600 mb-6 text-center">
          Aquí está la selección de productos Kusam que has capturado en{' '}
          <span className="inline-flex items-center align-middle mx-1">
              <Image
                  src="/expo_mueble.png"
                  alt="Expo Mueble Internacional Logo"
                  width={90}
                  height={18}
                  className="inline-block"
              />
          </span>.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {interestedItems.map((item, index) => (
            <CartItemCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <div className="mb-8 text-center p-4 bg-blue-50 rounded-md border-blue-200 border">
            <p className="text-blue-800 text-lg font-semibold">
                OFERTA EXCLUSIVA: Todas las compras completadas en <span className="inline-flex items-center align-middle mx-1">
                    <Image
                        src="/expo_mueble.png"
                        alt="Expo Mueble Internacional Logo"
                        width={100}
                        height={20}
                        className="inline-block"
                    />
                </span> reciben un <span className="font-bold text-xl">DESCUENTO ESPECIAL de 5%</span>.
            </p>
            <p className="text-blue-700 text-sm mt-1">
                Acércate a uno de nuestros asesores si tienes dudas o necesitas más información. <br></br>**En Kusam Outdoor Solutions estamos para servirte.**
            </p>
        </div>

        <button
          onClick={handleSubmitQuote}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xl font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
          style={{
            backgroundImage: `url('/wood/var5.png')`,
            backgroundSize: '100px 100px',
            backgroundRepeat: 'repeat',
            backgroundColor: '#6b7280',
          }}
        >
          Solicita Tu Cotización
        </button>

        <Link href="/kusam" passHref>
            <p className="text-center text-sm text-blue-600 hover:underline mt-4 cursor-pointer">
                Regresar al inicio de la demo
            </p>
        </Link>
      </motion.div>

      {/* Conditionally render the ConfirmationModal */}
      {showConfirmationModal && (
        <ConfirmationModal
          onClose={() => setShowConfirmationModal(false)}
          onSubmitOrder={handleOrderCompletionClick} // Pass the navigation handler
        />
      )}
    </div>
  );
}