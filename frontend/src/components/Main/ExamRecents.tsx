import { useCallback, useEffect, useState, useMemo } from "react";
import { useAuthStore } from "../../stores/authStore";
import { supabase } from "../../supabase.config";
import { ExamenData } from "./interfacesExam";
import { PreviewableRecentExamCard } from "./PreviewableExamRecents";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import {
  filterExams,
  sortExams,
  type SortOption,
  type SortDirection,
  type FilterDifficulty,
  type FilterStatus,
} from "../../utils/examHelpers";

// Sistema dinámico de colores para filtros - versión local
const getLocalFilterColorStyles = (type: 'difficulty' | 'status', value: string, isSelected: boolean) => {
  const colorMaps = {
    difficulty: {
      all: { bg: 'var(--theme-bg-accent)', text: 'var(--theme-text-secondary)', border: 'var(--theme-border-primary)' },
      easy: { bg: 'var(--theme-success-light)', text: 'var(--theme-success-dark)', border: 'var(--theme-success)' },
      medium: { bg: 'var(--theme-warning-light)', text: 'var(--theme-warning-dark)', border: 'var(--theme-warning)' },
      hard: { bg: 'var(--theme-error-light)', text: 'var(--theme-error-dark)', border: 'var(--theme-error)' },
      mixed: { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' }
    },
    status: {
      all: { bg: 'var(--theme-bg-accent)', text: 'var(--theme-text-secondary)', border: 'var(--theme-border-primary)' },
      pendiente: { bg: 'var(--theme-warning-light)', text: 'var(--theme-warning-dark)', border: 'var(--theme-warning)' },
      en_progreso: { bg: 'var(--theme-info-light)', text: 'var(--theme-info-dark)', border: 'var(--theme-info)' },
      terminado: { bg: 'var(--theme-success-light)', text: 'var(--theme-success-dark)', border: 'var(--theme-success)' },
      suspendido: { bg: 'var(--theme-error-light)', text: 'var(--theme-error-dark)', border: 'var(--theme-error)' }
    }
  };
  
  const colors = colorMaps[type][value as keyof typeof colorMaps[typeof type]] || colorMaps[type].all;
  
  return {
    backgroundColor: isSelected ? colors.border : colors.bg,
    color: isSelected ? 'white' : colors.text,
    borderColor: colors.border
  };
};

export function ExamRecents() {
  const { user } = useAuthStore();
  const [recentExams, setRecentExams] = useState<ExamenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<FilterDifficulty>('all');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedExams, setSelectedExams] = useState<Set<string>>(new Set());
  
  // Pagination
  const [visibleCount, setVisibleCount] = useState(6);
  
  const navigate = useNavigate();

  const handlePinExam = useCallback(async (examId: string) => {
    const exam = recentExams.find(e => e.id === examId);
    if (!exam) return;
    
    const newPinnedState = !exam.is_pinned;
    
    // Optimistic update
    setRecentExams(prev => prev.map(e => 
      e.id === examId ? { ...e, is_pinned: newPinnedState } : e
    ));
    
    try {
      const { error } = await supabase
        .from('examenes')
        .update({ is_pinned: newPinnedState })
        .eq('id', examId);
      
      if (error) {
        // Revert optimistic update on error
        setRecentExams(prev => prev.map(e => 
          e.id === examId ? { ...e, is_pinned: !newPinnedState } : e
        ));
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar el estado del pin'
        });
      }
    } catch (error) {
      // Revert optimistic update
      setRecentExams(prev => prev.map(e => 
        e.id === examId ? { ...e, is_pinned: !newPinnedState } : e
      ));
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el estado del pin'
      });
    }
  }, [recentExams]);

  const handleDeleteExam = useCallback(async (examId: string) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    // Optimistic update
    const examToDelete = recentExams.find(e => e.id === examId);
    setRecentExams(prev => prev.filter(exam => exam.id !== examId));
    setSelectedExams(prev => {
      const newSet = new Set(prev);
      newSet.delete(examId);
      return newSet;
    });
    
    try {
      const { error } = await supabase
        .from('examenes')
        .delete()
        .eq('id', examId);
      
      if (error) {
        // Revert optimistic update
        if (examToDelete) {
          setRecentExams(prev => [examToDelete, ...prev]);
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el examen'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El examen ha sido eliminado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      // Revert optimistic update
      if (examToDelete) {
        setRecentExams(prev => [examToDelete, ...prev]);
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado'
      });
    }
  }, [recentExams]);

  // Bulk operations
  const handleBulkDelete = useCallback(async () => {
    if (selectedExams.size === 0) return;
    
    const result = await Swal.fire({
      title: `¿Eliminar ${selectedExams.size} examen(es)?`,
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });
    
    if (!result.isConfirmed) return;
    
    const idsToDelete = Array.from(selectedExams);
    const examsToDelete = recentExams.filter(e => selectedExams.has(e.id));
    
    // Optimistic update
    setRecentExams(prev => prev.filter(exam => !selectedExams.has(exam.id)));
    setSelectedExams(new Set());
    
    try {
      const { error } = await supabase
        .from('examenes')
        .delete()
        .in('id', idsToDelete);
      
      if (error) {
        // Revert optimistic update
        setRecentExams(prev => [...examsToDelete, ...prev]);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron eliminar algunos exámenes'
        });
      } else {
        Swal.fire({
          icon: 'success',
          title: 'Eliminados',
          text: `${idsToDelete.length} examen(es) eliminado(s) exitosamente`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      // Revert optimistic update
      setRecentExams(prev => [...examsToDelete, ...prev]);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error inesperado'
      });
    }
  }, [selectedExams, recentExams]);
  
  const handleSelectExam = useCallback((examId: string) => {
    setSelectedExams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(examId)) {
        newSet.delete(examId);
      } else {
        newSet.add(examId);
      }
      return newSet;
    });
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + 6);
  }, []);

  useEffect(() => {
    const fetchRecentExams = async () => {
      if (!user) {
        setRecentExams([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("examenes")
          .select("*")
          .eq("user_id", user.id)
          .order("fecha_inicio", { ascending: false });

        if (error) {
          setError(`Error: ${error.message}`);
          setRecentExams([]);
        } else {
          const formattedData = data.map((item) => ({
            ...item,
            datos: Array.isArray(item.datos) ? item.datos : [],
            is_pinned: item.is_pinned || false,
          }));
          setRecentExams(formattedData as ExamenData[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setRecentExams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentExams();
  }, [user]);

  // Derived states with filtering and sorting
  const filteredAndSortedExams = useMemo(() => {
    const filtered = filterExams(recentExams, searchTerm, difficultyFilter, statusFilter);
    return sortExams(filtered, sortBy, sortDirection);
  }, [recentExams, searchTerm, difficultyFilter, statusFilter, sortBy, sortDirection]);
  
  const pinnedExamList = useMemo(() => {
    return filteredAndSortedExams.filter((exam) => exam.is_pinned);
  }, [filteredAndSortedExams]);

  const nonPinnedExamList = useMemo(() => {
    return filteredAndSortedExams.filter((exam) => !exam.is_pinned);
  }, [filteredAndSortedExams]);

  const slicedNonPinnedExams = useMemo(() => {
    return nonPinnedExamList.slice(0, visibleCount);
  }, [nonPinnedExamList, visibleCount]);

  const handleEntireCard = useCallback(
    (examId: string) => {
      navigate(`/examen/${examId}`);
    },
    [navigate],
  );
  
  const handleSort = useCallback((field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  }, [sortBy]);
  
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setDifficultyFilter('all');
    setStatusFilter('all');
    setSortBy('date');
    setSortDirection('desc');
  }, []);

  const handleSelectAll = useCallback(() => {
    const allVisibleIds = [...pinnedExamList, ...slicedNonPinnedExams].map(exam => exam.id);
    setSelectedExams(new Set(allVisibleIds));
  }, [pinnedExamList, slicedNonPinnedExams]);
  
  const handleDeselectAll = useCallback(() => {
    setSelectedExams(new Set());
  }, []);

  const hasExams = recentExams.length > 0;

  return (
    <div 
      className="rounded-xl shadow-md p-6 mb-8 transition-colors duration-300"
      style={{
        backgroundColor: 'var(--theme-bg-primary)',
        boxShadow: 'var(--theme-shadow-md)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 
          className="text-xl font-semibold transition-colors duration-300"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          Mis Exámenes ({recentExams.length})
        </h2>
        {selectedExams.size > 0 && (
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              {selectedExams.size} seleccionado(s)
            </span>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1 text-white text-sm rounded transition-colors"
              style={{ backgroundColor: 'var(--theme-error)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-error-dark)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-error)'}
            >
              <i className="fas fa-trash mr-1"></i>
              Eliminar
            </button>
            <button
              onClick={handleDeselectAll}
              className="px-3 py-1 text-white text-sm rounded transition-colors"
              style={{ backgroundColor: 'var(--theme-text-muted)' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-text-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--theme-text-muted)'}
            >
              Deseleccionar
            </button>
          </div>
        )}
      </div>
      
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Enhanced Search Bar */}
        <div className="relative group">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors duration-200">
            <i 
              className="fas fa-search"
              style={{ 
                color: searchTerm ? 'var(--theme-info)' : 'var(--theme-text-muted)' 
              }}
            ></i>
          </div>
          <input
            type="text"
            placeholder="🔍 Buscar por título o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-4 text-lg border-2 rounded-2xl focus:ring-4 focus:outline-none transition-all duration-300 shadow-sm hover:shadow-md"
            style={{
              backgroundColor: 'var(--theme-bg-secondary)',
              borderColor: 'var(--theme-border-primary)',
              color: 'var(--theme-text-primary)',
              background: 'linear-gradient(to right, var(--theme-bg-secondary), var(--theme-info-light))',
              '--placeholder-color': 'var(--theme-text-muted)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, var(--theme-info-light), var(--theme-info-light))';
              e.currentTarget.style.borderColor = 'var(--theme-info)';
              e.currentTarget.style.boxShadow = `0 0 0 4px var(--theme-focus-ring)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, var(--theme-bg-secondary), var(--theme-info-light))';
              e.currentTarget.style.borderColor = 'var(--theme-border-primary)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: 'var(--theme-bg-accent)',
                color: 'var(--theme-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-error-light)';
                e.currentTarget.style.color = 'var(--theme-error)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg-accent)';
                e.currentTarget.style.color = 'var(--theme-text-secondary)';
              }}
              title="Limpiar búsqueda"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          )}
          {searchTerm && (
            <div 
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs px-2 py-1 rounded-full border transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                color: 'var(--theme-text-muted)',
                borderColor: 'var(--theme-border-primary)'
              }}
            >
              {filteredAndSortedExams.length} resultados
            </div>
          )}
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Difficulty Filter - Theme-Aware Pills */}
          <div className="flex flex-col space-y-2">
            <label 
              className="text-sm font-medium flex items-center"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <i 
                className="fas fa-signal mr-2"
                style={{ color: 'var(--theme-info)' }}
              ></i>
              Dificultad
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todas', icon: '🎯' },
                { value: 'easy', label: 'Fácil', icon: '🟢' },
                { value: 'medium', label: 'Medio', icon: '🟡' },
                { value: 'hard', label: 'Difícil', icon: '🔴' },
                { value: 'mixed', label: 'Mixto', icon: '🌈' }
              ].map(({ value, label, icon }) => {
                const isSelected = difficultyFilter === value;
                const colorStyles = getLocalFilterColorStyles('difficulty', value, isSelected);
                return (
                  <button
                    key={value}
                    onClick={() => setDifficultyFilter(value as FilterDifficulty)}
                    className="px-3 py-2 text-sm font-medium rounded-full border-2 transition-all duration-200 hover:scale-105 shadow-sm"
                    style={{
                      ...colorStyles,
                      boxShadow: isSelected 
                        ? `0 0 0 3px ${colorStyles.borderColor}20, var(--theme-shadow-md)` 
                        : 'var(--theme-shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = colorStyles.borderColor;
                        e.currentTarget.style.backgroundColor = colorStyles.backgroundColor + '40';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--theme-border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
                      }
                    }}
                  >
                    <span className="mr-1">{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Status Filter - Theme-Aware Cards */}
          <div className="flex flex-col space-y-2">
            <label 
              className="text-sm font-medium flex items-center"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <i 
                className="fas fa-tasks mr-2"
                style={{ color: 'var(--primary)' }}
              ></i>
              Estado
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Todos', icon: '📋' },
                { value: 'pendiente', label: 'Pendiente', icon: '⏳' },
                { value: 'en_progreso', label: 'En Progreso', icon: '⚡' },
                { value: 'terminado', label: 'Completado', icon: '✅' },
                { value: 'suspendido', label: 'Suspendido', icon: '⏸️' }
              ].map(({ value, label, icon }) => {
                const isSelected = statusFilter === value;
                const colorStyles = getLocalFilterColorStyles('status', value, isSelected);
                return (
                  <button
                    key={value}
                    onClick={() => setStatusFilter(value as FilterStatus)}
                    className="px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all duration-200 hover:scale-105 flex items-center space-x-1 shadow-sm"
                    style={{
                      ...colorStyles,
                      boxShadow: isSelected 
                        ? `0 0 0 3px ${colorStyles.borderColor}20, var(--theme-shadow-md)` 
                        : 'var(--theme-shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = colorStyles.borderColor;
                        e.currentTarget.style.backgroundColor = colorStyles.backgroundColor + '40';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--theme-border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
                      }
                    }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Sort Options - Theme-Aware Design */}
          <div className="flex flex-col space-y-2">
            <label 
              className="text-sm font-medium flex items-center"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <i 
                className="fas fa-sort mr-2"
                style={{ color: 'var(--primary)' }}
              ></i>
              Ordenar por
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'date', label: 'Fecha', emoji: '📅' },
                { key: 'title', label: 'Título', emoji: '🔤' },
                { key: 'difficulty', label: 'Dificultad', emoji: '⚡' },
                { key: 'duration', label: 'Tiempo', emoji: '⏱️' }
              ].map(({ key, label, emoji }) => {
                const isSelected = sortBy === key;
                return (
                  <button
                    key={key}
                    onClick={() => handleSort(key as SortOption)}
                    className="px-3 py-2 text-sm font-medium rounded-xl border-2 transition-all duration-200 hover:scale-105 flex items-center space-x-2 min-w-[100px] justify-center shadow-sm"
                    style={{
                      backgroundColor: isSelected ? 'var(--primary)' : 'var(--theme-bg-primary)',
                      color: isSelected ? 'white' : 'var(--theme-text-secondary)',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--theme-border-primary)',
                      boxShadow: isSelected 
                        ? 'var(--theme-shadow-lg)' 
                        : 'var(--theme-shadow-sm)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--primary)';
                        e.currentTarget.style.backgroundColor = 'var(--theme-info-light)';
                        e.currentTarget.style.color = 'var(--primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--theme-border-primary)';
                        e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
                        e.currentTarget.style.color = 'var(--theme-text-secondary)';
                      }
                    }}
                    title={`Ordenar por ${label}`}
                  >
                    <span>{emoji}</span>
                    <span className="hidden sm:inline">{label}</span>
                    {isSelected && (
                      <i 
                        className={`fas fa-chevron-${sortDirection === 'asc' ? 'up' : 'down'} text-xs animate-pulse`}
                        style={{ color: 'white' }}
                      ></i>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <label 
              className="text-sm font-medium flex items-center"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <i 
                className="fas fa-cogs mr-2"
                style={{ color: 'var(--secondary)' }}
              ></i>
              Acciones
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Clear Filters */}
              {(searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'date' || sortDirection !== 'desc') && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 shadow-md flex items-center space-x-2"
                  style={{
                    background: 'var(--theme-gradient-primary)',
                    color: 'white',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
                  }}
                >
                  <i className="fas fa-broom"></i>
                  <span>Limpiar</span>
                </button>
              )}
              
              {/* Select All */}
              {(pinnedExamList.length > 0 || slicedNonPinnedExams.length > 0) && (
                <button
                  onClick={selectedExams.size === pinnedExamList.length + slicedNonPinnedExams.length ? handleDeselectAll : handleSelectAll}
                  className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover:scale-105 shadow-md flex items-center space-x-2"
                  style={{
                    backgroundColor: 'var(--secondary)',
                    color: 'white',
                    border: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
                    e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
                    e.currentTarget.style.backgroundColor = 'var(--theme-success-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
                    e.currentTarget.style.backgroundColor = 'var(--secondary)';
                  }}
                >
                  <i className={`fas ${selectedExams.size === pinnedExamList.length + slicedNonPinnedExams.length ? 'fa-check-square' : 'fa-square'}`}></i>
                  <span className="hidden sm:inline">
                    {selectedExams.size === pinnedExamList.length + slicedNonPinnedExams.length ? 'Deseleccionar' : 'Seleccionar'}
                  </span>
                  <span className="sm:hidden">
                    {selectedExams.size === pinnedExamList.length + slicedNonPinnedExams.length ? '❌' : '✅'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Filters Summary - Theme-Aware Design */}
        {(searchTerm || difficultyFilter !== 'all' || statusFilter !== 'all') && (
          <div 
            className="rounded-xl p-4 shadow-sm border transition-colors duration-300"
            style={{
              background: 'var(--theme-gradient-card)',
              borderColor: 'var(--theme-border-primary)'
            }}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <i 
                  className="fas fa-filter"
                  style={{ color: 'var(--theme-info)' }}
                ></i>
                <span 
                  className="text-sm font-semibold"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  Filtros activos:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span 
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border shadow-sm transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--theme-info-light)',
                      color: 'var(--theme-info-dark)',
                      borderColor: 'var(--theme-info)'
                    }}
                  >
                    <i className="fas fa-search text-xs"></i>
                    <span>"{searchTerm}"</span>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 transition-colors duration-200"
                      style={{ color: 'var(--theme-info-dark)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-info-dark)';
                      }}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                )}
                {difficultyFilter !== 'all' && (
                  <span 
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border shadow-sm transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--theme-success-light)',
                      color: 'var(--theme-success-dark)',
                      borderColor: 'var(--theme-success)'
                    }}
                  >
                    <span>
                      {difficultyFilter === 'easy' ? '🟢' : 
                       difficultyFilter === 'medium' ? '🟡' : 
                       difficultyFilter === 'hard' ? '🔴' : '🌈'}
                    </span>
                    <span className="capitalize">{difficultyFilter}</span>
                    <button
                      onClick={() => setDifficultyFilter('all')}
                      className="ml-1 transition-colors duration-200"
                      style={{ color: 'var(--theme-success-dark)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-success-dark)';
                      }}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span 
                    className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium border shadow-sm transition-colors duration-200"
                    style={{
                      backgroundColor: 'var(--theme-warning-light)',
                      color: 'var(--theme-warning-dark)',
                      borderColor: 'var(--theme-warning)'
                    }}
                  >
                    <span>
                      {statusFilter === 'pendiente' ? '⏳' : 
                       statusFilter === 'en_progreso' ? '⚡' : 
                       statusFilter === 'terminado' ? '✅' : '⏸️'}
                    </span>
                    <span className="capitalize">
                      {statusFilter === 'terminado' ? 'Completado' : 
                       statusFilter === 'en_progreso' ? 'En Progreso' : 
                       statusFilter}
                    </span>
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="ml-1 transition-colors duration-200"
                      style={{ color: 'var(--theme-warning-dark)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--theme-error)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--theme-warning-dark)';
                      }}
                    >
                      <i className="fas fa-times text-xs"></i>
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loading and Error States - Theme Aware */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div 
            className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3"
            style={{ borderColor: 'var(--primary)' }}
          ></div>
          <p style={{ color: 'var(--theme-text-secondary)' }}>Cargando exámenes...</p>
        </div>
      )}

      {!isLoading && error && (
        <div className="text-center py-8">
          <i 
            className="fas fa-exclamation-triangle text-4xl mb-4"
            style={{ color: 'var(--theme-error)' }}
          ></i>
          <p style={{ color: 'var(--theme-error-dark)' }}>{error}</p>
        </div>
      )}

      {!isLoading && !error && !hasExams && (
        <div className="text-center py-12">
          <i 
            className="fas fa-clipboard-list text-6xl mb-4"
            style={{ color: 'var(--theme-text-muted)' }}
          ></i>
          <h3 
            className="text-lg font-semibold mb-2"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            No tienes exámenes
          </h3>
          <p 
            className="mb-4"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            Crea tu primer examen para comenzar
          </p>
          <button
            onClick={() => navigate('/inicio')}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'scale(1.05) translateY(-1px)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
            }}
          >
            Crear Examen
          </button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && hasExams && (
        <>
          {/* Pinned Exams Section */}
          {pinnedExamList.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <i 
                  className="fas fa-star mr-2"
                  style={{ color: 'var(--theme-warning)' }}
                ></i>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  Exámenes Fijados ({pinnedExamList.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedExamList.map((exam, index) => (
                  <PreviewableRecentExamCard
                    key={exam.id}
                    exam={exam}
                    onDelete={handleDeleteExam}
                    index={index}
                    onPinToggle={handlePinExam}
                    isPinneable={true}
                    isThisPinned={true}
                    onEntireToggle={handleEntireCard}
                    isSelected={selectedExams.has(exam.id)}
                    onSelect={() => handleSelectExam(exam.id)}
                  />
                ))}
              </div>
              {slicedNonPinnedExams.length > 0 && (
                <div 
                  className="border-t mt-6 pt-6"
                  style={{ borderColor: 'var(--theme-border-primary)' }}
                ></div>
              )}
            </div>
          )}
          
          {/* Regular Exams Section */}
          {slicedNonPinnedExams.length > 0 && (
            <div>
              <div className="flex items-center mb-4">
                <i 
                  className="fas fa-list mr-2"
                  style={{ color: 'var(--theme-text-muted)' }}
                ></i>
                <h3 
                  className="text-lg font-semibold"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  {pinnedExamList.length > 0 ? "Otros Exámenes" : "Exámenes"} ({nonPinnedExamList.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slicedNonPinnedExams.map((exam, index) => (
                  <PreviewableRecentExamCard
                    key={exam.id}
                    exam={exam}
                    onDelete={handleDeleteExam}
                    index={index}
                    onPinToggle={handlePinExam}
                    isPinneable={true}
                    onEntireToggle={handleEntireCard}
                    isSelected={selectedExams.has(exam.id)}
                    onSelect={() => handleSelectExam(exam.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* No Results - Theme Aware */}
          {filteredAndSortedExams.length === 0 && (
            <div className="text-center py-8">
              <i 
                className="fas fa-search text-4xl mb-4"
                style={{ color: 'var(--theme-text-muted)' }}
              ></i>
              <p 
                className="mb-2"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                No se encontraron exámenes con los filtros aplicados
              </p>
              <button
                onClick={clearFilters}
                className="text-sm transition-colors duration-200"
                style={{ color: 'var(--primary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--primary-dark)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--primary)';
                }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
          
          {/* Pin Suggestion - Theme Aware */}
          {hasExams && pinnedExamList.length === 0 && nonPinnedExamList.length > 0 && (
            <div 
              className="border rounded-lg p-4 mt-4 transition-colors duration-300"
              style={{
                backgroundColor: 'var(--theme-info-light)',
                borderColor: 'var(--theme-info)'
              }}
            >
              <div className="flex items-center">
                <i 
                  className="fas fa-star mr-2"
                  style={{ color: 'var(--theme-info)' }}
                ></i>
                <p 
                  className="text-sm"
                  style={{ color: 'var(--theme-info-dark)' }}
                >
                  ¡Tip! Fija exámenes importantes para acceder a ellos rápidamente
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Load More Button - Theme Aware */}
      {!isLoading && !error && visibleCount < nonPinnedExamList.length && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="flex items-center px-6 py-3 rounded-lg transition-all duration-200 hover:scale-105 shadow-md"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-lg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'var(--theme-shadow-md)';
            }}
          >
            <i className="fas fa-chevron-down mr-2"></i>
            Cargar más ({Math.min(6, nonPinnedExamList.length - visibleCount)} de {nonPinnedExamList.length - visibleCount} restantes)
          </button>
        </div>
      )}
      
      {/* Summary - Theme Aware */}
      {!isLoading && !error && hasExams && (
        <div 
          className="mt-6 pt-6 border-t"
          style={{ borderColor: 'var(--theme-border-primary)' }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div 
              className="rounded-lg p-3 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-info-light)',
                boxShadow: 'var(--theme-shadow-sm)'
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--theme-info-dark)' }}
              >
                {recentExams.length}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--theme-info-dark)' }}
              >
                Total
              </div>
            </div>
            <div 
              className="rounded-lg p-3 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-success-light)',
                boxShadow: 'var(--theme-shadow-sm)'
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--theme-success-dark)' }}
              >
                {recentExams.filter(e => e.estado === 'terminado').length}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--theme-success-dark)' }}
              >
                Completados
              </div>
            </div>
            <div 
              className="rounded-lg p-3 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--theme-warning-light)',
                boxShadow: 'var(--theme-shadow-sm)'
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: 'var(--theme-warning-dark)' }}
              >
                {recentExams.filter(e => e.is_pinned).length}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--theme-warning-dark)' }}
              >
                Fijados
              </div>
            </div>
            <div 
              className="rounded-lg p-3 transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: '#f3e8ff',
                boxShadow: 'var(--theme-shadow-sm)'
              }}
            >
              <div 
                className="text-2xl font-bold"
                style={{ color: '#6b21a8' }}
              >
                {Math.round(recentExams.filter(e => e.tiempo_tomado_segundos).reduce((acc, e) => acc + (e.tiempo_tomado_segundos || 0), 0) / 60)}
              </div>
              <div 
                className="text-xs"
                style={{ color: '#6b21a8' }}
              >
                Min. totales
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}