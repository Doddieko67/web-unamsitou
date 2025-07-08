import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OfflineIndicatorProps {
  isOnline: boolean;
  pendingSyncCount: number;
  onForcSync?: () => void;
}

/**
 * Offline/Online status indicator
 * Shows connection status and pending sync items
 */
export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  isOnline,
  pendingSyncCount,
  onForcSync,
}) => {
  if (isOnline && pendingSyncCount === 0) {
    return null; // Hide when online and no pending syncs
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg border ${
          isOnline 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div className="flex items-center space-x-2">
          {/* Connection Status Icon */}
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <motion.i 
                className="fas fa-wifi text-green-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ) : (
              <motion.i 
                className="fas fa-wifi-slash text-red-600"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
            
            <span className={`text-sm font-medium ${
              isOnline ? 'text-green-800' : 'text-red-800'
            }`}>
              {isOnline ? 'En línea' : 'Sin conexión'}
            </span>
          </div>

          {/* Pending Sync Count */}
          {pendingSyncCount > 0 && (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-1">
                <motion.i 
                  className="fas fa-sync text-orange-600"
                  animate={{ rotate: isOnline ? [0, 360] : 0 }}
                  transition={{ 
                    duration: 2, 
                    repeat: isOnline ? Infinity : 0,
                    ease: "linear"
                  }}
                />
                <span className="text-xs text-orange-800 font-medium">
                  {pendingSyncCount} pendiente{pendingSyncCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Force Sync Button */}
          {isOnline && pendingSyncCount > 0 && onForcSync && (
            <button
              onClick={onForcSync}
              className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              title="Sincronizar ahora"
            >
              <i className="fas fa-cloud-upload-alt mr-1"></i>
              Sincronizar
            </button>
          )}
        </div>

        {/* Offline Message */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ delay: 0.3 }}
            className="mt-2 text-xs text-red-700"
          >
            Trabajando sin conexión. Los cambios se guardarán localmente.
          </motion.div>
        )}

        {/* Sync Success Message */}
        {isOnline && pendingSyncCount === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 text-xs text-green-700"
          >
            <i className="fas fa-check mr-1"></i>
            Todos los datos sincronizados
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};