export function Logros() {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-6">
            Logros y Reconocimientos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trophy text-indigo-600 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                Experto en Matemáticas
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Completa 10 exámenes de matemáticas con más del 90% de
                calificación
              </p>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium">
                Desbloqueado
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-medal text-green-600 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                Rápido y Eficiente
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Completa 5 exámenes en menos de la mitad del tiempo asignado
              </p>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                Desbloqueado
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-star text-blue-600 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Perfeccionista</h3>
              <p className="text-sm text-gray-500 mb-3">
                Obtén 100% en cualquier examen
              </p>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Desbloqueado
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book text-yellow-600 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                Estudiante Dedicado
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Completa 20 exámenes en total
              </p>
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                Desbloqueado
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-brain text-purple-600 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">
                Multidisciplinario
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Completa exámenes en 3 materias diferentes
              </p>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                Desbloqueado
              </span>
            </div>

            <div className="border border-gray-200 rounded-lg p-6 text-center opacity-50">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-fire text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-medium text-gray-800 mb-2">Racha de Éxito</h3>
              <p className="text-sm text-gray-500 mb-3">
                Obtén más del 90% en 5 exámenes consecutivos
              </p>
              <span className="bg-gray-100 text-gray-400 px-3 py-1 rounded-full text-xs font-medium">
                Bloqueado
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
