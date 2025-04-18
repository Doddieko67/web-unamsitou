import React, { useState, useCallback, DragEvent } from "react";
import { ExamButton } from "./ExamButton";
// Importa el componente de dificultad
// import { DifficultExam } from "./Main/DifficultExam"; // Asegúrate que la ruta sea correcta
import { Personalization } from "./Main/Personalization";
import { UserAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";

// Tipo para la dificultad (puede ser null si quieres un estado inicial sin selección)
// type GeneralDifficulty = "mixed" | "easy" | "medium" | "hard";

export function ExamQuestions() {
  // --- Estados del Componente ---
  const navigate = useNavigate();
  const [pastedText, setPastedText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);
  const [fineTuning, setFineTuning] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const { session } = UserAuth();

  // --- Handlers ---
  const handleDeleteFile = (indexToDelete: number) => {
    const updatedFiles = files.filter((_, index) => index !== indexToDelete);
    setFiles(updatedFiles);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newFiles: FileList = event.target.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        if (prevFiles) {
          return [...prevFiles, ...newFilesArray];
        } else {
          return newFilesArray;
        }
      });
    }
  };
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    /* ... (sin cambios) ... */
    setPastedText(event.target.value);
  };

  // --- Handlers para Drag and Drop (sin cambios) ---
  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);
  const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);
  const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
    /* ... */
    event.preventDefault();
    setIsDraggingOver(false);
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const newFiles: FileList = event.dataTransfer.files;
      setFiles((prevFiles) => {
        // Convert new files to array
        const newFilesArray: File[] = Array.from(newFiles);
        if (prevFiles) {
          return [...prevFiles, ...newFilesArray];
        } else {
          return newFilesArray;
        }
      });
      console.log("Archivos soltados:", event.dataTransfer.files);
    }
  }, []);

  const handleFineTuningChange = useCallback((text: string) => {
    /* ... */
    setFineTuning(text);
  }, []);

  // --- Handler para el botón de Generar (Actualizado) ---
  const handleGenerate = async () => {
    if (files.length == 0 && !pastedText.trim()) {
      Swal.fire({
        title: "Faltan archivos/texto",
        icon: "error",
        text: "Por favor, selecciona archivos o pega texto para generar el examen.",
      });
      return;
    }

    setIsLoading(true);

    let requestBody: FormData | null = null;

    let promptText = ``;
    if (pastedText && pastedText.trim() !== "") {
      promptText += `Contenido: ${pastedText}.\n`;
    }
    if (fineTuning && fineTuning.trim() !== "") {
      promptText += `Instrucciones adicionales: ${fineTuning.trim()}.\n`;
    }

    if (files.length > 0) {
      console.log("Preparando FormData para archivos...");
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("fuentes", files[i]);
      }

      formData.append("prompt", promptText);
      requestBody = formData;
      console.log(requestBody);
    }
    console.log("Preparando JSON para texto...");

    // Configure Toast without a timer
    const Toast = Swal.mixin({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      // timer: 3000,  Remove the timer
      // timerProgressBar: true, // Remove the progress bar
      didOpen: (toast) => {
        toast.addEventListener("mouseenter", Swal.stopTimer);
        toast.addEventListener("mouseleave", Swal.resumeTimer);
      },
    });
    Toast.fire({
      html: `<span className="loader"></span>`,
      title: "Generando el examen",
      allowOutsideClick: false, // Prevent closing by clicking outside
      stopKeydownPropagation: false, // Prevent keydown events from propagating
      //allowEscapeKey: false, // To disable ESC key, it requires stopKeydownPropagation be false
    });
    try {
      const response = await fetch("http://localhost:3000/api/upload_files", {
        method: "POST",
        headers: {
          authorization: `Bearer ${session && session.access_token}`,
        },
        body: requestBody,
      });
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });

      if (!response.ok) {
        let errorMsg = `Error del servidor: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          console.log(jsonError);
          Swal.close();
          Toast.fire({
            icon: "error",
            title: "Error del servidor interno",
          });
        }
        throw new Error(errorMsg);
      }
      const result = await response.json();
      console.log("Respuesta de generación desde contenido:", result);

      if (!result.examId) {
        Swal.close();
        Toast.fire({
          icon: "error",
          title: "La respuesta del servidor no contenia un ID de examen valido",
        });
        throw new Error(
          "La respuesta del servidor no contenía un ID de examen válido.",
        );
      }

      console.log("Examen generado y guardado con ID:", result.examId);

      // --- NAVEGACIÓN CON ID ---
      navigate(`/examen/${result.examId}`); // Navega a la ruta con el ID del examen

      Toast.fire({
        icon: "success",
        title: "Examen generado con exito",
      });
    } catch (error) {
      console.error("Error al generar desde contenido:", error);
      alert(`Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  type FileTypeIcons = {
    [key: string]: string; // string key and string value
  };

  const fileTypeIcons: FileTypeIcons = {
    "application/pdf": "fa-file-pdf bg-red-100 text-red-600",
    "image/": "fa-image bg-blue-100 text-blue-600",
    "video/": "fa-video bg-green-100 text-green-600",
  };

  // Function to determine the appropriate icon class based on file type
  function getFileIconClass(fileType: string): string {
    for (const typePattern in fileTypeIcons) {
      if (fileType.startsWith(typePattern)) {
        return fileTypeIcons[typePattern];
      }
    }
    // Default icon if no match is found:
    return "fa-file bg-gray-200 text-gray-600"; // Or some other default
  }

  // El botón se deshabilita si falta contenido O si falta dificultad (si permites null inicial)
  const isGenerateDisabled =
    (files.length == 0 && !pastedText.trim()) || isLoading; //|| !difficulty || isLoading;

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
            className={`fas fa-file-upload text-4xl ${
              isDraggingOver
                ? "text-indigo-600 animate-bounce"
                : "text-indigo-400"
            }`}
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
        />
      </div>
      {/* Mostrar archivos seleccionados (Sin cambios) */}
      {files && files.length > 0 /* ... */ && (
        <div className="mb-6 p-3 bg-gray-50 rounded-md border border-gray-200">
          <h4 className="text-sm font-medium text-gray-600 mb-2">
            Archivos seleccionados:
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-700 max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
            {Array.from(files).map((file, index) => (
              <li
                key={index}
                className="transition-all duration-300 flex flex-row justify-between border-2 p-2 items-center rounded-lg hover:bg-gray-100"
              >
                <div className="flex flex-row  items-center gap-2">
                  <i
                    className={`fas ${getFileIconClass(file.type)} p-2 m-auto rounded-md`}
                  ></i>
                  <div></div>
                  {file.name}
                  <span className="text-gray-400 text-xs">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </span>{" "}
                </div>
                <button
                  className="fas fa-xmark bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200 transition-all duration-300"
                  onClick={() => {
                    handleDeleteFile(index);
                  }}
                ></button>
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
      <Personalization
        fineTuning={fineTuning}
        onFineTuningChange={handleFineTuningChange}
      />
      {/* --- Botón de Generar (Sin cambios) --- */}
      <ExamButton
        onGenerateClick={handleGenerate}
        disabled={isGenerateDisabled}
      />
      nome vez?
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
