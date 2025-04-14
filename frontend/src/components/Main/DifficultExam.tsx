export function DifficultExam() {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-700 mb-4">
        3. Nivel de dificultad
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div
          className="difficulty-option border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300"
          data-difficulty="easy"
        >
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-smile text-green-600"></i>
          </div>
          <h4 className="font-medium text-gray-800">Fácil</h4>
          <p className="text-sm text-gray-500">Conceptos básicos</p>
        </div>

        <div
          className="difficulty-option border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300"
          data-difficulty="medium"
        >
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-meh text-yellow-600"></i>
          </div>
          <h4 className="font-medium text-gray-800">Medio</h4>
          <p className="text-sm text-gray-500">Reto moderado</p>
        </div>

        <div
          className="difficulty-option border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300"
          data-difficulty="hard"
        >
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-frown text-red-600"></i>
          </div>
          <h4 className="font-medium text-gray-800">Difícil</h4>
          <p className="text-sm text-gray-500">Preguntas complejas</p>
        </div>

        <div
          className="difficulty-option border-2 border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300"
          data-difficulty="mixed"
        >
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-3">
            <i className="fas fa-random text-indigo-600"></i>
          </div>
          <h4 className="font-medium text-gray-800">Mixto</h4>
          <p className="text-sm text-gray-500">Variedad de niveles</p>
        </div>
      </div>
    </div>
  );
}
