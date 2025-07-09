#!/bin/bash

# Script para limpiar cache y iniciar servidor de desarrollo sin problemas de Tailwind CSS
echo "🧹 Limpiando cache de Vite y node_modules..."

# Limpiar cache de Vite
rm -rf node_modules/.vite

# Limpiar cache de browser (opcional)
# rm -rf node_modules/.cache

# Limpiar builds anteriores
rm -rf dist

echo "✅ Cache limpiado exitosamente"

echo "🚀 Iniciando servidor de desarrollo con configuración optimizada..."

# Iniciar servidor con force flag para evitar problemas de cache
npm run dev:force

echo "📝 Nota: Si el problema persiste, usa 'npm run dev:clean' para una limpieza completa"