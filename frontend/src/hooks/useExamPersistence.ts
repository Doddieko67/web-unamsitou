import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { supabase } from '../supabase.config';
import { debounce } from '../utils/debounce';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'offline';

export interface PersistenceState {
  syncStatus: SyncStatus;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
}

export interface PersistenceActions {
  saveProgress: (force?: boolean) => Promise<void>;
  saveToLocal: () => void;
  clearLocalState: () => void;
}

export interface UseExamPersistenceReturn extends PersistenceState, PersistenceActions {}

export interface ExamProgressData {
  tiempo_tomado_segundos?: number;
  respuestas_usuario?: { [key: number]: number };
  questions_pinned?: { [key: number]: boolean };
  currentQuestionIndex?: number;
  timeLeft?: number;
  isSubmitted?: boolean;
}

/**
 * Custom hook for exam persistence and auto-save functionality
 * Implements smart change detection and optimized sync
 */
export const useExamPersistence = (
  examId: string,
  examData: ExamProgressData,
  userId?: string
): UseExamPersistenceReturn => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track last saved state for change detection
  const lastSavedStateRef = useRef<string>('');
  const lastSyncTimeRef = useRef<Date | null>(null);

  // Save to localStorage
  const saveToLocal = useCallback(() => {
    if (!examId) return;

    try {
      const stateToSave = {
        ...examData,
        ultimaActualizacion: new Date().toISOString(),
      };

      localStorage.setItem(
        `examen_estado_${examId}`,
        JSON.stringify(stateToSave)
      );

      console.log('Estado guardado en localStorage');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [examId, examData]);

  // Save to Supabase
  const saveToSupabase = useCallback(async (data: ExamProgressData) => {
    if (!examId || !userId) {
      throw new Error('Missing examId or userId');
    }

    const { error } = await supabase
      .from('examenes')
      .update(data)
      .eq('id', examId)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }, [examId, userId]);

  // Smart save with change detection
  const saveProgress = useCallback(async (force = false) => {
    if (!examId) return;

    // Prepare data for saving
    const dataToSave: ExamProgressData = {
      tiempo_tomado_segundos: examData.tiempo_tomado_segundos,
      respuestas_usuario: examData.respuestas_usuario,
      questions_pinned: examData.questions_pinned,
    };

    // Check for changes
    const currentStateString = JSON.stringify(dataToSave);
    const hasChanges = currentStateString !== lastSavedStateRef.current;

    if (!hasChanges && !force) {
      console.log('📋 No hay cambios desde el último guardado, saltando sync...');
      return;
    }

    // Always save to localStorage
    saveToLocal();

    // Only sync to Supabase if online and has changes
    if (!navigator.onLine) {
      setSyncStatus('offline');
      setHasUnsavedChanges(true);
      console.log('Offline: Estado guardado localmente');
      return;
    }

    setSyncStatus('syncing');
    setHasUnsavedChanges(false);

    try {
      await saveToSupabase(dataToSave);
      
      setSyncStatus('success');
      setLastSaved(new Date());
      lastSavedStateRef.current = currentStateString;
      lastSyncTimeRef.current = new Date();
      
      console.log('✅ Auto-save Supabase success');
    } catch (error) {
      console.error('Error en auto-save:', error);
      setSyncStatus('error');
      setHasUnsavedChanges(true);
    }
  }, [examId, examData, saveToLocal, saveToSupabase]);

  // Debounced auto-save (30 seconds)
  const debouncedSave = useMemo(
    () => debounce(saveProgress, 30000),
    [saveProgress]
  );

  // Clear local state
  const clearLocalState = useCallback(() => {
    if (!examId) return;
    
    localStorage.removeItem(`examen_estado_${examId}`);
    localStorage.removeItem(`examen_final_pending_${examId}`);
  }, [examId]);

  // Auto-save when data changes
  useEffect(() => {
    const currentStateString = JSON.stringify(examData);
    const hasChanges = currentStateString !== lastSavedStateRef.current;

    if (hasChanges) {
      setHasUnsavedChanges(true);
      debouncedSave();
    }
  }, [examData, debouncedSave]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveToLocal();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [saveToLocal]);

  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network status: Online');
      setSyncStatus('idle');
      
      // Try to sync pending changes
      if (hasUnsavedChanges) {
        saveProgress(true);
      }
    };

    const handleOffline = () => {
      console.log('Network status: Offline');
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial status
    if (!navigator.onLine) {
      setSyncStatus('offline');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasUnsavedChanges, saveProgress]);

  return {
    syncStatus,
    lastSaved,
    hasUnsavedChanges,
    saveProgress,
    saveToLocal,
    clearLocalState,
  };
};