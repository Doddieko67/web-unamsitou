// Constantes para configuración de exámenes

// Materias iniciales disponibles
export const INITIAL_SUBJECTS = [
  {
    name: "Matemáticas",
    icon: "fas fa-square-root-alt",
    description: "Álgebra, cálculo, geometría",
    colorTheme: 'blue' as const,
    colorClasses: {
      bg: "bg-blue-100",
      text: "text-blue-800",
      iconBg: "bg-blue-100",
    },
  },
  {
    name: "Biología",
    icon: "fas fa-dna",
    description: "Células, genética, ecología",
    colorTheme: 'green' as const,
    colorClasses: {
      bg: "bg-green-100",
      text: "text-green-800",
      iconBg: "bg-green-100",
    },
  },
  {
    name: "Literatura",
    icon: "fas fa-book-open",
    description: "Obras clásicas, análisis",
    colorTheme: 'purple' as const,
    colorClasses: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      iconBg: "bg-purple-100",
    },
  },
] as const;

// Valores por defecto para configuración de examen
export const DEFAULT_EXAM_CONFIG = {
  QUESTION_COUNT: 10,
  TIMER_HOUR: 0,
  TIMER_MINUTE: 30,
  TIMER_SECOND: 0,
  FINE_TUNING: "",
} as const;

// Límites de configuración
export const EXAM_LIMITS = {
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 100,
  MIN_TIME_SECONDS: 60, // 1 minuto mínimo
  MAX_TIME_SECONDS: 10800, // 3 horas máximo
  MAX_FINE_TUNING_LENGTH: 500,
} as const;

// Tipos de dificultad disponibles
export const DIFFICULTY_TYPES = ['easy', 'medium', 'hard', 'mixed'] as const;
export type DifficultyType = typeof DIFFICULTY_TYPES[number];

// Estados de examen
export const EXAM_STATES = ['pendiente', 'en_progreso', 'terminado', 'suspendido'] as const;
export type ExamState = typeof EXAM_STATES[number];

// Colores de tema disponibles
export const THEME_COLORS = ['blue', 'green', 'purple', 'orange', 'red', 'indigo'] as const;
export type ThemeColor = typeof THEME_COLORS[number];

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  NO_SUBJECTS: "Por favor, selecciona al menos una materia para generar el examen.",
  NO_DIFFICULTY: "Por favor, selecciona un nivel de dificultad para el examen.",
  INCOMPLETE_CONFIG: "Por favor, completa la configuración del examen antes de generarlo.",
  SUBJECT_EXISTS: "La materia ya está en la lista.",
  INVALID_TIME: "Por favor, configura un tiempo válido para el examen.",
} as const;

// Configuración de SweetAlert
export const SWAL_CONFIG = {
  SUCCESS_COLOR: "#10b981",
  ERROR_COLOR: "#ef4444", 
  WARNING_COLOR: "#f59e0b",
  INFO_COLOR: "#3b82f6",
  TOAST_TIMER: 3000,
  POSITION: "top-end" as const,
} as const;

// Iconos por tipo de contenido
export const CONTENT_ICONS = {
  EXAM: "fas fa-clipboard-list",
  SUBJECT: "fas fa-book",
  QUESTION: "fas fa-question-circle",
  TIMER: "fas fa-clock",
  DIFFICULTY: "fas fa-layer-group",
  SETTINGS: "fas fa-cog",
  ROBOT: "fas fa-robot",
  SUCCESS: "fas fa-check-circle",
  ERROR: "fas fa-exclamation-triangle",
  INFO: "fas fa-info-circle",
  WARNING: "fas fa-exclamation-circle",
} as const;