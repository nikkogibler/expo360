'use client'; // This component uses client-side interactivity

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- PasswordModal Component (UPDATED: Interzekt Logo & New Video) ---
interface PasswordModalProps {
  onPasswordSubmit: (password: string) => void;
  onClose: () => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onPasswordSubmit, onClose }) => {
  const [inputPassword, setInputPassword] = useState('');

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, y: -50 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.8, y: 50 }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordSubmit(inputPassword);
  };

  return (
    // This outermost div is the full-screen container for the modal and its background.
    // It's fixed, fills the viewport, centers content, and has no background color itself.
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Background Video: ABSOLUTELY POSITIONED TO FILL THE CONTAINER - UPDATED SOURCE */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/backgroundvideo2_wave.mp4" // Changed video source
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.10 }}
      />
      
      {/* Modal Content Box: This is the actual white modal that sits on top of the video. */}
      <motion.div
        className="bg-white p-8 rounded-lg shadow-xl text-center max-w-sm w-full relative z-20"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="mb-6 text-center">
          {/* Interzekt Logo: UPDATED SOURCE */}
          <Image
            src="/interzekt_logo1.png" // Changed logo source
            alt="Interzekt Logo" // Changed alt text
            width={300} // Adjust width as needed for the Interzekt logo
            height={80} // Adjust height as needed for the Interzekt logo
            priority
            className="mx-auto"
          />
        </div>
        
     <h2 className="text-4xl font-bold text-gray-800 text-center leading-tight">
          Hello <span className="text-blue-600">Humberto</span> 
        </h2>
        <p className="block text-2xl font-semibold text-gray-700 mt-4 text-center">
          <span className="text-stone-700">Kusam Outdoor Solutions</span>
        </p>
        <p className="block text-lg text-gray-600 mt-2 text-center">
          Enter your password to <span className="font-medium text-blue-500">step inside</span>.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-gray-900 placeholder-gray-500"
            placeholder="Contraseña"
            required
            autoFocus
          />
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Launch Demo
          </button>
        </form>
        <p className="text-sm text-gray-500 mt-4">
          <b>2025</b> Expo Mueble Internacional <br></br>Interactive Sales Pipeline  
        </p>
      </motion.div>
    </div>
  );
};
// --- End PasswordModal Component ---


export default function KusamLeadFormPage() {
  const [passwordEntered, setPasswordEntered] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState(''); // New state for customer type

  const router = useRouter();

  const DEMO_PASSWORD = 'humberto'; 

  useEffect(() => {
    const storedPassword = localStorage.getItem('kusamDemoPassword');
    if (storedPassword === DEMO_PASSWORD) {
      setPasswordEntered(true);
      setShowPasswordModal(false);
    } else {
      setShowPasswordModal(true);
    }
  }, []);

  const handlePasswordSubmit = (submittedPassword: string) => {
    if (submittedPassword === DEMO_PASSWORD) {
      setPasswordEntered(true);
      setShowPasswordModal(false);
      localStorage.setItem('kusamDemoPassword', DEMO_PASSWORD);
    } else {
      alert('Contraseña incorrecta. Por favor, intente de nuevo.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !whatsapp || !email) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    console.log('--- Kusam Lead Captured (DEMO) ---');
    console.log('Nombre Completo:', name);
    console.log('WhatsApp:', whatsapp);
    console.log('Email:', email);
    console.log('------------------------------------');

    router.push('/kusam/instructions');
  };

  if (!passwordEntered && showPasswordModal) {
    return <PasswordModal onPasswordSubmit={handlePasswordSubmit} onClose={() => setShowPasswordModal(false)} />;
  }

  if (!passwordEntered && !showPasswordModal) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Cargando demo...</p>
      </div>
    );
  }

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

  return (
    // Main container with white background
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      {/* Background Video (now with low opacity) */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/leaves1.mp4" // This video remains for the main form page
        autoPlay
        loop
        muted
        playsInline
        style={{ opacity: 0.10 }}
      />
      
      <motion.div
        className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 relative z-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-6 text-center">
          <Image
            src="/kusam_main.webp"
            alt="Kusam Outdoor Solutions Logo"
            width={200}
            height={50}
            priority
            className="mx-auto"
          />
        </div>
        
        <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800"></h1>
            <p className="text-gray-600 mt-2 text-lg">
                Su Experiencia en{' '}
                <span className="inline-flex items-center align-middle mx-1">
                    <Image
                        src="/expo_mueble.png"
                        alt="Expo Mueble Internacional Logo"
                        width={90}
                        height={18}
                        className="inline-block"
                    />
                </span>{' '}
                Comienza Aquí
            </p>
        </div>

        <p className="text-gray-700 mb-6 text-center text-md">
          ¡Bienvenido! Para iniciar su recorrido interactivo y obtener una cotización personalizada, por favor complete sus datos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
              placeholder="Ej. Mónica García"
              required
            />
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp (Número de Celular)</label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
              placeholder="Ej. +52 55 1234 5678"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
              placeholder="Ej. su.correo@ejemplo.com"
              required
            />
          </div>

          <div>
            <label htmlFor="customerType" className="block text-sm font-medium text-gray-700">¿A qué te dedicas?</label>
            <select
              id="customerType"
              name="customerType"
              value={customerType}
              onChange={(e) => setCustomerType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              required
            >
        <option value="">Selecciona tu industria</option>
              <option value="ArquitecturaDiseño">Despacho de Arquitectura/Diseño</option>
              <option value="HoteleriaTurismo">Hotel / Resort / Turismo</option>
              <option value="RestaurantesCafes">Restaurante / Cafetería</option>
              <option value="DesarrolladorInmobiliario">Desarrollador Inmobiliario</option>
              <option value="ConstructorContratista">Constructora / Contratista</option>
              <option value="Inversionista">Inversionista</option>
              <option value="SectorPublico">Sector Público (Gobierno)</option>
              <option value="SpaBienestar">Spa / Centro de Bienestar</option>
              <option value="ClubDeportivoSocial">Club Deportivo / Social</option>
              <option value="ResidencialParticular">Cliente Residencial / Particular</option>
              <option value="ComercioRetail">Comercio / Retail</option>
              <option value="Educacion">Institución Educativa</option>
              <option value="Industrial">Sector Industrial</option>
              <option value="SaludMedicina">Salud / Medicina (Clínicas, Hospitales)</option>
              <option value="Agroindustria">Agroindustria</option>
              <option value="OtroNegocio">Otro Tipo de Negocio</option>
              <option value="Estudiante">Estudiante / Académico</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold bg-stone-400 text-white hover:bg-stone-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-600 transition duration-150 ease-in-out"
            style={{
              backgroundImage: `url('/wood/var4.png')`,
              backgroundSize: '100px 100px',
              backgroundRepeat: 'repeat',
              backgroundBlendMode: 'multiply'
            }}
          >
            Comienza A Explorar
          </button>
        </form>
      </motion.div>
    </div>
  );
}