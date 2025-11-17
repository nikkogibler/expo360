"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// 1. Define the steps for the wizard to match the design
const wizardSteps = [
  { id: 1, name: 'Elige un Tema' },
  { id: 2, name: 'Información Empresarial' },
  { id: 3, name: 'Estudio de Diseño' },
  { id: 4, name: 'Navegación' },
  { id: 5, name: 'Lanzar' },
];

// 2. Placeholder data for the theme templates
const themes = [
  { name: 'Coolness', image: '/themes/0001_1_an-e-commerce-product-listing-page-with-_YoSQWppDSfq9XQx7bivvrA_YqAVPcP4QGm1mZ-b1vS2mQ.png' },
  { name: 'Moody Blues', image: '/themes/0002_1_a-modern-e-commerce-website-template-des_eA8CFs_FS9mcatnohLN1Dw_RmhbyRyuTWe8X5LtrmLizA.png' },
  { name: 'Etsyting', image: '/themes/0003_1_a-minimalist-e-commerce-product-listing-_V3L2-757SB2TzAPL5l17Rg_mE30LP7IQjOgj6OoOvk_dA.png' },
  { name: 'Hypemaker', image: '/themes/0004_1_a-minimalist-e-commerce-product-listing-_FthKXaKrS0OLeB5HEstpqQ_KFq_Apv9R_GGujLUMoGgeQ.png' },
  { name: 'Clean & Crisp', image: '/themes/0004_2_a-clean-e-commerce-product-listing-page-_JVUVfmjmROiqAy-RqhK1Jg_KFq_Apv9R_GGujLUMoGgeQ.png' },
  { name: 'Showcase', image: '/themes/0005_1_an-e-commerce-product-listing-page-showc_YE9rFisHRjSnrJheqrCxqA__CRlbttATIGCPQITahzbvw.png' },
];

// Types used by the wizard subcomponents
interface CompanyInfo {
  companyName: string;
  employees: string;
  locations: string;
  description: string;
  website: string;
  email: string;
  revenue: string;
  logo: string | null;
}

interface DesignConfig {
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  showPricing: boolean;
  showRatings: boolean;
  bannerStyle: string;
  bannerHeight: string;
  favicon?: string | null;
  // Optional assets and toggles
  bannerImage?: string | null;
  backgroundImage?: string | null;
  backgroundMode?: string;
  showCompanyName?: boolean;
}

interface NavigationConfig {
  navStyle: string;
  navPosition: string;
  showLogo: boolean;
  navBackgroundColor: string;
  navTextColor: string;
  navAlignment: string;
}

// 3. Main Wizard Component
export default function BuildWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(themes[2].name);

  interface CompanyInfo {
    companyName: string;
    employees: string;
    locations: string;
    description: string;
    website: string;
    email: string;
    revenue: string;
    logo: string | null;
  }

  interface DesignConfig {
    primaryColor: string;
    secondaryColor: string;
    darkMode: boolean;
    showPricing: boolean;
    showRatings: boolean;
    bannerStyle: string;
    bannerHeight: string;
    favicon?: string | null;
    // Optional assets and toggles
    bannerImage?: string | null;
    backgroundImage?: string | null;
    backgroundMode?: string; // 'tile' | 'fullscreen' | etc
    showCompanyName?: boolean;
  }

  interface NavigationConfig {
    navStyle: string;
    navPosition: string;
    showLogo: boolean;
    navBackgroundColor: string;
    navTextColor: string;
    navAlignment: string;
  }

  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    companyName: '',
    employees: '',
    locations: '',
    description: '',
    website: '',
    email: '',
    revenue: '',
    logo: null as string | null,
  });

  const [designConfig, setDesignConfig] = useState<DesignConfig>({
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    darkMode: false,
    showPricing: true,
    showRatings: true,
    bannerStyle: 'gradient',
    bannerHeight: 'medium',
    favicon: null as string | null,
  });

  const [navigationConfig, setNavigationConfig] = useState<NavigationConfig>({
    navStyle: 'horizontal',
    navPosition: 'top',
    showLogo: true,
    navBackgroundColor: '#ffffff',
    navTextColor: '#000000',
    navAlignment: 'left',
  });

  const handleNext = () => {
    if (currentStep < wizardSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
      <div className="p-8">
        {/* Header with Logo and Step Indicator */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-6">
            {/* Expo360 Logo */}
            <div className="pl-6">
              <Image
                src="/expo360.png"
                alt="Expo360"
                width={140}
                height={53}
                className="object-contain"
              />
            </div>
            
            {/* Step Indicator */}
            <div className="flex items-center space-x-8 ml-4 pl-6 border-l-2 border-gray-200">
              {wizardSteps.map((step) => (
                <div key={step.id} className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                      currentStep >= step.id
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? '✔' : step.id}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-gray-500">{`Paso ${step.id}`}</div>
                    <div className="text-lg font-bold text-gray-800">{step.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
          </div>
        </header>

        {/* Main Content Area */}
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <ThemeSelector
                  selectedTheme={selectedTheme}
                  onSelectTheme={setSelectedTheme}
                />
              )}
              {currentStep === 2 && (
                <CompanyInfoStep
                  companyInfo={companyInfo}
                  onUpdateCompanyInfo={setCompanyInfo}
                />
              )}
              {currentStep === 3 && (
                <DesignStudioStep
                  designConfig={designConfig}
                  onUpdateDesignConfig={setDesignConfig}
                  companyInfo={companyInfo}
                />
              )}
              {currentStep === 4 && (
                <NavigationStep
                  navigationConfig={navigationConfig}
                  onUpdateNavigationConfig={setNavigationConfig}
                  companyInfo={companyInfo}
                />
              )}
              {currentStep === 5 && <LaunchStep companyInfo={companyInfo} designConfig={designConfig} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer with Navigation */}
      <footer className="bg-white/50 px-8 py-5 flex justify-between items-center border-t border-gray-200/80">
        <button
          onClick={handleBack}
          disabled={currentStep === 1}
          className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Atrás
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === 1 ? !selectedTheme : currentStep === wizardSteps.length}
          className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {currentStep === wizardSteps.length ? '✓ Completar' : 'Siguiente →'}
        </button>
      </footer>
    </div>
  );
}

// 4. Step 1 Component: Theme Selector
const ThemeSelector = ({ selectedTheme, onSelectTheme }: { selectedTheme: string | null, onSelectTheme: (theme: string) => void }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Elige Tu Base</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {themes.map((theme) => (
        <div
          key={theme.name}
          onClick={() => onSelectTheme(theme.name)}
          className={`rounded-lg overflow-hidden border-4 transition-all duration-300 cursor-pointer group ${
            selectedTheme === theme.name ? 'border-blue-500 shadow-2xl' : 'border-transparent hover:border-blue-300'
          }`}
        >
          <div className="relative w-full h-48">
            <Image
              src={theme.image}
              alt={theme.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="p-4 bg-white">
            <h3 className="font-semibold text-gray-800">{theme.name}</h3>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// 5. Company Info Step
const CompanyInfoStep = ({ companyInfo, onUpdateCompanyInfo }: { companyInfo: CompanyInfo, onUpdateCompanyInfo: (info: CompanyInfo) => void }) => {
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCompanyInfo({ ...companyInfo, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const revenueOptions = [
    'Menos de $100,000 MXN',
    '$100,000 - $500,000 MXN',
    '$500,000 - $1,000,000 MXN',
    '$1,000,000 - $5,000,000 MXN',
    '$5,000,000 - $10,000,000 MXN',
    '$10,000,000 - $20,000,000 MXN',
    '$20,000,000 MXN o más',
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Información Empresarial</h2>
      <p className="text-gray-600 mb-8">Cuéntanos sobre tu negocio</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Form Fields */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Logo de la Empresa</label>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-700 font-medium">📋 Especificaciones Ideales:</p>
              <ul className="text-xs text-blue-600 mt-2 space-y-1">
                <li>• Dimensiones: 1500 × 500 px</li>
                <li>• Formato: PNG o WEBP transparente</li>
                <li>• Tamaño máximo: 500 KB</li>
              </ul>
            </div>
            {companyInfo.logo ? (
              <div className="relative">
                <motion.img
                  src={companyInfo.logo}
                  alt="Logo"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="w-full h-32 object-contain bg-gray-50 rounded-lg border-2 border-blue-300 p-4"
                />
                <button
                  onClick={() => onUpdateCompanyInfo({ ...companyInfo, logo: null })}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Cambiar Logo
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-8 cursor-pointer hover:bg-blue-50 transition-all">
                <span className="text-4xl mb-2">📤</span>
                <span className="text-sm font-medium text-gray-700">Haz clic para subir logo</span>
                <span className="text-xs text-gray-500 mt-1">PNG o WEBP transparente (máx. 500 KB)</span>
                <input
                  type="file"
                  accept=".png,.webp,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre de la Empresa *</label>
            <input
              type="text"
              placeholder="ej: Mi Tienda Digital"
              value={companyInfo.companyName}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, companyName: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Employees */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Empleados</label>
            <input
              type="number"
              placeholder="ej: 5"
              value={companyInfo.employees}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, employees: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Locations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sucursales Físicas</label>
            <input
              type="number"
              placeholder="ej: 3"
              value={companyInfo.locations}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, locations: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email de Contacto *</label>
            <input
              type="email"
              placeholder="contacto@miempresa.com"
              value={companyInfo.email}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Website */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sitio Web</label>
            <input
              type="url"
              placeholder="https://mitienda.com"
              value={companyInfo.website}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, website: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Revenue */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Ingresos Anuales Estimados</label>
            <select
              value={companyInfo.revenue}
              onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, revenue: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Selecciona un rango</option>
              {revenueOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right side: Description */}
        <div className="flex flex-col">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción de la Empresa</label>
          <textarea
            placeholder="Cuéntanos sobre tu negocio, qué vendes, tu historia, valores, etc..."
            value={companyInfo.description}
            onChange={(e) => onUpdateCompanyInfo({ ...companyInfo, description: e.target.value })}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-2">{companyInfo.description.length} / 500 caracteres</p>
        </div>
      </div>
    </div>
  );
};

// 6. Design Studio Step
const DesignStudioStep = ({ designConfig, onUpdateDesignConfig, companyInfo }: { designConfig: DesignConfig, onUpdateDesignConfig: (config: DesignConfig) => void, companyInfo: CompanyInfo }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const updateConfig = (key: string, value: string | boolean | null | undefined) => {
    onUpdateDesignConfig({ ...designConfig, [key]: value });
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('favicon', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('backgroundImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB = 2097152 bytes)
      if (file.size > 2097152) {
        alert('El archivo es demasiado grande. Máximo 2MB permitido.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig('bannerImage', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const bannerHeightClasses = {
    small: 'h-24',
    medium: 'h-40',
    large: 'h-56',
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Estudio de Diseño</h2>
      <p className="text-gray-600 mb-8">Personaliza los bloques de construcción de tu marca</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Building Blocks */}
        <div className="space-y-4">
          {/* Colors Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">🎨</div>
              <h3 className="font-bold text-gray-800">Colores</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <label className="font-medium text-gray-700 text-sm">Principal:</label>
                <input
                  type="color"
                  value={designConfig.primaryColor}
                  onChange={(e) => updateConfig('primaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <span className="text-xs font-mono text-gray-600">{designConfig.primaryColor}</span>
              </div>
              <div className="flex items-center space-x-3">
                <label className="font-medium text-gray-700 text-sm">Secundario:</label>
                <input
                  type="color"
                  value={designConfig.secondaryColor}
                  onChange={(e) => updateConfig('secondaryColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <span className="text-xs font-mono text-gray-600">{designConfig.secondaryColor}</span>
              </div>
            </div>
          </motion.div>

          {/* Features Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">⚙️</div>
              <h3 className="font-bold text-gray-800">Características</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designConfig.showPricing}
                  onChange={(e) => updateConfig('showPricing', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Precios</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designConfig.showRatings}
                  onChange={(e) => updateConfig('showRatings', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Calificaciones</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designConfig.showCompanyName !== false}
                  onChange={(e) => updateConfig('showCompanyName', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Nombre de la Empresa</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={designConfig.darkMode}
                  onChange={(e) => updateConfig('darkMode', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Modo Oscuro</span>
              </label>
            </div>
          </motion.div>

          {/* Banner Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-pink-50 to-pink-100 border-2 border-pink-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center text-white text-xl">🎪</div>
              <h3 className="font-bold text-gray-800">Banner</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Estilo:</label>
                <div className="flex gap-2">
                  {['gradient', 'solid', 'image'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateConfig('bannerStyle', style)}
                      className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                        designConfig.bannerStyle === style
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-300 text-gray-700 hover:bg-pink-50'
                      }`}
                    >
                      {style === 'gradient' ? 'Gradiente' : style === 'solid' ? 'Sólido' : 'Imagen'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Altura:</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((height) => (
                    <button
                      key={height}
                      onClick={() => updateConfig('bannerHeight', height)}
                      className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-all ${
                        designConfig.bannerHeight === height
                          ? 'bg-pink-500 text-white'
                          : 'bg-white border border-pink-300 text-gray-700 hover:bg-pink-50'
                      }`}
                    >
                      {height === 'small' ? 'Pequeño' : height === 'medium' ? 'Mediano' : 'Grande'}
                    </button>
                  ))}
                </div>
              </div>
              {designConfig.bannerStyle === 'image' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Imagen del Catálogo:</label>
                  <div className="bg-pink-50 border border-pink-200 rounded p-3 mb-3">
                    <p className="text-xs text-pink-700 font-medium">📋 Especificaciones:</p>
                    <ul className="text-xs text-pink-600 mt-2 space-y-1">
                      <li>• Dimensiones: 1500 × 500 px</li>
                      <li>• Tamaño máximo: 2 MB</li>
                      <li>• Formato: PNG, JPG o WEBP</li>
                    </ul>
                  </div>
                  {designConfig.bannerImage ? (
                    <div className="relative">
                      <img
                        src={designConfig.bannerImage}
                        alt="Banner"
                        className="w-full h-24 object-cover rounded-lg border-2 border-pink-300"
                      />
                      <button
                        onClick={() => updateConfig('bannerImage', null)}
                        className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                      >
                        Cambiar Imagen
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-lg p-4 cursor-pointer hover:bg-pink-50 transition-all">
                      <span className="text-xl mb-1">🖼️</span>
                      <span className="text-xs font-medium text-gray-700">Haz clic para subir imagen</span>
                      <span className="text-xs text-gray-500 mt-1">Máx. 2 MB</span>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp"
                        onChange={handleBannerImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Favicon Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">🌐</div>
              <h3 className="font-bold text-gray-800">Favicon</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-600 mb-3">Icono que aparece en la pestaña del navegador</p>
              {designConfig.favicon ? (
                <div className="relative">
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-yellow-300">
                    <img
                      src={designConfig.favicon}
                      alt="Favicon"
                      className="w-8 h-8 object-contain"
                    />
                    <span className="text-xs text-gray-600">Favicon cargado</span>
                  </div>
                  <button
                    onClick={() => updateConfig('favicon', null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Cambiar Favicon
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-yellow-300 rounded-lg p-6 cursor-pointer hover:bg-yellow-50 transition-all">
                  <span className="text-2xl mb-2">📌</span>
                  <span className="text-xs font-medium text-gray-700">Haz clic para subir favicon</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, ICO o WEBP (32x32 px recomendado)</span>
                  <input
                    type="file"
                    accept=".ico,.png,.webp,image/png,image/webp,image/x-icon"
                    onChange={handleFaviconUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </motion.div>

          {/* Background Image Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white text-xl">🖼️</div>
              <h3 className="font-bold text-gray-800">Fondo</h3>
            </div>
            <div className="space-y-3">
              <p className="text-xs text-gray-600 mb-3">Imagen de fondo para el sitio</p>
              {designConfig.backgroundImage ? (
                <div className="relative">
                  <div className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-indigo-300">
                    <img
                      src={designConfig.backgroundImage}
                      alt="Background"
                      className="w-12 h-12 object-cover rounded"
                    />
                    <span className="text-xs text-gray-600">Fondo cargado</span>
                  </div>
                  <button
                    onClick={() => updateConfig('backgroundImage', null)}
                    className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium"
                  >
                    Cambiar Fondo
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 rounded-lg p-6 cursor-pointer hover:bg-indigo-50 transition-all">
                  <span className="text-2xl mb-2">🌄</span>
                  <span className="text-xs font-medium text-gray-700">Haz clic para subir fondo</span>
                  <span className="text-xs text-gray-500 mt-1">PNG, JPG o WEBP</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/png,image/jpeg,image/webp"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                  />
                </label>
              )}
              {designConfig.backgroundImage && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Modo:</label>
                  <div className="flex gap-2">
                    {['fullscreen', 'tile'].map((mode) => (
                      <div key={mode} className="flex-1">
                        <button
                          onClick={() => updateConfig('backgroundMode', mode)}
                          className={`w-full px-3 py-2 rounded text-xs font-medium transition-all ${
                            (designConfig.backgroundMode || 'fullscreen') === mode
                              ? 'bg-indigo-500 text-white'
                              : 'bg-white border border-indigo-300 text-gray-700 hover:bg-indigo-50'
                          }`}
                        >
                          {mode === 'fullscreen' ? 'Pantalla Completa' : 'Repetir'}
                        </button>
                        {mode === 'tile' && (designConfig.backgroundMode === 'tile' || (designConfig.backgroundMode === undefined && mode === 'tile')) && (
                          <p className="text-xs text-indigo-600 mt-1">💡 Ideal: imagen cuadrada 300x300px</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right side: Live Preview */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Vista Previa en Vivo</h3>
            <button
              onClick={() => setIsFullscreen(true)}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded transition-all flex items-center gap-1"
              title="Ver a pantalla completa"
            >
              ⛶ Pantalla Completa
            </button>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex-1 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden transition-all ${
              designConfig.darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{
              borderColor: designConfig.primaryColor,
              backgroundImage: designConfig.backgroundImage 
                ? `url(${designConfig.backgroundImage})`
                : 'none',
              backgroundSize: (designConfig.backgroundMode || 'fullscreen') === 'tile' ? '300px 300px' : 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          >
            {/* Content Overlay */}
            <div className="flex-1">
            {/* Header with Logo */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                {companyInfo.logo ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <img
                      src={companyInfo.logo}
                      alt="Logo"
                      className="w-32 h-32 object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-4xl"
                  >
                    📦
                  </motion.div>
                )}
                {designConfig.showCompanyName !== false && (
                  <div>
                    <h4 className="text-xl font-bold" style={{ color: designConfig.darkMode ? '#ffffff' : '#1f2937' }}>
                      {companyInfo.companyName || 'Tu Marca'}
                    </h4>
                  </div>
                )}
              </div>

            {/* Banner Preview */}
            <div
              className={`w-full ${bannerHeightClasses[designConfig.bannerHeight as keyof typeof bannerHeightClasses]} relative flex items-center justify-center text-white font-bold text-lg overflow-hidden mb-6`}
              style={{
                background:
                  designConfig.bannerStyle === 'image' && designConfig.bannerImage
                    ? `url(${designConfig.bannerImage})`
                    : designConfig.bannerStyle === 'gradient'
                    ? `linear-gradient(135deg, ${designConfig.primaryColor}, ${designConfig.secondaryColor})`
                    : designConfig.bannerStyle === 'solid'
                    ? designConfig.primaryColor
                    : `linear-gradient(135deg, ${designConfig.primaryColor}, ${designConfig.secondaryColor})`,
                backgroundSize: designConfig.bannerStyle === 'image' ? 'contain' : 'auto',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {designConfig.bannerStyle === 'image' && !designConfig.bannerImage ? (
                <span className="text-gray-300">Imagen del Catálogo</span>
              ) : designConfig.bannerStyle !== 'image' ? (
                <span>Tu Catálogo</span>
              ) : null}
            </div>

              {/* Search Bar */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="🔍 Buscar productos..."
                  className={`w-full px-4 py-2 rounded-lg border-2 text-xs ${
                    designConfig.darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                  }`}
                  disabled
                />
              </div>

              {/* Sorting and Filtering Controls */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <select
                  className={`px-3 py-2 rounded text-xs border-2 font-medium ${
                    designConfig.darkMode
                      ? 'bg-gray-800 border-gray-700 text-white'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                  disabled
                >
                  <option>Ordenar por: Relevancia</option>
                  <option>Precio: Menor a Mayor</option>
                  <option>Precio: Mayor a Menor</option>
                  <option>Más Nuevo</option>
                </select>
                <button
                  className={`px-3 py-2 rounded text-xs font-medium border-2 transition-all ${
                    designConfig.darkMode
                      ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled
                >
                  🔽 Filtros
                </button>
              </div>

              {/* Preview Product Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border-2 ${
                      designConfig.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                    }`}
                  >
                    <div
                      className="w-full h-20 rounded mb-2 flex items-center justify-center text-gray-400 text-sm"
                      style={{ backgroundColor: designConfig.primaryColor + '20' }}
                    >
                      Producto
                    </div>
                    {designConfig.showRatings && (
                      <div className="text-xs mb-2">⭐⭐⭐⭐⭐</div>
                    )}
                    {designConfig.showPricing && (
                      <div
                        className="font-bold text-sm"
                        style={{ color: designConfig.secondaryColor }}
                      >
                        $99.99
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* CTA Button Preview */}
              <button
                className="w-full mt-4 px-8 py-3 rounded-lg text-white font-bold transition-all transform hover:scale-105"
                style={{ backgroundColor: designConfig.secondaryColor }}
              >
                Ver Catálogo Completo
              </button>
            </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsFullscreen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full h-full rounded-xl border-2 border-dashed overflow-auto ${
              designConfig.darkMode ? 'bg-gray-900' : 'bg-white'
            }`}
            style={{
              borderColor: designConfig.primaryColor,
              backgroundImage: designConfig.backgroundImage 
                ? `url(${designConfig.backgroundImage})`
                : 'none',
              backgroundSize: (designConfig.backgroundMode || 'fullscreen') === 'tile' ? '300px 300px' : 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="fixed top-6 right-6 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full z-50 shadow-lg font-bold text-xl"
            >
              ✕
            </button>

            {/* Content */}
            <div className="flex-1">
            {/* Content Overlay */}
            <div className="flex-1 p-8">
              {/* Header with Logo */}
              <div className="flex items-center space-x-4 mb-6">
                {companyInfo.logo ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg overflow-hidden"
                  >
                    <img
                      src={companyInfo.logo}
                      alt="Logo"
                      className="w-40 h-40 object-contain"
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-40 h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-5xl"
                  >
                    📦
                  </motion.div>
                )}
                {designConfig.showCompanyName !== false && (
                  <div>
                    <h4 className="text-3xl font-bold" style={{ color: designConfig.darkMode ? '#ffffff' : '#1f2937' }}>
                      {companyInfo.companyName || 'Tu Marca'}
                    </h4>
                  </div>
                )}
              </div>

              {/* Banner Preview */}
              <div
                className={`w-full ${bannerHeightClasses[designConfig.bannerHeight as keyof typeof bannerHeightClasses]} relative flex items-center justify-center text-white font-bold text-lg overflow-hidden mb-6`}
                style={{
                  background:
                    designConfig.bannerStyle === 'image' && designConfig.bannerImage
                      ? `url(${designConfig.bannerImage})`
                      : designConfig.bannerStyle === 'gradient'
                      ? `linear-gradient(135deg, ${designConfig.primaryColor}, ${designConfig.secondaryColor})`
                      : designConfig.bannerStyle === 'solid'
                      ? designConfig.primaryColor
                      : `linear-gradient(135deg, ${designConfig.primaryColor}, ${designConfig.secondaryColor})`,
                  backgroundSize: designConfig.bannerStyle === 'image' ? 'contain' : 'auto',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  // For fullscreen: calculate height to maintain 1500x500 aspect ratio at full width
                  height: designConfig.bannerStyle === 'image' ? 'calc(100vw * 500 / 1500)' : 'auto',
                  maxHeight: designConfig.bannerStyle === 'image' ? '500px' : 'auto',
                }}
              >
                {designConfig.bannerStyle === 'image' && !designConfig.bannerImage ? (
                  <span className="text-gray-300">Imagen del Catálogo</span>
                ) : designConfig.bannerStyle !== 'image' ? (
                  <span>Tu Catálogo</span>
                ) : null}
              </div>

                {/* Search Bar */}
                <div className="mb-6">
                  <input
                    type="text"
                    placeholder="🔍 Buscar productos..."
                    className={`w-full px-4 py-3 rounded-lg border-2 text-sm ${
                      designConfig.darkMode
                        ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                        : 'bg-white border-gray-300 text-gray-700 placeholder-gray-400'
                    }`}
                    disabled
                  />
                </div>

                {/* Sorting and Filtering Controls */}
                <div className="flex gap-3 mb-6 flex-wrap">
                  <select
                    className={`px-4 py-2 rounded border-2 font-medium ${
                      designConfig.darkMode
                        ? 'bg-gray-800 border-gray-700 text-white'
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                    disabled
                  >
                    <option>Ordenar por: Relevancia</option>
                    <option>Precio: Menor a Mayor</option>
                    <option>Precio: Mayor a Menor</option>
                    <option>Más Nuevo</option>
                  </select>
                  <button
                    className={`px-4 py-2 rounded border-2 font-medium transition-all ${
                      designConfig.darkMode
                        ? 'bg-gray-800 border-gray-700 text-white hover:bg-gray-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    disabled
                  >
                    🔽 Filtros
                  </button>
                </div>

                {/* Preview Product Grid */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className={`p-4 rounded-lg border-2 ${
                        designConfig.darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
                      }`}
                    >
                      <div
                        className="w-full h-32 rounded mb-3 flex items-center justify-center text-gray-400 text-sm"
                        style={{ backgroundColor: designConfig.primaryColor + '20' }}
                      >
                        Producto
                      </div>
                      {designConfig.showRatings && (
                        <div className="text-sm mb-2">⭐⭐⭐⭐⭐</div>
                      )}
                      {designConfig.showPricing && (
                        <div
                          className="font-bold text-base"
                          style={{ color: designConfig.secondaryColor }}
                        >
                          $99.99
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA Button Preview */}
                <button
                  className="w-full px-8 py-4 rounded-lg text-white font-bold transition-all transform hover:scale-105 text-lg"
                  style={{ backgroundColor: designConfig.secondaryColor }}
                >
                  Ver Catálogo Completo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

// 7. Navigation Step
const NavigationStep = ({ navigationConfig, onUpdateNavigationConfig, companyInfo }: { navigationConfig: NavigationConfig, onUpdateNavigationConfig: (config: NavigationConfig) => void, companyInfo: CompanyInfo }) => {
  const updateConfig = (key: string, value: string | boolean | null | undefined) => {
    onUpdateNavigationConfig({ ...navigationConfig, [key]: value });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Navegación</h2>
      <p className="text-gray-600 mb-8">Personaliza el estilo y la apariencia de tu navegación</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Navigation Options */}
        <div className="space-y-4">
          {/* Nav Style Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">📱</div>
              <h3 className="font-bold text-gray-800">Estilo de Navegación</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Tipo:</label>
                <div className="flex gap-2 flex-wrap">
                  {['horizontal', 'vertical', 'sticky'].map((style) => (
                    <button
                      key={style}
                      onClick={() => updateConfig('navStyle', style)}
                      className={`flex-1 min-w-fit px-3 py-2 rounded text-xs font-medium transition-all ${
                        navigationConfig.navStyle === style
                          ? 'bg-blue-500 text-white'
                          : 'bg-white border border-blue-300 text-gray-700 hover:bg-blue-50'
                      }`}
                    >
                      {style === 'horizontal' ? 'Horizontal' : style === 'vertical' ? 'Vertical' : 'Fija'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nav Alignment Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white text-xl">⚙️</div>
              <h3 className="font-bold text-gray-800">Alineación</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={navigationConfig.showLogo}
                  onChange={(e) => updateConfig('showLogo', e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar Logo en Nav</span>
              </label>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Posición:</label>
                <div className="flex gap-2 flex-wrap">
                  {['left', 'center', 'right'].map((align) => (
                    <button
                      key={align}
                      onClick={() => updateConfig('navAlignment', align)}
                      className={`flex-1 min-w-fit px-3 py-2 rounded text-xs font-medium transition-all ${
                        navigationConfig.navAlignment === align
                          ? 'bg-purple-500 text-white'
                          : 'bg-white border border-purple-300 text-gray-700 hover:bg-purple-50'
                      }`}
                    >
                      {align === 'left' ? 'Izquierda' : align === 'center' ? 'Centro' : 'Derecha'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Nav Colors Block */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-xl p-6 cursor-pointer transition-all"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">🎨</div>
              <h3 className="font-bold text-gray-800">Colores</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <label className="font-medium text-gray-700 text-sm">Fondo:</label>
                <input
                  type="color"
                  value={navigationConfig.navBackgroundColor}
                  onChange={(e) => updateConfig('navBackgroundColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <span className="text-xs font-mono text-gray-600">{navigationConfig.navBackgroundColor}</span>
              </div>
              <div className="flex items-center space-x-3">
                <label className="font-medium text-gray-700 text-sm">Texto:</label>
                <input
                  type="color"
                  value={navigationConfig.navTextColor}
                  onChange={(e) => updateConfig('navTextColor', e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
                />
                <span className="text-xs font-mono text-gray-600">{navigationConfig.navTextColor}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right side: Navigation Preview */}
        <div className="flex flex-col">
          <h3 className="font-bold text-gray-800 mb-4">Vista Previa de Navegación</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 rounded-xl border-2 border-gray-300 overflow-hidden bg-white"
          >
            {/* Navigation Preview */}
            <nav
              className="w-full p-4 flex items-center justify-between"
              style={{
                backgroundColor: navigationConfig.navBackgroundColor,
                flexDirection: navigationConfig.navStyle === 'vertical' ? 'column' : 'row',
              }}
            >
              {navigationConfig.showLogo && (
                <div className="flex items-center space-x-2 mb-2">
                  {companyInfo.logo ? (
                    <img
                      src={companyInfo.logo}
                      alt="Logo"
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs">
                      Logo
                    </div>
                  )}
                </div>
              )}
              <div
                className="flex gap-3 flex-1"
                style={{
                  justifyContent: navigationConfig.navAlignment === 'left' ? 'flex-start' : navigationConfig.navAlignment === 'center' ? 'center' : 'flex-end',
                  flexDirection: navigationConfig.navStyle === 'vertical' ? 'column' : 'row',
                }}
              >
                {['Inicio', 'Catálogo', 'Sobre', 'Contacto'].map((item) => (
                  <button
                    key={item}
                    className="px-4 py-2 rounded text-sm font-medium transition-all hover:opacity-80"
                    style={{
                      color: navigationConfig.navTextColor,
                      borderBottom: `2px solid ${navigationConfig.navTextColor}`,
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </nav>

            {/* Content Area Below Nav */}
            <div className="p-6 bg-gray-50 flex-1">
              <div className="w-12 h-12 bg-gray-200 rounded mb-3"></div>
              <div className="w-full h-4 bg-gray-200 rounded mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded mb-4"></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// 8. Launch Step
const LaunchStep = ({ companyInfo, designConfig }: { companyInfo: CompanyInfo, designConfig: DesignConfig }) => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-bold text-gray-800">¡Listo para Lanzar!</h2>
    <p className="mt-4 text-gray-600">Has completado la configuración de tu negocio</p>
    <div className="mt-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-300 inline-block">
      <p className="text-sm text-gray-700">
        <strong>Empresa:</strong> {companyInfo.companyName || '(Sin especificar)'}
      </p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Color Primario:</strong> {designConfig.primaryColor}
      </p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Modo Oscuro:</strong> {designConfig.darkMode ? 'Sí' : 'No'}
      </p>
    </div>
    <p className="mt-8 text-gray-600">Confirma tu configuración y prepárate para ir en vivo.</p>
  </div>
);
