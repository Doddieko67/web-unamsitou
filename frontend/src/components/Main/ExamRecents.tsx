export function ExamRecents() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Tus exámenes recientes
        </h2>
        <a
          href="#"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
        >
          Ver todo
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="exam-card bg-white border border-gray-200 rounded-lg p-5 hover:border-indigo-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="difficulty-badge easy">Fácil</span>
            </div>
            <span className="text-xs text-gray-500">Hace 2 días</span>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">
            Matemáticas básicas
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            15 preguntas sobre álgebra y aritmética
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                85%
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div className="bg-green-500 h-1.5 rounded-full width-85"></div>
              </div>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Ver detalles
            </button>
          </div>
        </div>

        <div className="exam-card bg-white border border-gray-200 rounded-lg p-5 hover:border-indigo-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="difficulty-badge medium">Medio</span>
            </div>
            <span className="text-xs text-gray-500">Hace 1 semana</span>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">Biología celular</h3>
          <p className="text-sm text-gray-600 mb-4">
            20 preguntas sobre células y organelos
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                72%
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div className="bg-yellow-500 h-1.5 rounded-full width-{72%}"></div>
              </div>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Ver detalles
            </button>
          </div>
        </div>

        <div className="exam-card bg-white border border-gray-200 rounded-lg p-5 hover:border-indigo-300">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="difficulty-badge hard">Difícil</span>
            </div>
            <span className="text-xs text-gray-500">Hace 2 semanas</span>
          </div>
          <h3 className="font-medium text-gray-800 mb-2">
            Literatura universal
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            25 preguntas sobre obras clásicas
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                64%
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                <div className="bg-red-500 h-1.5 rounded-full width-{64%}"></div>
              </div>
            </div>
            <button className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
