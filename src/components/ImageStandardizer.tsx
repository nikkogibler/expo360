'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { CreditDisplay, CreditUpgradeMessage } from './admin/CreditDisplay';
import { useCreditAwareProcessing } from '../hooks/useCredits';
import CreditPurchaseModal from './CreditPurchaseModal';
import { MultiStepLoader } from '../ui/multi-step-loader';
import { LoaderThree } from '../ui/loader';
import { LoaderOne } from './ui/loader';

// Interface for Supabase global product options
interface GlobalProductOption {
  id: string;
  name: string;
  type: string;
  value_data: { image_url?: string };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Interface for reference images
interface ReferenceImage {
  id: string;
  file: File | null;
  preview: string;
  contextType: 'fabric' | 'structure' | 'person' | 'place' | 'style' | 'custom';
  contextLabel: string;
  customDescription?: string;
  source: 'upload' | 'supabase';
  order: number;
  base64Data?: string; // Store base64 for API
}

interface ImageStandardizerProps {
  onBack: () => void;
}

// Loading states for the multi-step loader
const imageStandardizationSteps = [
  { text: "Verificando créditos disponibles" },
  { text: "Comprimiendo tu imagen" },
  { text: "Analizando tu prompt" },
  { text: "Configurando variables seleccionadas" },
  { text: "Llamando a ProShotNow™ by Interzekt" },
  { text: "Generando imagen estandarizada" },
  { text: "Guardando en la Librería de Imágenes Expo360" },
  { text: "¡Listo! Tu imagen estará lista en..." },
  { text: "5" },
  { text: "4" },
  { text: "3" },
  { text: "2" },
  { text: "1" }
];

export default function ImageStandardizer({ onBack }: ImageStandardizerProps) {
  // Utility: Convert base64 string to Blob
  function base64ToBlob(base64: string): Blob {
    const [meta, data] = base64.split(',');
    const mime = meta.match(/:(.*?);/)?.[1] || 'image/png';
    const binary = atob(data);
    const array = [];
    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], { type: mime });
  }
  
  // Prevent default drag behavior on the entire component
  useEffect(() => {
    const preventDefaults = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevent browser from opening files
    window.addEventListener('dragover', preventDefaults);
    window.addEventListener('drop', preventDefaults);

    return () => {
      window.removeEventListener('dragover', preventDefaults);
      window.removeEventListener('drop', preventDefaults);
    };
  }, []);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInitialLoader, setShowInitialLoader] = useState<boolean>(false);
  const [showImageSpotlight, setShowImageSpotlight] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  
  // Reference images state
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [maxReferenceImages] = useState<number>(5);
  const [isUploadingRef, setIsUploadingRef] = useState<boolean>(false);
  
  // Supabase options
  const [fabricOptions, setFabricOptions] = useState<GlobalProductOption[]>([]);
  const [frameOptions, setFrameOptions] = useState<GlobalProductOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);

  // Step-by-step flow state
  const [activeStep, setActiveStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set([0]));
  
  // Refs for smooth scrolling
  const imageUploadRef = React.useRef<HTMLDivElement>(null);
  const variablesRef = React.useRef<HTMLDivElement>(null);
  const perspectiveRef = React.useRef<HTMLDivElement>(null);
  const promptRef = React.useRef<HTMLDivElement>(null);
  const submitRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Credit management
  const { 
    credits, 
    hasCredits, 
    isProcessing: creditProcessing, 
    processWithCredits, 
    canProcess,
    refreshCredits
  } = useCreditAwareProcessing(userId || '');

  // Get current user
  useEffect(() => {
    async function getCurrentUser() {
      // Try Supabase auth first
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('🔍 ImageStandardizer auth check:', { user: user?.id, email: user?.email, error });
      
      if (user) {
        console.log('✅ Using Supabase auth user:', user.id);
        setUserId(user.id);
        return;
      }
      
      // Fallback to cookie-based admin system
      const userEmail = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_email='))
        ?.split('=')[1];
      
      console.log('🍪 Cookie check:', { userEmail, allCookies: document.cookie });
      
      if (userEmail) {
        // Use email as user ID for admin users
        console.log('✅ Using email from cookie:', userEmail);
        setUserId(userEmail);
      } else {
        // Generate a temporary session ID for demo purposes
        const sessionId = 'admin-session-' + Date.now();
        console.log('⚠️ No auth found, using demo session:', sessionId);
        setUserId(sessionId);
      }
    }
    getCurrentUser();
  }, []);

  // Fetch fabric and frame options from Supabase
  useEffect(() => {
    async function fetchOptions() {
      try {
        const { data: globalOptionsData, error } = await supabase
          .from('global_product_options')
          .select('*')
          .in('type', ['finish', 'fabric_color'])
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.error('Error fetching product options:', error);
          return;
        }

        if (globalOptionsData) {
          const processedOptions = globalOptionsData.map(option => ({
            ...option,
            value_data: typeof option.value_data === 'string' ?
              JSON.parse(option.value_data) : option.value_data
          })) as GlobalProductOption[];

          const fabrics = processedOptions.filter(opt => opt.type.toLowerCase() === 'fabric_color');
          const frames = processedOptions.filter(opt => opt.type.toLowerCase() === 'finish');

          setFabricOptions(fabrics);
          setFrameOptions(frames);

          // Do not set default selections; always default to placeholder
        }
      } catch (err) {
        console.error('Error in fetchOptions:', err);
      } finally {
        setOptionsLoading(false);
      }
    }

    fetchOptions();
  }, []);

  // Cleanup preview URL on unmount or when new image is selected
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Step validation and progression logic
  useEffect(() => {
    // Step 1: Image uploaded - unlock step 2 but don't auto-scroll
    if (imageFile && !completedSteps.has(1)) {
      setCompletedSteps(prev => new Set([...prev, 1]));
      if (activeStep === 1) {
        setActiveStep(2);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageFile, activeStep]);

  // Step 3: Perspective selected (optional)
  useEffect(() => {
    if (activeStep === 3 && selectedPerspective && !completedSteps.has(3)) {
      setCompletedSteps(prev => new Set([...prev, 3]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, selectedPerspective]);
  
  // Step 4: Prompt entered (optional) - REMOVED to prevent scroll jumps
  // The step will be marked complete when user moves to next step instead
  useEffect(() => {
    // Only mark complete if we've moved past this step
    if (activeStep > 4 && additionalPrompt && !completedSteps.has(4)) {
      setCompletedSteps(prev => new Set([...prev, 4]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  // Helper function to skip to next step
  const skipToNextStep = (currentStep: number) => {
    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep);
    setCompletedSteps(newCompleted);
    setActiveStep(currentStep + 1);
  };

  // Helper function to validate base64 image data
  const validateBase64Image = (dataUrl: string): boolean => {
    if (!dataUrl.startsWith('data:image/')) {
      console.log('Invalid data URL format');
      return false;
    }
    
    try {
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data || base64Data.length < 100) {
        console.log('Base64 data too short or missing');
        return false;
      }
      
      // Test if it's valid base64
      atob(base64Data.substring(0, 100));
      console.log('Base64 validation passed');
      return true;
    } catch (e) {
      console.log('Base64 validation failed:', e);
      return false;
    }
  };

  // Helper to generate descriptive file name using AI
  async function generateDescriptiveFileName(
    imageBase64: string, 
    fabricName?: string, 
    structureName?: string,
    referenceImagesData?: ReferenceImage[],
    generationPrompt?: string
  ): Promise<string> {
    try {
      console.log('[ImageStandardizer] 🎯 Starting AI filename generation...');
      setProcessingStatus('Generando nombre descriptivo...');
      
      // Prepare context about reference images
      const contextInfo = {
        fabric: fabricName || selectedFabric,
        structure: structureName || selectedFrame,
        referenceImages: referenceImagesData?.map(ref => ({
          type: ref.contextType,
          label: ref.contextLabel
        })) || []
      };

      const response = await fetch('/api/describe-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          imageBase64,
          contextInfo,
          generationPrompt // Include the full AI generation prompt
        })
      });

      console.log('[ImageStandardizer] 📡 describe-image API responded with status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ImageStandardizer] ❌ describe-image API error:', errorText);
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      console.log('[ImageStandardizer] 📝 AI generated description:', data.description);
      const description = data.description || 'furniture';
      
      // Sanitize for filename: clean and simple
      const sanitized = description
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s]/g, '') // Remove all special chars except spaces
        .replace(/\s+/g, '_') // Replace spaces with single underscore
        .replace(/_+/g, '_') // Replace multiple underscores with single
        .replace(/^_|_$/g, '') // Remove leading/trailing underscores
        .substring(0, 60); // Max 60 chars for description
      
      // Add timestamp for uniqueness
      const timestamp = Date.now();
      const finalFilename = `${sanitized}_${timestamp}.png`;
      console.log('[ImageStandardizer] ✅ Generated filename:', finalFilename);
      return finalFilename;
    } catch (error) {
      console.error('[ImageStandardizer] ⚠️ Error generating descriptive filename, using fallback:', error);
      // Fallback: simple descriptive naming based on available context
      const parts = ['expo360_furniture'];
      if (selectedFabric && selectedFabric !== 'Pearl') {
        parts.push(selectedFabric.toLowerCase().replace(/[^a-z0-9]/g, ''));
      }
      if (selectedFrame && selectedFrame !== 'Ecru') {
        parts.push(selectedFrame.toLowerCase().replace(/[^a-z0-9]/g, ''));
      }
      const timestamp = Date.now();
      const fallbackName = `${parts.join('_')}_${timestamp}.png`;
      console.log('[ImageStandardizer] 📁 Fallback filename:', fallbackName);
      return fallbackName;
    }
  }

  // Helper to generate consistent file name (fallback)
  function getImageFileName() {
    return `expo360-furniture-${selectedFabric.toLowerCase().replace(/\s+/g, '-')}-${selectedFrame.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
  }

  const handleDownload = () => {
    if (!editedImageUrl) return;
    const fileName = getImageFileName();
    const link = document.createElement('a');
    link.href = editedImageUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reference Image Handlers
  const urlToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Compress image to JPG to reduce payload size (critical for API limits)
  const compressImageToJPG = (file: File, maxWidth: number = 1920, quality: number = 0.85): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          
          const originalSize = (file.size / 1024 / 1024).toFixed(2);
          const compressedSize = (compressedBase64.length * 0.75 / 1024 / 1024).toFixed(2);
          console.log(`[Compression] ${file.name}: ${originalSize}MB → ${compressedSize}MB`);
          
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleAddReferenceImage = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const remainingSlots = maxReferenceImages - referenceImages.length;
    if (remainingSlots <= 0) {
      setError(`Máximo ${maxReferenceImages} imágenes de referencia permitidas`);
      return;
    }

    setIsUploadingRef(true);
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    try {
      const newImages: ReferenceImage[] = [];
      
      for (const file of filesToAdd) {
        // Validate file
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type.toLowerCase())) {
          continue;
        }
        
        if (file.size > 3 * 1024 * 1024) {
          setError('Cada imagen debe ser menor a 3MB');
          continue;
        }

        const preview = URL.createObjectURL(file);
        const base64Data = await fileToBase64(file);
        
        const newRef: ReferenceImage = {
          id: `ref-${Date.now()}-${Math.random()}`,
          file,
          preview,
          contextType: 'custom',
          contextLabel: file.name,
          source: 'upload',
          order: referenceImages.length + newImages.length,
          base64Data
        };
        
        newImages.push(newRef);
      }
      
      setReferenceImages([...referenceImages, ...newImages]);
    } catch (err) {
      console.error('Error adding reference images:', err);
      setError('Error al cargar imágenes de referencia');
    } finally {
      setIsUploadingRef(false);
    }
  };

  const handleRemoveReferenceImage = (id: string) => {
    const imageToRemove = referenceImages.find(img => img.id === id);
    if (imageToRemove && imageToRemove.source === 'upload') {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    setReferenceImages(referenceImages.filter(img => img.id !== id));
  };

  const handleUpdateReferenceContext = (id: string, contextType: ReferenceImage['contextType'], label?: string) => {
    setReferenceImages(referenceImages.map(img => 
      img.id === id 
        ? { ...img, contextType, contextLabel: label || img.contextLabel }
        : img
    ));
  };

  const handleClearAllReferences = () => {
    referenceImages.forEach(img => {
      if (img.source === 'upload') {
        URL.revokeObjectURL(img.preview);
      }
    });
    setReferenceImages([]);
  };

  // Comprehensive validation function
  const validateImagesForSubmit = (): string | null => {
    // Validate main image
    if (!imageFile) {
      return 'Por favor, sube una imagen de producto primero.';
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
      return 'La imagen principal debe ser JPG o PNG. Por favor, convierte tu archivo HEIC.';
    }

    if (imageFile.size > 3 * 1024 * 1024) {
      return 'La imagen principal es demasiado grande. Máximo 3MB.';
    }

    // Validate reference images
    if (referenceImages.length > maxReferenceImages) {
      return `Máximo ${maxReferenceImages} imágenes de referencia permitidas.`;
    }

    // Validate total payload size
    let totalSize = imageFile.size;
    for (const ref of referenceImages) {
      if (ref.file) {
        totalSize += ref.file.size;
      }
    }

    const maxTotalSize = 15 * 1024 * 1024; // 15MB
    if (totalSize > maxTotalSize) {
      return `El tamaño total de todas las imágenes (${(totalSize / 1024 / 1024).toFixed(1)}MB) excede el límite de 15MB. Por favor, reduce el tamaño o cantidad de imágenes.`;
    }

    // Validate individual reference images
    for (const ref of referenceImages) {
      if (ref.file) {
        if (!allowedTypes.includes(ref.file.type.toLowerCase())) {
          return `La imagen de referencia "${ref.contextLabel}" debe ser JPG o PNG.`;
        }
        
        if (ref.file.size > 3 * 1024 * 1024) {
          return `La imagen de referencia "${ref.contextLabel}" es demasiado grande (máximo 3MB).`;
        }
      }
    }

    return null; // All validations passed
  };

  // Add Supabase fabric reference image
  const handleAddFabricReference = async () => {
    if (!selectedFabric) return;
    
    // Check if already added
    if (referenceImages.some(img => img.contextType === 'fabric' && img.contextLabel.includes(selectedFabric))) {
      setError('Ya agregaste esta imagen de referencia de tela');
      return;
    }

    if (referenceImages.length >= maxReferenceImages) {
      setError(`Máximo ${maxReferenceImages} imágenes de referencia`);
      return;
    }

    const fabricOption = fabricOptions.find(f => f.name === selectedFabric);
    if (!fabricOption || !fabricOption.value_data?.image_url) {
      setError('No hay imagen disponible para esta tela');
      return;
    }

    setIsUploadingRef(true);
    try {
      const imageUrl = fabricOption.value_data.image_url;
      const base64Data = await urlToBase64(imageUrl);
      
      const newRef: ReferenceImage = {
        id: `fabric-${Date.now()}`,
        file: null,
        preview: imageUrl,
        contextType: 'fabric',
        contextLabel: `${selectedFabric} - Color de Tela`,
        source: 'supabase',
        order: referenceImages.length,
        base64Data
      };
      
      setReferenceImages([...referenceImages, newRef]);
    } catch (err) {
      console.error('Error adding fabric reference:', err);
      setError('Error al cargar imagen de tela desde Supabase');
    } finally {
      setIsUploadingRef(false);
    }
  };

  // Add Supabase structure reference image
  const handleAddStructureReference = async () => {
    if (!selectedFrame) return;
    
    // Check if already added
    if (referenceImages.some(img => img.contextType === 'structure' && img.contextLabel.includes(selectedFrame))) {
      setError('Ya agregaste esta imagen de referencia de estructura');
      return;
    }

    if (referenceImages.length >= maxReferenceImages) {
      setError(`Máximo ${maxReferenceImages} imágenes de referencia`);
      return;
    }

    const frameOption = frameOptions.find(f => f.name === selectedFrame);
    if (!frameOption || !frameOption.value_data?.image_url) {
      setError('No hay imagen disponible para esta estructura');
      return;
    }

    setIsUploadingRef(true);
    try {
      const imageUrl = frameOption.value_data.image_url;
      const base64Data = await urlToBase64(imageUrl);
      
      const newRef: ReferenceImage = {
        id: `structure-${Date.now()}`,
        file: null,
        preview: imageUrl,
        contextType: 'structure',
        contextLabel: `${selectedFrame} - Acabado Estructura`,
        source: 'supabase',
        order: referenceImages.length,
        base64Data
      };
      
      setReferenceImages([...referenceImages, newRef]);
    } catch (err) {
      console.error('Error adding structure reference:', err);
      setError('Error al cargar imagen de estructura desde Supabase');
    } finally {
      setIsUploadingRef(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Enhance prompt using AI
  const handleEnhancePrompt = async () => {
    // Get the current value from the textarea (since it's uncontrolled)
    const currentPrompt = textareaRef.current?.value || '';
    
    if (!currentPrompt || currentPrompt.trim().length === 0) {
      setError('Por favor, escribe un prompt primero antes de mejorarlo.');
      return;
    }

    if (!imageFile) {
      setError('Por favor, sube una imagen del producto primero.');
      return;
    }

    setIsEnhancingPrompt(true);
    setError(null);

    try {
      console.log('[ImageStandardizer] 🎨 Enhancing prompt...');
      console.log('[ImageStandardizer] Current additionalPrompt:', currentPrompt);
      console.log('[ImageStandardizer] Prompt length:', currentPrompt.length);
      console.log('[ImageStandardizer] Has product image file:', !!imageFile);
      console.log('[ImageStandardizer] Selected fabric:', selectedFabric);
      console.log('[ImageStandardizer] Selected frame:', selectedFrame);
      
      // Convert file to base64
      const base64Image = await fileToBase64(imageFile);
      console.log('[ImageStandardizer] Converted image to base64, length:', base64Image.length);
      
      const payload = { 
        prompt: currentPrompt,
        productImage: base64Image, // Pass the base64 image
        fabricColor: selectedFabric, // Pass selected fabric variable
        frameFinish: selectedFrame   // Pass selected frame/structure variable
      };
      console.log('[ImageStandardizer] Sending payload with product image and variables');
      
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[ImageStandardizer] Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[ImageStandardizer] ❌ API error response:', errorData);
        throw new Error(errorData.error || 'Failed to enhance prompt');
      }

      const data = await response.json();
      console.log('[ImageStandardizer] ✅ Enhanced prompt received:', data.enhancedPrompt);
      
      // Replace the text in the field (both state and textarea)
      setAdditionalPrompt(data.enhancedPrompt);
      if (textareaRef.current) {
        textareaRef.current.value = data.enhancedPrompt;
      }
      
    } catch (err) {
      console.error('[ImageStandardizer] Error enhancing prompt:', err);
      setError('Error al mejorar el prompt. Intenta de nuevo.');
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Helper function to close spotlight and scroll to results
  const closeSpotlightAndShowResults = () => {
    setShowImageSpotlight(false);
    // Scroll to results after modal closes
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300); // Wait for modal close animation
  };

  const handleSubmit = async () => {
    console.log('[ImageStandardizer] handleSubmit called');
    console.log('[ImageStandardizer] Main image:', imageFile?.name);
    console.log('[ImageStandardizer] Reference images:', referenceImages.length);
    
    // Pre-validation: Comprehensive validation BEFORE deducting credits
    const validationError = validateImagesForSubmit();
    if (validationError) {
      console.log('[ImageStandardizer] Validation failed:', validationError);
      setError(validationError);
      return;
    }

    if (!canProcess) {
      console.log('[ImageStandardizer] No credits available');
      setError('No hay créditos disponibles para procesar la imagen.');
      return;
    }

  setError(null);
  setEditedImageUrl(null);
  setAiDescription(null);
  console.log('[ImageStandardizer] Starting image processing...');
  
  // Show initial loader (LoaderThree) for 6.5 seconds
  setShowInitialLoader(true);
  await new Promise(resolve => setTimeout(resolve, 6500));
  setShowInitialLoader(false);
  
  // Then show the multi-step loader
  setIsLoading(true);

    // At this point, imageFile is guaranteed to be non-null due to validation
    const mainImageFile = imageFile!;

    // Create image details for credit tracking
    const imageDetails = {
      filename: mainImageFile.name,
      size: mainImageFile.size,
      type: mainImageFile.type,
      fabric: selectedFabric,
      frame: selectedFrame,
      perspective: selectedPerspective,
      additionalPrompt: additionalPrompt.trim()
    };

    // Process with credit awareness (credits only deducted after validation passes)
    const result = await processWithCredits(async () => {
      setProcessingStatus('Convirtiendo imagen a base64...');
      console.log('[ImageStandardizer] Reading image file as base64');


      try {
        // Compress main image to JPG to reduce payload size
        setProcessingStatus('Comprimiendo imagen principal...');
        console.log('[ImageStandardizer] Compressing main image to JPG...');
        const base64Image = await compressImageToJPG(mainImageFile, 1920, 0.85);

        // Log main image
        console.log('[ImageStandardizer] Main image prepared and compressed:', {
          userImage: base64Image?.substring(0, 80) + (base64Image?.length > 80 ? '...' : '')
        });

        setProcessingStatus('Comprimiendo imágenes de referencia...');
        console.log('[ImageStandardizer] Compressing reference images...');
        console.log('[ImageStandardizer] Reference images count:', referenceImages.length);

        // Compress all reference images to JPG (ALWAYS compress for API, even if we have base64 for display)
        const referencesWithBase64 = await Promise.all(
          referenceImages.map(async (ref) => {
            // Always recompress for API to ensure JPG format and consistent quality
            if (ref.file) {
              const base64 = await compressImageToJPG(ref.file, 1920, 0.85);
              return { ...ref, base64Data: base64 };
            }
            return ref;
          })
        );

        // Create modifications string from user prompt only (no tela/estructura)
        let modifications = '';
        if (selectedPerspective) {
          modifications += `PERSPECTIVE: Show the furniture from a ${selectedPerspective}. `;
        }
        if (additionalPrompt.trim()) {
          modifications += `USER ADDITIONAL INSTRUCTIONS: ${additionalPrompt.trim()}`;
        }

        // Compose content array for API
        const content = [
          { type: 'image_url', image_url: { url: base64Image } },
          // Add reference images
          ...referencesWithBase64.map(ref => ({
            type: 'image_url',
            image_url: { url: ref.base64Data! }
          }))
        ];

        console.log('[ImageStandardizer] Total images in content array:', content.length);

        const fileName = getImageFileName();
        const res = await fetch('/api/process-furniture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content,
            modifications,
            referenceImages: referencesWithBase64.map(ref => ({
              contextType: ref.contextType,
              contextLabel: ref.contextLabel,
              customDescription: ref.customDescription,
              order: ref.order
            })),
            userId: userId || null,
            tela: selectedFabric,
            estructura: selectedFrame,
            fileName,
          }),
        });

        setProcessingStatus('Procesando respuesta del servidor...');
        console.log('[ImageStandardizer] Awaiting response from /api/process-furniture');

        let data;
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error('[ImageStandardizer] Error parsing response JSON:', jsonErr);
          throw new Error('Error parsing response JSON: ' + jsonErr);
        }

        if (!res.ok) {
          console.error('[ImageStandardizer] API returned error:', data.error);
          throw new Error(data.error || 'Algo salió mal.');
        }

        console.log('[ImageStandardizer] API Response:', data);
        console.log('[ImageStandardizer] Generated Image URL:', data.editedImageUrl?.substring(0, 50) + '...');
        console.log('[ImageStandardizer] Has Generated Image:', data.hasGeneratedImage);
        console.log('[ImageStandardizer] Prompt Text Available:', !!data.promptText);
        console.log('[ImageStandardizer] Raw Response Available:', !!data.rawResponse);
        
        // Handle the base64 image from the response
        if (data.editedImageUrl && data.hasGeneratedImage) {
          console.log('[ImageStandardizer] Setting edited image URL, length:', data.editedImageUrl.length);
          // Validate the data URL
          if (validateBase64Image(data.editedImageUrl)) {
            setEditedImageUrl(data.editedImageUrl);
            console.log('[ImageStandardizer] Successfully set valid image data URL');
            // Immediately refresh credits when success message is shown
            refreshCredits();

            // --- Upload to Supabase Storage ---
            try {
              // Generate AI-powered descriptive filename with full context including the prompt
              const fileName = await generateDescriptiveFileName(
                data.editedImageUrl,
                selectedFabric,
                selectedFrame,
                referenceImages,
                data.promptText // Pass the full AI generation prompt
              );
              
              console.log(`[ImageStandardizer] 📁 Generated filename:`, fileName);
              console.log(`[ImageStandardizer] 📁 Filename length:`, fileName.length);
              console.log(`[ImageStandardizer] 📁 Contains special chars:`, /[^a-z0-9_.-]/i.test(fileName));
              
              const blob = base64ToBlob(data.editedImageUrl);
              console.log(`[ImageStandardizer] 📦 Blob size:`, blob.size, 'bytes', `(${(blob.size / 1024 / 1024).toFixed(2)} MB)`);
              
              // Use userId from React state for bucket selection
              // Check for both UUID and email for nikkogibler
              let bucket = 'product-images';
              const isNikko = userId === 'c9abd999-f0ab-4cd2-954c-db4ed288392e' || 
                             userId === 'nikkogibler@gmail.com' ||
                             userId?.includes('nikkogibler');
              
              if (isNikko) {
                bucket = 'nikko-tests';
                console.log(`[ImageStandardizer] 👨‍💻 Nikko detected - using nikko-tests bucket`);
              }
              
              console.log(`[ImageStandardizer] ☁️ Uploading to Supabase Storage...`);
              console.log(`[ImageStandardizer] ☁️ Bucket: ${bucket}`);
              console.log(`[ImageStandardizer] ☁️ Filename: ${fileName}`);
              
              // Check auth status before upload
              const { data: { session } } = await supabase.auth.getSession();
              console.log(`[ImageStandardizer] 🔐 Auth session status:`, session ? 'Active' : 'No session');
              console.log(`[ImageStandardizer] 👤 User ID for upload:`, userId);
              
              const { error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(fileName, blob, {
                  cacheControl: '3600',
                  upsert: true,
                });
              
              if (uploadError) {
                console.error('[ImageStandardizer] ❌ Supabase upload error:', uploadError);
                console.error('[ImageStandardizer] ❌ Error message:', uploadError.message);
                console.error('[ImageStandardizer] ❌ Error details:', JSON.stringify(uploadError, null, 2));
                
                // Check if it's an RLS policy error
                if (uploadError.message.includes('row-level security') || uploadError.message.includes('policy')) {
                  setError(`Error de autenticación: No tienes permisos para subir imágenes. Por favor, inicia sesión nuevamente.`);
                } else {
                  setError(`La imagen fue generada pero no se pudo guardar en Supabase: ${uploadError.message}`);
                }
              } else {
                console.log('[ImageStandardizer] ✅ Imagen subida exitosamente a Supabase Storage:', fileName);
                
                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                  .from(bucket)
                  .getPublicUrl(fileName);
                console.log('[ImageStandardizer] 🌐 Public URL:', publicUrl);
                
                // --- Generate Thumbnail Immediately ---
                console.log('[ImageStandardizer] 📸 Generating thumbnail...');
                try {
                  const thumbnailResponse = await fetch('/api/generate-thumbnail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileName, bucket })
                  });
                  
                  if (thumbnailResponse.ok) {
                    const thumbnailData = await thumbnailResponse.json();
                    console.log('[ImageStandardizer] ✅ Thumbnail generated:', thumbnailData.thumbnailPath);
                  } else {
                    console.error('[ImageStandardizer] ⚠️ Thumbnail generation failed (non-critical)');
                  }
                } catch (thumbnailErr) {
                  console.error('[ImageStandardizer] ⚠️ Thumbnail generation error (non-critical):', thumbnailErr);
                }
                // --- End thumbnail generation ---
              }
            } catch (err) {
              console.error('[ImageStandardizer] Error uploading image to Supabase:', err);
              setError('Error al subir la imagen generada a Supabase.');
            }
            // --- End upload ---

          } else {
            console.log('[ImageStandardizer] Invalid image data URL format');
            setError('Imagen generada pero con formato inválido.');
          }
        } else if (data.rawResponse) {
        // Try to extract base64 from raw response as fallback
        console.log('[ImageStandardizer] Attempting to extract base64 from rawResponse...');
        try {
          const rawData = typeof data.rawResponse === 'string' ? 
            JSON.parse(data.rawResponse) : data.rawResponse;
          
          // First, check if there's an 'id' field containing base64 data
          if (rawData.id && typeof rawData.id === 'string' && rawData.id.length > 100) {
            console.log('[ImageStandardizer] Found id field in rawResponse, length:', rawData.id.length);
            let base64Data = rawData.id;
            
            // Remove 'gen-1' prefix if present
            if (base64Data.startsWith('gen-1')) {
              base64Data = base64Data.slice(5);
            }
            
            const imageDataUrl = `data:image/png;base64,${base64Data}`;
            
            if (validateBase64Image(imageDataUrl)) {
              setEditedImageUrl(imageDataUrl);
              console.log('[ImageStandardizer] Successfully extracted and validated base64 from rawResponse id field');
            } else {
              console.log('[ImageStandardizer] Extracted base64 from id field failed validation');
              setError('Imagen extraída pero con formato inválido.');
            }
          } else {
            // Fallback: Look for any base64 patterns in the raw response
            const rawString = JSON.stringify(rawData);
            const base64Match = rawString.match(/([A-Za-z0-9+/=]{500,})/);
            
            if (base64Match) {
              const base64Data = base64Match[1];
              const imageDataUrl = `data:image/png;base64,${base64Data}`;
              
              if (validateBase64Image(imageDataUrl)) {
                setEditedImageUrl(imageDataUrl);
                console.log('[ImageStandardizer] Successfully extracted and validated base64 from rawResponse (fallback)');
              } else {
                console.log('[ImageStandardizer] Extracted base64 failed validation (fallback)');
                setError('Imagen extraída pero con formato inválido.');
              }
            } else {
              console.log('[ImageStandardizer] No base64 data found in rawResponse');
              setError('No se pudo generar la imagen. Intenta con otra imagen.');
            }
          }
        } catch (parseError) {
          console.error('[ImageStandardizer] Error parsing rawResponse:', parseError);
          setError('Error procesando la respuesta del servidor.');
        }
      } else {
        console.log('[ImageStandardizer] No generated image found in response');
        setError('No se pudo generar la imagen. El modelo AI no devolvió una imagen editada.');
      }
      
      if (data.description) {
        setAiDescription(data.description);
      }

      // No need to return res.json() again, data is already parsed
      return data;

    } catch (err: unknown) {
      console.error('[ImageStandardizer] Error in processing:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al procesar la imagen';
      throw new Error(errorMessage);
    }
    }, imageDetails);

    setIsLoading(false);
    setProcessingStatus('');

    if (result.success && result.result) {
      // Refresh credits after successful image generation
      refreshCredits();
      const data = result.result;
      console.log('API Response:', data); // Debug log
      
      // Show spotlight modal when image is ready
      if (data.editedImageUrl) {
        setShowImageSpotlight(true);
      }
      console.log('Generated Image URL:', data.editedImageUrl?.substring(0, 50) + '...'); // Debug log
      console.log('Has Generated Image:', data.hasGeneratedImage); // Debug log
      console.log('Raw Response Available:', !!data.rawResponse); // Debug log
      
      // Handle the base64 image from the response
      if (data.editedImageUrl && data.hasGeneratedImage) {
        console.log('Setting edited image URL, length:', data.editedImageUrl.length);
        // Validate the data URL
        if (validateBase64Image(data.editedImageUrl)) {
          setEditedImageUrl(data.editedImageUrl);
          console.log('Successfully set valid image data URL');
        } else {
          console.log('Invalid image data URL format');
          setError('Imagen generada pero con formato inválido.');
        }
      } else if (data.rawResponse) {
        // Try to extract base64 from raw response as fallback
        console.log('Attempting to extract base64 from rawResponse...');
        try {
          const rawData = typeof data.rawResponse === 'string' ? 
            JSON.parse(data.rawResponse) : data.rawResponse;
          
          // First, check if there's an 'id' field containing base64 data
          if (rawData.id && typeof rawData.id === 'string' && rawData.id.length > 100) {
            console.log('Found id field in rawResponse, length:', rawData.id.length);
            let base64Data = rawData.id;
            
            // Remove 'gen-1' prefix if present
            if (base64Data.startsWith('gen-1')) {
              base64Data = base64Data.slice(5);
            }
            
            const imageDataUrl = `data:image/png;base64,${base64Data}`;
            
            if (validateBase64Image(imageDataUrl)) {
              setEditedImageUrl(imageDataUrl);
              console.log('Successfully extracted and validated base64 from rawResponse id field');
            } else {
              console.log('Extracted base64 from id field failed validation');
              setError('Imagen extraída pero con formato inválido.');
            }
          } else {
            // Fallback: Look for any base64 patterns in the raw response
            const rawString = JSON.stringify(rawData);
            const base64Match = rawString.match(/([A-Za-z0-9+/=]{500,})/);
            
            if (base64Match) {
              const base64Data = base64Match[1];
              const imageDataUrl = `data:image/png;base64,${base64Data}`;
              
              if (validateBase64Image(imageDataUrl)) {
                setEditedImageUrl(imageDataUrl);
                console.log('Successfully extracted and validated base64 from rawResponse (fallback)');
              } else {
                console.log('Extracted base64 failed validation (fallback)');
                setError('Imagen extraída pero con formato inválido.');
              }
            } else {
              console.log('No base64 data found in rawResponse');
              setError('No se pudo generar la imagen. Intenta con otra imagen.');
            }
          }
        } catch (parseError) {
          console.error('Error parsing rawResponse:', parseError);
          setError('Error procesando la respuesta del servidor.');
        }
      } else {
        console.log('No generated image found in response');
        setError('No se pudo generar la imagen. El modelo AI no devolvió una imagen editada.');
      }
      
      if (data.description) {
        setAiDescription(data.description);
      }
    } else {
      // Processing failed
      const errorMsg = result.error || 'Error procesando la imagen.';
      
      // Check if it's a service unavailable error
      if (errorMsg.includes('temporalmente no disponible') || errorMsg.includes('503')) {
        setError('⚠️ El servicio de procesamiento está temporalmente no disponible. Esto es un problema del proveedor externo. Por favor, intenta de nuevo en 5-10 minutos.');
      } else if (errorMsg.includes('demasiado grande') || errorMsg.includes('413')) {
        setError('La solicitud es muy grande. Intenta: 1) Reducir el número de imágenes de referencia, 2) Usar imágenes más pequeñas, o 3) Comprimir las imágenes antes de subirlas.');
      } else {
        setError(errorMsg);
      }
    }
  };

  // Helper component for step containers
  const StepContainer = ({ 
    stepNumber, 
    children, 
    stepRef 
  }: { 
    stepNumber: number; 
    children: React.ReactNode; 
    stepRef?: React.RefObject<HTMLDivElement | null>;
  }) => {
    // Step 5 (submit) should be active when we reach step 4
    const isActive = stepNumber === 5 ? activeStep >= 4 : activeStep >= stepNumber;
    const isCompleted = completedSteps.has(stepNumber);
    
    return (
      <div 
        ref={stepRef}
        className="relative mb-6 p-4 rounded-lg"
        style={{
          opacity: isActive ? 1 : 0.4,
          filter: isActive ? 'none' : 'grayscale(1) blur(2px)',
          backgroundColor: isActive ? 'transparent' : 'rgba(0,0,0,0.02)',
          border: isActive ? '2px solid transparent' : '2px solid rgba(0,0,0,0.1)',
          borderImage: isActive && activeStep === stepNumber 
            ? 'linear-gradient(90deg, #8B5CF6, #2563EB, #EC4899) 1' 
            : 'none',
          pointerEvents: isActive ? 'auto' : 'none',
          transition: 'none',
        }}
      >
        <div style={{ position: 'relative', zIndex: isActive ? 1 : 0 }}>
          {children}
        </div>
        {isCompleted && stepNumber < activeStep && (
          <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white" style={{ zIndex: 2 }}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="p-6 rounded-lg shadow-lg"
      style={{
        backgroundColor: '#F8F5F0',
        borderColor: '#4B2E09',
        color: '#4B2E09',
        fontSize: '1.65rem',
        padding: '2.25rem',
        minHeight: '300px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1">
          <div className="text-xs font-semibold mt-2" style={{ lineHeight: 1.2 }}>
            ProShotNow™ by{' '}
            <span
              style={{
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #8B5CF6, #2563EB, #EC4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                color: 'transparent',
                padding: '0 2px',
              }}
            >
              Interzekt.com
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={(e) => {
              e.preventDefault();
              const scrollPos = window.scrollY;
              setShowPurchaseModal(true);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            <CreditDisplay size="compact" showIcon={true} />
          </button>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            &times; Cerrar
          </button>
        </div>
      </div>

      <StepContainer stepNumber={1} stepRef={imageUploadRef}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
              1
            </span>
            <label className="block text-gray-700 font-semibold">Subir Imagen de Producto</label>
          </div>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden"
            id="image-upload"
            ref={(input) => {
              if (input) {
                (window as Window & { imageUploadInput?: HTMLInputElement }).imageUploadInput = input;
              }
            }}
          />
          <div 
            onClick={(e) => {
              console.log('Upload area clicked');
              e.preventDefault();
              const input = document.getElementById('image-upload') as HTMLInputElement;
              if (input) {
                console.log('Triggering file input click');
                input.click();
              } else {
                console.log('File input not found');
              }
            }}
            className={`w-full block border-2 border-dashed rounded-lg py-4 px-6 cursor-pointer transition-colors duration-200 text-center ${
              isDragging 
                ? 'border-amber-500 bg-amber-50' 
                : 'border-gray-300 hover:border-amber-400'
            }`}
            style={!isDragging ? { borderColor: '#4B2E09', color: '#4B2E09' } : undefined}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragging(false);
              
              console.log('Drop event triggered', e.dataTransfer.files);
              const file = e.dataTransfer.files?.[0];
              if (!file) {
                console.log('No file found in drop');
                return;
              }
              
              console.log('File dropped:', file.name, file.type, file.size);
              
              // Check if it's an image
              if (!file.type.startsWith('image/')) {
                alert('Por favor, sube solo archivos de imagen.');
                return;
              }
              
              // Validate file size (max 3MB)
              if (file.size > 3 * 1024 * 1024) {
                alert('La imagen debe ser menor a 3MB.');
                return;
              }
              
              setImageFile(file);
              const previewUrl = URL.createObjectURL(file);
              setImagePreview(previewUrl);
              console.log('Image file set successfully');
            }}
          >
            {imageFile && imagePreview ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-full aspect-square max-w-xs">
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Imagen cargada exitosamente</span>
                </div>
                <p className="text-sm text-gray-600">
                  Haz clic o arrastra otra imagen para cambiarla
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div>
                  <span className="font-medium">
                    Seleccionar Archivo
                  </span>
                  <p className="text-sm text-gray-500 mt-1">
                    o arrastra y suelta aquí
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    Solo JPG y PNG, máximo 3MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        </div>
      </StepContainer>

      <StepContainer stepNumber={2} stepRef={variablesRef}>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                2
              </span>
              <label className="block text-gray-700 font-semibold">
                Seleccionar Variables
                <span className="text-gray-500 font-normal text-sm ml-1">(Opcional)</span>
              </label>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const scrollPos = window.scrollY;
                skipToNextStep(2);
                requestAnimationFrame(() => {
                  window.scrollTo(0, scrollPos);
                });
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium underline whitespace-nowrap"
            >
              Omitir →
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 font-medium text-sm">Color de Tela</label>
          {selectedFabric && fabricOptions.find(f => f.name === selectedFabric)?.value_data?.image_url && (
            <button
              onClick={handleAddFabricReference}
              disabled={referenceImages.length >= maxReferenceImages}
              className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
            >
              + Agregar Referencia
            </button>
          )}
        </div>
        {optionsLoading ? (
          <div className="w-full border rounded py-2 px-3 bg-gray-100 text-gray-500">
            Cargando opciones de tela...
          </div>
        ) : (
          <select 
            value={selectedFabric} 
            onChange={(e) => {
              const scrollPos = window.scrollY;
              setSelectedFabric(e.target.value);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }} 
            className="w-full border rounded py-2 px-3"
            style={{ borderColor: '#4B2E09', color: '#4B2E09', scrollMarginTop: '0px' }}
          >
            <option value="">Seleccionar color de tela...</option>
            {fabricOptions.map(fabric => (
              <option key={fabric.id} value={fabric.name}>{fabric.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 font-semibold">Material del Marco</label>
          {selectedFrame && frameOptions.find(f => f.name === selectedFrame)?.value_data?.image_url && (
            <button
              onClick={handleAddStructureReference}
              disabled={referenceImages.length >= maxReferenceImages}
              className="text-xs bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1 rounded transition-colors"
            >
              + Agregar Referencia
            </button>
          )}
        </div>
        {optionsLoading ? (
          <div className="w-full border rounded py-2 px-3 bg-gray-100 text-gray-500">
            Cargando opciones de estructura...
          </div>
        ) : (
          <select 
            value={selectedFrame} 
            onChange={(e) => {
              const scrollPos = window.scrollY;
              setSelectedFrame(e.target.value);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }} 
            className="w-full border rounded py-2 px-3"
            style={{ borderColor: '#4B2E09', color: '#4B2E09', scrollMarginTop: '0px' }}
          >
            <option value="">Seleccionar acabado de estructura...</option>
            {frameOptions.map(frame => (
              <option key={frame.id} value={frame.name}>{frame.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Reference Images Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
        <div className="flex justify-between items-center mb-3">
          <div>
            <label className="block text-gray-700 font-semibold">
              Imágenes de Referencia
              <span className="text-gray-500 font-normal text-sm ml-2">(Opcional)</span>
            </label>
            <p className="text-xs text-gray-600 mt-1">
              Agrega hasta {maxReferenceImages} imágenes para dar contexto adicional (color, estilo, ambiente, etc.)
            </p>
            {referenceImages.length >= 3 && (
              <p className="text-xs text-amber-600 mt-1">
                💡 Tip: Más imágenes = procesamiento más lento. Para mejores resultados, usa 2-3 imágenes de referencia clave.
              </p>
            )}
          </div>
          {referenceImages.length > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                const scrollPos = window.scrollY;
                handleClearAllReferences();
                requestAnimationFrame(() => {
                  window.scrollTo(0, scrollPos);
                });
              }}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Borrar todas
            </button>
          )}
        </div>

        {/* Reference Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {referenceImages.map((refImg) => (
            <div key={refImg.id} className="relative bg-white rounded-lg border-2 border-gray-300 p-2">
              {/* Image Preview */}
              <div className="relative w-full aspect-square mb-2 rounded overflow-hidden bg-gray-100">
                <Image
                  src={refImg.preview}
                  alt={refImg.contextLabel}
                  fill
                  className="object-cover"
                />
                {/* Source Badge */}
                <div className="absolute top-1 left-1 bg-black bg-opacity-60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {refImg.source === 'supabase' ? '📦 Supabase' : '📤 Upload'}
                </div>
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const scrollPos = window.scrollY;
                    handleRemoveReferenceImage(refImg.id);
                    requestAnimationFrame(() => {
                      window.scrollTo(0, scrollPos);
                    });
                  }}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>

              {/* Context Type Selector */}
              <select
                value={refImg.contextType}
                onChange={(e) => {
                  const scrollPos = window.scrollY;
                  handleUpdateReferenceContext(refImg.id, e.target.value as ReferenceImage['contextType']);
                  requestAnimationFrame(() => {
                    window.scrollTo(0, scrollPos);
                  });
                }}
                className="w-full text-xs border rounded py-1 px-2 mb-1"
                style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
              >
                <option value="custom">Otro Contexto</option>
                <option value="fabric">Color de Tela</option>
                <option value="structure">Acabado Estructura</option>
                <option value="person">Persona/Lifestyle</option>
                <option value="place">Lugar/Ambiente</option>
                <option value="style">Estilo/Mood</option>
              </select>

              {/* Context Label */}
              <input
                type="text"
                value={refImg.contextLabel}
                onChange={(e) => handleUpdateReferenceContext(refImg.id, refImg.contextType, e.target.value)}
                placeholder="Descripción..."
                className="w-full text-xs border rounded py-1 px-2"
                style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
              />
            </div>
          ))}

          {/* Add More Button */}
          {referenceImages.length < maxReferenceImages && (
            <label className="relative aspect-square border-2 border-dashed border-gray-400 hover:border-blue-500 rounded-lg cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const scrollPos = window.scrollY;
                  handleAddReferenceImage(e.target.files);
                  requestAnimationFrame(() => {
                    window.scrollTo(0, scrollPos);
                  });
                }}
                className="hidden"
              />
              <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs font-medium">Agregar</span>
              <span className="text-[10px]">
                {referenceImages.length}/{maxReferenceImages}
              </span>
            </label>
          )}
        </div>

        {isUploadingRef && (
          <p className="text-xs text-blue-600">Cargando imágenes...</p>
        )}

        {/* Smart Suggestions */}
        {referenceImages.length < maxReferenceImages && (
          <div className="mt-3 space-y-2">
            {selectedFabric && fabricOptions.find(f => f.name === selectedFabric)?.value_data?.image_url && 
             !referenceImages.some(img => img.contextType === 'fabric') && (
              <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <span className="text-lg">💡</span>
                <span className="text-gray-700">
                  Tienes una tela seleccionada. 
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const scrollPos = window.scrollY;
                      handleAddFabricReference();
                      requestAnimationFrame(() => {
                        window.scrollTo(0, scrollPos);
                      });
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    ¿Agregar imagen de referencia de tela?
                  </button>
                </span>
              </div>
            )}
            
            {selectedFrame && frameOptions.find(f => f.name === selectedFrame)?.value_data?.image_url && 
             !referenceImages.some(img => img.contextType === 'structure') && (
              <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-3 py-2">
                <span className="text-lg">💡</span>
                <span className="text-gray-700">
                  Tienes una estructura seleccionada. 
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      const scrollPos = window.scrollY;
                      handleAddStructureReference();
                      requestAnimationFrame(() => {
                        window.scrollTo(0, scrollPos);
                      });
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    ¿Agregar imagen de referencia de estructura?
                  </button>
                </span>
              </div>
            )}
            
            {referenceImages.length === 0 && (
              <div className="flex items-center gap-2 text-xs bg-blue-50 border border-blue-200 rounded px-3 py-2">
                <span className="text-lg">ℹ️</span>
                <span className="text-gray-600">
                  Puedes agregar imágenes de referencia para mejorar los resultados (ej: estilos, ambientes, personas)
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Continue button for variables section - minimal style */}
      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const scrollPos = window.scrollY;
            if (selectedFabric || selectedFrame) {
              const newCompleted = new Set(completedSteps);
              newCompleted.add(2);
              setCompletedSteps(newCompleted);
              setActiveStep(3);
            }
            requestAnimationFrame(() => {
              window.scrollTo(0, scrollPos);
            });
          }}
          disabled={!selectedFabric && !selectedFrame}
          className="text-sm font-medium transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
          style={{
            color: (selectedFabric || selectedFrame) ? '#2563EB' : '#9CA3AF',
          }}
        >
          Continuar 
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      </StepContainer>

      <StepContainer stepNumber={3} stepRef={perspectiveRef}>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
              3
            </span>
            <label className="block text-gray-700 font-semibold">
              Perspectiva de la Imagen 
              <span className="text-gray-500 font-normal text-sm">(Opcional)</span>
            </label>
          </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[
            { id: 'frontal', label: 'Vista Frontal', value: 'full frontal view' },
            { id: 'behind', label: 'Vista Posterior', value: 'view from behind' },
            { id: 'above', label: 'Vista Superior', value: 'view from above' },
            { id: 'angle-below', label: 'Ángulo Inferior', value: 'angled view from below' },
            { id: 'side', label: 'Vista Lateral', value: 'view from the side' },
            { id: 'rotate-180', label: 'Rotación 180°', value: 'rotated 180 degrees' }
          ].map((perspective) => (
            <button
              key={perspective.id}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                const scrollPos = window.scrollY;
                const isCurrentlySelected = selectedPerspective === perspective.value;
                setSelectedPerspective(isCurrentlySelected ? '' : perspective.value);
                
                // Auto-advance to next step when a perspective is selected
                if (!isCurrentlySelected) {
                  skipToNextStep(3);
                }
                
                requestAnimationFrame(() => {
                  window.scrollTo(0, scrollPos);
                });
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                selectedPerspective === perspective.value
                  ? 'bg-amber-100 border-amber-500 text-amber-800 shadow-md transform scale-105'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700'
              }`}
              style={{
                borderColor: selectedPerspective === perspective.value ? '#F59E0B' : '#4B2E09',
              }}
            >
              {perspective.label}
            </button>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">
            Selecciona una perspectiva específica para la imagen generada. Puedes hacer clic nuevamente para deseleccionar.
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const scrollPos = window.scrollY;
              skipToNextStep(3);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium underline whitespace-nowrap ml-4"
          >
            Omitir →
          </button>
        </div>
        </div>
      </StepContainer>

      <StepContainer stepNumber={4} stepRef={promptRef}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm font-bold">
                4
              </span>
              <label className="block text-gray-700 font-semibold">
                Instrucciones Adicionales 
                <span className="text-gray-500 font-normal text-sm">(Opcional)</span>
              </label>
            </div>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              const scrollPos = window.scrollY;
              handleEnhancePrompt();
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }}
            disabled={isEnhancingPrompt}
            className="group relative flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: isEnhancingPrompt
                ? 'linear-gradient(135deg, #F59E0B, #F97316, #EF4444)'
                : 'linear-gradient(135deg, #8B5CF6, #2563EB, #EC4899)',
              color: 'white',
              boxShadow: isEnhancingPrompt 
                ? '0 4px 15px rgba(245, 158, 11, 0.4)' 
                : '0 4px 15px rgba(139, 92, 246, 0.4)',
              transform: isEnhancingPrompt ? 'scale(0.98)' : 'scale(1)',
            }}
            title="Mejorar prompt con IA"
          >
            {isEnhancingPrompt ? (
              <>
                <LoaderOne />
                <span>Mejorando...</span>
              </>
            ) : (
              <>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2.5}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="whitespace-nowrap">
                  ✨ Mejorar con IA
                </span>
              </>
            )}
            <div 
              className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))',
                pointerEvents: 'none',
              }}
            />
          </button>
        </div>
        <textarea
          ref={textareaRef}
          defaultValue={additionalPrompt}
          onBlur={(e) => {
            // Only update state when user leaves the field
            setAdditionalPrompt(e.target.value);
          }}
          placeholder="Describe cualquier modificación específica adicional que desees para la imagen..."
          className="w-full border rounded py-2 px-3 resize-y min-h-[80px] max-h-[200px] overflow-y-auto text-sm"
          style={{ borderColor: '#4B2E09', color: '#4B2E09', fontSize: '0.875rem', lineHeight: '1.4' }}
          rows={3}
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            Ejemplo: &ldquo;Cambiar el ambiente de fondo a una terraza con vista al mar&rdquo; o &ldquo;Añadir plantas decorativas alrededor del mueble&rdquo;
          </p>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const scrollPos = window.scrollY;
              skipToNextStep(4);
              requestAnimationFrame(() => {
                window.scrollTo(0, scrollPos);
              });
            }}
            className="text-xs font-bold px-3 py-1 rounded transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            ¡Listo! ✓
          </button>
        </div>
        </div>
      </StepContainer>

      <StepContainer stepNumber={5} stepRef={submitRef}>
        <button 
        onClick={handleSubmit} 
        disabled={!imageFile || !canProcess || isLoading || optionsLoading || creditProcessing}
        className={`w-full py-3 rounded text-white font-bold transition-colors ${
          !imageFile || !canProcess || isLoading || optionsLoading || creditProcessing
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {optionsLoading 
          ? 'Cargando opciones...' 
          : !hasCredits
            ? 'Sin créditos disponibles'
            : isLoading || creditProcessing 
              ? (processingStatus || 'Estandarizando...') 
              : 'Estandarizar Imagen de Producto (1 crédito)'
        }
        </button>
      </StepContainer>

      {error && (
        <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Success message for upload */}
      {!error && editedImageUrl && (
        <div className="text-green-600 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-medium">Tu imagen fue agregada a la librería de imágenes Expo360.</p>
        </div>
      )}

      {/* Credit upgrade message */}
      <CreditUpgradeMessage 
        credits={credits} 
        onUpgradeClick={() => {
          // TODO: Implement Stripe integration for credit purchases
          console.log('Open credit upgrade modal');
        }}
      />
      
      {(editedImageUrl || aiDescription) && (
        <motion.div 
          ref={resultsRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 bg-white p-6 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-4">Resultado de la Estandarización</h2>
          
          {aiDescription && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Descripción de los Cambios Aplicados:</h3>
              <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                {aiDescription}
              </p>
            </div>
          )}
          
          {editedImageUrl && (
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Imagen Estandarizada:</h3>
                <button
                  onClick={handleDownload}
                  className="group relative px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 flex items-center gap-1.5 hover:scale-105 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, #10B981, #059669, #047857)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <svg className="w-3.5 h-3.5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar
                  <div 
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0))',
                      pointerEvents: 'none',
                    }}
                  />
                </button>
              </div>
              <div className="w-full max-w-xl mx-auto border rounded-lg overflow-hidden">
                {/* Use Next.js Image component with proper base64 handling */}
                <div 
                  className="relative w-full aspect-[9/16] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={handleDownload}
                >
                  <Image 
                    src={editedImageUrl} 
                    alt="Standardized product image" 
                    fill
                    style={{ objectFit: 'contain' }}
                    className="rounded-lg"
                    unoptimized={true} // Required for base64 data URLs
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.log('Failed image src:', editedImageUrl?.substring(0, 100));
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Imagen profesional generada con las características solicitadas.
              </p>
            </div>
          )}
        </motion.div>
      )}

      {/* Credit Purchase Modal */}
      <CreditPurchaseModal
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
      />

      {/* LoaderOne for prompt enhancement - centered overlay */}
      {isEnhancingPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4">
            <LoaderOne />
            <p className="text-gray-800 text-sm font-medium">Mejorando prompt con IA...</p>
          </div>
        </div>
      )}

      {/* Initial loader (LoaderThree) - shows for 6.5 seconds */}
      {showInitialLoader && <LoaderThree />}

      {/* Multi-step loader for image standardization */}
      <MultiStepLoader
        loadingStates={imageStandardizationSteps}
        loading={isLoading && !error}
        duration={2000}
        loop={false}
      />

      {/* Image Spotlight Modal */}
      {showImageSpotlight && editedImageUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          {/* Click anywhere to close */}
          <div
            className="absolute inset-0"
            onClick={closeSpotlightAndShowResults}
          />
          
          {/* Image container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="relative z-10 max-w-5xl w-[75vw] max-h-[75vh] cursor-pointer"
            onClick={() => {
              handleDownload();
              closeSpotlightAndShowResults();
            }}
          >
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 rounded-lg opacity-30 blur-2xl" />
            
            {/* Image */}
            <div className="relative bg-white rounded-lg overflow-hidden shadow-2xl">
              <img
                src={editedImageUrl}
                alt="Generated Image"
                className="w-full h-full object-contain"
                style={{ maxHeight: '75vh' }}
              />
              
              {/* Download hint */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white text-center">
                <p className="text-lg font-medium">✨ ¡Tu imagen está lista! ✨</p>
                <p className="text-sm opacity-90 mt-1">Haz clic para descargar</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}