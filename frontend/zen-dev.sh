#!/bin/bash

# Zen Browser Dev Script - Flujo correcto: dev → fix → clean
echo "🚀 Iniciando servidor de desarrollo..."

# 1. Primero iniciar el servidor
npm run dev &
DEV_PID=$!

# 2. Esperar un poco y luego aplicar el fix
sleep 2
echo "✨ Aplicando Zen fix..."
echo '.zen-fix { @apply block; }' >> src/index.css

# 3. Función para limpiar cuando se termine
cleanup() {
    echo "🧹 Limpiando Zen fix..."
    sed -i '/zen-fix/d' src/index.css
    echo "✅ Zen fix removido"
    kill $DEV_PID 2>/dev/null
    exit 0
}

# Capturar Ctrl+C para limpiar automáticamente
trap cleanup SIGINT SIGTERM

# Esperar a que el servidor termine
wait $DEV_PID