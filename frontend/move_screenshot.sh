#!/bin/bash

# Script para mover la captura de pantalla más reciente al directorio actual
# Uso: ./move_screenshot.sh

SCREENSHOTS_DIR="$HOME/Pictures/Screenshots"

# Verificar si existe el directorio de screenshots
if [ ! -d "$SCREENSHOTS_DIR" ]; then
    echo "❌ Error: No existe el directorio $SCREENSHOTS_DIR"
    exit 1
fi

# Encontrar la captura más reciente (por fecha de modificación)
LATEST_SCREENSHOT=$(ls -t "$SCREENSHOTS_DIR"/*.png 2>/dev/null | head -n 1)

# Verificar si se encontró alguna captura
if [ -z "$LATEST_SCREENSHOT" ]; then
    echo "❌ No se encontraron capturas de pantalla en $SCREENSHOTS_DIR"
    exit 1
fi

# Obtener solo el nombre del archivo
FILENAME=$(basename "$LATEST_SCREENSHOT")

# Mover la captura al directorio actual
mv "$LATEST_SCREENSHOT" .

# Verificar si el movimiento fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Captura movida exitosamente: $FILENAME"
    echo "📁 Ahora está en: $(pwd)/$FILENAME"
else
    echo "❌ Error al mover la captura"
    exit 1
fi