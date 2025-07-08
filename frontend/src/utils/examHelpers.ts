import { ExamenData } from "../components/Main/interfacesExam";

// Types para filtros y ordenamiento
export type SortOption = 'date' | 'title' | 'difficulty' | 'status' | 'duration';
export type SortDirection = 'asc' | 'desc';
export type FilterDifficulty = 'all' | 'easy' | 'medium' | 'hard' | 'mixed';
export type FilterStatus = 'all' | 'pendiente' | 'en_progreso' | 'terminado' | 'suspendido';

// Constantes para mapeo de dificultad
export const DIFFICULTY_ORDER = { easy: 1, medium: 2, hard: 3, mixed: 4 } as const;

// Helper para filtrar exámenes
export const filterExams = (
  exams: ExamenData[], 
  searchTerm: string, 
  difficultyFilter: FilterDifficulty, 
  statusFilter: FilterStatus
): ExamenData[] => {
  return exams.filter(exam => {
    const matchesSearch = exam.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exam.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || exam.dificultad === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || exam.estado === statusFilter;
    
    return matchesSearch && matchesDifficulty && matchesStatus;
  });
};

// Helper para ordenar exámenes
export const sortExams = (
  exams: ExamenData[], 
  sortBy: SortOption, 
  direction: SortDirection
): ExamenData[] => {
  return [...exams].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.fecha_inicio || 0).getTime() - new Date(b.fecha_inicio || 0).getTime();
        break;
      case 'title':
        comparison = a.titulo.localeCompare(b.titulo);
        break;
      case 'difficulty':
        comparison = DIFFICULTY_ORDER[a.dificultad] - DIFFICULTY_ORDER[b.dificultad];
        break;
      case 'status':
        comparison = a.estado.localeCompare(b.estado);
        break;
      case 'duration':
        comparison = (a.tiempo_tomado_segundos || 0) - (b.tiempo_tomado_segundos || 0);
        break;
      default:
        comparison = 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

// Helper para obtener estilos de filtro de colores
export const getFilterColorStyles = (colorTheme: string = 'blue') => {
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    blue: { bg: 'var(--theme-info-light)', text: 'var(--theme-info-dark)', border: 'var(--theme-info)' },
    green: { bg: 'var(--theme-success-light)', text: 'var(--theme-success-dark)', border: 'var(--theme-success)' },
    yellow: { bg: 'var(--theme-warning-light)', text: 'var(--theme-warning-dark)', border: 'var(--theme-warning)' },
    red: { bg: 'var(--theme-error-light)', text: 'var(--theme-error-dark)', border: 'var(--theme-error)' },
    gray: { bg: 'var(--theme-bg-secondary)', text: 'var(--theme-text-secondary)', border: 'var(--theme-border-primary)' }
  };
  
  return colorMap[colorTheme] || colorMap.blue;
};

// Helper para formatear tiempo
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Helper para obtener badge de estado
export const getStatusBadge = (status: string) => {
  const statusConfig = {
    pendiente: { label: 'Pendiente', color: 'gray' },
    en_progreso: { label: 'En Progreso', color: 'blue' },
    terminado: { label: 'Terminado', color: 'green' },
    suspendido: { label: 'Suspendido', color: 'yellow' }
  };
  
  return statusConfig[status as keyof typeof statusConfig] || statusConfig.pendiente;
};

// Helper para obtener badge de dificultad
export const getDifficultyBadge = (difficulty: string) => {
  const difficultyConfig = {
    easy: { label: 'Fácil', color: 'green' },
    medium: { label: 'Medio', color: 'yellow' },
    hard: { label: 'Difícil', color: 'red' },
    mixed: { label: 'Mixto', color: 'blue' }
  };
  
  return difficultyConfig[difficulty as keyof typeof difficultyConfig] || difficultyConfig.easy;
};