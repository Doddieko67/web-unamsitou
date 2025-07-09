// Utility para obtener colores CSS computados en tiempo real
export const getComputedCSSVariable = (variable: string): string => {
  if (typeof window === 'undefined') return '#6366f1'; // fallback para SSR
  
  const computed = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return computed || '#6366f1'; // fallback si no encuentra la variable
};

// Paleta de colores theme-aware para charts
export const getChartColors = () => {
  return {
    // Colores principales
    primary: getComputedCSSVariable('--primary') || '#6366f1',
    primaryDark: getComputedCSSVariable('--primary-dark') || '#4f46e5',
    secondary: getComputedCSSVariable('--secondary') || '#10b981',
    
    // Colores de estado
    success: getComputedCSSVariable('--theme-success') || '#10b981',
    successLight: getComputedCSSVariable('--theme-success-light') || '#d1fae5',
    successDark: getComputedCSSVariable('--theme-success-dark') || '#065f46',
    
    warning: getComputedCSSVariable('--theme-warning') || '#f59e0b',
    warningLight: getComputedCSSVariable('--theme-warning-light') || '#fef3c7',
    warningDark: getComputedCSSVariable('--theme-warning-dark') || '#92400e',
    
    error: getComputedCSSVariable('--theme-error') || '#ef4444',
    errorLight: getComputedCSSVariable('--theme-error-light') || '#fee2e2',
    errorDark: getComputedCSSVariable('--theme-error-dark') || '#991b1b',
    
    info: getComputedCSSVariable('--theme-info') || '#3b82f6',
    infoLight: getComputedCSSVariable('--theme-info-light') || '#dbeafe',
    infoDark: getComputedCSSVariable('--theme-info-dark') || '#1e40af',
    
    // Colores de texto y fondo
    textPrimary: getComputedCSSVariable('--theme-text-primary') || '#1e293b',
    textSecondary: getComputedCSSVariable('--theme-text-secondary') || '#475569',
    textMuted: getComputedCSSVariable('--theme-text-muted') || '#64748b',
    
    bgPrimary: getComputedCSSVariable('--theme-bg-primary') || '#ffffff',
    bgSecondary: getComputedCSSVariable('--theme-bg-secondary') || '#f8fafc',
    
    borderPrimary: getComputedCSSVariable('--theme-border-primary') || '#e2e8f0',
    borderSecondary: getComputedCSSVariable('--theme-border-secondary') || '#cbd5e1',
  };
};

// Paleta extendida para múltiples datasets
export const getExtendedChartPalette = () => {
  const colors = getChartColors();
  
  return {
    // Distribución por estado
    statusColors: [
      colors.success,     // Completados
      colors.info,        // En progreso  
      colors.warning,     // Pendientes
      colors.error,       // Suspendidos
    ],
    statusColorsLight: [
      colors.successLight,
      colors.infoLight,
      colors.warningLight,
      colors.errorLight,
    ],
    statusColorsDark: [
      colors.successDark,
      colors.infoDark,
      colors.warningDark,
      colors.errorDark,
    ],
    
    // Distribución por dificultad
    difficultyColors: [
      colors.success,     // Fácil
      colors.warning,     // Medio
      colors.error,       // Difícil
      colors.info,        // Mixto
    ],
    
    // Gradientes para efectos avanzados
    gradients: {
      success: `linear-gradient(135deg, ${colors.success}, ${colors.successDark})`,
      warning: `linear-gradient(135deg, ${colors.warning}, ${colors.warningDark})`,
      error: `linear-gradient(135deg, ${colors.error}, ${colors.errorDark})`,
      info: `linear-gradient(135deg, ${colors.info}, ${colors.infoDark})`,
      primary: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`,
    },
    
    // Colores para métricas avanzadas
    performanceColors: {
      excellent: colors.success,    // 90-100%
      good: colors.info,           // 70-89%
      average: colors.warning,     // 50-69%
      poor: colors.error,          // 0-49%
    },
    
    // Paleta rainbow para categorías múltiples
    rainbow: [
      colors.primary,
      colors.secondary,
      colors.success,
      colors.warning,
      colors.error,
      colors.info,
      '#8b5cf6', // purple
      '#f59e0b', // amber
      '#06b6d4', // cyan
      '#84cc16', // lime
    ],
  };
};

// Función para generar colores con transparencia
export const withOpacity = (color: string | undefined, opacity: number): string => {
  // Validar que el color exista
  if (!color || typeof color !== 'string') {
    console.warn('withOpacity: color is undefined or invalid, using fallback');
    return `rgba(99, 102, 241, ${opacity})`; // Fallback al primary color
  }
  
  // Limpiar espacios en blanco
  const cleanColor = color.trim();
  
  // Si el color es un hex, convertir a rgba
  if (cleanColor.startsWith('#')) {
    const hex = cleanColor.slice(1);
    if (hex.length === 6) {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    } else if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
  }
  
  // Si es rgb/rgba, extraer valores y aplicar nueva opacidad
  if (cleanColor.startsWith('rgb')) {
    const matches = cleanColor.match(/\d+/g);
    if (matches && matches.length >= 3) {
      return `rgba(${matches[0]}, ${matches[1]}, ${matches[2]}, ${opacity})`;
    }
  }
  
  // Si es un color nombrado o formato no reconocido, usar fallback
  console.warn(`withOpacity: unrecognized color format: ${cleanColor}`);
  return `rgba(99, 102, 241, ${opacity})`; // Fallback
};

// Función para obtener color según performance
export const getPerformanceColor = (percentage: number): string => {
  const colors = getExtendedChartPalette().performanceColors;
  
  if (percentage >= 90) return colors.excellent;
  if (percentage >= 70) return colors.good;
  if (percentage >= 50) return colors.average;
  return colors.poor;
};

// Función para refrescar colores (útil para cambios de tema)
export const refreshChartColors = () => {
  // Forzar recálculo en el próximo getChartColors()
  return getChartColors();
};