'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { PostgrestError } from '@supabase/supabase-js';

// Interface matching your existing product structure
interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  image_url: string;
  description?: string;
  is_active: boolean;
  category?: string;
  colección?: string; // ← CHANGE FROM "collection" TO "colección"
  created_at: string;
  updated_at: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

// Animation variants following your existing pattern
const containerVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      stiffness: 100,
      damping: 10,
      delay: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: 'spring', 
      stiffness: 100 
    } 
  }
};

// Product Card Component
const ProductCard = ({ product, index }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} MXN`;
  };

  const handleImageError = () => {
    console.log('❌ Image failed to load:', product.image_url);
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', product.image_url);
    setImageLoading(false);
  };

  // Add timeout for stuck loading images
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (imageLoading) {
        console.log('⏰ Image loading timeout:', product.image_url);
        setImageError(true);
        setImageLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [imageLoading, product.image_url]);

  const getImageSrc = () => {
    if (product.image_url) {
      return product.image_url;
    }
    return '/expo_mueble.png';
  };

  const shouldPrioritize = index < 4;

  return (
    <Link href={`/kusam/catalogo/${product.sku}`} passHref>
      <motion.div
        className="bg-white p-4 rounded-lg shadow-md border border-gray-100 cursor-pointer overflow-hidden relative group"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        whileHover={{ scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 10 }}
      >
        {/* Product Image */}
        <div className="relative w-full h-48 mb-4 overflow-hidden rounded-md bg-gray-200">
          
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-100 z-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-xs text-blue-600">Cargando imagen...</p>
              </div>
            </div>
          )}
          
          {!imageError ? (
            <Image
              src={getImageSrc()}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              onError={handleImageError}
              onLoad={handleImageLoad}
              priority={shouldPrioritize}
              unoptimized={true}
            />
          ) : (
            // Fallback - use placeholder image instead of error state
            <Image
              src="/expo_mueble.png"
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 opacity-75"
              unoptimized={true}
            />
          )}
          
          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold z-30">
            {formatCurrency(product.price)}
          </div>

          {/* Show image status for debugging */}
          {imageError && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-30">
              Placeholder
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-500 uppercase tracking-wide">
            SKU: {product.sku}
          </p>
          
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}
          
          {/* ✅ Updated badges section */}
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                {product.category}
              </span>
            )}
            {product.colección && ( // ← CHANGE TO "colección"
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-md text-xs">
                ✨ {product.colección}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default function KusamCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all'); // ← ADD THIS
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]); // ← ADD THIS

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching products...');
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*') // This will now include the colección column
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (productsError) {
        throw productsError;
      }

      console.log('📦 Raw products data sample:', productsData?.[0]);

      // Filter out products that begin with "XX"
      const typedProducts = (productsData as Product[]).filter(product => 
        !product.name.startsWith('XX')
      );
      
      setProducts(typedProducts);
      setFilteredProducts(typedProducts);

      // Extract unique categories
      const uniqueCategories = [...new Set(
        typedProducts
          .map(p => p.category)
          .filter(Boolean)
      )] as string[];
      setCategories(uniqueCategories.sort());

      // ✅ Extract unique collections using "colección" field
      const uniqueCollections = [...new Set(
        typedProducts
          .map(p => p.colección) // ← CHANGE FROM "collection" TO "colección"
          .filter(collection => collection && collection.trim() !== '')
      )] as string[];
      
      console.log('🎨 Unique collections found:', uniqueCollections);
      setCollections(uniqueCollections.sort());

    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      let errorMessage = 'Error al cargar los productos.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'message' in err) {
        errorMessage = (err as PostgrestError).message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.colección?.toLowerCase().includes(searchTerm.toLowerCase()) // ← CHANGE TO "colección"
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // ✅ Filter by collection using "colección" field
    if (selectedCollection !== 'all') {
      filtered = filtered.filter(product => product.colección === selectedCollection); // ← CHANGE TO "colección"
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, selectedCollection, sortBy]); // ← ADD selectedCollection

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  return (
    <div className="relative min-h-screen flex flex-col p-4 pt-10 pb-10 bg-white">
      {/* Background Video - matching your existing pattern */}
      <video
        className="fixed inset-0 w-full h-full object-cover"
        src="/leaves1.mp4"
        autoPlay
        loop
        muted
        playsInline
        disablePictureInPicture={true}
        preload="auto"
        style={{ opacity: 0.1, zIndex: -1 }}
      />

      <motion.div
        className="max-w-7xl mx-auto w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/kusam_main.webp"
              alt="Kusam Outdoor Solutions Logo"
              width={200}
              height={50}
              priority
              className="mx-auto"
            />
          </div>
          <h1 
            className="text-4xl font-bold mb-4 bg-clip-text text-transparent"
            style={{
              backgroundImage: `url('/wood/var5.png')`,
              backgroundSize: '200px 200px',
              backgroundRepeat: 'repeat',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Catálogo de Productos
          </h1>
          <p className="text-lg text-gray-600">
            Descubre nuestra colección completa de muebles para exteriores
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Category Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                >
                  <option value="all" className="text-black">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="text-black">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* ✅ Collection Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Colección</label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                >
                  <option value="all" className="text-black">Todas las colecciones</option>
                  {collections.map(collection => (
                    <option key={collection} value={collection} className="text-black">
                      {collection}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'newest')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                >
                  <option value="name" className="text-black">Nombre</option>
                  <option value="price" className="text-black">Precio</option>
                  <option value="newest" className="text-black">Más Recientes</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Mostrando {filteredProducts.length} de {products.length} productos
              {selectedCategory !== 'all' && ` en categoría "${selectedCategory}"`}
              {selectedCollection !== 'all' && ` de colección "${selectedCollection}"`}
            </div>

            {/* Clear Filters Button */}
            {(selectedCategory !== 'all' || selectedCollection !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedCollection('all');
                }}
                className="self-start px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
              >
                Limpiar Filtros
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg mt-4">Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No se encontraron productos que coincidan con tu búsqueda.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedCollection('all'); // ← ADD THIS
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerVariants}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
              />
            ))}
          </motion.div>
        )}

        {/* Navigation Buttons - Same style as product detail page */}
        <div className="mt-12 w-full max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-3">
            {/* Favorites Button */}
            <button
              onClick={() => window.location.href = '/kusam/cart'}
              className="py-3 px-2 bg-white border-2 border-green-500 text-green-600 rounded-lg font-medium text-xs shadow-sm hover:bg-green-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>Favoritos</span>
            </button>
            
            {/* Home Button */}
            <button
              onClick={() => window.location.href = '/kusam'}
              className="py-3 px-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-medium text-xs shadow-sm hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}