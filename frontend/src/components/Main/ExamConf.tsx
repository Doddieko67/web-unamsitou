import { useState, useCallback } from "react";
import { ExamButton } from "../ExamButton";
import { DifficultExam } from "./DifficultExam";
import { Materias } from "./Materias";
import { Personalization } from "./Personalization";
import { QuestionConf } from "./QuestionConf";

// Tipos
interface Subject {
  name: string;
  icon: string;
  description: string;
  colorClasses: { bg: string; text: string; iconBg: string };
}
type Difficulty = "easy" | "medium" | "hard" | "mixed";
interface ExamConfiguration {
  subjects: string[];
  questionCount: number;
  difficulty: Difficulty | null;
  fineTuning: string;
}

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
];

export function ExamConf() {
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

  // --- Handlers ---

  const handleSubjectToggle = useCallback((subjectName: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(subjectName)
        ? prev.filter((s) => s !== subjectName)
        : [...prev, subjectName],
    );
  }, []);

  // NUEVO Handler para añadir materia personalizada
  const handleAddCustomSubject = useCallback((newSubject: Subject) => {
    // Añadir la nueva materia a la lista de disponibles
    setAvailableSubjects((prev) => {
      // Comprobación extra por si acaso
      if (
        prev.some((s) => s.name.toLowerCase() === newSubject.name.toLowerCase())
      ) {
        return prev;
      }
      return [...prev, newSubject];
    });
    // Opcionalmente, seleccionar automáticamente la nueva materia añadida
    setSelectedSubjects((prev) => [...prev, newSubject.name]);
  }, []); // Depende de cómo gestiones la adición, podría necesitar dependencias si interactúa con otras cosas

  const handleQuestionCountChange = useCallback((count: number) => {
    /* ... */ setQuestionCount(count);
  }, []);
  const handleDifficultySelect = useCallback((difficulty: Difficulty) => {
    /* ... */ setSelectedDifficulty(difficulty);
  }, []);
  const handleFineTuningChange = useCallback((text: string) => {
    /* ... */ setFineTuning(text);
  }, []);
  const handleGenerateExam = async () => {
    /* ... (sin cambios en la lógica interna de envío) ... */
    if (!selectedSubjects.length || !selectedDifficulty) {
      alert(
        "Por favor, selecciona al menos una materia y un nivel de dificultad.",
      );
      return;
    }
    setIsGenerating(true);

    const examConfig: ExamConfiguration = {
      subjects: selectedSubjects,
      questionCount: questionCount,
      difficulty: selectedDifficulty,
      fineTuning: fineTuning.trim(),
    };

    console.log("Configuración a enviar:", examConfig);

    try {
      const response = await fetch("/api/generate-exam-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examConfig),
      });
      if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          console.log(jsonError);
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      console.log("Respuesta del backend:", result);
      alert("¡Examen generado exitosamente!");
    } catch (error) {
      console.error("Error al generar el examen:", error);
      alert(`Error al generar el examen: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const isGenerateDisabled =
    selectedSubjects.length === 0 || !selectedDifficulty || isGenerating;

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
        availableSubjects={availableSubjects} // Pasa la lista completa
        selectedSubjects={selectedSubjects}
        onSubjectToggle={handleSubjectToggle}
        onAddCustomSubject={handleAddCustomSubject} // Pasa la nueva función
      />

      <QuestionConf
        questionCount={questionCount}
        onQuestionCountChange={handleQuestionCountChange}
      />

      <DifficultExam
        selectedDifficulty={selectedDifficulty}
        onDifficultySelect={handleDifficultySelect}
      />

      <Personalization
        fineTuning={fineTuning}
        onFineTuningChange={handleFineTuningChange}
      />

      <ExamButton
        onGenerateClick={handleGenerateExam}
        disabled={isGenerateDisabled}
      />

      {isGenerating /* ... (indicador de carga sin cambios) ... */ && (
        <div className="mt-4 text-center text-sm text-indigo-600">
          <i className="fas fa-spinner fa-spin mr-2"></i>
          Generando tu examen... por favor espera.
        </div>
      )}
    </div>
  );
}
