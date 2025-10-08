"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import BurgerMenu from '../../../components/BurgerMenu';
import AdminMenu from '../../../components/AdminMenu';

// Interface matching the existing product structure
interface Product {
  id: string;
  name: string;
  sku: string;
  legacy_sku?: string;
  price: number;
  image_url: string;
  description?: string;
  is_active: boolean;
  category?: string;
  colección?: string;
  medidas?: string;
  estructuras_disponibles?: string[];
  available_fabric_colors?: string[];
  available_frame_finishes?: string[];
  has_fabric_colors?: boolean;
  has_frame_finish?: boolean;
  created_at: string;
  updated_at: string;
}

interface ProductCardProps {
  product: Product;
  index: number;
  onToggleActive: (productId: string, currentStatus: boolean) => Promise<void>;
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

// Product Card Component (identical to public catalog)
const ProductCard = ({ product, index, onToggleActive }: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isTogglingActive, setIsTogglingActive] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} MXN`;
  };

  const handleImageError = useCallback(() => {
    console.log('❌ Image failed to load:', product.image_url, 'Attempt:', retryCount + 1);
    
    if (retryCount < 2) {
      const retryDelay = Math.pow(2, retryCount) * 800;
      console.log(`Auto-retrying image load in ${retryDelay}ms (attempt ${retryCount + 1}/2)`);
      
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
        setImageLoading(true);
        setImageKey(prev => prev + 1);
        setLoadingProgress(0);
      }, retryDelay);
    } else {
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

  // Add timeout for stuck loading images
  useEffect(() => {
    if (!imageLoading) return; 
    
    const timeout = setTimeout(() => {
      if (imageLoading && !imageLoaded && !imageError) {
        console.log('⏰ Image loading timeout (15s):', product.image_url);
        handleImageError();
      }
    }, 15000);

    return () => clearTimeout(timeout);
  }, [imageLoading, imageLoaded, imageError, product.image_url, handleImageError]);

  const shouldPrioritize = index < 6;

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
              key={`product-${product.id}-${imageKey}`}
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
              quality={shouldPrioritize ? 85 : 75}
              unoptimized={false}
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
          
          {/* Is Active Toggle */}
          <div 
            className="absolute top-2 left-2 bg-white rounded-lg shadow-md px-3 py-2 z-30 flex items-center gap-2 cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isTogglingActive) return;
              setIsTogglingActive(true);
              try {
                await onToggleActive(product.id, product.is_active);
              } finally {
                setIsTogglingActive(false);
              }
            }}
          >
            <input
              type="checkbox"
              checked={product.is_active}
              onChange={() => {}} // Handled by parent div onClick
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 pointer-events-none"
              disabled={isTogglingActive}
            />
            <span className={`text-xs font-semibold ${product.is_active ? 'text-green-700' : 'text-gray-500'}`}>
              {isTogglingActive ? 'Actualizando...' : (product.is_active ? 'Activo' : 'Inactivo')}
            </span>
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
          
          {/* Updated badges section */}
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-xs">
                {product.category}
              </span>
            )}
            {product.colección && (
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

export default function AdminCatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [selectedActiveStatus, setSelectedActiveStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [categories, setCategories] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [burgerOpen, setBurgerOpen] = useState(false);

  // Add Product Modal state
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [modalStep, setModalStep] = useState<1 | 2 | 'success'>(1); // 1 for first page, 2 for second page, 'success' for completion
  const [copySuccess, setCopySuccess] = useState(false);

  // Add Variable Modal state
  const [showAddVariableModal, setShowAddVariableModal] = useState(false);
  const [newVariable, setNewVariable] = useState({
    name: '',
    type: 'fabric_color',
    image: null as File | null
  });
  const [variableImagePreview, setVariableImagePreview] = useState<string>('');
  const [variableUploadProgress, setVariableUploadProgress] = useState(false);
  const [variableSuccess, setVariableSuccess] = useState(false);

  // Available variables from global_product_options
  const [availableFabricColors, setAvailableFabricColors] = useState<Array<{id: string, name: string}>>([]);
  const [availableFinishes, setAvailableFinishes] = useState<Array<{id: string, name: string}>>([]);

  // Drag and drop states
  const [isDraggingProduct, setIsDraggingProduct] = useState(false);
  const [isDraggingVariable, setIsDraggingVariable] = useState(false);

  // Product creation form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    legacy_sku: '',
    price: '',
    description: '',
    category: '',
    colección: '',
    medidas: '',
    estructuras_disponibles: [] as string[], // Legacy field for structure names
    colores_tela_disponibles: [] as string[], // Fabric color names
    aplica_color_tela: false,
    colores_estructura_disponibles: [] as string[], // Frame finish names
    is_active: true,
    image_url: ''
  });

  // Edit Product Modal state
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editModalStep, setEditModalStep] = useState<'select' | 'edit' | 'delete'>('select');
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState({
    id: '',
    name: '',
    sku: '',
    legacy_sku: '',
    price: '',
    description: '',
    category: '',
    colección: '',
    medidas: '',
    estructuras_disponibles: [] as string[],
    colores_tela_disponibles: [] as string[],
    aplica_color_tela: false,
    colores_estructura_disponibles: [] as string[],
    is_active: true,
    image_url: ''
  });
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [savePassword, setSavePassword] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Library Image Modal state


  // ...existing code...
      {/* Library Image Modal */}

  // Authentication check
  const isAuthenticated = useAdminAuth();
  const router = useRouter();

  // DEBUG: Log JWT payload after login
  useEffect(() => {
    (async () => {
      // Only run in browser and if supabase.auth exists
      if (typeof window !== 'undefined' && supabase && supabase.auth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.access_token) {
          const payload = JSON.parse(atob(session.access_token.split('.')[1]));
          console.log('Decoded JWT payload:', payload);
        } else {
          console.log('No Supabase session found.');
        }
      }
    })();
  }, []);

  // Navigation functions
  const handleBackToAdmin = () => {
    router.push('/admin');
  };

  // Form handling functions
  const resetForm = () => {
    setNewProduct({
      name: '',
      sku: '',
      legacy_sku: '',
      price: '',
      description: '',
      category: '',
      colección: '',
      medidas: '',
      estructuras_disponibles: [],
      colores_tela_disponibles: [],
      aplica_color_tela: false,
      colores_estructura_disponibles: [],
      is_active: true,
      image_url: ''
    });
  };

  const handleCloseModal = () => {
    setShowAddProductModal(false);
    setModalStep(1); // Reset to first step
    setCopySuccess(false);
    resetForm();
  };

  const handleNextStep = () => {
    // Validate required fields for step 1
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      alert('Por favor, completa los campos obligatorios: Nombre, SKU y Precio');
      return;
    }
    setModalStep(2);
  };

  const handlePreviousStep = () => {
    setModalStep(1);
  };

  const handleCopyLink = async () => {
    const productUrl = `${window.location.origin}/kusam/catalogo/${newProduct.sku}`;
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      // Fallback for browsers without clipboard API
      console.error('Could not copy text: ', err);
      // Create a temporary textarea to copy the text
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed: ', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleViewProduct = () => {
    const productUrl = `/kusam/catalogo/${newProduct.sku}`;
    window.open(productUrl, '_blank');
  };

  const handleAddAnother = () => {
    resetForm();
    setModalStep(1);
  };

  const handleSaveProduct = async () => {
    // Basic validation
    if (!newProduct.name || !newProduct.sku || !newProduct.price) {
      alert('Por favor, completa los campos obligatorios: Nombre, SKU y Precio');
      return;
    }

    // Prepare data for Supabase
    const productToInsert = {
      name: newProduct.name,
      sku: newProduct.sku,
      legacy_sku: newProduct.legacy_sku || null,
      price: parseFloat(newProduct.price),
      description: newProduct.description || null,
      category: newProduct.category || null,
      colección: newProduct.colección || null,
      medidas: newProduct.medidas || null,
      estructuras_disponibles: newProduct.estructuras_disponibles.length > 0 ? newProduct.estructuras_disponibles : null,
      available_frame_finishes: newProduct.colores_estructura_disponibles.length > 0 ? newProduct.colores_estructura_disponibles : null,
      available_fabric_colors: newProduct.colores_tela_disponibles.length > 0 ? newProduct.colores_tela_disponibles : null,
      has_fabric_colors: !!newProduct.aplica_color_tela && newProduct.colores_tela_disponibles.length > 0,
      has_frame_finish: newProduct.colores_estructura_disponibles.length > 0,
      is_active: !!newProduct.is_active,
      image_url: newProduct.image_url || null,
    };

    try {
      const { error } = await supabase
        .from('products')
        .insert([productToInsert])
        .select();
      if (error) {
        console.error('Error inserting product:', error);
        alert('Error al guardar el producto: ' + error.message);
        return;
      }
      setModalStep('success');
      // Optionally refresh product list or update UI
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Error inesperado al guardar el producto.');
    }
  };

  // Function to reload variables
  const reloadVariables = async () => {
    try {
      const { data, error } = await supabase
        .from('global_product_options')
        .select('id, name, type')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching variables:', error);
        return;
      }

      if (data) {
        const fabrics = data
          .filter(v => v.type === 'fabric_color')
          .map(v => ({ id: v.id, name: v.name }));
        
        const finishes = data
          .filter(v => v.type === 'finish')
          .map(v => ({ id: v.id, name: v.name }));

        setAvailableFabricColors(fabrics);
        setAvailableFinishes(finishes);
      }
    } catch (err) {
      console.error('Unexpected error fetching variables:', err);
    }
  };

  // Variable Modal handlers
  const handleCloseVariableModal = () => {
    setShowAddVariableModal(false);
    setVariableSuccess(false);
    setNewVariable({
      name: '',
      type: 'fabric_color',
      image: null
    });
    setVariableImagePreview('');
    // Reload variables when closing modal (if product modal is still open)
    if (showAddProductModal) {
      reloadVariables();
    }
  };

  const handleSaveVariable = async () => {
    // Validation
    if (!newVariable.name || !newVariable.image) {
      alert('Por favor, completa todos los campos obligatorios');
      return;
    }

    setVariableUploadProgress(true);

    try {
      // Upload image to product_variables bucket
      const fileExt = newVariable.image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product_variables')
        .upload(filePath, newVariable.image, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        alert('Error al subir la imagen: ' + uploadError.message);
        setVariableUploadProgress(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product_variables')
        .getPublicUrl(filePath);

      // Insert into global_product_options
      const { error: insertError } = await supabase
        .from('global_product_options')
        .insert([{
          name: newVariable.name,
          type: newVariable.type,
          value_data: { image_url: publicUrl },
          is_active: true
        }]);

      if (insertError) {
        console.error('Error inserting variable:', insertError);
        alert('Error al guardar la variable: ' + insertError.message);
        setVariableUploadProgress(false);
        return;
      }

      // Success!
      setVariableUploadProgress(false);
      setVariableSuccess(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        handleCloseVariableModal();
      }, 2000);

    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Error inesperado al guardar la variable.');
      setVariableUploadProgress(false);
    }
  };

  // Edit Product Modal Functions
  const handleSelectProductToEdit = (product: Product) => {
    console.log('🔍 Selected product for edit:', product);
    console.log('📦 available_fabric_colors:', product.available_fabric_colors);
    console.log('📦 available_frame_finishes:', product.available_frame_finishes);
    
    // Parse JSONB fields properly
    let fabricColors: string[] = [];
    let frameFinishes: string[] = [];
    
    // Handle available_fabric_colors (JSONB)
    if (product.available_fabric_colors) {
      if (Array.isArray(product.available_fabric_colors)) {
        fabricColors = product.available_fabric_colors;
      } else if (typeof product.available_fabric_colors === 'string') {
        try {
          fabricColors = JSON.parse(product.available_fabric_colors);
        } catch (e) {
          console.error('Error parsing available_fabric_colors:', e);
        }
      }
    }
    
    // Handle available_frame_finishes (JSONB)
    if (product.available_frame_finishes) {
      if (Array.isArray(product.available_frame_finishes)) {
        frameFinishes = product.available_frame_finishes;
      } else if (typeof product.available_frame_finishes === 'string') {
        try {
          frameFinishes = JSON.parse(product.available_frame_finishes);
        } catch (e) {
          console.error('Error parsing available_frame_finishes:', e);
        }
      }
    }
    
    console.log('✅ Parsed fabricColors:', fabricColors);
    console.log('✅ Parsed frameFinishes:', frameFinishes);
    
    setSelectedProductToEdit(product);
    setEditProduct({
      id: product.id,
      name: product.name,
      sku: product.sku,
      legacy_sku: product.legacy_sku || '',
      price: product.price.toString(),
      description: product.description || '',
      category: product.category || '',
      colección: product.colección || '',
      medidas: product.medidas || '',
      estructuras_disponibles: Array.isArray(product.estructuras_disponibles) ? product.estructuras_disponibles : [],
      colores_tela_disponibles: fabricColors,
      aplica_color_tela: !!product.has_fabric_colors,
      colores_estructura_disponibles: frameFinishes,
      is_active: product.is_active,
      image_url: product.image_url || ''
    });
    setEditModalStep('edit');
  };

  const handleCloseEditModal = () => {
    setShowEditProductModal(false);
    setEditModalStep('select');
    setSelectedProductToEdit(null);
    setDeletePassword('');
    setDeleteError('');
    setSavePassword('');
    setSaveError('');
    setShowSaveConfirm(false);
  };

  const handleUpdateProduct = async () => {
    if (!editProduct.id) return;

    // Verify admin password first
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSaveError('No se pudo verificar la sesión del administrador.');
        return;
      }

      // Attempt to sign in with the provided password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: savePassword,
      });

      if (signInError) {
        setSaveError('Contraseña incorrecta. Por favor, intenta de nuevo.');
        return;
      }

      // Password verified, proceed with update
      const productToUpdate = {
        name: editProduct.name,
        sku: editProduct.sku,
        legacy_sku: editProduct.legacy_sku || null,
        price: parseFloat(editProduct.price),
        description: editProduct.description || null,
        category: editProduct.category || null,
        colección: editProduct.colección || null,
        medidas: editProduct.medidas || null,
        estructuras_disponibles: editProduct.estructuras_disponibles.length > 0 ? editProduct.estructuras_disponibles : null,
        available_frame_finishes: editProduct.colores_estructura_disponibles.length > 0 ? editProduct.colores_estructura_disponibles : null,
        available_fabric_colors: editProduct.colores_tela_disponibles.length > 0 ? editProduct.colores_tela_disponibles : null,
        has_fabric_colors: !!editProduct.aplica_color_tela && editProduct.colores_tela_disponibles.length > 0,
        has_frame_finish: editProduct.colores_estructura_disponibles.length > 0,
        is_active: !!editProduct.is_active,
        image_url: editProduct.image_url || null,
        updated_at: new Date().toISOString(),
      };

      console.log('🔄 Updating product with ID:', editProduct.id);
      console.log('📦 Product data to update:', JSON.stringify(productToUpdate, null, 2));

      const { data, error, count, status, statusText } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', editProduct.id)
        .select();

      console.log('📡 Update response status:', status, statusText);
      console.log('📡 Update response count:', count);
      console.log('📡 Update response data:', data);

      if (error) {
        console.error('❌ Error updating product:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error code:', error.code);
        console.error('Error hint:', error.hint);
        setSaveError('Error al actualizar el producto: ' + error.message);
        return;
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from update. Update may have been blocked by RLS policy.');
        console.warn('⚠️ This usually means the update was blocked or no rows matched.');
      }

      console.log('✅ Product update completed');
      
      // Show success message
      alert('¡Producto actualizado exitosamente!');
      
      // Close modal
      handleCloseEditModal();
      
      // Force a fresh fetch of products
      setLoading(true);
      await fetchProducts();
      
      // Small delay to ensure state updates propagate
      setTimeout(() => {
        console.log('🔄 Products refreshed after update');
      }, 100);
    } catch (err) {
      console.error('Unexpected error:', err);
      setSaveError('Error inesperado al actualizar el producto.');
    }
  };

  const handleDeleteProduct = async () => {
    if (!editProduct.id || !selectedProductToEdit) return;

    // Verify admin password
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setDeleteError('No se pudo verificar la sesión del administrador.');
        return;
      }

      // Attempt to sign in with the provided password to verify
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: deletePassword,
      });

      if (signInError) {
        setDeleteError('Contraseña incorrecta. Por favor, intenta de nuevo.');
        return;
      }

      // Delete the product
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', editProduct.id);

      if (deleteError) {
        console.error('Error deleting product:', deleteError);
        alert('Error al eliminar el producto: ' + deleteError.message);
        return;
      }

      alert(`Producto "${selectedProductToEdit.name}" eliminado permanentemente.`);
      handleCloseEditModal();
      fetchProducts(); // Refresh the product list
    } catch (err) {
      console.error('Unexpected error:', err);
      setDeleteError('Error inesperado al eliminar el producto.');
    }
  };

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching products...');
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        // Admin view: fetch ALL products regardless of active status
        .order('name', { ascending: true });

      if (productsError) {
        throw productsError;
      }

      console.log('📦 Raw products data sample:', productsData?.[0]);
      console.log('📊 Total products fetched:', productsData?.length);

      // Filter out products that begin with "XX"
      const typedProducts = (productsData as Product[]).filter(product => 
        !product.name.startsWith('XX')
      );
      
      console.log('✅ Products after XX filter:', typedProducts.length);
      
      setProducts(typedProducts);
      setFilteredProducts(typedProducts);
      
      console.log('🔄 Products state updated');

      // Extract unique categories and collections
      const uniqueCategories = [...new Set(typedProducts
        .map(p => p.category)
        .filter(Boolean)
      )] as string[];

      const uniqueCollections = [...new Set(typedProducts
        .map(p => p.colección)
        .filter(Boolean)
      )] as string[];

      setCategories(uniqueCategories);
      setCollections(uniqueCollections);

      // Enhanced progressive image preloading
      const preloadImages = async (products: Product[]) => {
        const priorityImages = products.slice(0, 6);
        const secondaryImages = products.slice(6, 16);
        
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
              resolve();
            };
            img.src = product.image_url;
          });
        });
        
        await Promise.allSettled(priorityPromises);
        
        // Load secondary images with delay
        setTimeout(() => {
          secondaryImages.forEach((product, index) => {
            if (product.image_url) {
              const img = new globalThis.Image();
              img.onload = () => console.log(`✅ Secondary image ${index + 1} preloaded:`, product.name);
              img.onerror = () => console.log(`❌ Secondary image ${index + 1} failed:`, product.name);
              img.src = product.image_url;
            }
          });
        }, 1000);
      };

      await preloadImages(typedProducts);

    } catch (error) {
      console.error('Error fetching products:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar productos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter and sort products
  const filterAndSortProducts = useCallback(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.sku.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.category?.toLowerCase().includes(searchLower) ||
        product.colección?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Collection filter
    if (selectedCollection !== 'all') {
      filtered = filtered.filter(product => product.colección === selectedCollection);
    }

    // Active status filter
    if (selectedActiveStatus === 'active') {
      filtered = filtered.filter(product => product.is_active === true);
    } else if (selectedActiveStatus === 'inactive') {
      filtered = filtered.filter(product => product.is_active === false);
    }
    // if 'all', don't filter by active status

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
  }, [products, searchTerm, selectedCategory, selectedCollection, selectedActiveStatus, sortBy]);

  // Toggle product active status
  const handleToggleProductActive = async (productId: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling product active status:', productId, 'from', currentStatus, 'to', !currentStatus);
      
      const { error } = await supabase
        .from('products')
        .update({ is_active: !currentStatus })
        .eq('id', productId);

      if (error) {
        console.error('❌ Error toggling product status:', error);
        alert('Error al actualizar el estado: ' + error.message);
        return;
      }

      console.log('✅ Product status toggled successfully');
      
      // Update local state immediately for instant feedback
      setProducts(prevProducts =>
        prevProducts.map(p =>
          p.id === productId ? { ...p, is_active: !currentStatus } : p
        )
      );
      
      // Also update filtered products
      setFilteredProducts(prevFiltered =>
        prevFiltered.map(p =>
          p.id === productId ? { ...p, is_active: !currentStatus } : p
        )
      );
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('Error inesperado al actualizar el estado.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    filterAndSortProducts();
  }, [filterAndSortProducts]);

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowAddProductModal(false);
        resetForm();
      }
    };

    if (showAddProductModal) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showAddProductModal]);

  // Load available variables when modal opens
  useEffect(() => {
    if (showAddProductModal) {
      reloadVariables();
    }
  }, [showAddProductModal]);

  // Show loading or redirect if not authenticated
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-lg mt-4">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // useAdminAuth will handle redirect
  }

  return (
    <>
      {/* Custom styles for placeholder color */}
      <style jsx>{`
        .custom-placeholder::placeholder {
          color: #b0a187;
          opacity: 1;
        }
        .custom-placeholder::-webkit-input-placeholder {
          color: #b0a187;
        }
        .custom-placeholder::-moz-placeholder {
          color: #b0a187;
          opacity: 1;
        }
        .custom-placeholder:-ms-input-placeholder {
          color: #b0a187;
        }
        .custom-text-input {
          color: #5c5240;
        }
        .custom-text-input option {
          color: #5c5240;
        }
      `}</style>
      
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

        {/* Back Arrow - Top Left */}
        <button
          onClick={handleBackToAdmin}
          className="absolute top-6 left-65 z-20 transition-all duration-200 hover:opacity-70"
          aria-label="Volver al panel principal"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>

        {/* Burger Menu - Top Right */}
        <div className="absolute top-6 right-65 z-20">
          <div className="transition-all duration-200 hover:opacity-70">
            <BurgerMenu 
              isOpen={burgerOpen} 
              onClick={() => setBurgerOpen(!burgerOpen)}
            />
          </div>
          <AdminMenu open={burgerOpen} setOpen={setBurgerOpen} />
        </div>

        <motion.div
          className="max-w-7xl mx-auto w-full relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          role="main"
          aria-label="Panel de administración del catálogo"
        >
          {/* Admin Header */}
          <header className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/kusam_main.webp"
                alt="Kusam Outdoor Solutions - Panel de administración"
                width={200}
                height={50}
                priority
                className="mx-auto"
              />
            </div>
            
            {/* Admin Title */}
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-2 text-amber-950">
                🛠️ Panel de Administración
              </h1>
              <h2 className="text-2xl font-semibold text-gray-700">
                Catálogo de Productos
              </h2>
              <p className="text-lg text-gray-600 mt-2">
                Gestiona y añade productos al catálogo
              </p>
            </div>
            
            {/* Product Action Buttons */}
            <div className="mb-6 flex gap-4 justify-center">
              <button
                className="text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 hover:opacity-90 focus:outline-none"
                style={{ backgroundColor: '#595144' }}
                onClick={() => {
                  setEditModalStep('select');
                  setShowEditProductModal(true);
                }}
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Producto Existente
              </button>
              {/* Edit Product Modal */}
              <AnimatePresence>
                {showEditProductModal && (
                  <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <motion.div
                      className="absolute inset-0"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                      style={{ background: 'rgba(0,0,0,0.32)' }}
                    />
                    <motion.div
                      className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      transition={{
                        opacity: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                        scale: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Modal Header */}
                      <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-lg">
                        <h2 className="text-2xl font-bold text-gray-800">
                          {editModalStep === 'select' && 'Seleccionar Producto para Editar'}
                          {editModalStep === 'edit' && 'Editar Producto'}
                          {editModalStep === 'delete' && 'Confirmar Eliminación'}
                        </h2>
                        <button
                          onClick={handleCloseEditModal}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Modal Body */}
                      <div className="p-6">
                        {/* STEP 1: Product Selection */}
                        {editModalStep === 'select' && (
                          <div className="space-y-4">
                            <p className="text-gray-600 mb-4">Selecciona un producto de tu catálogo para editar:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
                              {products.map((product) => (
                                <div
                                  key={product.id}
                                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all cursor-pointer"
                                  onClick={() => handleSelectProductToEdit(product)}
                                >
                                  {product.image_url && (
                                    <div className="w-full h-40 mb-3 relative">
                                      <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        fill
                                        className="object-cover rounded"
                                      />
                                    </div>
                                  )}
                                  <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                                  <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                                  <p className="text-sm text-gray-600">Precio: ${product.price.toFixed(2)} MXN</p>
                                  {product.category && (
                                    <span className="inline-block mt-2 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                                      {product.category}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* STEP 2: Edit Form */}
                        {editModalStep === 'edit' && selectedProductToEdit && (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="text-sm text-gray-700">
                                Editando: <span className="font-semibold text-gray-900">{selectedProductToEdit.name}</span>
                              </div>
                              <button
                                onClick={() => setEditModalStep('delete')}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Borrar Producto
                              </button>
                            </div>

                            {/* Edit Form Fields */}
                            <div className="space-y-4">
                              {/* Name */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Nombre del Producto *
                                </label>
                                <input
                                  type="text"
                                  value={editProduct.name}
                                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="Ej: Sillón Moderno"
                                  required
                                />
                              </div>

                              {/* Price */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Precio (MXN) *
                                </label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={editProduct.price}
                                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="0.00"
                                  required
                                />
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Descripción
                                </label>
                                <textarea
                                  value={editProduct.description}
                                  onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  rows={3}
                                  placeholder="Descripción detallada del producto..."
                                />
                              </div>

                              {/* Category */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Categoría
                                </label>
                                <input
                                  type="text"
                                  value={editProduct.category}
                                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="Ej: Sala, Recámara, Comedor"
                                />
                              </div>

                              {/* Colección */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Colección
                                </label>
                                <input
                                  type="text"
                                  value={editProduct.colección}
                                  onChange={(e) => setEditProduct({ ...editProduct, colección: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="Ej: Moderna 2024"
                                />
                              </div>

                              {/* Medidas */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  Medidas
                                </label>
                                <input
                                  type="text"
                                  value={editProduct.medidas}
                                  onChange={(e) => setEditProduct({ ...editProduct, medidas: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="Ej: 180cm x 80cm x 90cm"
                                />
                              </div>

                              {/* Image URL */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-1">
                                  URL de Imagen
                                </label>
                                <input
                                  type="url"
                                  value={editProduct.image_url}
                                  onChange={(e) => setEditProduct({ ...editProduct, image_url: e.target.value })}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 placeholder:text-gray-600"
                                  placeholder="https://ejemplo.com/imagen.jpg"
                                />
                                {editProduct.image_url && (
                                  <div className="mt-2 relative w-full h-48">
                                    <Image
                                      src={editProduct.image_url}
                                      alt="Vista previa"
                                      fill
                                      className="object-contain rounded border"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Has Fabric Colors - Checkbox */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="edit-has-fabric"
                                  checked={editProduct.aplica_color_tela}
                                  onChange={(e) => setEditProduct({ ...editProduct, aplica_color_tela: e.target.checked })}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="edit-has-fabric" className="text-sm font-semibold text-gray-900">
                                  Aplica Color de Tela
                                </label>
                              </div>

                              {/* Available Fabric Colors - Multi-select Grid */}
                              {editProduct.aplica_color_tela && (
                                <div>
                                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                                    Colores de Tela Disponibles 
                                  </label>
                                  <div className="text-xs text-gray-600 mb-2">
                                    Currently selected: {editProduct.colores_tela_disponibles.length > 0 ? editProduct.colores_tela_disponibles.join(', ') : 'None'}
                                  </div>
                                  <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                    {availableFabricColors.length === 0 ? (
                                      <p className="text-sm text-gray-700 italic">
                                        No hay colores de tela disponibles.
                                      </p>
                                    ) : (
                                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                        {availableFabricColors.map((fabric) => {
                                          const isChecked = editProduct.colores_tela_disponibles.some(
                                            color => color.toUpperCase().trim() === fabric.name.toUpperCase().trim()
                                          );
                                          return (
                                            <label key={fabric.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                              <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={(e) => {
                                                  const checked = e.target.checked;
                                                  setEditProduct({
                                                    ...editProduct,
                                                    colores_tela_disponibles: checked
                                                      ? [...editProduct.colores_tela_disponibles, fabric.name]
                                                      : editProduct.colores_tela_disponibles.filter(
                                                          n => n.toUpperCase().trim() !== fabric.name.toUpperCase().trim()
                                                        )
                                                  });
                                                }}
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                              />
                                              <span className="text-sm text-gray-900">{fabric.name}</span>
                                            </label>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Frame Finishes - Multi-select Grid */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-2">
                                  Acabados de Estructura Disponibles 
                                </label>
                                <div className="text-xs text-gray-600 mb-2">
                                  Currently selected: {editProduct.colores_estructura_disponibles.length > 0 ? editProduct.colores_estructura_disponibles.join(', ') : 'None'}
                                </div>
                                <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                                  {availableFinishes.length === 0 ? (
                                    <p className="text-sm text-gray-700 italic">
                                      No hay acabados de estructura disponibles.
                                    </p>
                                  ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                      {availableFinishes.map((finish) => {
                                        const isChecked = editProduct.colores_estructura_disponibles.some(
                                          color => color.toUpperCase().trim() === finish.name.toUpperCase().trim()
                                        );
                                        return (
                                          <label key={finish.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={(e) => {
                                                const checked = e.target.checked;
                                                setEditProduct({
                                                  ...editProduct,
                                                  colores_estructura_disponibles: checked
                                                    ? [...editProduct.colores_estructura_disponibles, finish.name]
                                                    : editProduct.colores_estructura_disponibles.filter(
                                                        n => n.toUpperCase().trim() !== finish.name.toUpperCase().trim()
                                                      )
                                                });
                                              }}
                                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                            />
                                            <span className="text-sm text-gray-900">{finish.name}</span>
                                          </label>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Is Active */}
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  id="edit-is-active"
                                  checked={editProduct.is_active}
                                  onChange={(e) => setEditProduct({ ...editProduct, is_active: e.target.checked })}
                                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                                />
                                <label htmlFor="edit-is-active" className="text-sm font-semibold text-gray-900">
                                  Producto Activo
                                </label>
                              </div>
                            </div>

                            {/* Password Confirmation for Save */}
                            {showSaveConfirm && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Confirmar Cambios</h4>
                                <label className="block mb-3">
                                  <span className="text-sm font-medium text-gray-700 mb-2 block">
                                    Ingresa tu contraseña de administrador para guardar los cambios:
                                  </span>
                                  <input
                                    type="password"
                                    value={savePassword}
                                    onChange={(e) => {
                                      setSavePassword(e.target.value);
                                      setSaveError('');
                                    }}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 text-gray-900 focus:ring-2 focus:ring-green-500 placeholder:text-gray-600"
                                    placeholder="Contraseña de administrador"
                                  />
                                </label>
                                {saveError && (
                                  <p className="text-sm text-red-600 mb-3">{saveError}</p>
                                )}
                                <div className="flex gap-3">
                                  <button
                                    onClick={() => {
                                      setShowSaveConfirm(false);
                                      setSavePassword('');
                                      setSaveError('');
                                    }}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md font-medium"
                                  >
                                    Cancelar
                                  </button>
                                  <button
                                    onClick={handleUpdateProduct}
                                    disabled={!savePassword}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    Confirmar y Guardar
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end pt-4 border-t">
                              <button
                                onClick={() => setEditModalStep('select')}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => setShowSaveConfirm(true)}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
                              >
                                Guardar Cambios
                              </button>
                            </div>
                          </div>
                        )}

                        {/* STEP 3: Delete Confirmation */}
                        {editModalStep === 'delete' && selectedProductToEdit && (
                          <div className="space-y-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                              <div className="flex items-start gap-4">
                                <svg className="w-12 h-12 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="flex-1">
                                  <h3 className="text-lg font-bold text-red-900 mb-2">¡ADVERTENCIA!</h3>
                                  <p className="text-red-800 mb-4">
                                    Estás a punto de eliminar permanentemente el producto:
                                  </p>
                                  <div className="bg-white rounded p-4 mb-4">
                                    <p className="font-bold text-gray-900">{selectedProductToEdit.name}</p>
                                    <p className="text-sm text-gray-600">SKU: {selectedProductToEdit.sku}</p>
                                  </div>
                                  <p className="text-red-800 font-semibold">
                                    Esta acción NO se puede deshacer. La eliminación es permanente.
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <label className="block">
                                <span className="text-sm font-medium text-gray-700 mb-2 block">
                                  Para confirmar, ingresa tu contraseña de administrador:
                                </span>
                                <input
                                  type="password"
                                  value={deletePassword}
                                  onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setDeleteError('');
                                  }}
                                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-500"
                                  placeholder="Contraseña de administrador"
                                />
                              </label>
                              {deleteError && (
                                <p className="text-sm text-red-600">{deleteError}</p>
                              )}
                            </div>

                            <div className="flex gap-3 justify-end pt-4 border-t">
                              <button
                                onClick={() => setEditModalStep('edit')}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={handleDeleteProduct}
                                disabled={!deletePassword}
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                              >
                                Eliminar Permanentemente
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button 
                className="text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: '#71b5d1' }}
                onClick={() => setShowAddProductModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Producto
              </button>

              <button 
                className="text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-200 flex items-center gap-2 hover:opacity-90"
                style={{ backgroundColor: '#8b7355' }}
                onClick={() => setShowAddVariableModal(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Añadir Variables
              </button>
            </div>
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

                {/* Collection Filter */}
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

                {/* Active Status Filter */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={selectedActiveStatus}
                    onChange={(e) => setSelectedActiveStatus(e.target.value as 'all' | 'active' | 'inactive')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white"
                  >
                    <option value="all" className="text-black">Todos los productos</option>
                    <option value="active" className="text-black">Solo activos</option>
                    <option value="inactive" className="text-black">Solo inactivos</option>
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
                {selectedActiveStatus === 'active' && ` (solo activos)`}
                {selectedActiveStatus === 'inactive' && ` (solo inactivos)`}
              </div>

              {/* Clear Filters Button */}
              {(selectedCategory !== 'all' || selectedCollection !== 'all' || selectedActiveStatus !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedCollection('all');
                    setSelectedActiveStatus('all');
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
                  setSelectedCollection('all');
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
                  onToggleActive={handleToggleProductActive}
                />
              ))}
            </motion.div>
          )}
          </main>

          {/* Admin Navigation Buttons */}
          <nav className="mt-12 w-full max-w-sm mx-auto" aria-label="Navegación de administrador">
            <div className="grid grid-cols-2 gap-3" role="group" aria-label="Acciones de administrador">
              {/* Back to Admin Dashboard */}
              <button
                onClick={handleBackToAdmin}
                className="py-3 px-2 bg-white border-2 border-blue-500 text-blue-600 rounded-lg font-medium text-xs shadow-sm hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
                aria-label="Volver al panel de administración"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Admin</span>
              </button>
              
              {/* Reportes */}
              <button
                onClick={() => router.push('/admin/reportes')}
                className="py-3 px-2 bg-white border-2 border-gray-300 text-gray-600 rounded-lg font-medium text-xs shadow-sm hover:bg-gray-50 transition-all duration-200 flex flex-col items-center justify-center gap-1"
                aria-label="Ver reportes"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Reportes</span>
              </button>
            </div>
          </nav>
        </motion.div>

        {/* Add Product Modal */}
        <AnimatePresence>
          {showAddProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              {/* Video Backdrop */}
              <motion.div 
                className="absolute inset-0"
                onClick={handleCloseModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  src="/leaves1.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  disablePictureInPicture={true}
                  preload="auto"
                  style={{ opacity: 0.1 }}
                />
              </motion.div>
            
            {/* Modal */}
            <motion.div 
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking modal content
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {modalStep === 'success' ? '✅ ¡Producto Agregado Exitosamente!' : '➕ Añadir Nuevo Producto'}
                  </h2>
                  {modalStep !== 'success' && (
                    <p className="text-sm text-gray-500 mt-1">
                      Paso {modalStep} de 2 - {modalStep === 1 ? 'Información Básica' : 'Especificaciones y Subida'}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <form className="space-y-6">
                  {modalStep === 1 ? (
                    /* STEP 1: Basic Information */
                    <div className="space-y-6">
                      {/* Basic Information Section */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Product Name */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Nombre del Producto <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={newProduct.name}
                              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              placeholder="Ej: Sofá Modular Marieta"
                              required
                            />
                          </div>

                          {/* SKU */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              SKU <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={newProduct.sku}
                              onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              placeholder="Ej: KOS001"
                              required
                            />
                          </div>

                          {/* Legacy SKU */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Legacy SKU <span className="text-gray-400">(opcional)</span>
                            </label>
                            <input 
                              type="text" 
                              value={newProduct.legacy_sku}
                              onChange={(e) => setNewProduct({...newProduct, legacy_sku: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              placeholder="Ej: OLD001"
                            />
                          </div>

                          {/* Category */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoría <span className="text-red-500">*</span>
                            </label>
                            <select 
                              value={newProduct.category}
                              onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 custom-text-input custom-placeholder"
                              style={{ color: '#b0a187' }}
                              required
                            >
                              <option value="">Seleccionar categoría...</option>
                              {categories.map(category => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))}
                              <option value="__new__">➕ Nueva Categoría</option>
                            </select>
                          </div>

                          {/* Collection */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Colección
                            </label>
                            <select 
                              value={newProduct.colección}
                              onChange={(e) => setNewProduct({...newProduct, colección: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-gray-300 focus:border-gray-300 custom-text-input custom-placeholder"
                              style={{ color: '#b0a187' }}
                            >
                              <option value="">Seleccionar colección...</option>
                              {collections.map(collection => (
                                <option key={collection} value={collection}>
                                  {collection}
                                </option>
                              ))}
                              <option value="__new__">➕ Nueva Colección</option>
                            </select>
                          </div>

                          {/* Price */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Precio (MXN) <span className="text-red-500">*</span>
                            </label>
                            <input 
                              type="text" 
                              value={newProduct.price}
                              onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              placeholder="Ej: 25000"
                              required
                            />
                          </div>

                          {/* Medidas */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Medidas
                            </label>
                            <input 
                              type="text" 
                              value={newProduct.medidas}
                              onChange={(e) => setNewProduct({...newProduct, medidas: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              placeholder="Ej: 1.48 mts. x 86.8 cm. x 92 cm."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : modalStep === 2 ? (
                    /* STEP 2: Specifications and Upload */
                    <div className="space-y-6">
                      {/* Product Specifications Section */}
                      <div className="border-b border-gray-200 pb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Especificaciones</h3>
                        <div className="space-y-4">
                          {/* Description */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción
                            </label>
                            <textarea 
                              value={newProduct.description}
                              onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 custom-text-input custom-placeholder"
                              rows={3}
                              placeholder="Descripción detallada del producto..."
                            />
                          </div>

                          {/* Colores de Tela Disponibles - Multi-select */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Colores de Tela Disponibles
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewVariable({ ...newVariable, type: 'fabric_color' });
                                  setShowAddVariableModal(true);
                                }}
                                className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva Tela
                              </button>
                            </div>
                            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                              {availableFabricColors.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                  No hay colores de tela disponibles. Añade variables primero.
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {availableFabricColors.map((fabric) => (
                                    <label key={fabric.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                      <input
                                        type="checkbox"
                                        checked={newProduct.colores_tela_disponibles.includes(fabric.name)}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setNewProduct({
                                            ...newProduct,
                                            colores_tela_disponibles: isChecked
                                              ? [...newProduct.colores_tela_disponibles, fabric.name]
                                              : newProduct.colores_tela_disponibles.filter(n => n !== fabric.name)
                                          });
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                      />
                                      <span className="text-sm text-gray-700">{fabric.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            {newProduct.colores_tela_disponibles.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Seleccionadas: {newProduct.colores_tela_disponibles.join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Colores de Estructura Disponibles - Multi-select */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-sm font-medium text-gray-700">
                                Colores de Estructura Disponibles
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  setNewVariable({ ...newVariable, type: 'finish' });
                                  setShowAddVariableModal(true);
                                }}
                                className="text-xs px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Nueva Estructura
                              </button>
                            </div>
                            <div className="border border-gray-300 rounded-md p-3 bg-gray-50">
                              {availableFinishes.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">
                                  No hay colores disponibles. Añade variables primero.
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                  {availableFinishes.map((finish) => (
                                    <label key={finish.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                                      <input
                                        type="checkbox"
                                        checked={newProduct.colores_estructura_disponibles.includes(finish.name)}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setNewProduct({
                                            ...newProduct,
                                            colores_estructura_disponibles: isChecked
                                              ? [...newProduct.colores_estructura_disponibles, finish.name]
                                              : newProduct.colores_estructura_disponibles.filter(n => n !== finish.name)
                                          });
                                        }}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 flex-shrink-0"
                                      />
                                      <span className="text-sm text-gray-700">{finish.name}</span>
                                    </label>
                                  ))}
                                </div>
                              )}
                            </div>
                            {newProduct.colores_estructura_disponibles.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                Seleccionados: {newProduct.colores_estructura_disponibles.join(', ')}
                              </p>
                            )}
                          </div>

                          {/* Aplica Color de Tela - Checkbox */}
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              id="aplica_color_tela"
                              checked={newProduct.aplica_color_tela}
                              onChange={(e) => setNewProduct({...newProduct, aplica_color_tela: e.target.checked})}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <label htmlFor="aplica_color_tela" className="text-sm font-medium text-gray-700">
                              Aplica Color de Tela
                            </label>
                          </div>

                          {/* Active Status */}
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              id="is_active"
                              checked={newProduct.is_active}
                              onChange={(e) => setNewProduct({...newProduct, is_active: e.target.checked})}
                              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                            />
                            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                              Producto Activo (visible en catálogo)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Image Upload Section */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Imagen del Producto</h3>
                        <div className="flex flex-col gap-3">
                          <div 
                            className={`border-2 border-dashed rounded-md p-6 text-center transition-colors cursor-pointer ${
                              isDraggingProduct 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-300 hover:border-green-400'
                            }`}
                            onClick={() => document.getElementById('image-upload')?.click()}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingProduct(true);
                            }}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingProduct(true);
                            }}
                            onDragLeave={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingProduct(false);
                            }}
                            onDrop={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsDraggingProduct(false);
                              
                              const file = e.dataTransfer.files?.[0];
                              if (!file) return;
                              
                              // Check if it's an image
                              if (!file.type.startsWith('image/')) {
                                alert('Por favor, sube solo archivos de imagen.');
                                return;
                              }
                              
                              // Validate file size (max 10MB)
                              if (file.size > 10 * 1024 * 1024) {
                                alert('La imagen debe ser menor a 10MB.');
                                return;
                              }
                              
                              try {
                                const ext = file.name.split('.').pop();
                                const fileName = `${newProduct.sku || 'product'}_${Date.now()}.${ext}`;
                                
                                const uploadResult = await supabase.storage
                                  .from('catalogo_new')
                                  .upload(fileName, file, {
                                    cacheControl: '3600',
                                    upsert: true
                                  });
                                
                                if (uploadResult.error) {
                                  console.error('Error uploading image:', uploadResult.error);
                                  alert('Error al subir la imagen: ' + uploadResult.error.message);
                                  return;
                                }
                                
                                const publicUrlData = supabase.storage
                                  .from('catalogo_new')
                                  .getPublicUrl(uploadResult.data.path);
                                
                                if (!publicUrlData?.data?.publicUrl) {
                                  alert('No se pudo obtener la URL pública de la imagen.');
                                  return;
                                }
                                
                                setNewProduct((prev) => ({ ...prev, image_url: publicUrlData.data.publicUrl }));
                                // Image preview will show success - no alert needed
                              } catch (err) {
                                console.error('Unexpected error uploading image:', err);
                                alert('Error inesperado al subir la imagen.');
                              }
                            }}
                          >
                            {newProduct.image_url ? (
                              <div className="space-y-3">
                                <div className="relative w-full max-w-xs mx-auto">
                                  <Image
                                    src={newProduct.image_url}
                                    alt="Vista previa"
                                    width={300}
                                    height={300}
                                    className="rounded-lg object-cover"
                                  />
                                </div>
                                <div className="flex items-center justify-center gap-2 text-green-600">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm font-medium">Imagen cargada exitosamente</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewProduct((prev) => ({ ...prev, image_url: '' }));
                                  }}
                                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                                >
                                  Cambiar imagen
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <svg className="w-12 h-12 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <div className="text-sm text-gray-600">
                                  <p className="font-medium">Haz clic para subir una imagen</p>
                                  <p>o arrastra y suelta aquí</p>
                                </div>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG, WEBP hasta 10MB
                                </p>
                              </div>
                            )}
                            <input 
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                // Validate file size (max 10MB)
                                if (file.size > 10 * 1024 * 1024) {
                                  alert('La imagen debe ser menor a 10MB.');
                                  return;
                                }
                                // Show uploading state (optional: you can add a state for this)
                                try {
                                  // Generate a unique filename: sku + timestamp + ext
                                  const ext = file.name.split('.').pop();
                                  const fileName = `${newProduct.sku || 'product'}_${Date.now()}.${ext}`;
                                  // Upload to Supabase Storage (catalogo_new bucket)
                                  const uploadResult = await supabase.storage
                                    .from('catalogo_new')
                                    .upload(fileName, file, {
                                      cacheControl: '3600',
                                      upsert: true
                                    });
                                  if (uploadResult.error) {
                                    console.error('Error uploading image:', uploadResult.error);
                                    alert('Error al subir la imagen: ' + uploadResult.error.message);
                                    return;
                                  }
                                  // Get public URL
                                  const publicUrlData = supabase.storage
                                    .from('catalogo_new')
                                    .getPublicUrl(uploadResult.data.path);
                                  if (!publicUrlData?.data?.publicUrl) {
                                    alert('No se pudo obtener la URL pública de la imagen.');
                                    return;
                                  }
                                  setNewProduct((prev) => ({ ...prev, image_url: publicUrlData.data.publicUrl }));
                                  // Image preview will show success - no alert needed
                                } catch (err) {
                                  console.error('Unexpected error uploading image:', err);
                                  alert('Error inesperado al subir la imagen.');
                                }
                              }}
                            />
                          </div>
                          {/*
                          <button
                            type="button"
                            className="mt-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-md border border-blue-200 hover:bg-blue-200 transition-colors text-sm font-medium"
                            onClick={() => setShowLibraryModal(true)}
                          >
                            Utiliza una imagen de tu librería Kusam
                          </button>
                          */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SUCCESS PAGE */
                    <div className="text-center space-y-6">
                      {/* Product Details */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-gray-900">{newProduct.name}</h3>
                        <p className="text-lg text-gray-600">SKU: {newProduct.sku}</p>
                      </div>

                      {/* Product Link Section */}
                      <div className="space-y-3">
                        <h4 className="text-lg font-medium text-gray-900">📋 Tu Página de Producto:</h4>
                        
                        {/* Copy Link Button */}
                        <div className="relative">
                          <button
                            onClick={handleCopyLink}
                            className="w-full max-w-lg mx-auto flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors group"
                          >
                            <span className="text-sm text-gray-700 truncate pr-2">
                              {`${typeof window !== 'undefined' ? window.location.origin : ''}/kusam/catalogo/${newProduct.sku}`}
                            </span>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {copySuccess ? (
                                <>
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm text-green-600 font-medium">¡Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-500 group-hover:text-gray-700 font-medium">Copiar</span>
                                </>
                              )}
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-blue-700">
                            Tu página estará lista en unos segundos. En casos excepcionales, puede tardar hasta 5 minutos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-between gap-3 p-6 border-t border-gray-200">
                <div>
                  {modalStep === 2 && (
                    <button
                      onClick={handlePreviousStep}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      ← Anterior
                    </button>
                  )}
                </div>
                <div className="flex gap-3">
                  {modalStep === 'success' ? (
                    /* SUCCESS PAGE BUTTONS */
                    <>
                      <button
                        onClick={handleViewProduct}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        Ver mi Producto
                      </button>
                      <button
                        onClick={handleAddAnother}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                      >
                        Agregar Otro Producto
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Cerrar
                      </button>
                    </>
                  ) : (
                    /* FORM STEPS BUTTONS */
                    <>
                      <button
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Cancelar
                      </button>
                      {modalStep === 1 ? (
                        <button
                          onClick={handleNextStep}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                          disabled={!newProduct.name || !newProduct.sku || !newProduct.price}
                        >
                          Siguiente →
                        </button>
                      ) : (
                        <button
                          onClick={handleSaveProduct}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                        >
                          Agrega el Producto
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
        </AnimatePresence>

        {/* Add Variable Modal */}
        <AnimatePresence>
        {showAddVariableModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            {/* Video Backdrop */}
            <motion.div 
              className="absolute inset-0"
              onClick={handleCloseVariableModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <video
                className="absolute inset-0 w-full h-full object-cover"
                src="/leaves1.mp4"
                autoPlay
                loop
                muted
                playsInline
                disablePictureInPicture={true}
                preload="auto"
                style={{ opacity: 0.1 }}
              />
            </motion.div>
            
            {/* Modal Content */}
            <motion.div
              className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  Añadir Nueva Variable
                </h2>
                <button
                  onClick={handleCloseVariableModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {variableSuccess ? (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      ¡Variable Creada Exitosamente!
                    </h3>
                    <p className="text-gray-600">
                      La variable ha sido agregada al catálogo.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveVariable(); }} className="space-y-6">
                    {/* Variable Name */}
                    <div>
                      <label htmlFor="variable-name" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la Variable <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="variable-name"
                        type="text"
                        value={newVariable.name}
                        onChange={(e) => setNewVariable({ ...newVariable, name: e.target.value })}
                        placeholder="ej. Azul Marino, Negro Mate, etc."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        required
                      />
                    </div>

                    {/* Variable Type */}
                    <div>
                      <label htmlFor="variable-type" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Variable <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="variable-type"
                        value={newVariable.type}
                        onChange={(e) => setNewVariable({ ...newVariable, type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800"
                        required
                      >
                        <option value="fabric_color">Color de Tela</option>
                        <option value="finish">Colores de Estructura</option>
                      </select>
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label htmlFor="variable-image" className="block text-sm font-medium text-gray-700 mb-2">
                        Imagen <span className="text-red-500">*</span>
                      </label>
                      <div 
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                          isDraggingVariable 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingVariable(true);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingVariable(true);
                        }}
                        onDragLeave={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingVariable(false);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsDraggingVariable(false);
                          
                          const file = e.dataTransfer.files?.[0];
                          if (!file) return;
                          
                          // Check if it's an image
                          if (!file.type.startsWith('image/')) {
                            alert('Por favor, sube solo archivos de imagen.');
                            return;
                          }
                          
                          // Validate file size (max 10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            alert('La imagen debe ser menor a 10MB.');
                            return;
                          }
                          
                          setNewVariable({ ...newVariable, image: file });
                          // Create preview URL
                          const previewUrl = URL.createObjectURL(file);
                          setVariableImagePreview(previewUrl);
                        }}
                        onClick={() => !newVariable.image && document.getElementById('variable-image')?.click()}
                      >
                        <div className="space-y-1 text-center">
                          {newVariable.image && variableImagePreview ? (
                            <div className="space-y-3">
                              <div className="relative w-full max-w-xs mx-auto">
                                <Image
                                  src={variableImagePreview}
                                  alt="Vista previa"
                                  width={200}
                                  height={200}
                                  className="rounded-lg object-cover"
                                />
                              </div>
                              <div className="flex items-center justify-center gap-2 text-green-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Imagen cargada exitosamente</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewVariable({ ...newVariable, image: null });
                                  setVariableImagePreview('');
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Cambiar imagen
                              </button>
                            </div>
                          ) : (
                            <>
                              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <div className="flex text-sm text-gray-600">
                                <label
                                  htmlFor="variable-image"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                >
                                  <span>Subir una imagen</span>
                                  <input
                                    id="variable-image"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        setNewVariable({ ...newVariable, image: file });
                                        // Create preview URL
                                        const previewUrl = URL.createObjectURL(file);
                                        setVariableImagePreview(previewUrl);
                                      }
                                    }}
                                    required
                                  />
                                </label>
                                <p className="pl-1">o arrastra y suelta</p>
                              </div>
                              <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </form>
                )}
              </div>

              {/* Modal Footer */}
              {!variableSuccess && (
                <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                  <button
                    onClick={handleCloseVariableModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    disabled={variableUploadProgress}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveVariable}
                    disabled={!newVariable.name || !newVariable.image || variableUploadProgress}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {variableUploadProgress ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </>
                    ) : (
                      'Guardar Variable'
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
        </AnimatePresence>
      </div>
    </>
  );
}