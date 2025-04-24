import { useEffect, useState } from "react"; // Import useEffect and useState
import { UserAuth } from "../../context/AuthContext"; // Ensure this path is correct
import { supabase } from "../../supabase.config";
import { Link } from "react-router";
// Assuming your Supabase client is imported like this
// import { supabase } from '../../utils/supabaseClient'; // <-- Adjust this path

// Define the interfaces (already provided by the user)
interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
  feedback?: string;
}

interface ExamenData {
  id: string; // UUID
  user_id: string; // UUID
  titulo: string;
  dificultad: "easy" | "medium" | "hard" | "mixed"; // Use string literals for difficulty
  estado: "pendiente" | "en_progreso" | "terminado" | "suspendido";
  numero_preguntas: number;
  datos: Pregunta[]; // Assumes the 'datos' JSONB column contains an array of Pregunta
  fecha_inicio: string | null; // ISO string or similar
  tiempo_limite_segundos: number;
  tiempo_tomado_segundos?: number;
  respuestas_usuario?: { [key: number]: number }; // Maps question ID to user's answer index
  // You might want to add fecha_terminacion if you have it
}

// --- Helper Functions (outside the component) ---

// Helper to get display text and class for difficulty
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
    const userAnswer = exam.respuestas_usuario?.[pregunta.id];
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

// --- React Component ---

export function ExamRecents() {
  const { user } = UserAuth(); // Only need the user from the context
  const [recentExams, setRecentExams] = useState<ExamenData[]>([]); // State for exams
  const [isLoading, setIsLoading] = useState(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for errors

  // Fetch exams when the component mounts or user changes
  useEffect(() => {
    const fetchRecentExams = async () => {
      if (!user) {
        // If no user, clear exams, set loading false, maybe show a message
        setRecentExams([]);
        setIsLoading(false);
        setError(null); // No user is not necessarily an error state for fetching, maybe just no exams
        console.log("No user authenticated, cannot fetch recent exams.");
        return; // Exit if no user
      }

      setIsLoading(true);
      setError(null); // Clear previous errors

      try {
        console.log(`Fetching recent exams for user: ${user.id}`);
        // Assume 'supabase' client is available (imported or globally configured)
        const { data, error } = await supabase
          .from("examenes")
          .select("*") // Select all columns needed
          .eq("user_id", user.id) // Filter by the current user's ID
          .order("fecha_inicio", { ascending: false }); // Order by start date, newest first

        if (error) {
          console.error("Error fetching recent exams:", error);
          setError(`Error al cargar los exámenes recientes: ${error.message}`);
          setRecentExams([]); // Clear previous data on error
        } else {
          console.log("Recent exams fetched:", data);
          // Ensure data is treated as ExamenData[]
          setRecentExams(data as ExamenData[]);
        }
      } catch (err) {
        console.error("Unexpected error fetching recent exams:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Ocurrió un error desconocido al cargar los exámenes.",
        );
        setRecentExams([]); // Clear previous data on unexpected error
      } finally {
        setIsLoading(false); // Always set loading to false when done
      }
    };

    fetchRecentExams();
  }, [user]); // Depend on 'user' so it refetches if the user object changes (e.g., login/logout)

  // --- Render Logic ---

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Tus exámenes recientes
        </h2>
        {/* Consider making this link dynamic to a full list page */}
        {/* Or hide it if there are no exams */}
        {recentExams.length > 0 && (
          <a
            href="#" // Replace with actual link to All Exams page
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Ver todo
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Show loading state */}
        {isLoading && (
          <p className="text-gray-600 text-center">Cargando exámenes...</p>
        )}

        {/* Show error state */}
        {!isLoading && error && (
          <p className="text-red-600 col-span-full text-center">
            Error: {error}
          </p>
        )}

        {/* Check if there are exams to display after loading */}
        {!isLoading && !error && recentExams.length === 0 ? (
          <p className="text-gray-600 h-full col-span-full text-center flex items-center align-middle">
            No tienes exámenes recientes.
          </p>
        ) : (
          // Map through the recent exams array to render each card
          !isLoading &&
          !error &&
          recentExams.map((exam) => {
            // Only map if not loading and no error
            const difficultyInfo = getDifficultyDisplay(exam.dificultad);
            const scorePercentage = calculateScorePercentage(exam); // Only for 'terminado'
            const progressBarColor = getProgressBarColor(scorePercentage);
            // Use fecha_inicio for sorting, but maybe display fecha_terminacion if available?
            // Sticking with fecha_inicio for now as it's in the data
            const dateDisplay = formatDateDisplay(exam.fecha_inicio);

            // Determine what to show in the progress section based on state
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
                      style={{ width: `${scorePercentage}%` }} // Dynamic width
                    ></div>
                  </div>
                </div>
              );
            } else if (exam.estado === "en_progreso") {
              // You could potentially show progress based on answered questions count
              // e.g., `${Object.keys(exam.respuestas_usuario || {}).length} / ${exam.numero_preguntas} respondidas`
              progressContent = (
                <span className="text-sm font-medium text-yellow-600">
                  En Progreso
                </span>
              );
            } else {
              // pendiente, suspendido, etc.
              progressContent = (
                <span className="text-sm font-medium text-gray-500">
                  {exam.estado.charAt(0).toUpperCase() + exam.estado.slice(1)}{" "}
                  {/* Capitalize first letter */}
                </span>
              );
            }

            return (
              <div
                key={exam.id} // Important for lists in React
                className="exam-card bg-white border border-gray-200 rounded-lg p-5 hover:border-indigo-300 transition duration-200 ease-in-out"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    {/* Difficulty badge */}
                    <span
                      className={`difficulty-badge text-xs font-semibold px-2.5 py-0.5 rounded ${difficultyInfo.class}`}
                    >
                      {difficultyInfo.text}
                    </span>
                  </div>
                  {/* Date/Status */}
                  <span className="text-xs text-gray-500">{dateDisplay}</span>
                </div>

                {/* Title */}
                <h3 className="font-medium text-gray-800 mb-2">
                  {exam.titulo}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {exam.numero_preguntas} preguntas
                  {exam.tiempo_limite_segundos > 0 &&
                    ` | Límite: ${Math.ceil(exam.tiempo_limite_segundos / 60)} min`}
                </p>

                {/* Progress / Status and Details Button */}
                <div className="flex justify-between items-center">
                  {progressContent}{" "}
                  {/* Dynamically display progress or status */}
                  {/* Consider making this a dynamic link to the exam page using a routing library */}
                  {/* Example with React Router or Next.js: */}
                  <Link
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                    to={`/examen/${exam.id}`}
                  >
                    Ver detalles
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
