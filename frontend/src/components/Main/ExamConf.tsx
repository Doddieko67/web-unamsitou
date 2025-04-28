import { useState, useCallback } from "react";
import { ExamButton } from "../ExamButton";
import { DifficultExam } from "./DifficultExam";
import { Materias } from "./Materias";
import { Personalization } from "./Personalization";
import { QuestionConf } from "./QuestionConf";
import { useNavigate } from "react-router";
import { UserAuth } from "../../context/AuthContext";
import { TimerConf } from "../TimerConf";

// Importar SweetAlert2
import Swal from "sweetalert2";

// Tipos
interface Subject {
  name: string;
  icon: string;
  description: string;
  colorClasses: { bg: string; text: string; iconBg: string };
}
type Difficulty = "easy" | "medium" | "hard" | "mixed";

// Lista inicial de materias (podría venir de otro lugar)
const initialAvailableSubjects: Subject[] = [
  {
    name: "Matemáticas",
    icon: "fas fa-square-root-alt",
    description: "Álgebra, cálculo, geometría",
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
    colorClasses: {
      bg: "bg-purple-100",
      text: "text-purple-800",
      iconBg: "bg-purple-100",
    },
  },
  // ... puedes añadir más materias iniciales aquí
];

export function ExamConf() {
  const { session } = UserAuth(); // Asumiendo que UserAuth devuelve un objeto con 'session'
  const navigate = useNavigate();

  // --- Estados ---
  // Estado para TODAS las materias disponibles (iniciales + personalizadas)
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>(
    initialAvailableSubjects,
  );
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty | null>(null);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hour, setHour] = useState<number>(0); // Inicializar en 0 horas
  const [minute, setMinute] = useState<number>(30); // Inicializar en 30 minutos (ejemplo)
  const [second, setSecond] = useState<number>(0); // Inicializar en 0 segundos

  // --- Handlers ---

  // Maneja la selección/deselección de materias
  const handleSubjectToggle = useCallback((subjectName: string) => {
    setSelectedSubjects(
      (prev) =>
        prev.includes(subjectName)
          ? prev.filter((s) => s !== subjectName) // Deseleccionar si ya está
          : [...prev, subjectName], // Seleccionar si no está
    );
  }, []); // Dependencias vacías porque no usa estados externos

  // Maneja la adición de una materia personalizada
  const handleAddCustomSubject = useCallback((newSubject: Subject) => {
    // Añadir la nueva materia a la lista de disponibles
    setAvailableSubjects((prev) => {
      // Evitar duplicados por nombre (ignorando mayúsculas/minúsculas)
      if (
        prev.some((s) => s.name.toLowerCase() === newSubject.name.toLowerCase())
      ) {
        // Podrías mostrar un Swal aquí también si quieres
        Swal.fire({
          icon: "info",
          title: "Materia Existente",
          text: `La materia "${newSubject.name}" ya está en la lista.`,
          toast: true, // Mostrar como toast
          position: "top-end", // Posición en la esquina superior derecha
          showConfirmButton: false,
          timer: 3000, // Ocultar después de 3 segundos
          timerProgressBar: true,
        });
        return prev; // Devuelve el estado anterior sin cambios
      }
      // Añadir la nueva materia y mantener el orden inicial al principio si es necesario
      return [...prev, newSubject]; // Añade al final
    });
    // Opcionalmente, seleccionar automáticamente la nueva materia añadida
    // Retrasamos la selección un poco para asegurar que availableSubjects se haya actualizado si es necesario (aunque useState es síncrono en la mayoría de los casos, a veces es útil para evitar race conditions visuales)
    setTimeout(() => {
      setSelectedSubjects((prev) => {
        // Evitar añadir si ya estaba seleccionada por alguna razón
        if (!prev.includes(newSubject.name)) {
          return [...prev, newSubject.name];
        }
        return prev;
      });
    }, 0); // Ejecutar al final del ciclo de eventos actual
  }, []); // Dependencias vacías

  const handleQuestionCountChange = useCallback((count: number) => {
    setQuestionCount(count);
  }, []);

  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  }, []);

  const handleFineTuningChange = useCallback((text: string) => {
    setFineTuning(text);
  }, []);

  // Handler principal para generar el examen
  const handleGenerateExam = async () => {
    // --- Validación Inicial con Swal ---
    if (!selectedSubjects.length || selectedDifficulty === null) {
      Swal.fire({
        icon: "warning",
        title: "Configuración Incompleta",
        text: "Por favor, selecciona al menos una materia y un nivel de dificultad para generar el examen.",
        confirmButtonColor: "#3085d6", // Color azul estándar de Swal
      });
      return; // Detiene la ejecución si la validación falla
    }

    setIsGenerating(true); // Habilita el indicador de carga

    try {
      // --- Construir el PROMPT para el backend ---
      let promptText = `Genera un examen de ${questionCount} preguntas.\n`;

      // Encontrar los objetos Subject completos para las materias seleccionadas
      const selectedSubjectsDetails = selectedSubjects
        .map((subjectName) =>
          // Busca el objeto Subject completo en la lista de disponibles
          availableSubjects.find((s) => s.name === subjectName),
        )
        // Filtra por si acaso alguna materia seleccionada no se encuentra (no debería pasar con la lógica actual)
        .filter((subject): subject is Subject => subject !== undefined); // Usar un type guard para asegurar que no son undefined

      // Formatear los detalles de cada materia para el prompt
      const formattedSubjectsForPrompt = selectedSubjectsDetails.map(
        (subject) =>
          // Formatea como "Nombre (Descripción)". Puedes ajustar el formato si lo prefieres.
          `${subject.name} (${subject.description})`,
      );

      // Unir los strings formateados para el prompt
      promptText += `Materias a cubrir: ${formattedSubjectsForPrompt.join(
        ", ",
      )}.\n`;
      promptText += `Nivel de dificultad general: ${selectedDifficulty}.\n`;
      if (fineTuning && fineTuning.trim() !== "") {
        promptText += `Instrucciones adicionales: ${fineTuning.trim()}.\n`;
      }

      // Calcular el tiempo límite total en segundos
      const tiempoLimiteSegundos = hour * 3600 + minute * 60 + second;
      // Opcionalmente, puedes añadir esto al prompt si el modelo necesita saberlo en texto
      // if (tiempoLimiteSegundos > 0) {
      //   promptText += `El examen tiene un tiempo límite de ${hour} horas, ${minute} minutos y ${second} segundos.\n`;
      // }

      // --- Llama al backend para generar el examen ---
      const response = await fetch(
        // Asegúrate de que la URL es correcta para tu API
        "http://localhost:3000/api/generate-content",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Incluye el token de autorización si es necesario
            authorization: `Bearer ${session?.access_token}`, // Usa encadenamiento opcional por si session es null/undefined
          },
          // Envía los datos necesarios al backend
          body: JSON.stringify({
            prompt: promptText, // Envía el prompt de texto construido
            dificultad: selectedDifficulty, // Envía la dificultad como dato estructurado si el backend lo necesita
            tiempo_limite_segundos: tiempoLimiteSegundos, // Envía el tiempo límite
            materias_seleccionadas: selectedSubjectsDetails.map((s) => ({
              // Envía detalles estructurados de las materias
              name: s.name,
              description: s.description,
            })),
            cantidad_preguntas: questionCount, // Envía la cantidad de preguntas
            instrucciones_adicionales: fineTuning.trim(), // Envía las instrucciones adicionales
            // Puedes añadir más datos estructurados si tu backend los espera
          }),
        },
      );

      // --- Manejo de la respuesta del backend ---
      if (!response.ok) {
        // Intenta leer el mensaje de error del cuerpo de la respuesta si está disponible
        const errorBody = await response.json().catch(() => null); // Intenta parsear JSON, ignora errores si no es JSON
        const errorMessage =
          errorBody?.message ||
          `Error del servidor: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage); // Lanza un error con un mensaje más específico
      }

      const result = await response.json();

      // Verifica si la respuesta contiene el ID del examen
      if (!result || !result.examId) {
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      console.log("Examen generado y guardado con ID:", result.examId);

      // --- NAVEGACIÓN A LA PÁGINA DEL EXAMEN ---
      // Navega a la ruta con el ID del examen generado.
      // No se muestra un Swal de éxito aquí porque la navegación es la indicación visual de éxito.
      navigate(`/examen/${result.examId}`);
    } catch (error) {
      // Especifica 'any' o un tipo de error más específico si lo conoces
      // --- Manejo de Errores con Swal ---
      console.error("Error en la llamada de generación:", error); // Loguea el error completo para debugging
      Swal.fire({
        icon: "error",
        title: "Error al Generar Examen",
        text: `Hubo un problema al intentar generar tu examen. Por favor, inténtalo de nuevo.`,
        confirmButtonColor: "#d33", // Color rojo estándar de Swal
      });
    } finally {
      // Este bloque siempre se ejecuta, ya sea que haya éxito o error
      setIsGenerating(false); // Deshabilita el indicador de carga
    }
  };

  // Determina si el botón de generar debe estar deshabilitado
  const isGenerateDisabled =
    selectedSubjects.length === 0 ||
    selectedDifficulty === null ||
    isGenerating;

  return (
    <div
      id="new-exam-section"
      className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 mb-8 border border-gray-200"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">
        Configura tu Examen Personalizado
      </h2>

      {/* Pasar el estado ACTUALIZADO de availableSubjects y el NUEVO handler */}
      <Materias
        availableSubjects={availableSubjects} // Pasa la lista completa de materias
        selectedSubjects={selectedSubjects} // Pasa las materias seleccionadas
        onSubjectToggle={handleSubjectToggle} // Pasa el handler para (des)seleccionar
        onAddCustomSubject={handleAddCustomSubject} // Pasa el handler para añadir nueva materia
      />

      <QuestionConf
        questionCount={questionCount}
        onQuestionCountChange={handleQuestionCountChange}
      />

      <DifficultExam
        selectedDifficulty={selectedDifficulty}
        onDifficultySelect={handleDifficultySelect}
      />

      {/* Componente para configurar el temporizador */}
      <TimerConf
        hour={hour}
        setHour={setHour}
        minute={minute}
        setMinute={setMinute}
        second={second}
        setSecond={setSecond}
      />

      <Personalization
        fineTuning={fineTuning}
        onFineTuningChange={handleFineTuningChange}
      />

      {/* Botón para generar el examen, deshabilitado si la configuración no está completa o está generando */}
      <ExamButton
        onGenerateClick={handleGenerateExam}
        disabled={isGenerateDisabled}
      />

      {/* Indicador visual mientras se genera el examen */}
      {isGenerating && (
        <div className="mt-4 text-center text-sm text-indigo-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>{" "}
          {/* Icono de spinner (requiere FontAwesome) */}
          Generando tu examen... esto puede tardar unos momentos.
        </div>
      )}
    </div>
  );
}
