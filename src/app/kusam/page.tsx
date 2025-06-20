// src/app/kusam/page.tsx

'use client'; // This directive is necessary for client-side components in Next.js App Router

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

// IMPORT THE SUPABASE CLIENT FROM YOUR UTILS FILE
// IMPORTANT: Confirm this path. If your utils folder is directly under 'src'
// AND your app folder is directly under 'src', then `../../utils/supabase` is correct.
// If you have configured path aliases like '@utils', you might use '@/utils/supabase'.
import { supabase } from '../../utils/supabase'; // Using relative path

// -----------------------------------------------------------------------------
// Existing PasswordModal component (remains unchanged)
// -----------------------------------------------------------------------------
interface PasswordModalProps {
  onPasswordSubmit: (password: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ onPasswordSubmit }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPasswordSubmit(password);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
    >
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Accede al Demo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          Entrar
        </button>
      </form>
    </motion.div>
  );
};

// -----------------------------------------------------------------------------
// KusamLeadFormPage component (main component with all changes)
// -----------------------------------------------------------------------------
export default function KusamLeadFormPage() {
  const [passwordEntered, setPasswordEntered] = useState(false);
  // showPasswordModal state is no longer strictly necessary if rendering is conditional on passwordEntered
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  // NEW STATE: To hold the selected Customer Type (CRITICAL for Phase 1 Deliverables)
  const [customerType, setCustomerType] = useState(''); // Initialize with empty string

  const router = useRouter();
  const DEMO_PASSWORD = 'humberto';

  // NEW STATE: To hold the current customer's UUID persisted across sessions
  const [currentCustomerId, setCurrentCustomerId] = useState<string | null>(null);

  // NEW useEffect Hook: To check localStorage for an existing customer ID on component mount
  useEffect(() => {
    // Ensure this code runs only in the browser environment (client-side)
    if (typeof window !== 'undefined') {
      const storedId = localStorage.getItem('kusam_customer_id');
      if (storedId) {
        setCurrentCustomerId(storedId); // Set the React state if an ID is found
        console.log('Existing customer ID found in localStorage:', storedId);
      } else {
        console.log('No existing customer ID in localStorage. This is a new session or first visit.');
      }
    }
  }, []); // Empty dependency array ensures this effect runs only once after the initial render

  // Handler for password submission (remains unchanged)
  const handlePasswordSubmit = (pw: string) => {
    if (pw === DEMO_PASSWORD) {
      setPasswordEntered(true);
      // No need to set setShowPasswordModal(false) if it's not explicitly controlling the modal visibility
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // MODIFIED handleSubmit Function: Handles form submission and Supabase interaction
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation for all required fields, including the new customerType dropdown
    if (!name || !whatsapp || !email || !customerType) {
      alert('Por favor, complete todos los campos requeridos (Nombre, WhatsApp, Email y Tipo de Cliente).');
      return;
    }

    // Data object to be sent to Supabase for insertion or update
    const customerData = {
      name: name,
      whatsapp: whatsapp,
      email: email,
      customer_type: customerType, // Include the selected customer type
      // Optional: Capture 'source_qr_code' from URL query parameter if available
      // Assumes your QR code scanner might add '?qr=some_code' to the URL
      source_qr_code: typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('qr') : null,
    };

    try {
      // Use a local variable to guarantee it's a string before router.push
      let customerIdToUse: string; 

      if (!currentCustomerId) {
        // SCENARIO 1: No existing customer ID found (new user or cleared localStorage)
        // -> INSERT a new record into the 'customers' table
        console.log('Attempting to insert new customer record...');
        const { data, error } = await supabase
          .from('customers')
          .insert([customerData])
          .select('id') // Request the 'id' (UUID) generated by Supabase for the new record
          .single(); // Expecting a single row back

        if (error || !data || !data.id) { // Check for error OR if data/id is unexpectedly null
          console.error('Error inserting new customer:', error?.message || 'No data or ID returned from Supabase.');
          alert(`Error al guardar su información: ${error?.message || 'No se pudo obtener el ID del cliente. Por favor, inténtelo de nuevo.'}`);
          return; // Stop execution if there's an error
        }

        // Successfully inserted: Capture the new ID and store it
        customerIdToUse = data.id; // This is now guaranteed to be a string
        setCurrentCustomerId(customerIdToUse); // Update React state
        if (typeof window !== 'undefined') {
          localStorage.setItem('kusam_customer_id', customerIdToUse); // Persist in localStorage
        }
        console.log('New customer successfully created with ID:', customerIdToUse);

        // Optional: If a QR parameter was found, log it to 'customer_qr_scans' table
        if (customerData.source_qr_code) {
          const { error: qrError } = await supabase
            .from('customer_qr_scans')
            .insert([{
              customer_id: customerIdToUse,
              qr_code_scanned: customerData.source_qr_code,
              scan_timestamp: new Date().toISOString() // Or use Supabase's default 'now()' for column
            }]);
          if (qrError) console.error('Error logging initial QR scan:', qrError.message);
          else console.log('Initial QR scan logged successfully for:', customerData.source_qr_code);
        }

      } else {
        // SCENARIO 2: Existing customer ID found (returning user)
        // -> UPDATE the existing customer record
        customerIdToUse = currentCustomerId; // Assign the existing ID, which is guaranteed to be a string here
        console.log('Existing customer ID found. Attempting to update existing data for ID:', customerIdToUse);
        const { error } = await supabase
          .from('customers')
          .update(customerData) // Update the fields with the new form values
          .eq('id', customerIdToUse); // Crucially, target the correct customer by their ID

        if (error) {
          console.error('Error updating customer:', error.message);
          alert(`Error al actualizar su información: ${error.message}`);
          return; // Stop execution if there's an error
        }
        console.log('Existing customer successfully updated for ID:', customerIdToUse);

        // For returning users, check if a new QR was scanned during this visit
        const currentQrParam = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('qr') : null;
        if (currentQrParam && customerData.source_qr_code !== currentQrParam) {
            // Only log if the QR code in the URL is different from what was previously stored (if any)
            const { error: qrError } = await supabase
                .from('customer_qr_scans')
                .insert([{ customer_id: customerIdToUse, qr_code_scanned: currentQrParam, scan_timestamp: new Date().toISOString() }]);
            if (qrError) console.error('Error logging new QR scan for existing user:', qrError.message);
            else console.log('New QR scan logged for existing user:', currentQrParam);
        }
      }

      // --- Success Path: Log and Redirect ---
      // These logs are for your debugging; you might remove or refine them for production.
      console.log('--- Kusam Lead Form Submission (DEBUG) ---');
      console.log('Final Customer ID used for action:', customerIdToUse);
      console.log('Nombre:', name);
      console.log('WhatsApp:', whatsapp);
      console.log('Email:', email);
      console.log('Tipo de Cliente:', customerType);
      console.log('------------------------------------');

      // NOW, customerIdToUse is definitely a string, satisfying TypeScript
      // Redirect to the next page, optionally passing the customerId in the URL
      router.push(`/kusam/instructions?customerId=${customerIdToUse}`);

    } catch (error) {
      // Catch any unexpected errors that might occur during the try block
      console.error('An unexpected error occurred during form submission:', error);
      alert('Ocurrió un error inesperado durante el envío del formulario. Por favor, inténtelo de nuevo.');
    }
  };

  // -----------------------------------------------------------------------------
  // JSX Rendering Logic (includes the new Customer Type dropdown)
  // -----------------------------------------------------------------------------
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <Image
        src="/Kusam-Expo.png" // Ensure this path is correct relative to your public folder
        alt="Kusam Expo Background"
        layout="fill"
        objectFit="cover"
        quality={100}
        priority
        className="z-0"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-60 z-10"></div>

      {/* Main Content (Modal/Form) */}
      <div className="absolute inset-0 flex items-center justify-center p-4 z-20">
        {passwordEntered ? (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full"
          >
            {/* Logo container */}
            <div className="mb-6 flex justify-center">
              <Image
                src="/Kusam-Noche-Logo-Web.png" // Path to your logo image in the public directory
                alt="Kusam Logo"
                width={150}
                height={150}
                className="object-contain"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Regístrate para ver el catálogo</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              {/* WhatsApp Input */}
              <div>
                <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">WhatsApp</label>
                <input
                  type="tel"
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500"
                />
              </div>
              {/* CRITICAL NEW ELEMENT: Customer Type Dropdown */}
              <div>
                <label htmlFor="customerType" className="block text-sm font-medium text-gray-700">Tipo de Cliente</label>
                <select
                  id="customerType"
                  value={customerType} // Binds to the customerType state
                  onChange={(e) => setCustomerType(e.target.value)} // Updates state on change
                  required // Make this field mandatory as per requirements
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent-500 focus:border-accent-500 bg-white"
                >
                  <option value="">Selecciona un tipo</option> {/* Default empty option */}
                  <option value="Hospitality">Hospitality</option>
                  <option value="Architecture">Architecture</option>
                  <option value="Private Client">Private Client</option>
                  <option value="SPA">SPA</option>
                  <option value="Country Clubs">Country Clubs</option>
                </select>
              </div>
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out"
              >
                Ver Catálogo
              </button>
            </form>
          </motion.div>
        ) : (
          // Render PasswordModal if password hasn't been entered
          <PasswordModal onPasswordSubmit={handlePasswordSubmit} />
        )}
      </div>
    </div>
  );
}