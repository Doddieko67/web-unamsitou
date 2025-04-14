import { useState } from "react";

export function QuestionConf() {
  const [questionCount, setQuestionCount] = useState(20);

  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        2. Configura las preguntas
      </h3>

      <div
        className="bg-gray-50 rounded-lg p-4 mb-4"
        id="questions-config-container"
      >
        <p className="text-gray-500 text-sm">
          Selecciona materias primero para configurar las preguntas.
        </p>
      </div>

      <div className="flex items-center">
        <label className="block text-sm font-medium text-gray-700 mr-4">
          Total de preguntas:
        </label>
        <div className="flex-1">
          <input
            type="range"
            min="5"
            max="50"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            id="total-questions-slider"
          />
        </div>
        <span
          className="ml-4 text-gray-700 font-medium w-16 text-center"
          id="total-questions-value"
        >
          {questionCount}
        </span>
      </div>
    </div>
  );
}
