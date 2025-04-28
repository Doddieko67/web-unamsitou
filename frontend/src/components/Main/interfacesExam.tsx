export interface Pregunta {
  id: number;
  pregunta: string;
  opciones: string[];
  correcta: number;
  respuesta?: number;
  feedback?: string;
}

export interface ExamenData {
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
  previsualizacion?: boolean;
  descripcion?: string;
  is_pinned?: boolean;
}
