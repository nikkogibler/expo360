'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import { CreditDisplay, CreditUpgradeMessage } from './admin/CreditDisplay';
import { useCreditAwareProcessing } from '../hooks/useCredits';
import CreditPurchaseModal from './CreditPurchaseModal';

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<string>('');
  const [selectedFrame, setSelectedFrame] = useState<string>('');
  const [additionalPrompt, setAdditionalPrompt] = useState<string>('');
  const [selectedPerspective, setSelectedPerspective] = useState<string>('');
  const [editedImageUrl, setEditedImageUrl] = useState<string | null>(null);
  const [aiDescription, setAiDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [userId, setUserId] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Reference images state
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [maxReferenceImages] = useState<number>(5);
  const [isUploadingRef, setIsUploadingRef] = useState<boolean>(false);
  
  // Supabase options
  const [fabricOptions, setFabricOptions] = useState<GlobalProductOption[]>([]);
  const [frameOptions, setFrameOptions] = useState<GlobalProductOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState<boolean>(true);

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
      const parts = ['kusam_furniture'];
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
    return `kusam-furniture-${selectedFabric.toLowerCase().replace(/\s+/g, '-')}-${selectedFrame.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.png`;
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

  setIsLoading(true);
  setError(null);
  setEditedImageUrl(null);
  setAiDescription(null);
  console.log('[ImageStandardizer] Starting image processing...');

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

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
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
            onClick={() => setShowPurchaseModal(true)}
            className="transition-all duration-200 hover:scale-105"
          >
            <CreditDisplay size="compact" showIcon={true} />
          </button>
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            &times; Cerrar
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Subir Imagen de Producto</label>
        <div className="relative">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="hidden"
            id="image-upload"
          />
          <label 
            htmlFor="image-upload"
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
              
              const file = e.dataTransfer.files?.[0];
              if (!file) return;
              
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
          </label>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-gray-700 font-semibold">Color de Tela</label>
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
            onChange={(e) => setSelectedFabric(e.target.value)} 
            className="w-full border rounded py-2 px-3"
            style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
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
            onChange={(e) => setSelectedFrame(e.target.value)} 
            className="w-full border rounded py-2 px-3"
            style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
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
              onClick={handleClearAllReferences}
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
                  onClick={() => handleRemoveReferenceImage(refImg.id)}
                  className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>

              {/* Context Type Selector */}
              <select
                value={refImg.contextType}
                onChange={(e) => handleUpdateReferenceContext(refImg.id, e.target.value as ReferenceImage['contextType'])}
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
                onChange={(e) => handleAddReferenceImage(e.target.files)}
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
                    onClick={handleAddFabricReference}
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
                    onClick={handleAddStructureReference}
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

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Instrucciones Adicionales 
          <span className="text-gray-500 font-normal text-sm">(Opcional)</span>
        </label>
        <textarea
          value={additionalPrompt}
          onChange={(e) => setAdditionalPrompt(e.target.value)}
          placeholder="Describe cualquier modificación específica adicional que desees para la imagen..."
          className="w-full border rounded py-2 px-3 resize-y min-h-[80px]"
          style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">
          Ejemplo: &ldquo;Cambiar el ambiente de fondo a una terraza con vista al mar&rdquo; o &ldquo;Añadir plantas decorativas alrededor del mueble&rdquo;
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-3">
          Perspectiva de la Imagen 
          <span className="text-gray-500 font-normal text-sm">(Opcional)</span>
        </label>
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
              onClick={() => setSelectedPerspective(selectedPerspective === perspective.value ? '' : perspective.value)}
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
        <p className="text-xs text-gray-500 mt-2">
          Selecciona una perspectiva específica para la imagen generada. Puedes hacer clic nuevamente para deseleccionar.
        </p>
      </div>

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

      {error && (
        <div className="text-red-500 mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {/* Success message for upload */}
      {!error && editedImageUrl && (
        <div className="text-green-600 mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="font-medium">Tu imagen fue agregada a la librería de imágenes Kusam.</p>
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
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar Imagen
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
    </motion.div>
  );
}