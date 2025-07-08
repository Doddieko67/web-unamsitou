// src/components/RecentExamCard.tsx (o la ruta que uses)
import { Link } from "react-router"; // Asumiendo react-router-dom
import { ExamenData } from "./interfacesExam";

// Importa las funciones auxiliares necesarias
// Asegúrate de que estas funciones estén accesibles (exportadas desde un archivo común o copiadas aquí)
const getDifficultyDisplay = (dificultad: ExamenData["dificultad"]) => {
  switch (dificultad) {
    case "easy":
      return { text: "Fácil", class: "easy bg-green-100 text-green-800" };
    case "medium":
      return { text: "Medio", class: "medium bg-yellow-100 text-yellow-800" };
    case "hard":
      return { text: "Difícil", class: "hard bg-red-100 text-red-800" };
    case "mixed":
      return { text: "Mixto", class: "mixed bg-blue-100 text-blue-800" };
    default:
      return {
        text: dificultad,
        class: "unknown bg-gray-100 text-gray-800",
      };
  }
};

// Helper to calculate score percentage (for 'terminado' exams)
const calculateScorePercentage = (exam: ExamenData): number => {
  // Ensure exam.datos is an array and not null/undefined
  const questions = Array.isArray(exam.datos) ? exam.datos : [];

  if (
    exam.estado !== "terminado" ||
    questions.length === 0 ||
    !exam.respuestas_usuario
  ) {
    return 0; // Cannot calculate score for non-terminated or incomplete exams
  }

  let correctCount = 0;
  questions.forEach((pregunta) => {
    // Use exam.respuestas_usuario object to get the answer
    const userAnswer = exam.respuestas_usuario?.[pregunta.id - 1];
    // Ensure correcta is a number for comparison
    if (userAnswer !== undefined && userAnswer === pregunta.correcta) {
      correctCount++;
    }
  });

  return Math.round((correctCount / questions.length) * 100);
};


// Helper to format date (basic "X days ago" or date string)
const formatDateDisplay = (dateString: string | null | undefined): string => {
  if (!dateString) return "Sin fecha";
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }

    const now = new Date();
    const diffTime = now.getTime() - date.getTime(); // Time difference in milliseconds
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // Difference in full days

    if (diffDays < 0) return "En el futuro"; // For dates in the future

    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        if (diffMinutes === 0) return "Ahora mismo";
        return `Hace ${diffMinutes} minutos`;
      }
      return `Hace ${diffHours} horas`;
    }
    if (diffDays === 1) return "Ayer";
    if (diffDays < 7) return `Hace ${diffDays} días`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Hace ${Math.floor(diffDays / 30)} meses`;

    // Fallback to locale date string for much older dates
    return date.toLocaleDateString();
  } catch (e) {
    // Return original if invalid format
    return dateString;
  }
};

interface RecentExamCardProps {
  exam: ExamenData;
  onDelete: (id: string) => void;
  onPinToggle?: (questionIndex: string) => void;
  onEntireToggle: (examId: string) => void;
  isThisPinned?: boolean;
  isPinneable: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

// Asegúrate de exportar las funciones helper si las pones en un archivo separado
// Por ejemplo, en src/utils/examHelpers.ts:
/*
export const getDifficultyDisplay = (dificultad: ExamenData["dificultad"]) => { ... };
export const calculateScorePercentage = (exam: ExamenData): number => { ... };
export const getProgressBarColor = (percentage: number): string => { ... };
export const formatDateDisplay = (dateString: string | null | undefined): string => { ... };
*/

export function RecentExamCard({
  exam,
  onDelete,
  onPinToggle,
  onEntireToggle,
  isThisPinned,
  isPinneable,
  isSelected = false,
  onSelect,
}: RecentExamCardProps) {
  // Usa las funciones auxiliares pasándole el examen
  const difficultyInfo = getDifficultyDisplay(exam.dificultad);
  const scorePercentage = calculateScorePercentage(exam);
  const dateDisplay = formatDateDisplay(exam.fecha_inicio);


  // Sistema de colores adaptable al tema
  const getDifficultyColors = () => {
    const colorMap = {
      easy: {
        bg: 'var(--theme-success)',
        bgLight: 'var(--theme-success-light)',
        text: 'var(--theme-success-dark)',
        border: 'var(--theme-success)'
      },
      medium: {
        bg: 'var(--theme-warning)',
        bgLight: 'var(--theme-warning-light)',
        text: 'var(--theme-warning-dark)',
        border: 'var(--theme-warning)'
      },
      hard: {
        bg: 'var(--theme-error)',
        bgLight: 'var(--theme-error-light)',
        text: 'var(--theme-error-dark)',
        border: 'var(--theme-error)'
      },
      mixed: {
        bg: 'var(--theme-info)',
        bgLight: 'var(--theme-info-light)',
        text: 'var(--theme-info-dark)',
        border: 'var(--theme-info)'
      }
    };
    return colorMap[exam.dificultad as keyof typeof colorMap] || colorMap.easy;
  };

  const getStatusColors = () => {
    const statusMap = {
      terminado: {
        bg: 'var(--theme-success-light)',
        text: 'var(--theme-success-dark)',
        border: 'var(--theme-success)',
        icon: '✅'
      },
      en_progreso: {
        bg: 'var(--theme-info-light)',
        text: 'var(--theme-info-dark)',
        border: 'var(--theme-info)',
        icon: '⚡'
      },
      pendiente: {
        bg: 'var(--theme-warning-light)',
        text: 'var(--theme-warning-dark)',
        border: 'var(--theme-warning)',
        icon: '⏳'
      },
      suspendido: {
        bg: 'var(--theme-error-light)',
        text: 'var(--theme-error-dark)',
        border: 'var(--theme-error)',
        icon: '⏸️'
      }
    };
    return statusMap[exam.estado as keyof typeof statusMap] || statusMap.pendiente;
  };

  const getCardStyles = () => {
    if (isThisPinned) {
      return {
        backgroundColor: 'var(--theme-warning-light)',
        borderColor: 'var(--theme-warning)',
        boxShadow: 'var(--theme-shadow-lg)',
        borderWidth: '2px'
      };
    } else if (isSelected) {
      return {
        backgroundColor: 'var(--theme-info-light)',
        borderColor: 'var(--theme-info)',
        boxShadow: 'var(--theme-shadow-lg)',
        borderWidth: '2px'
      };
    } else {
      return {
        backgroundColor: 'var(--theme-bg-primary)',
        borderColor: 'var(--theme-border-primary)',
        boxShadow: 'var(--theme-shadow-md)',
        borderWidth: '1px'
      };
    }
  };

  const cardStyles = getCardStyles();
  const difficultyColors = getDifficultyColors();
  const statusColors = getStatusColors();

  return (
    // Modern Card Design
    <div
      className="group relative transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 rounded-2xl overflow-hidden border"
      style={cardStyles}
    >
      {/* Difficulty Gradient Bar */}
      <div 
        className="h-1.5"
        style={{ backgroundColor: difficultyColors.bg }}
      ></div>
      
      {/* Card Content */}
      <div className="relative z-10 p-6 pointer-events-none">
        {/* Re-enable pointer events for interactive elements */}
        <style>{`.interactive-element { pointer-events: auto; }`}</style>
        {/* Header Row */}
        <div className="flex items-start justify-between mb-4">
          {/* Selection Checkbox - Modern Design */}
          {onSelect && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              className="interactive-element relative z-10 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: isSelected ? 'var(--primary)' : 'var(--theme-bg-primary)',
                borderColor: isSelected ? 'var(--primary)' : 'var(--theme-border-secondary)',
                color: isSelected ? 'white' : 'var(--theme-text-primary)',
                boxShadow: isSelected ? 'var(--theme-shadow-md)' : 'none'
              }}
            >
              {isSelected && <i className="fas fa-check text-sm"></i>}
            </button>
          )}
          
          {/* Difficulty Badge */}
          <div 
            className="px-3 py-1 rounded-full text-xs font-bold shadow-sm"
            style={{
              backgroundColor: difficultyColors.bg,
              color: 'white'
            }}
          >
            {difficultyInfo.text}
          </div>
          
          {/* Pin Status Indicator */}
          {isThisPinned && (
            <div 
              className="p-1.5 rounded-full shadow-sm"
              style={{
                backgroundColor: 'var(--theme-warning)',
                color: 'white'
              }}
            >
              <i className="fas fa-star text-sm"></i>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 
          className="font-bold text-xl mb-3 leading-tight transition-colors"
          style={{
            color: 'var(--theme-text-primary)'
          }}
        >
          {exam.titulo}
        </h3>

        {/* Meta Information */}
        <div className="space-y-3 mb-4">
          {/* Questions and Time */}
          <div 
            className="flex items-center space-x-4 text-sm"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <div className="flex items-center space-x-1">
              <i 
                className="fas fa-question-circle"
                style={{ color: 'var(--primary)' }}
              ></i>
              <span className="font-medium">{exam.numero_preguntas} preguntas</span>
            </div>
            <div className="flex items-center space-x-1">
              <i 
                className="fas fa-clock"
                style={{ color: 'var(--theme-info)' }}
              ></i>
              <span className="font-medium">
                {exam.tiempo_tomado_segundos 
                  ? `${Math.ceil(exam.tiempo_tomado_segundos / 60)} min` 
                  : '0 min'}
              </span>
            </div>
          </div>

          {/* Date */}
          <div 
            className="flex items-center space-x-1 text-sm"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <i 
              className="fas fa-calendar-alt"
              style={{ color: 'var(--theme-success)' }}
            ></i>
            <span>{dateDisplay}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          {exam.estado === "terminado" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span 
                  className="font-semibold"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  Puntuación
                </span>
                <span 
                  className="font-bold text-lg"
                  style={{
                    color: scorePercentage >= 70 ? 'var(--theme-success)' : 
                           scorePercentage >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'
                  }}
                >
                  {scorePercentage}%
                </span>
              </div>
              <div 
                className="w-full rounded-full h-3 overflow-hidden"
                style={{ backgroundColor: 'var(--theme-bg-secondary)' }}
              >
                <div
                  className="h-full transition-all duration-500 ease-out rounded-full"
                  style={{
                    width: `${scorePercentage}%`,
                    backgroundColor: scorePercentage >= 70 ? 'var(--theme-success)' : 
                                   scorePercentage >= 40 ? 'var(--theme-warning)' : 'var(--theme-error)'
                  }}
                />
              </div>
            </div>
          ) : (
            <div 
              className="inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold"
              style={{
                backgroundColor: statusColors.bg,
                color: statusColors.text
              }}
            >
              <span className="mr-1">
                {statusColors.icon}
              </span>
              {exam.estado === 'en_progreso' ? 'En Progreso' : 
               exam.estado === 'pendiente' ? 'Pendiente' : 'Suspendido'}
            </div>
          )}
        </div>
      </div>

      {/* Click Area for Navigation - Behind everything */}
      <div 
        onClick={() => onEntireToggle(exam.id)} 
        className="absolute inset-0 cursor-pointer"
      />

      {/* Action Buttons - Modern Floating Design with proper z-index */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
        {/* Pin/Unpin Button */}
        {isPinneable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle && onPinToggle(exam.id);
            }}
            className={`interactive-element relative z-30 p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 shadow-lg ${
              isThisPinned ? 'animate-pulse' : ''
            }`}
            style={{
              backgroundColor: isThisPinned ? 'var(--theme-warning)' : 'var(--theme-bg-primary)',
              color: isThisPinned ? 'white' : 'var(--theme-text-secondary)',
              borderColor: isThisPinned ? 'var(--theme-warning)' : 'var(--theme-border-primary)'
            }}
            title={isThisPinned ? 'Desfijar examen' : 'Fijar examen'}
          >
            <i className="fas fa-star text-sm"></i>
          </button>
        )}

        {/* View Button (for non-pinnable cards) */}
        {!isPinneable && (
          <Link to={`/examen/${exam.id}`} target="_blank" className="interactive-element relative z-30">
            <button 
              className="p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 shadow-lg"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                color: 'var(--primary)',
                borderColor: 'var(--primary)'
              }}
            >
              <i className="fas fa-external-link-alt text-sm"></i>
            </button>
          </Link>
        )}

        {/* Delete Button */}
        {isPinneable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(exam.id);
            }}
            className="interactive-element relative z-30 p-2.5 rounded-xl backdrop-blur-sm border transition-all duration-200 hover:scale-110 shadow-lg"
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              color: 'var(--theme-error)',
              borderColor: 'var(--theme-error)'
            }}
            title="Eliminar examen"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        )}
      </div>
    </div>
  );
}
