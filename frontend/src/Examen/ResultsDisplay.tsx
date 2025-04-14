interface ResultsDisplayProps {
  resultados: { correctas: number; total: number; porcentaje: number };
  timeLeftFormatted: string;
}
export function ResultsDisplay({
  resultados,
  timeLeftFormatted,
}: ResultsDisplayProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center border-t-4 border-green-500">
      <i className="fas fa-trophy text-5xl text-yellow-500 mb-4"></i>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
        ¡Examen Completado!
      </h2>
      <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 inline-block">
        <div className="space-y-3 text-left text-sm sm:text-base">
          <div className="flex justify-between">
            <span className="text-gray-700">Preguntas correctas:</span>
            <span className="font-semibold text-green-600">
              {resultados.correctas} / {resultados.total}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Porcentaje:</span>
            <span className="font-semibold text-indigo-600">
              {resultados.porcentaje}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Tiempo restante:</span>
            <span className="font-semibold">{timeLeftFormatted}</span>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mb-6">¡Buen trabajo!</p>
      <button
        onClick={() => window.location.reload()} // O redirigir a un dashboard
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
      >
        Volver a Intentar
      </button>
    </div>
  );
}
