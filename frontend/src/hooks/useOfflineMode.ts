import { useState, useEffect, useCallback } from 'react';

export interface OfflineState {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  pendingSyncCount: number;
  lastSyncAttempt: Date | null;
}

export interface OfflineActions {
  forceSyncPendingData: () => Promise<void>;
  queueForSync: (data: any, key: string) => void;
  clearPendingSync: (key: string) => void;
  getPendingSyncData: () => Record<string, any>;
}

export interface UseOfflineModeReturn extends OfflineState, OfflineActions {}

/**
 * Custom hook for offline mode management
 * Handles service worker registration, online/offline detection, and data sync
 */
export const useOfflineMode = (): UseOfflineModeReturn => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    isServiceWorkerReady: false,
    pendingSyncCount: 0,
    lastSyncAttempt: null,
  });

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Back online');
      setState(prev => ({ ...prev, isOnline: true }));
      // Trigger sync when back online
      if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
        navigator.serviceWorker.ready.then(registration => {
          // @ts-ignore - Background Sync API may not be fully typed
          if ('sync' in registration) {
            // @ts-ignore
            return registration.sync.register('exam-sync');
          }
        }).catch(error => {
          console.error('❌ Background sync registration failed:', error);
        });
      }
    };

    const handleOffline = () => {
      console.log('🔌 Gone offline');
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen for service worker messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_EXAM_DATA') {
        console.log('🔄 Received sync request from service worker');
        forceSyncPendingData();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, []);

  // Update pending sync count
  useEffect(() => {
    const updatePendingCount = () => {
      const pendingData = getPendingSyncData();
      const count = Object.keys(pendingData).length;
      setState(prev => ({ ...prev, pendingSyncCount: count }));
    };

    updatePendingCount();
    
    // Update count every 5 seconds
    const interval = setInterval(updatePendingCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const registerServiceWorker = async () => {
    try {
      console.log('📦 Registering service worker...');
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      registration.addEventListener('updatefound', () => {
        console.log('🔄 Service worker update found');
      });

      await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');
      
      setState(prev => ({ ...prev, isServiceWorkerReady: true }));
    } catch (error) {
      console.error('❌ Service worker registration failed:', error);
    }
  };

  const queueForSync = useCallback((data: any, key: string) => {
    try {
      const existingQueue = JSON.parse(localStorage.getItem('offline_sync_queue') || '{}');
      existingQueue[key] = {
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };
      localStorage.setItem('offline_sync_queue', JSON.stringify(existingQueue));
      
      setState(prev => ({ 
        ...prev, 
        pendingSyncCount: Object.keys(existingQueue).length 
      }));
      
      console.log('📥 Queued for sync:', key);
    } catch (error) {
      console.error('❌ Failed to queue data for sync:', error);
    }
  }, []);

  const clearPendingSync = useCallback((key: string) => {
    try {
      const existingQueue = JSON.parse(localStorage.getItem('offline_sync_queue') || '{}');
      delete existingQueue[key];
      localStorage.setItem('offline_sync_queue', JSON.stringify(existingQueue));
      
      setState(prev => ({ 
        ...prev, 
        pendingSyncCount: Object.keys(existingQueue).length 
      }));
      
      console.log('✅ Cleared from sync queue:', key);
    } catch (error) {
      console.error('❌ Failed to clear sync data:', error);
    }
  }, []);

  const getPendingSyncData = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('offline_sync_queue') || '{}');
    } catch (error) {
      console.error('❌ Failed to get pending sync data:', error);
      return {};
    }
  }, []);

  const forceSyncPendingData = useCallback(async () => {
    if (!state.isOnline) {
      console.log('🔌 Cannot sync while offline');
      return;
    }

    const pendingData = getPendingSyncData();
    const keys = Object.keys(pendingData);
    
    if (keys.length === 0) {
      console.log('✅ No pending data to sync');
      return;
    }

    console.log(`🔄 Syncing ${keys.length} pending items...`);
    setState(prev => ({ ...prev, lastSyncAttempt: new Date() }));

    for (const key of keys) {
      const item = pendingData[key];
      try {
        // Emit custom event for components to handle their own sync
        window.dispatchEvent(new CustomEvent('offline-sync', {
          detail: { key, data: item.data }
        }));
        
        // Clear successful sync
        clearPendingSync(key);
        
        console.log('✅ Synced:', key);
      } catch (error) {
        console.error('❌ Sync failed for:', key, error);
        
        // Increment retry count
        item.retryCount = (item.retryCount || 0) + 1;
        
        // Remove if too many retries
        if (item.retryCount > 3) {
          console.log('🗑️ Removing failed sync item after 3 retries:', key);
          clearPendingSync(key);
        } else {
          // Update retry count
          const queue = getPendingSyncData();
          queue[key] = item;
          localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
        }
      }
    }

    console.log('🔄 Sync attempt completed');
  }, [state.isOnline, getPendingSyncData, clearPendingSync]);

  return {
    ...state,
    forceSyncPendingData,
    queueForSync,
    clearPendingSync,
    getPendingSyncData,
  };
};