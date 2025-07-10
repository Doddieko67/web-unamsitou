import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Base path para producción - ajustar según tu deployment
  base: '/', // Usar '/' para dominio raíz o '/vikdev/' si está en subdirectorio
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@stores': resolve(__dirname, './src/stores'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
    },
  },
  build: {
    // Source map configuration
    sourcemap: false, // Desactiva source maps en producción para evitar warnings
    // Configuración de code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - dependencias grandes
          vendor: ['react', 'react-dom'],
          router: ['react-router'],
          ui: ['@tanstack/react-query', 'zustand'],
          supabase: ['@supabase/supabase-js'],
          utils: ['sweetalert2', 'katex', 'react-katex', 'react-markdown'],
        },
      },
    },
    // Tamaño de chunk warning aumentado
    chunkSizeWarningLimit: 1000,
    // Minificación optimizada
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  // Optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router',
      '@tanstack/react-query',
      'zustand',
      '@supabase/supabase-js',
    ],
    // Forzar re-bundling para evitar problemas de cache con Tailwind CSS v4
    force: true,
  },
  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  // Configuración del servidor de desarrollo
  server: {
    port: 5173,
    open: true,
    cors: true,
    // Mejorar timing de inicialización para Tailwind CSS v4
    warmup: {
      clientFiles: ['./src/index.css', './src/**/*.{tsx,ts,jsx,js}'],
    },
  },
  // Preview server configuration
  preview: {
    port: 4173,
    cors: true,
  },
})