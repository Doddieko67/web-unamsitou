export function ExamBasedOnHistory() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8 ">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Examen basado en tu historial
      </h2>

      <div className="bg-indigo-50 border-l-4 border-indigo-400 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-indigo-400"></i>
          </div>
          <div className="ml-3">
            <p className="text-sm text-indigo-700">
              Nuestra IA analizará tu historial de exámenes anteriores para
              crear un examen personalizado que se enfoque en tus áreas de
              mejora y refuerce tus conocimientos.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Tu rendimiento reciente
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Matemáticas
                </span>
                <span className="text-sm font-medium text-gray-700">72%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full width-72"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Biología
                </span>
                <span className="text-sm font-medium text-gray-700">85%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full width-85"></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  Literatura
                </span>
                <span className="text-sm font-medium text-gray-700">64%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full width-64"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Áreas para mejorar
          </h3>

          <div className="space-y-3">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <i className="fas fa-exclamation text-red-500"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Ecuaciones cuadráticas
                </p>
                <p className="text-xs text-gray-500">
                  Fallaste 5 de 7 preguntas
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <i className="fas fa-exclamation text-red-500"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Genética mendeliana
                </p>
                <p className="text-xs text-gray-500">
                  Fallaste 3 de 5 preguntas
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                <i className="fas fa-question text-yellow-500"></i>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Literatura del siglo XIX
                </p>
                <p className="text-xs text-gray-500">50% de acierto</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Configuración del examen
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de preguntas
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>20 (recomendado)</option>
              <option>10</option>
              <option>30</option>
              <option>50</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enfoque principal
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Áreas de mejora (recomendado)</option>
              <option>Reforzar conocimientos</option>
              <option>Mezcla equilibrada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificultad
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Adaptativa (recomendado)</option>
              <option>Fácil</option>
              <option>Medio</option>
              <option>Difícil</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="gradient-bg text-white px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition duration-300 flex items-center">
          <i className="fas fa-brain mr-2"></i> Generar Examen Inteligente
        </button>
      </div>
    </div>
  );
}
