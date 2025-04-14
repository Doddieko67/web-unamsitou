import React, { useState, useCallback, DragEvent } from "react";
import { ExamButton } from "./ExamButton";
// Importa el componente de dificultad
import { DifficultExam } from "./Main/DifficultExam"; // Asegúrate que la ruta sea correcta

// Tipo para la dificultad (puede ser null si quieres un estado inicial sin selección)
type GeneralDifficulty = "mixed" | "easy" | "medium" | "hard";

export function ExamQuestions() {
  // --- Estados del Componente ---
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  // const [questionType, setQuestionType] = useState<QuestionGenerationType>('auto'); // <--- ELIMINADO
  const [difficulty, setDifficulty] = useState<GeneralDifficulty>("mixed"); // Mantenemos 'auto' como default o null si prefieres
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  // --- Handlers ---
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    /* ... (sin cambios) ... */
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFiles(event.target.files);
      setPastedText("");
      console.log("Archivos seleccionados:", event.target.files);
    } else {
      setSelectedFiles(null);
    }
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* ... (sin cambios) ... */
    setPastedText(event.target.value);
    if (event.target.value) {
      setSelectedFiles(null);
    }
  };

  // Handler para la dificultad (del nuevo componente)
  const handleDifficultySelect = useCallback(
    (selectedDiff: GeneralDifficulty) => {
      setDifficulty(selectedDiff);
    },
    [],
  );

  // --- Handlers para Drag and Drop (sin cambios) ---
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */ event.preventDefault();
    setIsDraggingOver(true);
  }, []);
  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */ event.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      setSelectedFiles(event.dataTransfer.files);
      setPastedText("");
      console.log("Archivos soltados:", event.dataTransfer.files);
    }
  }, []);

  // --- Handler para el botón de Generar (Actualizado) ---
  const handleGenerate = async () => {
    if (!selectedFiles && !pastedText.trim()) {
      alert(
        "Por favor, selecciona archivos o pega texto para generar el examen.",
      );
      return;
    }
    if (!difficulty) {
      // Añadir validación si permites null como estado inicial
      alert("Por favor, selecciona un nivel de dificultad.");
      return;
    }

    setIsLoading(true);
    console.log("Generando examen desde contenido...");

    let requestBody: FormData | string;
    const headers: HeadersInit = {};

    if (selectedFiles && selectedFiles.length > 0) {
      console.log("Preparando FormData para archivos...");
      const formData = new FormData();
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append("files", selectedFiles[i]);
      }
      // Ya NO añadimos questionType
      formData.append("difficulty", difficulty); // Añadimos la dificultad seleccionada
      requestBody = formData;
    } else {
      console.log("Preparando JSON para texto...");
      const textData = {
        text: pastedText,
        // Ya NO incluimos questionType
        difficulty: difficulty, // Incluimos la dificultad seleccionada
      };
      requestBody = JSON.stringify(textData);
      headers["Content-Type"] = "application/json";
    }
    // headers['Authorization'] = `Bearer ${tu_token}`;

    try {
      const response = await fetch("/api/generate-from-content", {
        method: "POST",
        headers: headers,
        body: requestBody,
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
      console.log("Respuesta de generación desde contenido:", result);
      alert("¡Generación completada! Revisa la consola.");
    } catch (error) {
      console.error("Error al generar desde contenido:", error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // El botón se deshabilita si falta contenido O si falta dificultad (si permites null inicial)
  const isGenerateDisabled =
    (!selectedFiles && !pastedText.trim()) || !difficulty || isLoading;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden p-6 sm:p-8 mb-8 border border-gray-200">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 border-b pb-3">
        Genera Exámenes desde Contenido
      </h2>

      {/* --- Sección de Carga de Archivos (Sin cambios) --- */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors duration-200 ${
          isDraggingOver
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* ... Contenido del área de drop sin cambios ... */}
        <div className="flex justify-center mb-4">
          <i
            className={`fas fa-file-upload text-4xl ${isDraggingOver ? "text-indigo-600 animate-bounce" : "text-indigo-400"}`}
          ></i>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Arrastra y suelta tus archivos aquí
        </h3>
        <p className="text-sm text-gray-500 mb-4">o</p>
        <label
          htmlFor="file-upload"
          className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2 rounded-md font-medium inline-block hover:from-indigo-700 hover:to-purple-700 transition shadow-sm hover:shadow-md"
        >
          <i className="fas fa-folder-open mr-2"></i> Seleccionar archivos
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        />
        <p className="text-xs text-gray-500 mt-4">Soportados: PDF, DOCX, TXT</p>
      </div>

      {/* Mostrar archivos seleccionados (Sin cambios) */}
      {selectedFiles && selectedFiles.length > 0 /* ... */ && (
        <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Archivos seleccionados:
          </h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700 max-h-32 overflow-y-auto">
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>
                {" "}
                {file.name}{" "}
                <span className="text-gray-400 text-xs">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>{" "}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center my-4 text-gray-500 font-semibold">O</div>

      {/* --- Sección de Pegar Texto (Sin cambios) --- */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
        {/* ... Contenido del textarea sin cambios ... */}
        <label
          htmlFor="pasted-text-area"
          className="block text-lg font-medium text-gray-700 mb-3"
        >
          {" "}
          Pega tu texto directamente{" "}
        </label>
        <textarea
          id="pasted-text-area"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          rows={6}
          placeholder="Pega aquí el contenido..."
          value={pastedText}
          onChange={handleTextChange}
        ></textarea>
      </div>

      {/* --- Sección de Configuración (Ahora solo Dificultad) --- */}
      <div className="mb-6 border-t pt-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Configuración de procesamiento
        </h3>
        {/* Usamos el componente importado */}
        <DifficultExam
          selectedDifficulty={difficulty}
          onDifficultySelect={handleDifficultySelect}
        />
        {/* El select de tipo de pregunta ha sido eliminado */}
      </div>

      {/* --- Botón de Generar (Sin cambios) --- */}
      <ExamButton
        onGenerateClick={handleGenerate}
        disabled={isGenerateDisabled}
      />
      {isLoading /* ... Indicador de carga sin cambios ... */ && (
        <div className="mt-4 text-center text-sm text-indigo-600">
          {" "}
          <i className="fas fa-spinner fa-spin mr-2"></i> Procesando
          contenido...{" "}
        </div>
      )}
    </div>
  );
}
