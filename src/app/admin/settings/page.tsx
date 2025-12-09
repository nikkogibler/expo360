"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import Image from 'next/image';

export default function AdminSettings() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  
  // Logo management state
  const [client, setClient] = useState<any>(null);
  const [expo, setExpo] = useState<any>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoMessage, setLogoMessage] = useState('');
  const [logoError, setLogoError] = useState('');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [expoLogoUrl, setExpoLogoUrl] = useState<string | null>(null);
  
  // Appearance state
  const [bgType, setBgType] = useState<'solid' | 'gradient'>('solid');
  const [bgColors, setBgColors] = useState<string[]>(['#ffffff', '#ffffff']);
  const [bgDirection, setBgDirection] = useState('to bottom');
  const [savingColor, setSavingColor] = useState(false);

  const router = useRouter();
  const isAuthenticated = useAdminAuth();

  useEffect(() => {
    // Get current user info
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || '');
        
        // Fetch user profile for name
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, name')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.full_name || profile.name || '');
        }

        // Fetch client and expo data
        const { data: userClient } = await supabase
            .from('user_clients')
            .select('client_id')
            .eq('user_id', user.id)
            .maybeSingle();
            
        if (userClient) {
            const { data: clientData } = await supabase
                .from('clients')
                .select('*')
                .eq('id', userClient.client_id)
                .single();
            setClient(clientData);
            
            if (clientData?.theme?.backgroundConfig) {
              setBgType(clientData.theme.backgroundConfig.type || 'solid');
              setBgColors(clientData.theme.backgroundConfig.colors || ['#ffffff', '#ffffff']);
              setBgDirection(clientData.theme.backgroundConfig.direction || 'to bottom');
            } else if (clientData?.theme?.dashboardBgColor) {
              setBgType('solid');
              setBgColors([clientData.theme.dashboardBgColor, '#ffffff']);
            }
            
            if (clientData && clientData.logo_path) {
                 const { data: publicData } = supabase.storage
                  .from('expo360-clients-assets')
                  .getPublicUrl(clientData.logo_path);
                 setLogoUrl(publicData.publicUrl);
            }
            
            if (clientData) {
                 const { data: expos } = await supabase
                    .from('expos')
                    .select('*')
                    .eq('client_id', clientData.id)
                    .order('created_at', { ascending: true })
                    .limit(1);
                 const firstExpo = expos?.[0];
                 setExpo(firstExpo);

                 if (firstExpo && firstExpo.logo_path) {
                    const { data: publicData } = supabase.storage
                     .from('expo360-clients-assets')
                     .getPublicUrl(firstExpo.logo_path);
                    setExpoLogoUrl(publicData.publicUrl);
                 }
            }
        }

      } else {
        // Fallback to cookie for email-based admin
        const email = document.cookie
          .split('; ')
          .find(row => row.startsWith('user_email='))
          ?.split('=')[1];
        if (email) {
          setUserEmail(decodeURIComponent(email));
        }
      }
    };

    if (isAuthenticated) {
      getCurrentUser();
    }
  }, [isAuthenticated]);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'client' | 'expo') => {
    try {
      setLogoError('');
      setLogoMessage('');
      setUploadingLogo(true);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validation
      if (file.size > 3 * 1024 * 1024) {
        throw new Error('El archivo debe pesar menos de 3MB.');
      }
      if (file.type !== 'image/png') {
        throw new Error('Solo se permiten archivos PNG.');
      }

      if (!client) throw new Error('No se encontró información del cliente.');

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
            throw new Error(`Error al actualizar base de datos: ${updateError.message}`);
        }
        
        // Update local state
        const { data: publicData } = supabase.storage
            .from('expo360-clients-assets')
            .getPublicUrl(filePath);
        setLogoUrl(publicData.publicUrl);
        setLogoMessage('Logotipo de empresa actualizado correctamente.');

      } else {
        if (!expo) throw new Error('No se encontró información del evento.');

        const { error: updateError } = await supabase
          .from('expos')
          .update({ logo_path: filePath })
          .eq('id', expo.id);

        if (updateError) {
            throw new Error(`Error al actualizar base de datos: ${updateError.message}`);
        }

        // Update local state
        const { data: publicData } = supabase.storage
            .from('expo360-clients-assets')
            .getPublicUrl(filePath);
        setExpoLogoUrl(publicData.publicUrl);
        setLogoMessage('Logotipo del evento actualizado correctamente.');
      }
      
      router.refresh();

    } catch (err: any) {
      setLogoError(err.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleColorSave = async () => {
    if (!client) return;
    
    setSavingColor(true);
    setLogoMessage('');
    setLogoError('');
    
    try {
      const backgroundConfig = {
        type: bgType,
        colors: bgType === 'solid' ? [bgColors[0]] : bgColors,
        direction: bgDirection
      };

      const updatedTheme = {
        ...(client.theme || {}),
        backgroundConfig,
        // Keep legacy for now, or update it to primary color
        dashboardBgColor: bgColors[0]
      };

      const { error } = await supabase
        .from('clients')
        .update({ theme: updatedTheme })
        .eq('id', client.id);

      if (error) throw error;
      
      // Update local client state
      setClient({ ...client, theme: updatedTheme });
      setLogoMessage('Apariencia actualizada correctamente.');
      
      // Redirect to dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Error updating background color:', err);
      setLogoError('Error al guardar la apariencia.');
    } finally {
      setSavingColor(false);
    }
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) {
      errors.push('Debe tener al menos 8 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Debe incluir al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Debe incluir al menos una letra minúscula');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Debe incluir al menos un número');
    }
    return errors;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      // Validate form inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        throw new Error('Todos los campos son obligatorios');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas nuevas no coinciden');
      }

      // Validate password strength
      const passwordErrors = validatePassword(newPassword);
      if (passwordErrors.length > 0) {
        throw new Error(`Contraseña no válida:\n• ${passwordErrors.join('\n• ')}`);
      }

      // First, verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(`Error al actualizar contraseña: ${updateError.message}`);
      }

      setMessage('Contraseña actualizada exitosamente');
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setMessage(''), 5000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p>Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: "url('/vine_2b.png')",
        backgroundRepeat: 'repeat',
        backgroundSize: '400px 400px',
        backgroundPosition: 'center',
        padding: '2rem',
      }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Dashboard
          </button>
          <h1 className="text-2xl font-bold text-amber-800">Configuración</h1>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Perfil</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-800 bg-gray-50 p-2 rounded">{userEmail}</p>
            </div>
            {userName && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Nombre</label>
                <p className="text-gray-800 bg-gray-50 p-2 rounded">{userName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Cambiar Contraseña</h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña Actual *
              </label>
              <input
                type="password"
                id="currentPassword"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ color: '#4B2E09', fontWeight: 'bold' }}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña *
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ color: '#4B2E09', fontWeight: 'bold' }}
                required
                disabled={loading}
              />
              <div className="mt-2 text-sm text-gray-600">
                <p className="mb-1">La contraseña debe tener:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Al menos 8 caracteres</li>
                  <li>Al menos una letra mayúscula</li>
                  <li>Al menos una letra minúscula</li>
                  <li>Al menos un número</li>
                </ul>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Nueva Contraseña *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{ color: '#4B2E09', fontWeight: 'bold' }}
                required
                disabled={loading}
              />
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-3 px-4 rounded-md transition-colors duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Actualizando...
                </div>
              ) : (
                'Actualizar Contraseña'
              )}
            </button>
          </form>
        </div>

        {/* Logo Management Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Gestión de Logotipos
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Company Logo */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-700 mb-3">Logotipo de Empresa</h3>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full h-32 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden relative">
                        {logoUrl ? (
                            <Image 
                                src={logoUrl} 
                                alt="Company Logo" 
                                fill
                                style={{ objectFit: 'contain', padding: '1rem' }}
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">Sin logotipo</span>
                        )}
                    </div>
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-center">
                        {uploadingLogo ? 'Subiendo...' : 'Cambiar Logo Empresa'}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/png"
                            disabled={uploadingLogo}
                            onChange={(e) => handleLogoUpload(e, 'client')}
                        />
                    </label>
                </div>
            </div>

            {/* Expo Logo */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-700 mb-3">Logotipo de Expo #1</h3>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-full h-32 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden relative">
                        {expoLogoUrl ? (
                            <Image 
                                src={expoLogoUrl} 
                                alt="Expo Logo" 
                                fill
                                style={{ objectFit: 'contain', padding: '1rem' }}
                            />
                        ) : (
                            <span className="text-gray-400 text-sm">Sin logotipo</span>
                        )}
                    </div>
                    <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors w-full text-center">
                        {uploadingLogo ? 'Subiendo...' : 'Cambiar Logo Evento'}
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/png"
                            disabled={uploadingLogo}
                            onChange={(e) => handleLogoUpload(e, 'expo')}
                        />
                    </label>
                </div>
            </div>
          </div>

          {logoError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-700 text-sm">{logoError}</p>
              </div>
          )}

          {logoMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-700 text-sm">{logoMessage}</p>
              </div>
          )}
          
          <p className="text-xs text-gray-500 mt-4">
            * Solo archivos PNG. Máximo 3MB. Fondo transparente recomendado.
          </p>
        </div>

        {/* Appearance Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-200">
            Apariencia del Dashboard
          </h2>
          
          <div className="space-y-6">
            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Fondo</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="bgType" 
                    value="solid" 
                    checked={bgType === 'solid'} 
                    onChange={() => setBgType('solid')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-gray-700">Color Sólido</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="bgType" 
                    value="gradient" 
                    checked={bgType === 'gradient'} 
                    onChange={() => setBgType('gradient')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-gray-700">Gradiente</span>
                </label>
              </div>
            </div>

            {/* Color Pickers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bgType === 'solid' ? 'Color' : 'Colores del Gradiente'}
              </label>
              
              <div className="flex flex-wrap gap-4 items-end">
                {/* Color 1 */}
                <div>
                  <span className="text-xs text-gray-500 block mb-1">Color 1</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bgColors[0]}
                      onChange={(e) => {
                        const newColors = [...bgColors];
                        newColors[0] = e.target.value;
                        setBgColors(newColors);
                      }}
                      className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-xs font-mono text-gray-500">{bgColors[0]}</span>
                  </div>
                </div>

                {bgType === 'gradient' && (
                  <>
                    {/* Color 2 */}
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Color 2</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColors[1]}
                          onChange={(e) => {
                            const newColors = [...bgColors];
                            newColors[1] = e.target.value;
                            setBgColors(newColors);
                          }}
                          className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-gray-500">{bgColors[1]}</span>
                      </div>
                    </div>

                    {/* Optional Color 3 */}
                    <div>
                      <span className="text-xs text-gray-500 block mb-1">Color 3 (Opcional)</span>
                      <div className="flex items-center gap-2">
                         {bgColors.length > 2 ? (
                            <>
                              <input
                                type="color"
                                value={bgColors[2]}
                                onChange={(e) => {
                                  const newColors = [...bgColors];
                                  newColors[2] = e.target.value;
                                  setBgColors(newColors);
                                }}
                                className="h-10 w-16 p-1 rounded border border-gray-300 cursor-pointer"
                              />
                              <button 
                                onClick={() => setBgColors(bgColors.slice(0, 2))}
                                className="text-red-500 hover:text-red-700 text-xs underline"
                              >
                                Eliminar
                              </button>
                            </>
                         ) : (
                            <button 
                              onClick={() => setBgColors([...bgColors, '#ffffff'])}
                              className="h-10 px-3 border border-dashed border-gray-300 rounded text-gray-500 text-xs hover:bg-gray-50"
                            >
                              + Agregar Color
                            </button>
                         )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Direction Selector (Gradient Only) */}
            {bgType === 'gradient' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <select
                  value={bgDirection}
                  onChange={(e) => setBgDirection(e.target.value)}
                  className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                >
                  <option value="to bottom">Arriba hacia Abajo (↓)</option>
                  <option value="to top">Abajo hacia Arriba (↑)</option>
                  <option value="to right">Izquierda a Derecha (→)</option>
                  <option value="to left">Derecha a Izquierda (←)</option>
                  <option value="to bottom right">Diagonal (↘)</option>
                  <option value="to top right">Diagonal (↗)</option>
                </select>
              </div>
            )}

            {/* Preview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vista Previa</label>
              <div 
                className="h-24 w-full rounded-lg border border-gray-200 shadow-inner"
                style={{
                  background: bgType === 'solid' 
                    ? bgColors[0] 
                    : `linear-gradient(${bgDirection}, ${bgColors.join(', ')})`
                }}
              />
            </div>
            
            <div className="flex justify-end pt-4">
               <button
                onClick={handleColorSave}
                disabled={savingColor}
                className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium py-2 px-6 rounded-md transition-colors duration-200"
              >
                {savingColor ? 'Guardando...' : 'Guardar y Aplicar'}
              </button>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Nota de Seguridad</h3>
              <p className="text-sm text-blue-700 mt-1">
                Al cambiar tu contraseña, mantendrás tu sesión actual. Se recomienda usar una contraseña única y segura.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}