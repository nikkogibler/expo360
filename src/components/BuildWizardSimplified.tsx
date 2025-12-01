"use client";

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const steps = [
  { id: 1, name: 'Información Empresarial' },
  { id: 2, name: 'Estudio de Diseño' },
  { id: 3, name: 'Navegación' },
  { id: 4, name: 'Lanzar' }
];

export default function BuildWizardSimplified() {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#10b981');
  const [darkMode, setDarkMode] = useState(false);

  const [navPosition, setNavPosition] = useState('top');
  const [showLogo, setShowLogo] = useState(true);
  const [navTextColor, setNavTextColor] = useState('#000000');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
    setLogoFile(file);
  };

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, steps.length));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const saveConfig = () => {
    const payload = {
      companyName,
      companyEmail,
      description,
      logo,
      primaryColor,
      secondaryColor,
      darkMode,
      navPosition,
      showLogo,
      navTextColor
    };
    try {
      localStorage.setItem('expo360_simplified_config', JSON.stringify(payload));
      alert('Configuración guardada localmente. Puedes usar este dataset con el template.');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la configuración en localStorage.');
    }
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/30 overflow-hidden"
      initial={{ opacity: 0, x: -120, scale: 0.995 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      // subtle hover lift for expensive feeling
      whileHover={{ translateY: -2, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}
    >
      <div className="p-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Image src="/expo360.png" alt="Expo360" width={120} height={44} />
            <h1 className="text-xl font-bold">Build - Simplificado</h1>
          </div>
        </header>

        <div className="flex items-start gap-8">
          <div className="w-64">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${currentStep >= step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {currentStep > step.id ? '✔' : step.id}
                </div>
                <div>
                  <div className="text-sm text-gray-600">Paso {step.id}</div>
                  <div className="font-semibold">{step.name}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {currentStep === 1 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Información Empresarial</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} type="text" className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="Mi Tienda" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email de Contacto</label>
                        <input value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} type="email" className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="contacto@miempresa.com" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Descripción</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="mt-1 block w-full border rounded-md px-3 py-2" placeholder="Describe tu negocio..." />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Logo</label>
                        {logo ? (
                          <div className="mt-2">
                            <motion.img
                              src={logo}
                              alt="Logo"
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.15 }}
                              className="w-full h-32 object-contain bg-gray-50 rounded-lg border p-4"
                            />
                            <div className="mt-2 flex items-center gap-2">
                              <label className="text-sm text-blue-700 cursor-pointer underline">
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                                Cambiar Logo
                              </label>
                              <button type="button" onClick={() => setLogo(null)} className="text-sm text-red-600">Quitar</button>
                            </div>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-4 cursor-pointer hover:bg-blue-50 transition-all">
                            <span className="text-3xl mb-2">📤</span>
                            <span className="text-sm font-medium text-gray-700">Haz clic para subir logo</span>
                            <span className="text-xs text-gray-500 mt-1">PNG o WEBP transparente (máx. 500 KB)</span>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Estudio de Diseño</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color Primario</label>
                        <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color Secundario</label>
                        <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <label className="inline-flex items-center mt-2">
                          <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="mr-2" />
                          Modo oscuro
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Navegación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Posición del Nav</label>
                        <select value={navPosition} onChange={(e) => setNavPosition(e.target.value)} className="mt-1 block w-full border rounded-md px-3 py-2">
                          <option value="top">Top</option>
                          <option value="left">Izquierda</option>
                          <option value="right">Derecha</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Mostrar Logo</label>
                        <select value={String(showLogo)} onChange={(e) => setShowLogo(e.target.value === 'true')} className="mt-1 block w-full border rounded-md px-3 py-2">
                          <option value="true">Sí</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Color de texto del nav</label>
                        <input type="color" value={navTextColor} onChange={(e) => setNavTextColor(e.target.value)} className="mt-1" />
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Lanzar</h2>
                    <p className="text-gray-600 mb-4">Revisa tu configuración antes de guardar.</p>
                    <div className="bg-gray-50 p-4 rounded border">
                      <p><strong>Empresa:</strong> {companyName || '(Sin especificar)'}</p>
                      <p><strong>Email:</strong> {companyEmail || '(Sin especificar)'}</p>
                      <p><strong>Primario:</strong> <span style={{ color: primaryColor }}>{primaryColor}</span></p>
                      <p><strong>Secundario:</strong> <span style={{ color: secondaryColor }}>{secondaryColor}</span></p>
                      <p><strong>Nav:</strong> {navPosition} - {showLogo ? 'Logo mostrado' : 'Logo oculto'}</p>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={saveConfig} className="px-4 py-2 bg-green-500 text-white rounded">Guardar Configuración</button>
                      <button onClick={() => alert('Previsualización guardada localmente.')} className="px-4 py-2 bg-blue-100 text-blue-700 rounded">Previsualizar</button>
                      <button
                        onClick={async () => {
                          try {
                            const form = new FormData();
                            const slug = companyName ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g,'') : '';
                            form.append('name', companyName || 'Untitled');
                            form.append('slug', slug);
                            form.append('description', description || '');
                            form.append('theme', JSON.stringify({ primaryColor, secondaryColor, darkMode }));
                            if (logoFile) form.append('logo', logoFile);

                            const headers: Record<string,string> = {};
                            // For local testing you can set NEXT_PUBLIC_ADMIN_API_KEY in your .env.local
                            // This will be sent as `x-admin-key`. In production use server-only ADMIN_API_KEY.
                            const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
                            if (adminKey) headers['x-admin-key'] = adminKey;

                            const res = await fetch('/api/admin/create-client', {
                              method: 'POST',
                              headers,
                              body: form
                            });
                            const json = await res.json();
                            if (!res.ok) throw new Error(json?.error?.message || json?.error || 'Create failed');
                            alert(`Cliente creado — vista previa: ${json.previewUrl}`);
                            // open preview in new tab
                            if (json.previewUrl) window.open(json.previewUrl, '_blank');
                          } catch (err: any) {
                            console.error('Create client error', err);
                            alert('No se pudo crear el cliente: ' + (err?.message || String(err)));
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                      >
                        Lanzar Cliente
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex justify-between">
              <button onClick={goBack} disabled={currentStep === 1} className="px-4 py-2 rounded border">← Atrás</button>
              <div>
                {currentStep < steps.length && (
                  <button onClick={goNext} className="px-4 py-2 bg-blue-500 text-white rounded">Siguiente →</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}