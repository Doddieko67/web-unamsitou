// src/components/ResultsDisplay.tsx (Potentially modify)
import React from "react";

interface Resultados {
  correctas: number;
  total: number;
  porcentaje: number;
}

interface ResultsDisplayProps {
  resultados: Resultados;
  timeLeftFormatted: string; // Time remaining/taken when submitted
  onReview?: () => void; // Callback for review button (optional)
  onFinish?: () => void; // Callback for finish button (e.g., go to dashboard)
}

export function ResultsDisplay({
  resultados,
  timeLeftFormatted,
  onReview,
  onFinish,
}: ResultsDisplayProps) {
  const getResultMessage = (
    percentage: number,
  ): { message: string; color: string } => {
    if (percentage >= 80)
      return { message: "¡Excelente!", color: "text-green-600" };
    if (percentage >= 60)
      return { message: "¡Buen trabajo!", color: "text-blue-600" };
    if (percentage >= 40)
      return { message: "Puedes mejorar", color: "text-yellow-600" };
    return { message: "Necesitas repasar", color: "text-red-600" };
  };

  const resultStyle = getResultMessage(resultados.porcentaje);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border-t-4 border-indigo-500">
      <div className="p-6 text-center">
        <i className={`fas fa-poll ${resultStyle.color} text-5xl mb-4`}></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Resultados del Examen
        </h2>
        <p className={`text-lg font-semibold ${resultStyle.color} mb-4`}>
          {resultStyle.message}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-sm mx-auto text-left text-sm sm:text-base space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-700">
              <i className="fas fa-check text-green-500 mr-2 w-4 text-center"></i>
              Respuestas Correctas:
            </span>
            <span className="font-medium text-gray-800">
              {resultados.correctas} / {resultados.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">
              <i className="fas fa-percentage text-blue-500 mr-2 w-4 text-center"></i>
              Porcentaje:
            </span>
            <span className="font-medium text-gray-800">
              {resultados.porcentaje}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">
              <i className="fas fa-clock text-purple-500 mr-2 w-4 text-center"></i>
              Tiempo Restante al Enviar:
            </span>
            <span className="font-medium text-gray-800">
              {timeLeftFormatted}
            </span>
          </div>
        </div>

        {/* Optional: Message about reviewing answers */}
        <p className="text-gray-600 text-sm mb-6">
          Ahora puedes revisar tus respuestas a continuación. Las opciones
          correctas están marcadas en verde{" "}
          <i className="fas fa-check-circle text-green-500"></i> y las
          incorrectas que seleccionaste en rojo{" "}
          <i className="fas fa-times-circle text-red-500"></i>.
        </p>

        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          {onReview && ( // Show only if callback is provided
            <button
              onClick={onReview}
              className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg font-medium hover:bg-gray-200 transition duration-150 flex items-center justify-center"
            >
              <i className="fas fa-search mr-2"></i> Volver a Revisar
            </button>
          )}
          {onFinish && ( // Show only if callback is provided
            <button
              onClick={onFinish}
              className="gradient-bg text-white px-5 py-2 rounded-lg font-medium hover:shadow-lg transition duration-150 flex items-center justify-center"
            >
              <i className="fas fa-flag-checkered mr-2"></i> Finalizar y Salir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
