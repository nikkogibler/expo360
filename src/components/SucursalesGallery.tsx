"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import BurgerMenu from './BurgerMenu';

interface SucursalCard {
  id: string;
  title: string;
  description: string;
  image: string;
  route: string;
  isActive: boolean;
}

const sucursalesData: SucursalCard[] = [
  // Kusam Locations First (Active)
  {
    id: 'saltillo',
    title: 'Saltillo',
    description: 'Sucursal de Saltillo',
    image: '/sucursales_y_expos/saltillo.png',
    route: '/saltillo',
    isActive: true
  },
  {
    id: 'vasconcelos',
    title: 'Vasconcelos',
    description: 'Sucursal de Vasconcelos',
    image: '/sucursales_y_expos/vasconcelos.png',
    route: '/vasconcelos',
    isActive: true
  },
  // International Exhibitions (Future)
  {
    id: 'salone_milano',
    title: 'Salone Milano',
    description: 'Exposición internacional en Milán',
    image: '/sucursales_y_expos/salone_milano.png',
    route: '#',
    isActive: false
  },
  {
    id: 'casualmarket_atl',
    title: 'Casual Market Atlanta',
    description: 'Exposición en Atlanta, Estados Unidos',
    image: '/sucursales_y_expos/casualmarketATL.png',
    route: '#',
    isActive: false
  },
  {
    id: 'ciff',
    title: 'CIFF Copenhagen',
    description: 'Copenhagen International Fashion Fair',
    image: '/sucursales_y_expos/ciff.png',
    route: '#',
    isActive: false
  },
  {
    id: 'movelsul',
    title: 'Movelsul Brasil',
    description: 'Feria de muebles en Brasil',
    image: '/sucursales_y_expos/movelsul.png',
    route: '#',
    isActive: false
  },
  {
    id: 'spoga_gafa',
    title: 'Spoga+Gafa Cologne',
    description: 'Feria internacional de jardín en Colonia',
    image: '/sucursales_y_expos/spoga_gafa.jpg',
    route: '#',
    isActive: false
  },
  {
    id: 'kusam',
    title: 'Expo Mueble GDL',
    description: 'La exposición original de Kusam en Guadalajara',
    image: '/sucursales_y_expos/expomueblegdl.png',
    route: '/kusam',
    isActive: true
  }
];

const SucursalesGallery = () => {
  const router = useRouter();
  const [burgerOpen, setBurgerOpen] = useState(false);

  const handleCardClick = (card: SucursalCard) => {
    if (card.isActive && card.route !== '#') {
      router.push(card.route);
    }
  };

  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToAdmin}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            style={{ marginTop: '7px' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <Image
            src="/kusam_main.webp"
            alt="Kusam Logo"
            width={120}
            height={30}
            className="h-8 w-auto"
          />
        </div>
        <BurgerMenu isOpen={burgerOpen} onClick={() => setBurgerOpen(!burgerOpen)} />
      </div>

      {/* Hero Image */}
      <div className="w-full mb-8">
        <Image
          src="/admin/sucursalesyexpos.png"
          alt="Sucursales y Exposiciones"
          width={400}
          height={100}
          priority
          className="w-[64%] h-auto object-contain mx-auto"
        />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2"></h1>
        <p className="text-lg text-gray-600"></p>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
          {sucursalesData.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                relative group rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform
                ${card.isActive 
                  ? 'hover:scale-105 hover:shadow-2xl cursor-pointer bg-white' 
                  : 'opacity-60 bg-gray-100 cursor-not-allowed'
                }
                aspect-[4/3] min-h-[280px]
              `}
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundImage: `url('${card.image}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-200 group-hover:text-gray-100 transition-colors">
                  {card.description}
                </p>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  {card.isActive ? (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Activo
                    </span>
                  ) : (
                    <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">
                      Próximamente
                    </span>
                  )}
                </div>

                {/* Hover Arrow */}
                {card.isActive && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19M12 5L19 12L12 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6">
        <p className="text-sm text-gray-500">
          © 2024 Kusam. Selecciona una sucursal para comenzar a agregar clientes.
        </p>
      </div>
    </div>
  );
};

export default SucursalesGallery;