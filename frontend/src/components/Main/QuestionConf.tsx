interface QuestionConfProps {
  questionCount: number;
  onQuestionCountChange: (count: number) => void;
  // Podrías pasar selectedSubjects si quieres lógica condicional aquí
  // selectedSubjects: string[];
}

export function QuestionConf({
  questionCount,
  onQuestionCountChange,
}: QuestionConfProps) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        2. Configura las preguntas
      </h3>

      {/* Contenedor para configuración por materia (funcionalidad pendiente) */}
      {/* <div
        className="bg-gray-50 rounded-lg p-4 mb-4"
        id="questions-config-container"
      >
        <p className="text-gray-500 text-sm">
          Aquí podrías ajustar preguntas por materia seleccionada.
        </p>
      </div> */}

      <div className="flex items-center bg-gray-50 p-4 rounded-lg">
        <label
          htmlFor="total-questions-slider"
          className="block text-sm font-medium text-gray-700 mr-4 whitespace-nowrap"
        >
          Total de preguntas:
        </label>
        <div className="flex-1 mx-4">
          <input
            id="total-questions-slider"
            type="range"
            min="5"
            max="50"
            step="1" // Es buena idea añadir step
            value={questionCount}
            // Llama a la función del padre cuando el valor cambia
            onChange={(e) => onQuestionCountChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer range-lg accent-indigo-600" // Usar accent color
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>5</span>
            <span>50</span>
          </div>
        </div>
        <span
          className="ml-4 text-indigo-700 font-bold text-lg w-12 text-center bg-indigo-100 px-2 py-1 rounded"
          id="total-questions-value"
        >
          {questionCount}
        </span>
      </div>
    </div>
  );
}
