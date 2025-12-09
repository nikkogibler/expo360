'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

interface LogoOnboardingProps {
  client: any;
  onComplete?: () => void;
}

export default function LogoOnboarding({ client, onComplete }: LogoOnboardingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'client' | 'expo' | 'success' | 'complete'>('client');
  const [expo, setExpo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const checkLogos = async () => {
      if (!client) return;

      // Check client logo
      const needsClientLogo = !client.logo_path;

      // Check expo logo
      const { data: expos } = await supabase
        .from('expos')
        .select('*')
        .eq('client_id', client.id)
        .order('created_at', { ascending: true })
        .limit(1);
      
      const firstExpo = expos?.[0];
      setExpo(firstExpo);
      
      const needsExpoLogo = firstExpo && !firstExpo.logo_path;

      // Only open if strictly needed and not just uploaded
      if (needsClientLogo) {
        setStep('client');
        setIsOpen(true);
      } else if (needsExpoLogo) {
        setStep('expo');
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };

    checkLogos();
  }, [client, supabase]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'client' | 'expo') => {
    try {
      setError(null);
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      
      // Validation
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('El archivo debe pesar menos de 3MB.');
      }
      if (file.type !== 'image/png') {
        throw new Error('Solo se permiten archivos PNG.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${client.slug}/${type}_logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('expo360-clients-assets')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw new Error(`Error al subir: ${uploadError.message}`);
      }

      // Update DB
      if (type === 'client') {
        const { error: updateError } = await supabase
          .from('clients')
          .update({ logo_path: filePath })
          .eq('id', client.id);
        
        if (updateError) {
            console.error('DB Update Error (Client):', updateError);
            throw new Error(`Error al actualizar base de datos: ${updateError.message}`);
        }
        
        // Move to next step or finish
        if (expo && !expo.logo_path) {
          setStep('expo');
        } else {
          setStep('success');
          router.refresh();
        }
      } else {
        const { error: updateError } = await supabase
          .from('expos')
          .update({ logo_path: filePath })
          .eq('id', expo.id);

        if (updateError) {
            console.error('DB Update Error (Expo):', updateError);
            throw new Error(`Error al actualizar base de datos: ${updateError.message}`);
        }

        setStep('success');
        router.refresh();
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  if (step === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500" />
          
          <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Logotipos Actualizados!</h2>
          
          <p className="text-gray-600 mb-6">
            Tus logotipos se han guardado correctamente.
            <br/><br/>
            Recuerda que siempre puedes cambiarlos en la sección de <strong>Preferencias</strong> de tu panel de administración.
          </p>

          <button 
            onClick={() => {
              setIsOpen(false);
              if (onComplete) onComplete();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Continuar al Panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
          <div 
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: step === 'client' ? '50%' : '100%' }}
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {step === 'client' ? 'Sube tu Logotipo' : 'Sube el Logo de tu Expo'}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {step === 'client' 
            ? 'Por favor sube el logotipo de tu empresa para personalizar tu panel.' 
            : `Sube un logotipo para tu evento "${expo?.name || 'Expo'}".`}
        </p>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept="image/png"
              onChange={(e) => handleFileUpload(e, step)}
              disabled={uploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="space-y-2">
              <div className="mx-auto w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-blue-600">Clic para subir</span> o arrastra y suelta
              </div>
              <p className="text-xs text-gray-500">PNG hasta 3MB (Fondo transparente recomendado)</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {uploading && (
            <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Subiendo...
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end">
            <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm"
            >
                Omitir por ahora
            </button>
        </div>
      </div>
    </div>
  );
}
