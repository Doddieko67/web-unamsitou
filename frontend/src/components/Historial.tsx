export function Historial() {
  return (
    <div>
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              Historial de Exámenes
            </h2>
            <div className="relative">
              <select className="appearance-none bg-gray-100 border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Filtrar por materia</option>
                <option>Matemáticas</option>
                <option>Biología</option>
                <option>Física</option>
                <option>Química</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <i className="fas fa-chevron-down"></i>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="exam-item p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-gray-800">
                    Examen de Matemáticas Avanzadas
                  </h3>
                  <p className="text-sm text-gray-500">
                    15 de junio, 2023 • 20 preguntas • 1 hora
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                    95%
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <i className="fas fa-eye mr-1"></i> Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="exam-item p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-gray-800">
                    Examen de Biología Celular
                  </h3>
                  <p className="text-sm text-gray-500">
                    10 de junio, 2023 • 15 preguntas • 45 min
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                    88%
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <i className="fas fa-eye mr-1"></i> Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="exam-item p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-gray-800">
                    Examen de Física Cuántica
                  </h3>
                  <p className="text-sm text-gray-500">
                    5 de junio, 2023 • 25 preguntas • 1.5 horas
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                    78%
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <i className="fas fa-eye mr-1"></i> Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="exam-item p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-gray-800">
                    Examen de Química Orgánica
                  </h3>
                  <p className="text-sm text-gray-500">
                    1 de junio, 2023 • 18 preguntas • 1 hora
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                    85%
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <i className="fas fa-eye mr-1"></i> Ver Detalles
                  </button>
                </div>
              </div>
            </div>

            <div className="exam-item p-4 border border-gray-200 rounded-lg hover:shadow-md cursor-pointer">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="mb-3 md:mb-0">
                  <h3 className="font-medium text-gray-800">
                    Examen de Matemáticas Básicas
                  </h3>
                  <p className="text-sm text-gray-500">
                    28 de mayo, 2023 • 10 preguntas • 30 min
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mr-4">
                    100%
                  </span>
                  <button className="text-indigo-600 hover:text-indigo-800">
                    <i className="fas fa-eye mr-1"></i> Ver Detalles
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50">
              <i className="fas fa-history mr-2"></i> Cargar más
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
