'use client'; // This component uses client-side interactivity

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // Import usePathname AND useSearchParams
import { v4 as uuidv4 } from 'uuid'; // Import uuid to generate unique IDs

// CORRECT import for Supabase client
import { supabase } from '../../utils/supabase'; // <--- Import the already initialized 'supabase' client

export default function KusamLeadFormPage() {
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null); // State to hold customer_id

  const router = useRouter();
  const pathname = usePathname(); // Get the current path for conditional redirects
  const searchParams = useSearchParams(); // --- ADDED: Get URL search parameters from Next.js


  // --- Customer ID and Redirect/Data Fetching Effect ---
  // This useEffect now runs immediately on component mount.
  useEffect(() => {
    // const urlParams = new URLSearchParams(window.location.search); // Not strictly needed with useSearchParams
    const sourceQrCode = searchParams.get('source_qr_code'); // Capture QR code from URL using useSearchParams
    const clearSessionFlag = searchParams.get('clear_session'); // Get the clear_session flag

    let storedCustomerId = localStorage.getItem('kusam_customer_id');

    // --- CRITICAL ADDITION/MODIFICATION HERE ---
    if (clearSessionFlag === 'true') {
      console.log('KusamLeadFormPage: Detected clear_session=true in URL parameter. Forcing new session.');
      localStorage.removeItem('kusam_customer_id'); // <--- THIS IS THE KEY LINE TO ADD/UNCOMMENT
      storedCustomerId = null; // Ensure the rest of this useEffect treats it as cleared

      // Optional: Redirect to clear the URL parameter for a cleaner state and prevent
      // this logic from running unnecessarily on subsequent renders if user stays on /kusam
      // If you are redirecting to /instructions anyway, this might not be critical.
      // router.replace('/kusam');
      // return; // Exit early if we are forcing clear and restarting the session
    }

    // Scenario 1: Returning user with a stored customer_id (and no actual clear operation happened)
    if (storedCustomerId) {
      console.log('--- Found stored kusam_customer_id:', storedCustomerId); // Debug Log

      // If customer_id exists AND we are currently on the main form page (/kusam), redirect immediately.
      if (pathname === '/kusam') { // Only redirect if on the landing page
        router.replace(`/kusam/instructions?customer_id=${storedCustomerId}`);
        return; // Stop further execution of this useEffect in the current render cycle
      }

      // If not redirecting (i.e., we are already on instructions or another page, but this component remounted),
      // set customer ID and attempt to pre-fill form data
      setCurrentCustomerId(storedCustomerId);
      const fetchCustomerData = async () => {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', storedCustomerId)
          .single();

        if (error) {
          console.error('Error fetching customer data for returning user:', error);
          localStorage.removeItem('kusam_customer_id'); // Clear invalid ID
          setCurrentCustomerId(null); // Treat as new user
        } else if (data) {
          setName(data.name || '');
          setWhatsapp(data.whatsapp || '');
          setEmail(data.email || '');
          setCustomerType(data.customer_type || '');
          console.log('Returning customer data loaded for form pre-fill:', data);
        }
      };
      // Only call fetchCustomerData if we're not immediately redirecting out of /kusam
      if (pathname === '/kusam') {
          fetchCustomerData();
      }


      // Log QR scan for returning user if applicable and on the landing page
      if (sourceQrCode && pathname === '/kusam') {
        const logQrScan = async () => {
          const { error: logError } = await supabase
            .from('customer_qr_scans')
            .insert({ customer_id: storedCustomerId, source_qr_code: sourceQrCode });
          if (logError) {
            console.error('Error logging QR scan for returning user:', logError);
          }
        };
        logQrScan();
      }

    } else {
      // Scenario 2: New user (no stored kusam_customer_id found or was just cleared by clear_session=true)
      console.log('--- No stored kusam_customer_id found or clear_session=true was detected. Generating a new one.');
      const newCustomerId = uuidv4(); // Generate a unique ID
      localStorage.setItem('kusam_customer_id', newCustomerId); // Store it locally for persistence
      setCurrentCustomerId(newCustomerId); // Update component state
      console.log('New customer ID generated and stored:', newCustomerId); // Debug Log

      // Log QR scan for new session initiated by QR code
      if (sourceQrCode) {
        const logQrScan = async () => {
          const { error: logError } = await supabase
            .from('customer_qr_scans')
            .insert({ customer_id: newCustomerId, source_qr_code: sourceQrCode });
          if (logError) {
            console.error('Error logging QR scan for new customer on initial load:', logError);
          }
        };
        logQrScan();
      }
    }
  }, [pathname, router, searchParams]); // searchParams is crucial dependency here for clearSessionFlag

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Basic form validation
    if (!name || !whatsapp || !email || !customerType) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    console.log('--- Kusam Lead Captured (DEMO) ---');
    console.log('Nombre Completo:', name);
    console.log('WhatsApp:', whatsapp);
    console.log('Email:', email);
    console.log('Tipo de Cliente:', customerType);
    console.log('------------------------------------');

    // const urlParams = new URLSearchParams(window.location.search); // Not strictly needed
    const sourceQrCode = searchParams.get('source_qr_code'); // Capture QR code from URL

    // Safety check: currentCustomerId should never be null at this point if logic is correct
    if (currentCustomerId === null) {
      console.error('No customer ID available for submission. This should not happen.');
      alert('Error de sesión. Por favor, recargue la página.');
      return;
    }

    let customerIdToUse = currentCustomerId; // Use the ID already set in state/localStorage

    // Attempt to find an existing customer record by the generated/stored ID
    const { data: existingCustomer, error: fetchError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_id', customerIdToUse)
        .maybeSingle();

    // Handle any error during the existence check, except "No rows found" (PGRST116)
    if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking for existing customer:', fetchError);
        alert('Hubo un error de base de datos. Por favor, intente de nuevo.');
        return;
    }

    // If an existing customer record was found for this customerIdToUse
    if (existingCustomer) {
      // Update the existing customer's data
      const { data, error } = await supabase
        .from('customers')
        .update({
          name,
          whatsapp,
          email,
          customer_type: customerType,
          updated_at: new Date().toISOString() // Update timestamp
        })
        .eq('customer_id', customerIdToUse) // Specify which row to update
        .select(); // Return the updated data

      if (error) {
        console.error('Error updating customer:', error);
        alert('Hubo un error al actualizar sus datos. Por favor, intente de nuevo.');
        return; // Stop execution on error
      }
      console.log('Customer updated:', data);

    } else {
      // If no existing customer record was found for this customerIdToUse, insert a new one
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_id: customerIdToUse, // Use the pre-generated ID
          name,
          whatsapp,
          email,
          customer_type: customerType
        })
        .select(); // Return the inserted data

      if (error) {
        console.error('Error inserting new customer:', error);
        alert('Hubo un error al registrar sus datos. Por favor, intente de nuevo.');
        return; // Stop execution on error
      }

      const newCustomer = data[0]; // Get the first (and only) inserted record
      console.log('New customer inserted:', newCustomer);

      // Log the QR scan if present for a brand new customer
      if (sourceQrCode) {
        const { error: logError } = await supabase
          .from('customer_qr_scans')
          .insert({ customer_id: customerIdToUse, source_qr_code: sourceQrCode });
        if (logError) {
          console.error('Error logging QR scan for new customer on form submit:', logError);
        }
      }
    }

    // After successful submission (insert or update), redirect to the instructions page
    router.push(`/kusam/instructions?customer_id=${customerIdToUse}`);
  };

  // --- Conditional Rendering Logic ---
  // If currentCustomerId is null AND we are on the main form path (/kusam),
  // it means the useEffect is still running to determine if it's a new or returning user.
  // In this very brief initial phase, we render nothing (null) to avoid text flash.
  if (currentCustomerId === null && pathname === '/kusam') {
    return null; // Render nothing during initial loading
  }

  // This block renders the main form. It will be displayed if:
  // 1. currentCustomerId has been set (meaning an ID was generated for a new user, or found for an existing one)
  //    AND the current pathname is '/kusam'. This is the new user path.
  // 2. OR if the current pathname is NOT '/kusam' (meaning we're on the instructions page due to redirect,
  //    this component would theoretically still render but return this part).
  //    The redirect logic in the useEffect handles the actual navigation away from /kusam for returning users.
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

  // This is the primary return for the component. It renders the form or nothing if already redirected.
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/leaves1.mp4"
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