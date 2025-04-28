// src/components/RecentExamCard.tsx (o la ruta que uses)
import { Link } from "react-router"; // Asumiendo react-router-dom
import { ExamenData } from "./interfacesExam";
import Swal from "sweetalert2";

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

// Helper to get progress bar color based on percentage
const getProgressBarColor = (percentage: number): string => {
  if (percentage >= 70) return "bg-green-500";
  if (percentage >= 40) return "bg-yellow-500";
  return "bg-red-500";
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
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original if invalid format
  }
};

interface RecentExamCardProps {
  exam: ExamenData;
  onDelete: (id: string) => void;
  onPinToggle?: (questionIndex: string) => void;
  onEntireToggle: (examId: string) => void;
  isThisPinned?: boolean;
  isPinneable: boolean;
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
}: RecentExamCardProps) {
  // Usa las funciones auxiliares pasándole el examen
  const difficultyInfo = getDifficultyDisplay(exam.dificultad);
  const scorePercentage = calculateScorePercentage(exam);
  const progressBarColor = getProgressBarColor(scorePercentage);
  const dateDisplay = formatDateDisplay(exam.fecha_inicio);

  let progressContent;
  if (exam.estado === "terminado") {
    progressContent = (
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-2">
          {scorePercentage}%
        </span>
        <div className="w-16 bg-gray-200 rounded-full h-1.5">
          <div
            className={`${progressBarColor} h-1.5 rounded-full`}
            style={{ width: `${scorePercentage}%` }}
          />
        </div>
      </div>
    );
  } else if (exam.estado === "en_progreso") {
    progressContent = (
      <span className="text-sm font-medium text-yellow-600">En Progreso</span>
    );
  } else {
    progressContent = (
      <span className="text-sm font-medium text-gray-500">
        {exam.estado.charAt(0).toUpperCase() + exam.estado.slice(1)}
      </span>
    );
  }

  const Info = () => {
    return (
      <div>
        <div className="flex justify-between items-start mb-3">
          <span
            className={`difficulty-badge text-xs font-semibold px-2.5 py-0.5 rounded ${difficultyInfo.class}`}
          >
            {difficultyInfo.text}
          </span>
          <span className="text-xs text-gray-500">{dateDisplay}</span>
        </div>

        <h3 className="font-medium text-gray-800 mb-2">{exam.titulo}</h3>

        <p className="text-sm text-gray-600 mb-4">
          {exam.numero_preguntas} preguntas
          {exam.tiempo_tomado_segundos
            ? ` | Te tomo: ${Math.ceil(exam.tiempo_tomado_segundos / 60)} min`
            : " | Te tomo: 0 min"}
        </p>

        <div className="flex justify-between items-center">
          {progressContent}
          {/* Usa Link para navegar a la página de detalles del examen */}
        </div>
      </div>
    );
  };
  return (
    // La tarjeta individual
    <div
      className={`${isThisPinned ? "bg-purple-100" : "bg-white"} relative exam-card border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition duration-200 ease-in-out`}
    >
      <div className="flex flex-row gap-1 absolute bottom-2 right-2">
        {isPinneable ? (
          <button
            onClick={() => onPinToggle && onPinToggle(exam.id)}
            className="fas fa-font-awesome right-0 -top-1 hover:shadow-lg transition-all hover:shadow-pink-400 cursor-pointer text-pink-600 rounded-lg p-2 border-pink-300 bg-pink-100 border-2"
          ></button>
        ) : (
          <Link to={`/examen/${exam.id}`} target="_blank">
            <i className="fas fa-eye hover:shadow-lg transition-all hover:shadow-yellow-400 cursor-pointer text-yellow-600 rounded-lg p-2 border-yellow-300 bg-yellow-100 border-2"></i>
          </Link>
        )}
        {isPinneable && (
          <button
            onClick={async () => {
              const confirmar = await Swal.fire({
                title: "¿Estás seguro?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminar examen",
                cancelButtonText: "Cancelar",
              }).then((result) => {
                return result.isConfirmed;
              });

              if (!confirmar) return; // Si el usuario cancela, salir
              onDelete(exam.id);
            }}
            className="right-0 -top-1 hover:shadow-lg transition-all hover:shadow-red-400 cursor-pointer text-red-600 rounded-lg p-2 border-red-300 bg-red-100 border-2  fas fa-trash"
          ></button>
        )}
      </div>
      <div onClick={() => onEntireToggle(exam.id)} className="cursor-pointer">
        {Info()}
      </div>
    </div>
  );
}
