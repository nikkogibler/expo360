// src/app/kusam/page.tsx (KusamLeadFormPage)
'use client'; // This component uses client-side interactivity

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid'; // Keep uuidv4 here!
import type { Variants } from 'framer-motion';

import { supabase } from '../../utils/supabase';

// Helper function to convert ISO country code to flag emoji
const getFlagEmoji = (countryCode: string) => {
  if (countryCode === 'OT') return '🌐'; // Use a globe emoji for "Otro"
  if (!countryCode) return ''; // Handle empty code

  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 0x1f1e6 + (char.charCodeAt(0) - 'A'.charCodeAt(0)));
  return String.fromCodePoint(...codePoints);
};

interface CountryCode {
  name: string;
  dial_code: string;
  code: string; // ISO 2-letter code
  emoji?: string; // Optional: to store the pre-computed emoji for performance
}

// Expanded list of country codes with associated emoji
const countryCodes: CountryCode[] = [
  { name: 'México', dial_code: '+52', code: 'MX' },
  { name: 'Estados Unidos', dial_code: '+1', code: 'US' },
  { name: 'Canadá', dial_code: '+1', code: 'CA' },
  { name: 'Argentina', dial_code: '+54', code: 'AR' },
  { name: 'Colombia', dial_code: '+57', code: 'CO' },
  { name: 'España', dial_code: '+34', code: 'ES' },
  { name: 'Brasil', dial_code: '+55', code: 'BR' },
  { name: 'Chile', dial_code: '+56', code: 'CL' },
  { name: 'Perú', dial_code: '+51', code: 'PE' },
  // Add more as needed
  { name: 'Otro', dial_code: '', code: 'OT' }
];

// Pre-compute emojis for constant `countryCodes` array
countryCodes.forEach(country => {
  country.emoji = getFlagEmoji(country.code);
});


const KusamLeadFormPage = () => { // Changed to const for export default as React.FC<any>
  const [name, setName] = useState('');
  const [localWhatsapp, setLocalWhatsapp] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(countryCodes[0]); // Default to Mexico
  const [email, setEmail] = useState('');
  const [customerType, setCustomerType] = useState('');
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingCustomerStatus, setIsLoadingCustomerStatus] = useState(true); // NEW: Loading state for customer check

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    const sourceQrCode = searchParams.get('source_qr_code');
    const clearSessionFlag = searchParams.get('clear_session');

    let storedCustomerId = localStorage.getItem('kusam_customer_id');

    const initializeCustomer = async () => {
      setIsLoadingCustomerStatus(true); // Start loading

      if (clearSessionFlag === 'true') {
        console.log('KusamLeadFormPage: Detected clear_session=true. Forcing new session by clearing localStorage.');
        localStorage.removeItem('kusam_customer_id');
        storedCustomerId = null; // Ensure logic below sees it as null
        // Optionally, clean the URL here to avoid repeated clearing on refresh
        // if (window.location.search.includes('clear_session')) {
        //   window.history.replaceState({}, document.title, window.location.pathname);
        // }
      }

      if (storedCustomerId) {
        console.log('--- Found stored kusam_customer_id:', storedCustomerId, 'in KusamLeadFormPage. Verifying with Supabase.');

        const { data: customerData, error } = await supabase
          .from('customers')
          .select('*')
          .eq('customer_id', storedCustomerId)
          .single();

        if (error || !customerData) {
          console.error('Error fetching customer data or customer not found in DB:', error?.message || 'Not found');
          localStorage.removeItem('kusam_customer_id'); // Invalidate stored ID if not in DB
          setCurrentCustomerId(null); // Clear state
          // Fall through to generate new ID or show form if not found
        } else {
          // Customer ID found and validated in Supabase! -> User is "signed up"
          setCurrentCustomerId(storedCustomerId); // Set state with valid ID
          setName(customerData.name || '');
          setEmail(customerData.email || '');
          setCustomerType(customerData.customer_type || '');

          const existingWhatsapp = customerData.whatsapp || '';
          const foundCountry = countryCodes.find(c => existingWhatsapp.startsWith(c.dial_code));
          if (foundCountry) {
            setSelectedCountry(foundCountry);
            setLocalWhatsapp(existingWhatsapp.substring(foundCountry.dial_code.length));
          } else {
            setSelectedCountry(countryCodes[0]); // Default to Mexico
            setLocalWhatsapp(existingWhatsapp);
          }
          console.log('Returning customer data loaded for form pre-fill and redirect:', customerData);

          // REDIRECT ONLY IF ON THE ROOT KUSAM PAGE AND CONFIRMED SIGNED UP
          if (pathname === '/kusam') {
            router.replace(`/kusam/instructions?customer_id=${storedCustomerId}`);
            return; // Exit early as we are redirecting
          }
        }
      }

      // This block only runs if storedCustomerId was null OR was invalidated above
      if (!storedCustomerId || localStorage.getItem('kusam_customer_id') === null) { // Double check localStorage after potential clearing/invalidation
        console.log('--- No valid kusam_customer_id found. Generating a new one for current session.');
        const newCustomerId = uuidv4();
        localStorage.setItem('kusam_customer_id', newCustomerId); // Store new ID
        setCurrentCustomerId(newCustomerId); // Set state with new ID
        console.log('New customer ID generated and stored for this session:', newCustomerId);

        // Log QR scan for truly new customer at this stage
        if (sourceQrCode) {
          const { error: logError } = await supabase
            .from('customer_qr_scans')
            .insert({ customer_id: newCustomerId, source_qr_code: sourceQrCode });
          if (logError) {
            console.error('Error logging QR scan for new customer on initial load:', logError);
          }
        }
      }
      setIsLoadingCustomerStatus(false); // End loading
    };

    initializeCustomer();
  }, [pathname, router, searchParams]); // Depend on relevant states/props

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullWhatsappNumber = selectedCountry.dial_code === '' ? localWhatsapp : `${selectedCountry.dial_code}${localWhatsapp}`;

    if (!name || !fullWhatsappNumber || !email || !customerType) {
      alert('Por favor, complete todos los campos.');
      return;
    }

    console.log('--- Kusam Lead Captured (DEMO) ---');
    console.log('Nombre Completo:', name);
    console.log('WhatsApp:', fullWhatsappNumber);
    console.log('Email:', email);
    console.log('Tipo de Cliente:', customerType);
    console.log('------------------------------------');

    const sourceQrCode = searchParams.get('source_qr_code');

    if (currentCustomerId === null) {
      console.error('No customer ID available for submission. This should not happen if currentCustomerId state is managed correctly.');
      alert('Error de sesión. Por favor, recargue la página.');
      return;
    }

    const customerIdToUse = currentCustomerId; // Use the ID from state

    // Check if customer exists or insert
    const { data: existingCustomerCheck, error: fetchError } = await supabase
        .from('customers')
        .select('customer_id')
        .eq('customer_id', customerIdToUse)
        .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is 'No rows found'
        console.error('Error checking for existing customer during submit:', fetchError);
        alert('Hubo un error de base de datos. Por favor, intente de nuevo.');
        return;
    }

    if (existingCustomerCheck) {
      // Update existing customer
      const { data, error } = await supabase
        .from('customers')
        .update({
          name,
          whatsapp: fullWhatsappNumber,
          email,
          customer_type: customerType,
          updated_at: new Date().toISOString()
        })
        .eq('customer_id', customerIdToUse)
        .select();

      if (error) {
        console.error('Error updating customer:', error);
        alert('Hubo un error al actualizar sus datos. Por favor, intente de nuevo.');
        return;
      }
      console.log('Customer updated:', data);

    } else {
      // Insert new customer
      const { data, error } = await supabase
        .from('customers')
        .insert({
          customer_id: customerIdToUse,
          name,
          whatsapp: fullWhatsappNumber,
          email,
          customer_type: customerType
        })
        .select();

      if (error) {
        console.error('Error inserting new customer:', error);
        alert('Hubo un error al registrar sus datos. Por favor, intente de nuevo.');
        return;
      }

      const newCustomer = data[0];
      console.log('New customer inserted:', newCustomer);

      if (sourceQrCode) {
        const { error: logError } = await supabase
          .from('customer_qr_scans')
          .insert({ customer_id: customerIdToUse, source_qr_code: sourceQrCode });
        if (logError) {
          console.error('Error logging QR scan for new customer on form submit:', logError);
        }
      }
    }

    // Redirect to instructions page after successful form submission (signup or update)
    router.push(`/kusam/instructions?customer_id=${customerIdToUse}`);
  };

  // NEW: Render loading state based on isLoadingCustomerStatus
  if (isLoadingCustomerStatus) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 bg-white">
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 text-center"
        >
            <p className="text-xl text-gray-700 font-semibold">Cargando experiencia Kusam...</p>
            <Image src="/kusam_main.webp" alt="Loading Logo" width={100} height={25} className="mx-auto mt-4 animate-pulse" />
        </motion.div>
      </div>
    );
  }

  // --- Framer Motion Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring", // Removed 'as const' as it's not needed for string literal types
        stiffness: 100,
        damping: 10,
        delay: 0.2
      }
    },
  };

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
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
            <div className="relative mt-1 flex rounded-md shadow-sm" ref={dropdownRef}>
              {/* Flag and Dial Code Display */}
              <button
                type="button"
                className="relative z-10 inline-flex items-center space-x-2 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-900 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="text-xl leading-none">{selectedCountry.emoji}</span> {/* Flag Emoji */}
                <span className="hidden sm:inline">{selectedCountry.dial_code}</span>
                <svg className="-mr-1 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Country Dropdown (Hidden by default) */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-12 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20 max-h-60 overflow-y-auto">
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="country-select-button">
                    {countryCodes.map((country) => (
                      <a
                        key={country.code}
                        href="#"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        role="menuitem"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedCountry(country);
                          if (country.dial_code === '') { // If "Otro" is selected
                            setLocalWhatsapp(''); // Clear local, user manually enters full number
                          }
                          setIsDropdownOpen(false);
                        }}
                      >

                        <span className="mr-2 text-lg leading-none">{country.emoji}</span> {/* Flag Emoji */}
                        {country.name} ({country.dial_code})
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Local WhatsApp Number Input */}
              <input
                type="tel"
                id="localWhatsapp"
                name="localWhatsapp"
                value={localWhatsapp}
                onChange={(e) => setLocalWhatsapp(e.target.value)}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-500"
                placeholder={selectedCountry.dial_code === '' ? "Ej. +YY XXXXXXXXXX" : "Ej. 55 1234 5678"}
                required
              />
            </div>
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default KusamLeadFormPage as React.FunctionComponent<any>;