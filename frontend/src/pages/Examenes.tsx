import { ExamBasedOnHistory } from "../components/ExamBasedOnHistory";
import { ExamRecents } from "../components/Main/ExamRecents";

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
  dificultad: string;
  estado: "pendiente" | "en_progreso" | "terminado" | "suspendido"; // Usa los tipos de estado correctos
  numero_preguntas: number;
  datos: Pregunta[]; // Asume que la columna 'datos' JSONB contiene un array de Pregunta
  fecha_inicio: string | null;
  tiempo_limite_segundos: number;
  tiempo_tomado_segundos?: number; // Añadir esto si no estaba
  respuestas_usuario?: { [key: number]: number }; // Añadir esto si no estaba
}

export function Examenes() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ExamRecents></ExamRecents>
      <ExamBasedOnHistory></ExamBasedOnHistory>
    </main>
  );
}
