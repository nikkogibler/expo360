"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

// 1. Define the steps for the wizard to match the design
const wizardSteps = [
  { id: 1, name: 'Pick a Theme' },
  { id: 2, name: 'Design Studio' },
  { id: 3, name: 'Launch' },
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

// 3. Main Wizard Component
export default function BuildWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(themes[2].name); // Default to Home Goods

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
    <div className="w-full max-w-5xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/30 overflow-hidden">
      <div className="p-8">
        {/* Header with Step Indicator */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-8">
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
                  <div className="text-sm font-semibold text-gray-500">{`Step ${step.id}`}</div>
                  <div className="text-lg font-bold text-gray-800">{step.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-4">
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-blue-500">Help</a>
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
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
              {currentStep === 2 && <DesignStudioStep />}
              {currentStep === 3 && <LaunchStep />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Footer with Navigation */}
      <footer className="bg-white/50 px-8 py-5 flex justify-end items-center border-t border-gray-200/80">
        <button
          onClick={handleNext}
          disabled={!selectedTheme}
          className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          Continue to Design Studio
        </button>
      </footer>
    </div>
  );
}

// 4. Step 1 Component: Theme Selector
const ThemeSelector = ({ selectedTheme, onSelectTheme }: { selectedTheme: string | null, onSelectTheme: (theme: string) => void }) => (
  <div>
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Choose Your Foundation</h2>
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

// 5. Placeholder components for other steps
const DesignStudioStep = () => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-bold text-gray-800">Design Studio</h2>
    <p className="mt-2 text-gray-600">This is where you will customize your application's look and feel.</p>
  </div>
);

const LaunchStep = () => (
  <div className="text-center py-16">
    <h2 className="text-2xl font-bold text-gray-800">Ready to Launch!</h2>
    <p className="mt-2 text-gray-600">Confirm your settings and get ready to go live.</p>
  </div>
);
