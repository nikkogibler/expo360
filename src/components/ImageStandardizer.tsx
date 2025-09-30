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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        return;
      }
      
      // Fallback to cookie-based admin system
      const userEmail = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_email='))
        ?.split('=')[1];
      
      if (userEmail) {
        // Use email as user ID for admin users
        setUserId(userEmail);
      } else {
        // Generate a temporary session ID for demo purposes
        setUserId('admin-session-' + Date.now());
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

          // Set default selections
          if (fabrics.length > 0) setSelectedFabric(fabrics[0].name);
          if (frames.length > 0) setSelectedFrame(frames[0].name);
        }
      } catch (err) {
        console.error('Error in fetchOptions:', err);
      } finally {
        setOptionsLoading(false);
      }
    }

    fetchOptions();
  }, []);

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

  // Helper to generate consistent file name
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    console.log('[ImageStandardizer] handleSubmit called');
    if (!imageFile) {
      console.log('[ImageStandardizer] No image file selected');
      setError('Por favor, sube una imagen primero.');
      return;
    }

    // Pre-validation: Check file type and size BEFORE deducting credits
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes

    if (!allowedTypes.includes(imageFile.type.toLowerCase())) {
      setError('Solo se permiten archivos JPG y PNG. Por favor, convierte tu archivo HEIC a JPG o PNG.');
      return;
    }

    if (imageFile.size > maxSize) {
      setError('El archivo es demasiado grande. El tamaño máximo permitido es 2MB.');
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

    // Create image details for credit tracking
    const imageDetails = {
      filename: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
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
        const base64Image = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        setProcessingStatus('Enviando imagen para estandarización...');
        console.log('[ImageStandardizer] Sending image to /api/process-furniture');

        // Create modifications string from selected options
        let modifications = `Additionally, change the cushion fabric to ${selectedFabric || 'canvas beige'} and the frame material appearance to ${selectedFrame || 'the current material'}`;
        
        // Add perspective specification if selected
        if (selectedPerspective) {
          modifications += `. PERSPECTIVE: Show the furniture from a ${selectedPerspective}`;
        }
        
        // Add additional prompt if provided
        if (additionalPrompt.trim()) {
          modifications += `. USER ADDITIONAL INSTRUCTIONS: ${additionalPrompt.trim()}`;
        }

        const res = await fetch('/api/process-furniture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64Image,
            modifications: modifications,
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
              const fileName = getImageFileName();
              const blob = base64ToBlob(data.editedImageUrl);
              console.log('[ImageStandardizer] Uploading image to Supabase Storage:', fileName);
              const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, blob, {
                  cacheControl: '3600',
                  upsert: true,
                });
              if (uploadError) {
                console.error('[ImageStandardizer] Supabase upload error:', JSON.stringify(uploadError, null, 2));
                setError('La imagen fue generada pero no se pudo guardar en Supabase.');
              } else {
                console.log('[ImageStandardizer] Imagen subida exitosamente a Supabase Storage:', fileName);
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
      setError(result.error || 'Error procesando la imagen.');
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
          <h1 className="text-3xl font-bold"> Optimizador de Fotos Kusam </h1>
          <p className="text-sm text-gray-600 mt-1">AI-powered image optimization</p>
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
            className="w-full block border-2 border-dashed border-gray-300 hover:border-amber-400 rounded-lg py-4 px-6 cursor-pointer transition-colors duration-200 text-center"
            style={{ borderColor: '#4B2E09', color: '#4B2E09' }}
          >
            <div className="flex flex-col items-center gap-2">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <div>
                <span className="font-medium">
                  {imageFile ? imageFile.name : 'Seleccionar Archivo'}
                </span>
                {!imageFile && (
                  <>
                    <p className="text-sm text-gray-500 mt-1">
                      Ningún archivo seleccionado
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      Solo JPG y PNG, máximo 2MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Color de Tela</label>
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
        <label className="block text-gray-700 font-semibold mb-2">Material del Marco</label>
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
          <p className="font-medium">Tu imagen fué agregada a la libreria de imagenes Kusam.</p>
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
                Imagen estandarizada con formato 9:16, fondo blanco, iluminación profesional y especificaciones de Kusam
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