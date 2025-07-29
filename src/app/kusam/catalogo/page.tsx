'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
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
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0); // For forcing re-renders
  const [loadingProgress, setLoadingProgress] = useState(0);

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} MXN`;
  };

  const handleImageError = useCallback(() => {
    console.log('❌ Image failed to load:', product.image_url, 'Attempt:', retryCount + 1);
    
    // Auto-retry up to 3 times with exponential backoff
    if (retryCount < 2) { // Reduced to 2 retries for faster fallback
      const retryDelay = Math.pow(2, retryCount) * 800; // 800ms, 1.6s
      console.log(`Auto-retrying image load in ${retryDelay}ms (attempt ${retryCount + 1}/2)`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
        setImageLoading(true);
        setImageKey(prev => prev + 1); // Force re-render
        setLoadingProgress(0);
      }, retryDelay);
    } else {
      // After 2 retries, silently use fallback
      console.log('Max retries reached, using fallback for:', product.image_url);
      setImageError(true);
      setImageLoading(false);
      setImageLoaded(false);
      setLoadingProgress(0);
    }
  }, [product.image_url, retryCount]);

  const handleImageLoad = useCallback(() => {
    console.log('✅ Image loaded successfully:', product.image_url);
    setImageError(false);
    setImageLoading(false);
    setImageLoaded(true);
    setLoadingProgress(100);
  }, [product.image_url]);

  const handleImageLoadStart = useCallback(() => {
    setLoadingProgress(10);
  }, []);

  const handleImageProgress = useCallback(() => {
    setLoadingProgress(prev => Math.min(prev + 20, 90));
  }, []);

  // Reset image state when product changes
  useEffect(() => {
    setImageError(false);
    setImageLoading(true);
    setImageLoaded(false);
    setRetryCount(0);
    setImageKey(0);
    setLoadingProgress(0);
  }, [product.image_url]);

  // Progressive loading progress simulation for large images
  useEffect(() => {
    if (imageLoading && loadingProgress < 90) {
      const interval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 5, 85));
      }, 300);
      
      return () => clearInterval(interval);
    }
  }, [imageLoading, loadingProgress]);

  // Add timeout for stuck loading images - reduced to 15 seconds
  useEffect(() => {
    if (!imageLoading) return; 
    
    const timeout = setTimeout(() => {
      if (imageLoading && !imageLoaded && !imageError) {
        console.log('⏰ Image loading timeout (15s):', product.image_url);
        handleImageError(); // Use retry logic instead of immediate failure
      }
    }, 15000); // Reduced to 15 seconds for faster fallback

    return () => clearTimeout(timeout);
  }, [imageLoading, imageLoaded, imageError, product.image_url, handleImageError]);

  const shouldPrioritize = index < 6; // Reduced from 8 to 6 for better performance

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
        <div className="relative w-full h-64 sm:h-72 md:h-64 lg:h-72 mb-4 overflow-hidden rounded-md bg-white">
          
          {imageLoading && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-20">
              <div className="text-center">
                <div className="relative w-8 h-8 mx-auto mb-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-100"></div>
                  <div 
                    className="absolute top-0 left-0 h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"
                    style={{
                      background: `conic-gradient(from 0deg, transparent ${360 - (loadingProgress * 3.6)}deg, #f59e0b ${360 - (loadingProgress * 3.6)}deg)`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 font-medium">
                  {retryCount > 0 ? `Reintentando (${retryCount + 1}/3)...` : `Cargando... ${Math.round(loadingProgress)}%`}
                </p>
              </div>
            </div>
          )}
          
          {!imageError && product.image_url ? (
            <Image
              key={`product-${product.id}-${imageKey}`} // Force re-render on retry
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-contain transition-all duration-500 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onError={handleImageError}
              onLoad={handleImageLoad}
              onLoadStart={handleImageLoadStart}
              onProgress={handleImageProgress}
              priority={shouldPrioritize}
              quality={shouldPrioritize ? 85 : 75} // Higher quality for priority images
              unoptimized={false} // Let Next.js optimize the images
              loading={shouldPrioritize ? "eager" : "lazy"}
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          ) : (
            // Fallback - use placeholder image instead of error state
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <Image
                src="/expo_mueble.png"
                alt={`${product.name} - Imagen de muestra`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-contain transition-transform duration-300 group-hover:scale-105 opacity-60"
                priority={shouldPrioritize}
                loading={shouldPrioritize ? "eager" : "lazy"}
              />
              <div className="absolute inset-0 bg-white bg-opacity-5 flex items-center justify-center">
                <span className="text-xs text-gray-500 bg-white bg-opacity-95 px-2 py-1 rounded shadow-sm">
                  Imagen no disponible
                </span>
              </div>
            </div>
          )}
          
          {/* Price Badge */}
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold z-30">
            {formatCurrency(product.price)}
          </div>
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

      // Enhanced progressive image preloading
      const preloadImages = async (products: Product[]) => {
        const priorityImages = products.slice(0, 6); // First 6 images
        const secondaryImages = products.slice(6, 16); // Next 10 images
        
        // Load priority images immediately
        const priorityPromises = priorityImages.map((product, index) => {
          return new Promise<void>((resolve) => {
            if (!product.image_url) {
              resolve();
              return;
            }
            
            const img = new globalThis.Image();
            img.onload = () => {
              console.log(`✅ Priority image ${index + 1} preloaded:`, product.name);
              resolve();
            };
            img.onerror = () => {
              console.log(`❌ Priority image ${index + 1} failed:`, product.name);
              resolve(); // Don't block on failures
            };
            img.src = product.image_url;
          });
        });
        
        // Wait for priority images to load
        await Promise.allSettled(priorityPromises);
        
        // Load secondary images with delay
        setTimeout(() => {
          secondaryImages.forEach((product, index) => {
            if (product.image_url) {
              const img = new globalThis.Image();
              img.onload = () => console.log(`✅ Secondary image ${index + 7} preloaded:`, product.name);
              img.onerror = () => console.log(`❌ Secondary image ${index + 7} failed:`, product.name);
              img.src = product.image_url;
            }
          });
        }, 1000); // 1 second delay for secondary images
      };
      
      preloadImages(typedProducts);

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
    <>
      <Head>
        {/* Primary Meta Tags */}
        <title>Catálogo de Muebles para Exteriores | Kusam Outdoor Solutions</title>
        <meta name="title" content="Catálogo de Muebles para Exteriores | Kusam Outdoor Solutions" />
        <meta name="description" content="Descubre nuestra amplia colección de muebles para exteriores de alta calidad. Sofás, sillas, mesas y más para crear el espacio exterior perfecto. Kusam - Expertos en mobiliario outdoor." />
        <meta name="keywords" content="muebles exteriores, outdoor furniture, muebles jardín, muebles terraza, sofás exteriores, sillas jardín, mesas exteriores, kusam, mobiliario outdoor México" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Spanish" />
        <meta name="author" content="Kusam Outdoor Solutions" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kusam.com/catalogo" />
        <meta property="og:title" content="Catálogo de Muebles para Exteriores | Kusam Outdoor Solutions" />
        <meta property="og:description" content="Descubre nuestra amplia colección de muebles para exteriores de alta calidad. Sofás, sillas, mesas y más para crear el espacio exterior perfecto." />
        <meta property="og:image" content="https://kusam.com/kusam_main.webp" />
        <meta property="og:site_name" content="Kusam Outdoor Solutions" />
        <meta property="og:locale" content="es_MX" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://kusam.com/catalogo" />
        <meta property="twitter:title" content="Catálogo de Muebles para Exteriores | Kusam Outdoor Solutions" />
        <meta property="twitter:description" content="Descubre nuestra amplia colección de muebles para exteriores de alta calidad. Sofás, sillas, mesas y más." />
        <meta property="twitter:image" content="https://kusam.com/kusam_main.webp" />
        
        {/* Additional SEO */}
        <link rel="canonical" href="https://kusam.com/catalogo" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Store",
              "name": "Kusam Outdoor Solutions",
              "description": "Especialistas en muebles para exteriores de alta calidad",
              "url": "https://kusam.com/catalogo",
              "logo": "https://kusam.com/kusam_main.webp",
              "image": "https://kusam.com/catalog_header1.png",
              "priceRange": "$$",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "MX"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Catálogo de Muebles para Exteriores",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Product",
                      "name": "Muebles para Exteriores",
                      "category": "Furniture"
                    }
                  }
                ]
              }
            })
          }}
        />
      </Head>
      
      <div className="relative min-h-screen flex flex-col p-4 pt-10 pb-10">
      {/* Background Image - vine pattern */}
      <div
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/vine_2b.png')`,
          opacity: 1,
          zIndex: -1
        }}
      />

      <motion.div
        className="max-w-7xl mx-auto w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        role="main"
        aria-label="Catálogo de productos"
      >
        {/* Header */}
        <header className="text-center mb-8">
          <div className="mb-6">
            <Image
              src="/kusam_main.webp"
              alt="Kusam Outdoor Solutions - Especialistas en muebles para exteriores"
              width={200}
              height={50}
              priority
              className="mx-auto"
            />
          </div>
          
          {/* Header Image */}
          <div className="mb-6 w-full">
            <Image
              src="/catalog_header1.png"
              alt="Catálogo de productos - Muebles para exteriores de alta calidad"
              width={800}
              height={200}
              priority
              className="w-full h-auto object-contain"
            />
          </div>
          
          {/* Commented out text header */}
          {/* 
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
          */}
        </header>

        {/* Search and Filters */}
        <section 
          className="p-6 rounded-lg shadow-md border border-gray-200 mb-8 relative"
          style={{
            backgroundImage: `url('/vine_2.png')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          aria-label="Buscar y filtrar productos"
        >
          <div className="flex flex-col gap-4 relative z-10">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="product-search" className="sr-only">
                Buscar productos por nombre, SKU o descripción
              </label>
              <input
                id="product-search"
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border-2 border-amber-950 rounded-md focus:ring-2 focus:ring-amber-950 focus:border-amber-950 text-amber-950 placeholder-amber-950 bg-transparent"
                aria-describedby="search-help"
              />
              <span id="search-help" className="sr-only">
                Busque por nombre del producto, código SKU, descripción o colección
              </span>
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
        </section>

        {/* Products Grid */}
        <main role="main" aria-label="Lista de productos">
        {loading ? (
          <section className="text-center py-20" aria-label="Cargando productos">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 text-lg mt-4">Cargando productos...</p>
          </section>
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
        </main>

        {/* Navigation Buttons - Same style as product detail page */}
        <nav className="mt-12 w-full max-w-sm mx-auto" aria-label="Navegación principal">
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="Acciones principales">
            {/* Favorites Button */}
            <button
              onClick={() => window.location.href = '/kusam/cart'}
              className="py-3 px-2 bg-white border-2 border-green-500 text-green-600 rounded-lg font-medium text-xs shadow-sm hover:bg-green-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
              aria-label="Ver productos favoritos"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span>Favoritos</span>
            </button>
            
            {/* Home Button */}
            <button
              onClick={() => window.location.href = '/kusam/instructions'}
              className="py-3 px-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-medium text-xs shadow-sm hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
              aria-label="Ir al inicio"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>Inicio</span>
            </button>
          </div>
        </nav>
      </motion.div>
      </div>
    </>
  );
}