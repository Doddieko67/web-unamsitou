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


  const getDifficultyGradient = () => {
    switch (exam.dificultad) {
      case 'easy':
        return 'from-green-400 to-green-600';
      case 'medium':
        return 'from-yellow-400 to-orange-500';
      case 'hard':
        return 'from-red-400 to-red-600';
      case 'mixed':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getStatusColor = () => {
    switch (exam.estado) {
      case 'terminado':
        return 'text-green-600 bg-green-50';
      case 'en_progreso':
        return 'text-blue-600 bg-blue-50';
      case 'pendiente':
        return 'text-orange-600 bg-orange-50';
      case 'suspendido':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    // Modern Card Design
    <div
      className={`group relative transform transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
        isThisPinned 
          ? "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-lg shadow-purple-100" 
          : isSelected 
            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg shadow-blue-100" 
            : "bg-white border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl"
      } rounded-2xl overflow-hidden`}
    >
      {/* Difficulty Gradient Bar */}
      <div className={`h-1.5 bg-gradient-to-r ${getDifficultyGradient()}`}></div>
      
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
              className={`interactive-element relative z-10 w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-500 text-white shadow-md'
                  : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {isSelected && <i className="fas fa-check text-sm"></i>}
            </button>
          )}
          
          {/* Difficulty Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getDifficultyGradient()} shadow-sm`}>
            {difficultyInfo.text}
          </div>
          
          {/* Pin Status Indicator */}
          {isThisPinned && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-1.5 rounded-full shadow-sm">
              <i className="fas fa-star text-sm"></i>
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-xl text-gray-800 mb-3 leading-tight group-hover:text-indigo-700 transition-colors">
          {exam.titulo}
        </h3>

        {/* Meta Information */}
        <div className="space-y-3 mb-4">
          {/* Questions and Time */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <i className="fas fa-question-circle text-indigo-500"></i>
              <span className="font-medium">{exam.numero_preguntas} preguntas</span>
            </div>
            <div className="flex items-center space-x-1">
              <i className="fas fa-clock text-purple-500"></i>
              <span className="font-medium">
                {exam.tiempo_tomado_segundos 
                  ? `${Math.ceil(exam.tiempo_tomado_segundos / 60)} min` 
                  : '0 min'}
              </span>
            </div>
          </div>

          {/* Date */}
          <div className="flex items-center space-x-1 text-sm text-gray-500">
            <i className="fas fa-calendar-alt text-teal-500"></i>
            <span>{dateDisplay}</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          {exam.estado === "terminado" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-700">Puntuación</span>
                <span className={`font-bold text-lg ${scorePercentage >= 70 ? 'text-green-600' : scorePercentage >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {scorePercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${
                    scorePercentage >= 70 
                      ? 'from-green-400 to-green-600' 
                      : scorePercentage >= 40 
                        ? 'from-yellow-400 to-orange-500' 
                        : 'from-red-400 to-red-600'
                  } transition-all duration-500 ease-out rounded-full`}
                  style={{ width: `${scorePercentage}%` }}
                />
              </div>
            </div>
          ) : (
            <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${getStatusColor()}`}>
              <span className="mr-1">
                {exam.estado === 'en_progreso' ? '⚡' : 
                 exam.estado === 'pendiente' ? '⏳' : '⏸️'}
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
              isThisPinned
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white border-yellow-300 hover:from-yellow-500 hover:to-yellow-600'
                : 'bg-white/90 text-gray-600 border-gray-200 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300'
            }`}
            title={isThisPinned ? 'Desfijar examen' : 'Fijar examen'}
          >
            <i className={`fas fa-star text-sm ${isThisPinned ? 'animate-pulse' : ''}`}></i>
          </button>
        )}

        {/* View Button (for non-pinnable cards) */}
        {!isPinneable && (
          <Link to={`/examen/${exam.id}`} target="_blank" className="interactive-element relative z-30">
            <button className="p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-300 transition-all duration-200 hover:scale-110 shadow-lg">
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
            className="interactive-element relative z-30 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm text-red-500 border border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 hover:scale-110 shadow-lg"
            title="Eliminar examen"
          >
            <i className="fas fa-trash text-sm"></i>
          </button>
        )}
      </div>
    </div>
  );
}
