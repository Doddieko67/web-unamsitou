import React, { useState, useCallback, DragEvent, useMemo, memo, useEffect } from "react";
import { Viewer, Worker } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { Personalization } from "./Main/Personalization";
import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { TimerConf } from "./TimerConf";
import { url_backend } from "../url_backend";
import { DEFAULT_EXAM_CONFIG } from "../constants/examConstants";
import { AIConfiguration } from "./shared/AIConfiguration";
import { DEFAULT_MODEL } from "../constants/geminiModels";

// PDF functionality using @react-pdf-viewer/core - Modern implementation

// Tipo para la dificultad (puede ser null si quieres un estado inicial sin selección)
// type GeneralDifficulty = "mixed" | "easy" | "medium" | "hard";

export const ExamQuestions = memo(function ExamQuestions() {
  // --- Estados del Componente ---
  const navigate = useNavigate();
  const [pastedText, setPastedText] = useState<string>("");
  
  // Plugin de layout por defecto con configuración personalizada
  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    sidebarTabs: (defaultTabs) => [
      defaultTabs[0], // Thumbnails
      defaultTabs[1], // Bookmarks
    ],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const { session } = useAuthStore();
  const [hour, setHour] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_HOUR);
  const [minute, setMinute] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_MINUTE);
  const [second, setSecond] = useState<number>(DEFAULT_EXAM_CONFIG.TIMER_SECOND);

  // Estados para configuración de IA
  const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
  const [isApiValid, setIsApiValid] = useState<boolean>(false);
  
  // Estado para previsualización de archivos
  const [filePreviews, setFilePreviews] = useState<{[key: string]: string | null}>({});
  
  // Estado para progreso de carga
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  
  // Estados para modal de previsualización
  const [selectedPreview, setSelectedPreview] = useState<{file: File, type: 'image' | 'pdf'} | null>(null);
  const [imageLoadErrors, setImageLoadErrors] = useState<{[key: string]: boolean}>({});
  const [imageDimensions, setImageDimensions] = useState<{[key: string]: {width: number, height: number}}>({});
  
  // Estados para navegación entre archivos
  const [currentFileIndex, setCurrentFileIndex] = useState<number>(0);

  // --- Handlers ---
  const handleDeleteFile = (indexToDelete: number) => {
    const fileToDelete = files[indexToDelete];
    if (fileToDelete) {
      // Remover preview del archivo y limpiar Object URLs
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        const previewUrl = prev[fileToDelete.name];
        
        // Si es un Object URL (PDFs), liberarlo
        if (previewUrl && typeof previewUrl === 'string' && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
        
        // Remover todas las entradas relacionadas con este archivo
        Object.keys(prev).forEach(key => {
          if (key.startsWith(fileToDelete.name)) {
            delete newPreviews[key];
          }
        });
        
        return newPreviews;
      });
    }
    
    const updatedFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(updatedFiles);
  };

  // Función para generar previsualización de archivos
  const generatePreview = useCallback((file: File) => {
    if (file.type.startsWith('image/')) {
      // Calculate estimated tokens based on Gemini API documentation
      const estimateTokens = (width: number, height: number) => {
        // Based on Gemini API: ≤384px = 258 tokens, larger images are tiled
        const baseTokens = 258;
        if (width <= 384 && height <= 384) return baseTokens;
        
        // Calculate tiles for larger images (768x768 per tile)
        const tilesX = Math.ceil(width / 768);
        const tilesY = Math.ceil(height / 768);
        return tilesX * tilesY * baseTokens;
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const img = new Image();
          img.onload = () => {
            const estimatedTokens = estimateTokens(img.width, img.height);
            
            // Store image dimensions
            setImageDimensions(prev => ({
              ...prev,
              [file.name]: { width: img.width, height: img.height }
            }));
            
            setFilePreviews(prev => ({
              ...prev,
              [file.name]: e.target?.result as string,
              [`${file.name}_tokens`]: `~${estimatedTokens} tokens`,
              [`${file.name}_dimensions`]: `${img.width}×${img.height}px`
            }));
          };
          
          img.onerror = () => {
            setImageLoadErrors(prev => ({ ...prev, [file.name]: true }));
          };
          
          img.src = e.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'application/pdf') {
      // PDF preview usando @react-pdf-viewer/core
      const pdfUrl = URL.createObjectURL(file);
      
      setFilePreviews(prev => ({
        ...prev,
        [file.name]: pdfUrl,
        [`${file.name}_type`]: 'pdf'
      }));
      
      // Metadata del archivo
      const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
      const processingMode = file.size > 20 * 1024 * 1024 ? 'File API' : 'Inline';
      const lastModified = new Date(file.lastModified).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      setFilePreviews(prev => ({
        ...prev,
        [`${file.name}_metadata`]: `PDF • ${sizeInMB} MB • ${processingMode} • ${lastModified}`
      }));
    } else if (file.type.startsWith('text/') || file.type === 'text/plain' || file.type === 'text/markdown' || file.type === 'text/html') {
      // Para archivos de texto, leemos las primeras líneas
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const text = e.target.result as string;
          const firstLines = text.split('\n').slice(0, 3).join('\n');
          setFilePreviews(prev => ({
            ...prev,
            [file.name]: firstLines.length > 100 ? firstLines.substring(0, 100) + '...' : firstLines
          }));
        }
      };
      reader.readAsText(file);
    }
  }, []);

  // Función para obtener archivos con preview (imágenes y PDFs)
  const getPreviewableFiles = useMemo(() => {
    return files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
  }, [files]);

  // Función para navegar entre archivos
  const navigateToFile = useCallback((direction: 'prev' | 'next') => {
    if (!selectedPreview) return;
    
    const previewableFiles = getPreviewableFiles;
    const currentIndex = previewableFiles.findIndex(f => f.name === selectedPreview.file.name);
    
    if (currentIndex === -1) return;
    
    let newIndex;
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : previewableFiles.length - 1;
    } else {
      newIndex = currentIndex < previewableFiles.length - 1 ? currentIndex + 1 : 0;
    }
    
    const newFile = previewableFiles[newIndex];
    const newType = newFile.type.startsWith('image/') ? 'image' : 'pdf';
    
    // Si es un PDF, regenerar el Object URL para asegurar que se cargue correctamente
    if (newType === 'pdf') {
      // Limpiar el URL anterior si existe
      const oldPdfUrl = filePreviews[newFile.name];
      if (oldPdfUrl && typeof oldPdfUrl === 'string' && oldPdfUrl.startsWith('blob:')) {
        URL.revokeObjectURL(oldPdfUrl);
      }
      
      // Crear un nuevo Object URL
      const newPdfUrl = URL.createObjectURL(newFile);
      
      setFilePreviews(prev => ({
        ...prev,
        [newFile.name]: newPdfUrl,
        [`${newFile.name}_type`]: 'pdf'
      }));
    }
    
    setSelectedPreview({ file: newFile, type: newType as 'image' | 'pdf' });
    setCurrentFileIndex(newIndex);
  }, [selectedPreview, getPreviewableFiles, filePreviews]);

  // Función para abrir preview con navegación
  const openPreview = useCallback((file: File, type: 'image' | 'pdf') => {
    const previewableFiles = getPreviewableFiles;
    const fileIndex = previewableFiles.findIndex(f => f.name === file.name);
    
    // Si es un PDF, asegurar que tiene un Object URL válido
    if (type === 'pdf') {
      const existingPdfUrl = filePreviews[file.name];
      if (!existingPdfUrl || !existingPdfUrl.startsWith('blob:')) {
        // Crear un nuevo Object URL
        const newPdfUrl = URL.createObjectURL(file);
        
        setFilePreviews(prev => ({
          ...prev,
          [file.name]: newPdfUrl,
          [`${file.name}_type`]: 'pdf'
        }));
      }
    }
    
    setSelectedPreview({ file, type });
    setCurrentFileIndex(fileIndex);
  }, [getPreviewableFiles, filePreviews]);

  // Manejo de teclas para navegación
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!selectedPreview) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        navigateToFile('prev');
        break;
      case 'ArrowRight':
        event.preventDefault();
        navigateToFile('next');
        break;
      case 'Escape':
        event.preventDefault();
        setSelectedPreview(null);
        break;
    }
  }, [selectedPreview, navigateToFile]);

  // Agregar event listeners para navegación con teclado
  useEffect(() => {
    if (selectedPreview) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [selectedPreview, handleKeyDown]);

  // Cleanup effect for PDF Object URLs
  useEffect(() => {
    return () => {
      // Limpiar Object URLs de PDFs al desmontar
      Object.entries(filePreviews).forEach(([key]) => {
        if (key.includes('_type') && filePreviews[key] === 'pdf') {
          const fileName = key.replace('_type', '');
          const pdfUrl = filePreviews[fileName];
          if (pdfUrl && typeof pdfUrl === 'string' && pdfUrl.startsWith('blob:')) {
            URL.revokeObjectURL(pdfUrl);
          }
        }
      });
    };
  }, [filePreviews]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: FileList = event.target.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        
        // Check file limits based on Gemini API documentation  
        const currentFilesCount = prevFiles ? prevFiles.length : 0;
        const totalFiles = currentFilesCount + newFilesArray.length;
        
        // Check combined limits based on file types
        const currentImageCount = prevFiles ? prevFiles.filter(f => f.type.startsWith('image/')).length : 0;
        const newImageCount = newFilesArray.filter(f => f.type.startsWith('image/')).length;
        const totalImageCount = currentImageCount + newImageCount;
        
        // Gemini API supports up to 3,600 images per request, but we set reasonable limit
        if (totalImageCount > 50) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite de imágenes excedido',
            text: `Máximo 50 imágenes recomendado para evitar límites del contexto. Tienes ${currentImageCount} imágenes e intentas agregar ${newImageCount} más.`,
            confirmButtonColor: '#3085d6'
          });
          return prevFiles || [];
        }
        
        // General file limit for non-images
        if (totalFiles > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite de archivos excedido',
            text: `Máximo 20 archivos total recomendado. Tienes ${currentFilesCount} archivos e intentas agregar ${newFilesArray.length} más.`,
            confirmButtonColor: '#3085d6'
          });
          return prevFiles || [];
        }
        
        // Check file size and format based on Gemini API specifications
        const validFiles: File[] = [];
        for (const file of newFilesArray) {
          // Check file size according to Gemini API limits
          let maxSize = 50 * 1024 * 1024; // 50MB default (File API)
          let sizeMessage = '50MB';
          
          if (file.type === 'application/pdf') {
            // PDFs can be up to 50MB via File API, 20MB for inline
            maxSize = 50 * 1024 * 1024; // Using File API limit
            sizeMessage = '50MB';
          }
          
          if (file.size > maxSize) {
            Swal.fire({
              icon: 'warning',
              title: 'Archivo demasiado grande',
              text: `El archivo "${file.name}" excede el límite de ${sizeMessage} establecido por Gemini API`,
              confirmButtonColor: '#3085d6'
            });
            continue;
          }
          
          // Check file format - Based on official Gemini API documentation
          const allowedTypes = [
            'application/pdf',
            // Image formats supported by Gemini API
            'image/jpeg', 
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            // Text formats 
            'text/plain',
            'text/markdown',
            'text/html'
          ];
          
          if (!allowedTypes.includes(file.type)) {
            Swal.fire({
              icon: 'warning',
              title: 'Formato no soportado',
              text: `El archivo "${file.name}" no es compatible. Formatos soportados: PDF, imágenes (JPG, PNG, WEBP, HEIC, HEIF), texto (TXT, MD, HTML).`,
              confirmButtonColor: '#3085d6'
            });
            continue;
          }
          
          // Additional validation for images - check total inline size
          if (file.type.startsWith('image/')) {
            const currentTotalSize = prevFiles 
              ? prevFiles.reduce((total, f) => total + f.size, 0) 
              : 0;
            const newTotalSize = currentTotalSize + file.size;
            
            // Gemini API limit: 20MB total for inline images + text
            if (newTotalSize > 15 * 1024 * 1024) { // 15MB to leave space for text
              Swal.fire({
                icon: 'warning',
                title: 'Límite de tamaño total excedido',
                text: `El tamaño total de archivos inline no puede exceder 15MB (límite de Gemini API). Tamaño actual: ${(newTotalSize / 1024 / 1024).toFixed(1)}MB`,
                confirmButtonColor: '#3085d6'
              });
              continue;
            }
          }
          
          validFiles.push(file);
        }
        
        // Generar previsualización para archivos válidos
        validFiles.forEach(file => generatePreview(file));
        
        if (prevFiles) {
          return [...prevFiles, ...validFiles];
        } else {
          return validFiles;
        }
      });
    }
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* ... (sin cambios) ... */
    setPastedText(event.target.value);
  };

  // --- Handlers para Drag and Drop (sin cambios) ---
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);
  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles: FileList = event.dataTransfer.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        
        // Check file limits based on Gemini API documentation  
        const currentFilesCount = prevFiles ? prevFiles.length : 0;
        const totalFiles = currentFilesCount + newFilesArray.length;
        
        // Check combined limits based on file types
        const currentImageCount = prevFiles ? prevFiles.filter(f => f.type.startsWith('image/')).length : 0;
        const newImageCount = newFilesArray.filter(f => f.type.startsWith('image/')).length;
        const totalImageCount = currentImageCount + newImageCount;
        
        // Gemini API supports up to 3,600 images per request, but we set reasonable limit
        if (totalImageCount > 50) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite de imágenes excedido',
            text: `Máximo 50 imágenes recomendado para evitar límites del contexto. Tienes ${currentImageCount} imágenes e intentas agregar ${newImageCount} más.`,
            confirmButtonColor: '#3085d6'
          });
          return prevFiles || [];
        }
        
        // General file limit for non-images
        if (totalFiles > 20) {
          Swal.fire({
            icon: 'warning',
            title: 'Límite de archivos excedido',
            text: `Máximo 20 archivos total recomendado. Tienes ${currentFilesCount} archivos e intentas agregar ${newFilesArray.length} más.`,
            confirmButtonColor: '#3085d6'
          });
          return prevFiles || [];
        }
        
        // Check file size and format based on Gemini API specifications
        const validFiles: File[] = [];
        for (const file of newFilesArray) {
          // Check file size according to Gemini API limits
          let maxSize = 50 * 1024 * 1024; // 50MB default (File API)
          let sizeMessage = '50MB';
          
          if (file.type === 'application/pdf') {
            // PDFs can be up to 50MB via File API, 20MB for inline
            maxSize = 50 * 1024 * 1024; // Using File API limit
            sizeMessage = '50MB';
          }
          
          if (file.size > maxSize) {
            Swal.fire({
              icon: 'warning',
              title: 'Archivo demasiado grande',
              text: `El archivo "${file.name}" excede el límite de ${sizeMessage} establecido por Gemini API`,
              confirmButtonColor: '#3085d6'
            });
            continue;
          }
          
          // Check file format - Based on official Gemini API documentation
          const allowedTypes = [
            'application/pdf',
            // Image formats supported by Gemini API
            'image/jpeg', 
            'image/jpg', 
            'image/png',
            'image/webp',
            'image/heic',
            'image/heif',
            // Text formats 
            'text/plain',
            'text/markdown',
            'text/html'
          ];
          
          if (!allowedTypes.includes(file.type)) {
            Swal.fire({
              icon: 'warning',
              title: 'Formato no soportado',
              text: `El archivo "${file.name}" no es compatible. Formatos soportados: PDF, imágenes (JPG, PNG, WEBP, HEIC, HEIF), texto (TXT, MD, HTML).`,
              confirmButtonColor: '#3085d6'
            });
            continue;
          }
          
          // Additional validation for images - check total inline size
          if (file.type.startsWith('image/')) {
            const currentTotalSize = prevFiles 
              ? prevFiles.reduce((total, f) => total + f.size, 0) 
              : 0;
            const newTotalSize = currentTotalSize + file.size;
            
            // Gemini API limit: 20MB total for inline images + text
            if (newTotalSize > 15 * 1024 * 1024) { // 15MB to leave space for text
              Swal.fire({
                icon: 'warning',
                title: 'Límite de tamaño total excedido',
                text: `El tamaño total de archivos inline no puede exceder 15MB (límite de Gemini API). Tamaño actual: ${(newTotalSize / 1024 / 1024).toFixed(1)}MB`,
                confirmButtonColor: '#3085d6'
              });
              continue;
            }
          }
          
          validFiles.push(file);
        }
        
        // Generar previsualización para archivos válidos
        validFiles.forEach(file => generatePreview(file));
        
        if (prevFiles) {
          return [...prevFiles, ...validFiles];
        } else {
          return validFiles;
        }
      });
      // Archivos soltados procesados
    }
  }, [generatePreview]);

  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  const handleApiValidChange = useCallback((isValid: boolean) => {
    setIsApiValid(isValid);
  }, []);

  // --- Handler para el botón de Generar (Actualizado) ---
  const handleGenerate = async () => {
    if (files.length == 0 && !pastedText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Contenido Incompleto",
        text: "Por favor, selecciona archivos o pega texto para generar el examen.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (!isApiValid) {
      Swal.fire({
        icon: "warning",
        title: "API Key Requerida",
        text: "Por favor, configura una API key válida de Google.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    setIsLoading(true);
    setUploadStatus('uploading');
    setUploadProgress(0);

    let requestBody: FormData | null = null;

    let promptText = ``;
    if (pastedText && pastedText.trim() !== "") {
      promptText += `Contenido: ${pastedText}.\n`;
    }
    if (fineTuning && fineTuning.trim() !== "") {
      promptText += `Instrucciones adicionales: ${fineTuning.trim()}.\n`;
    }

    if (files.length > 0) {
      // Preparando FormData para archivos
      const formData = new FormData();
      
      // Simular progreso de preparación
      setUploadProgress(20);
      
      for (let i = 0; i < files.length; i++) {
        formData.append("fuentes", files[i]);
        // Simular progreso incremental
        setUploadProgress(20 + (i + 1) * (30 / files.length));
      }

      formData.append("prompt", promptText);
      formData.append(
        "tiempo_limite_segundos",
        (hour * 3600 + minute * 60 + second).toString(),
      );
      formData.append("model", selectedModel);
      requestBody = formData;
      // FormData preparado
      
      setUploadProgress(50);
      setUploadStatus('processing');
    }
    // Preparando JSON para texto

    try {
      // Simular progreso de envío
      setUploadProgress(60);
      
      const response = await fetch(`${url_backend}/api/upload_files`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${session?.access_token}`,
        },
        body: requestBody,
      });

      // Simular progreso de procesamiento
      setUploadProgress(80);

      if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          // Error procesando respuesta JSON
          Swal.fire({
            icon: "error",
            title: "Error del servidor interno",
          });
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      // Respuesta de generación desde contenido procesada

      // Completar progreso
      setUploadProgress(100);
      setUploadStatus('completed');

      if (!result.examId) {
        setUploadStatus('error');
        Swal.fire({
          icon: "error",
          title: "La respuesta del servidor no contenia un ID de examen valido",
        });
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      // Examen generado exitosamente

      // --- NAVEGACIÓN CON ID ---
      navigate(`/examen/${result.examId}`); // Navega a la ruta con el ID del examen
    } catch (error) {
      // Error al generar desde contenido
      setUploadStatus('error');
      setUploadProgress(0);
      Swal.fire({
        icon: 'error',
        title: 'Error al generar examen',
        text: `Error: ${error}`,
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress(0);
      }, 2000);
    }
  };

  type FileTypeIcons = {
    [key: string]: string; // string key and string value
  };

  const fileTypeIcons: FileTypeIcons = {
    "application/pdf": "fa-file-pdf bg-red-100 text-red-600",
    "image/jpeg": "fa-image bg-blue-100 text-blue-600",
    "image/jpg": "fa-image bg-blue-100 text-blue-600", 
    "image/png": "fa-image bg-green-100 text-green-600",
    "image/webp": "fa-image bg-purple-100 text-purple-600",
    "image/heic": "fa-image bg-orange-100 text-orange-600",
    "image/heif": "fa-image bg-orange-100 text-orange-600",
    "text/plain": "fa-file-alt bg-gray-100 text-gray-600",
    "text/markdown": "fa-file-code bg-purple-100 text-purple-600",
    "text/html": "fa-file-code bg-orange-100 text-orange-600",
  };

  // Function to determine the appropriate icon class based on file type
  function getFileIconClass(fileType: string): string {
    // Check exact matches first
    if (fileTypeIcons[fileType]) {
      return fileTypeIcons[fileType];
    }
    
    // Check pattern matches
    for (const typePattern in fileTypeIcons) {
      if (fileType.startsWith(typePattern)) {
        return fileTypeIcons[typePattern];
      }
    }
    
    // Default icon if no match is found:
    return "fa-file bg-gray-200 text-gray-600";
  }

  // Determina si el botón de generar debe estar deshabilitado (memoizado)
  const isGenerateDisabled = useMemo(() => 
    (files.length == 0 && !pastedText.trim()) ||
    !isApiValid ||
    isLoading,
    [files.length, pastedText, isApiValid, isLoading]
  );

  return (
    <div id="upload-exam-section" className="exam-config-grid">
      {/* Header Grid Area */}
      <div className="grid-header">
        <div 
          className="exam-header-card"
          style={{
            background: 'linear-gradient(135deg, var(--theme-bg-primary) 0%, var(--theme-bg-accent) 50%, var(--theme-bg-primary) 100%)',
            borderColor: 'var(--theme-border-primary)'
          }}
        >
          <div className="header-content">
            <div 
              className="header-icon"
              style={{ backgroundColor: 'var(--secondary)' }}
            >
              <i className="fas fa-file-upload text-2xl text-white"></i>
            </div>
            <div className="header-text">
              <h1 
                className="header-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                Subir y Procesar Contenido
              </h1>
              <p 
                className="header-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Genera exámenes desde archivos PDF, imágenes o texto
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* File Upload Grid Area - Spans full width */}
      <div className="grid-personalization">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-success-light)' }}
            >
              <i 
                className="fas fa-cloud-upload-alt text-lg"
                style={{ color: 'var(--theme-success)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📁 Agregar Contenido de Estudio
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Elige una opción o combina ambas según prefieras
              </p>
            </div>
          </div>
          
          <div className="card-content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
              {/* File Upload Section - Fusionado */}
              <div className="space-y-4 flex flex-col">
                <h4 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  Subir Archivos {files.length > 0 && `(${files.length})`}
                </h4>
                
                {/* Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    isDraggingOver ? "animate-pulse" : ""
                  }`}
                  style={{
                    borderColor: isDraggingOver ? 'var(--primary)' : 'var(--theme-border-secondary)',
                    backgroundColor: isDraggingOver ? 'var(--theme-info-light)' : 'var(--theme-bg-secondary)'
                  }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex justify-center mb-4">
                    <i
                      className={`fas fa-file-upload text-3xl transition-all duration-300 ${
                        isDraggingOver ? "animate-bounce" : ""
                      }`}
                      style={{ 
                        color: isDraggingOver ? 'var(--primary)' : 'var(--theme-text-secondary)' 
                      }}
                    ></i>
                  </div>
                  <h5 
                    className="text-base font-medium mb-2"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    Arrastra archivos aquí
                  </h5>
                  <div className="flex items-center justify-center space-x-4">
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'var(--theme-gradient-purple)',
                        color: 'white',
                        boxShadow: 'var(--theme-shadow-sm)'
                      }}
                    >
                      <i className="fas fa-folder-open"></i>
                      <span>Seleccionar archivos</span>
                    </label>
                    {files.length > 0 && (
                      <button
                        onClick={() => setFiles([])}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                        style={{
                          backgroundColor: 'var(--theme-error-light)',
                          color: 'var(--theme-error-dark)',
                          border: `1px solid var(--theme-error)`
                        }}
                      >
                        <i className="fas fa-trash"></i>
                        <span>Limpiar todo</span>
                      </button>
                    )}
                  </div>
                  <input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                  />
                </div>

                {/* Files List - Integrado directamente */}
                {files && files.length > 0 && (
                  <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                    {Array.from(files).map((file, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          backgroundColor: 'var(--theme-bg-tertiary)',
                          borderColor: 'var(--theme-border-primary)'
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3 flex-1">
                            <div 
                              className={`w-8 h-8 rounded-lg flex items-center justify-center ${getFileIconClass(file.type)}`}
                            >
                              <i className="fas fa-file text-xs"></i>
                            </div>
                            <div className="flex-1">
                              <p 
                                className="font-medium text-sm"
                                style={{ color: 'var(--theme-text-primary)' }}
                              >
                                {file.name}
                              </p>
                              <p 
                                className="text-xs"
                                style={{ color: 'var(--theme-text-secondary)' }}
                              >
                                {(file.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteFile(index)}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                            style={{
                              backgroundColor: 'var(--theme-error-light)',
                              color: 'var(--theme-error-dark)'
                            }}
                          >
                            <i className="fas fa-times text-xs"></i>
                          </button>
                        </div>
                        
                        {/* Previsualización del archivo */}
                        {filePreviews[file.name] && (
                          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--theme-border-primary)' }}>
                            {file.type.startsWith('image/') ? (
                              <div>
                                <div className="relative group">
                                  {imageLoadErrors[file.name] ? (
                                    <div 
                                      className="w-full h-16 flex items-center justify-center rounded-lg border-2 border-dashed"
                                      style={{ 
                                        borderColor: 'var(--theme-error)',
                                        backgroundColor: 'var(--theme-error-light)'
                                      }}
                                    >
                                      <div className="text-center">
                                        <i className="fas fa-exclamation-triangle text-sm mb-1" style={{ color: 'var(--theme-error)' }}></i>
                                        <p className="text-xs" style={{ color: 'var(--theme-error-dark)' }}>Error al cargar</p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <img 
                                        src={filePreviews[file.name] || ''} 
                                        alt={file.name}
                                        className="max-w-full h-16 object-cover rounded-lg mb-2 cursor-pointer transition-all duration-300 hover:shadow-lg"
                                        style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                                        onClick={() => openPreview(file, 'image')}
                                      />
                                      <div 
                                        className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                        onClick={() => openPreview(file, 'image')}
                                      >
                                        <i className="fas fa-search-plus text-white text-sm"></i>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="space-y-1">
                                  {filePreviews[`${file.name}_dimensions`] && (
                                    <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                                      📐 {filePreviews[`${file.name}_dimensions`]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : file.type === 'application/pdf' ? (
                              <div>
                                <div className="relative group">
                                  <div 
                                    className="w-full h-16 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 hover:shadow-lg"
                                    style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
                                    onClick={() => setSelectedPreview({file, type: 'pdf'})}
                                  >
                                    <div className="text-center">
                                      <i className="fas fa-file-pdf text-lg mb-1 text-red-500"></i>
                                      <p className="text-xs font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                                        Click para ver
                                      </p>
                                    </div>
                                  </div>
                                  <div 
                                    className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-lg transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                                    onClick={() => setSelectedPreview({file, type: 'pdf'})}
                                  >
                                    <i className="fas fa-eye text-white text-sm"></i>
                                  </div>
                                </div>
                                
                                {filePreviews[`${file.name}_metadata`] && (
                                  <p className="text-xs mt-2" style={{ color: 'var(--theme-text-secondary)' }}>
                                    {filePreviews[`${file.name}_metadata`]}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div 
                                className="text-xs p-2 rounded-lg"
                                style={{ 
                                  backgroundColor: 'var(--theme-bg-secondary)',
                                  color: 'var(--theme-text-secondary)'
                                }}
                              >
                                <div className="font-mono whitespace-pre-wrap">
                                  {filePreviews[file.name]}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Text Input Section */}
              <div className="flex flex-col space-y-4 h-full">
                <h4 className="font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  Pegar Texto Directamente
                </h4>
                <div className="flex-1 flex flex-col">
                  <textarea
                    className="w-full h-full px-4 py-3 rounded-xl border-2 transition-all duration-300 resize-none"
                    style={{
                      backgroundColor: 'var(--theme-bg-secondary)',
                      borderColor: pastedText.trim() ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                      color: 'var(--theme-text-primary)',
                      minHeight: '200px'
                    }}
                    placeholder="Pega aquí el contenido del material de estudio, libros, artículos, notas de clase..."
                    value={pastedText}
                    onChange={handleTextChange}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
                  Puedes pegar texto desde PDFs, artículos web, documentos de Word, etc.
                </p>
              </div>
            </div>
            
            {/* Límites y Validaciones Section */}
            <div 
              className="mt-6 p-4 rounded-xl border"
              style={{
                backgroundColor: 'var(--theme-warning-light)',
                borderColor: 'var(--theme-warning)'
              }}
            >
              <div className="flex items-center justify-center space-x-3 mb-3">
                <i 
                  className="fas fa-exclamation-triangle text-xl"
                  style={{ color: 'var(--theme-warning-dark)' }}
                ></i>
                <h5 
                  className="font-medium"
                  style={{ color: 'var(--theme-warning-dark)' }}
                >
                  Límites y Validaciones:
                </h5>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="flex items-center space-x-2"
                    style={{ color: 'var(--theme-warning-dark)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--theme-warning-dark)' }}
                    ></div>
                    <div className="text-sm">
                      <strong>Archivos:</strong> Máximo 20 archivos, 50 imágenes
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center space-x-2"
                    style={{ color: 'var(--theme-warning-dark)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--theme-warning-dark)' }}
                    ></div>
                    <div className="text-sm">
                      <strong>Tamaño:</strong> 50MB por archivo, 15MB total inline
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className="flex items-center space-x-2"
                    style={{ color: 'var(--theme-warning-dark)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--theme-warning-dark)' }}
                    ></div>
                    <div className="text-sm">
                      <strong>Formatos:</strong> PDF, JPG, PNG, WEBP, HEIC, HEIF, TXT, MD, HTML
                    </div>
                  </div>
                  
                  <div 
                    className="flex items-center space-x-2"
                    style={{ color: 'var(--theme-warning-dark)' }}
                  >
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: 'var(--theme-warning-dark)' }}
                    ></div>
                    <div className="text-sm">
                      <strong>PDFs:</strong> Máximo 1,000 páginas, orientación correcta
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Timer Grid Area */}
      <div className="grid-timer">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-error-light)' }}
            >
              <i 
                className="fas fa-clock text-lg"
                style={{ color: 'var(--theme-error)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                ⏱️ Tiempo
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Duración límite del examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <TimerConf
              hour={hour}
              setHour={setHour}
              minute={minute}
              setMinute={setMinute}
              second={second}
              setSecond={setSecond}
            />
          </div>
        </div>
      </div>

      {/* Instructions Grid Area */}
      <div className="grid-questions">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-warning-light)' }}
            >
              <i 
                className="fas fa-edit text-lg"
                style={{ color: 'var(--theme-warning)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                📝 Instrucciones
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Personaliza el enfoque del examen
              </p>
            </div>
          </div>
          <div className="card-content">
            <Personalization
              fineTuning={fineTuning}
              onFineTuningChange={handleFineTuningChange}
            />
          </div>
        </div>
      </div>

      {/* AI Configuration Grid Area */}
      <div className="grid-ai-config">
        <div 
          className="config-card"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            borderColor: 'var(--theme-border-primary)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="card-header">
            <div 
              className="card-icon"
              style={{ backgroundColor: 'var(--theme-info-light)' }}
            >
              <i 
                className="fas fa-robot text-lg"
                style={{ color: 'var(--theme-info)' }}
              ></i>
            </div>
            <div className="card-header-text">
              <h3 
                className="card-title"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                🤖 Configuración de IA
              </h3>
              <p 
                className="card-subtitle"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Modelo y API de Gemini
              </p>
            </div>
          </div>
          
          <div className="card-content">
            <AIConfiguration
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              isApiValid={isApiValid}
              onApiValidChange={handleApiValidChange}
            />
          </div>
        </div>
      </div>

      {/* Generate Button Grid Area */}
      <div className="grid-generate">
        <div className="flex items-center justify-center h-full">
          <div 
            className="w-full max-w-md mx-auto"
            style={{
              padding: '2rem',
              borderRadius: '1.5rem',
              border: '2px dashed',
              borderColor: isGenerateDisabled ? 'var(--theme-border-primary)' : 'var(--primary)',
              backgroundColor: isGenerateDisabled ? 'var(--theme-bg-secondary)' : 'var(--theme-bg-primary)',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? (
              <div className="space-y-4 text-center">
                <div 
                  className="inline-flex items-center space-x-3 px-6 py-4 rounded-2xl border-2"
                  style={{
                    backgroundColor: 'var(--theme-info-light)',
                    borderColor: 'var(--theme-info)',
                    color: 'var(--theme-info-dark)'
                  }}
                >
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-semibold">
                    {uploadStatus === 'uploading' && 'Subiendo archivos...'}
                    {uploadStatus === 'processing' && 'Procesando contenido...'}
                    {uploadStatus === 'completed' && 'Generando examen...'}
                  </span>
                </div>
                
                {/* Barra de progreso */}
                <div className="w-full max-w-md mx-auto">
                  <div 
                    className="w-full bg-gray-200 rounded-full h-2 mb-2"
                    style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
                  >
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${uploadProgress}%`,
                        backgroundColor: 'var(--theme-success)' 
                      }}
                    />
                  </div>
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {uploadProgress}% completado
                  </p>
                </div>
                
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Analizando archivos con IA
                </p>
              </div>
            ) : (
              <div className="space-y-6 text-center">
                {/* Configuration Summary */}
                <div className="space-y-4">
                  <h4 
                    className="text-lg font-bold"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    📊 Resumen de Configuración
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: (files.length > 0 || pastedText.trim()) ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {(files.length > 0 || pastedText.trim()) ? '✓' : '✗'}
                      </div>
                      <div className="text-xs opacity-80">Contenido</div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: isApiValid ? 'var(--theme-success-light)' : 'var(--theme-bg-secondary)',
                        borderColor: isApiValid ? 'var(--theme-success)' : 'var(--theme-border-primary)',
                        color: isApiValid ? 'var(--theme-success-dark)' : 'var(--theme-text-secondary)'
                      }}
                    >
                      <div className="text-lg font-bold">
                        {isApiValid ? '✓' : '✗'}
                      </div>
                      <div className="text-xs opacity-80">API</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-info-light)',
                        borderColor: 'var(--theme-info)',
                        color: 'var(--theme-info-dark)'
                      }}
                    >
                      <div className="text-lg font-bold">{files.length}</div>
                      <div className="text-xs opacity-80">Archivos</div>
                    </div>
                    
                    <div 
                      className="p-3 rounded-xl border text-center transition-all duration-300"
                      style={{
                        backgroundColor: 'var(--theme-error-light)',
                        borderColor: 'var(--theme-error)',
                        color: 'var(--theme-error-dark)'
                      }}
                    >
                      <div className="text-xs font-bold">
                        {hour > 0 ? `${hour}h` : ''} {minute > 0 ? `${minute}m` : ''} {second > 0 ? `${second}s` : ''}
                      </div>
                      <div className="text-xs opacity-80">Tiempo</div>
                    </div>
                  </div>
                </div>
                
                {/* Generate Button */}
                <div className="space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerateDisabled}
                    className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 ${
                      isGenerateDisabled ? 'cursor-not-allowed' : 'hover:scale-105 hover:shadow-lg'
                    }`}
                    style={{
                      backgroundColor: isGenerateDisabled ? 'var(--theme-text-tertiary)' : 'var(--secondary)',
                      color: 'white',
                      opacity: isGenerateDisabled ? 0.5 : 1,
                      boxShadow: isGenerateDisabled ? 'none' : 'var(--theme-shadow-lg)'
                    }}
                  >
                    <i className="fas fa-file-upload text-xl"></i>
                    <span>Procesar y Generar</span>
                  </button>
                  
                  {isGenerateDisabled && (
                    <p 
                      className="text-xs opacity-80"
                      style={{ color: 'var(--theme-text-secondary)' }}
                    >
                      Añade contenido y configura la API key
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Previsualización */}
      {selectedPreview && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPreview(null)}
        >
          <div 
            className="max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden shadow-2xl"
            style={{ backgroundColor: 'var(--theme-bg-primary)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div 
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: 'var(--theme-border-primary)' }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${getFileIconClass(selectedPreview.file.type)}`}
                >
                  <i className={`fas ${selectedPreview.type === 'pdf' ? 'fa-file-pdf' : 'fa-image'} text-sm`}></i>
                </div>
                <div>
                  <h3 
                    className="font-semibold text-lg"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    {selectedPreview.file.name}
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    {(selectedPreview.file.size / 1024 / 1024).toFixed(2)} MB
                    {selectedPreview.type === 'image' && imageDimensions[selectedPreview.file.name] && 
                      ` • ${imageDimensions[selectedPreview.file.name].width}×${imageDimensions[selectedPreview.file.name].height}px`
                    }
                  </p>
                </div>
              </div>
              
              {/* Navegación y botón de cerrar */}
              <div className="flex items-center space-x-2">
                {/* Botones de navegación si hay más de un archivo */}
                {getPreviewableFiles.length > 1 && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => navigateToFile('prev')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: 'var(--theme-bg-secondary)',
                        color: 'var(--theme-text-primary)'
                      }}
                      title="Archivo anterior"
                    >
                      <i className="fas fa-chevron-left text-xs"></i>
                    </button>
                    <span 
                      className="text-xs px-2 py-1 rounded"
                      style={{ 
                        backgroundColor: 'var(--theme-bg-tertiary)',
                        color: 'var(--theme-text-secondary)'
                      }}
                    >
                      {currentFileIndex + 1} / {getPreviewableFiles.length}
                    </span>
                    <button
                      onClick={() => navigateToFile('next')}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                      style={{
                        backgroundColor: 'var(--theme-bg-secondary)',
                        color: 'var(--theme-text-primary)'
                      }}
                      title="Archivo siguiente"
                    >
                      <i className="fas fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedPreview(null)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{
                    backgroundColor: 'var(--theme-error-light)',
                    color: 'var(--theme-error-dark)'
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-4 max-h-[70vh] overflow-auto">
              {selectedPreview.type === 'image' ? (
                <div className="text-center">
                  <img 
                    src={filePreviews[selectedPreview.file.name] || ''} 
                    alt={selectedPreview.file.name}
                    className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow-lg"
                    style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
                  />
                  
                  {/* Información de la imagen */}
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Dimensiones</p>
                        <p style={{ color: 'var(--theme-text-secondary)' }}>
                          {filePreviews[`${selectedPreview.file.name}_dimensions`] || 'Calculando...'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Formato</p>
                        <p style={{ color: 'var(--theme-text-secondary)' }}>
                          {selectedPreview.file.type.split('/')[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : selectedPreview.type === 'pdf' ? (
                <div className="text-center">
                  {/* PDF Preview usando @react-pdf-viewer/core */}
                  <div className="w-full max-w-4xl mx-auto">
                    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                      <div 
                        className="pdf-viewer-container"
                        style={{ 
                          height: '600px',
                          border: '1px solid var(--theme-border-primary)',
                          borderRadius: '12px',
                          backgroundColor: 'var(--theme-bg-primary)',
                          overflow: 'hidden'
                        }}
                      >
                        <Viewer
                          key={selectedPreview.file.name}
                          fileUrl={filePreviews[selectedPreview.file.name] || ''}
                          plugins={[defaultLayoutPluginInstance]}
                          theme={{
                            theme: document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
                          }}
                        />
                      </div>
                    </Worker>
                  </div>
                  
                  {/* Información del PDF */}
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'var(--theme-bg-secondary)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Formato</p>
                        <p style={{ color: 'var(--theme-text-secondary)' }}>
                          Documento PDF
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Tamaño</p>
                        <p style={{ color: 'var(--theme-text-secondary)' }}>
                          {(selectedPreview.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>Procesamiento</p>
                        <p style={{ color: selectedPreview.file.size > 20 * 1024 * 1024 ? 'var(--theme-warning-dark)' : 'var(--theme-success-dark)' }}>
                          {selectedPreview.file.size > 20 * 1024 * 1024 ? 'File API' : 'Inline'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  {/* Fallback para otros tipos de archivo */}
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <i 
                        className="fas fa-file text-6xl mb-4" 
                        style={{ color: 'var(--theme-text-secondary)' }}
                      ></i>
                      <p 
                        className="text-lg font-medium mb-2"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        Vista previa no disponible
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: 'var(--theme-text-secondary)' }}
                      >
                        Tipo de archivo: {selectedPreview.file.type}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Navegación inferior con thumbnails */}
            {getPreviewableFiles.length > 1 && (
              <div 
                className="border-t p-4"
                style={{ borderColor: 'var(--theme-border-primary)' }}
              >
                <div className="flex items-center justify-center space-x-2 overflow-x-auto">
                  {getPreviewableFiles.map((file, index) => (
                    <button
                      key={file.name}
                      onClick={() => {
                        const type = file.type.startsWith('image/') ? 'image' : 'pdf';
                        
                        // Si es un PDF, regenerar el Object URL para asegurar que se cargue correctamente
                        if (type === 'pdf') {
                          // Limpiar el URL anterior si existe
                          const oldPdfUrl = filePreviews[file.name];
                          if (oldPdfUrl && typeof oldPdfUrl === 'string' && oldPdfUrl.startsWith('blob:')) {
                            URL.revokeObjectURL(oldPdfUrl);
                          }
                          
                          // Crear un nuevo Object URL
                          const newPdfUrl = URL.createObjectURL(file);
                          
                          setFilePreviews(prev => ({
                            ...prev,
                            [file.name]: newPdfUrl,
                            [`${file.name}_type`]: 'pdf'
                          }));
                        }
                        
                        setSelectedPreview({ file, type });
                        setCurrentFileIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                        currentFileIndex === index ? 'ring-2 ring-offset-2' : ''
                      }`}
                      style={{
                        borderColor: currentFileIndex === index ? 'var(--primary)' : 'var(--theme-border-primary)',
                        backgroundColor: 'var(--theme-bg-secondary)'
                      } as React.CSSProperties}
                      title={file.name}
                    >
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={filePreviews[file.name] || ''} 
                          alt={file.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="fas fa-file-pdf text-red-500 text-lg"></i>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2">
                  <p 
                    className="text-xs"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Usa ← → para navegar • Esc para cerrar
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
