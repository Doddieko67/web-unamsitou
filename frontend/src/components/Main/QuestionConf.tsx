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
  const handleIncrement = () => {
    // Primero, verifica que no excedas el máximo permitido
    if (questionCount < 128) {
      onQuestionCountChange(questionCount + 1); // Incrementa el valor
    }
  };

  const handleDecrement = () => {
    // Primero, verifica que no bajes el mínimo permitido
    if (questionCount > 5) {
      onQuestionCountChange(questionCount - 1); // Decrementa el valor
    }
  };

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

      <div className="flex items-center bg-indigo-50 p-4 rounded-lg">
        <label
          htmlFor="total-questions-slider"
          className="block text-sm font-medium text-indigo-700 mr-4 whitespace-nowrap"
        >
          Total de preguntas:
        </label>
        <div className="flex-1 mx-4">
          <input
            type="range"
            min="5"
            max="128"
            step="1" // Es buena idea añadir step
            value={questionCount}
            // Llama a la función del padre cuando el valor cambia
            onChange={(e) => onQuestionCountChange(Number(e.target.value))}
            className="slider w-full h-2 bg-indigo-300 rounded-lg cursor-pointer range-lg slide-2" // Usar accent color
          />
          <div className="flex justify-between text-xs text-indigo-500 mt-1">
            <span>5</span>
            <span>128</span>
          </div>
        </div>
        <button onClick={handleDecrement}>
          <i className="fas fa-minus ml-4 mr-1 text-indigo-700 fa-lg px-3 py-4 rounded bg-indigo-100"></i>
        </button>
        <input
          type="text"
          className="text-indigo-700 font-bold border-indigo-400 focus:border-indigo-300 focus:outline focus:outline-indigo-400 text-lg w-12 text-center bg-indigo-100 px-2 py-1 rounded"
          value={questionCount}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (!isNaN(value) && 0 < value && value < 128) {
              // isNaN(value) es true si value NO es un número
              onQuestionCountChange(value);
            } else {
              // Si no es un número, reseteamos el valor al anterior o a un valor por defecto (ej: 0)
              onQuestionCountChange(0); // O cualquier valor predeterminado
            }
          }}
        ></input>
        <button onClick={handleIncrement}>
          <i className="fas fa-plus ml-1 text-indigo-700 fa-lg px-3 py-4 rounded bg-indigo-100"></i>
        </button>
      </div>
    </div>
  );
}
