export function Estadisticas() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stats-card bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Exámenes realizados</p>
              <h3 className="text-2xl font-bold text-gray-800">24</h3>
            </div>
            <div className="bg-indigo-100 p-3 rounded-full">
              <i className="fas fa-file-alt text-indigo-600 text-xl"></i>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill w-{75%}"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+5 desde el mes pasado</p>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Promedio de calificación</p>
              <h3 className="text-2xl font-bold text-gray-800">86%</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-star text-green-600 text-xl"></i>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill w-{75%}"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+3% desde el mes pasado</p>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Tiempo promedio</p>
              <h3 className="text-2xl font-bold text-gray-800">42 min</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="fas fa-clock text-blue-600 text-xl"></i>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill w-{65%}"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            -8 min desde el mes pasado
          </p>
        </div>

        <div className="stats-card bg-white p-6 rounded-xl shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Preguntas correctas</p>
              <h3 className="text-2xl font-bold text-gray-800">78%</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <i className="fas fa-check-circle text-purple-600 text-xl"></i>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress-fill w-{78%}"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">+4% desde el mes pasado</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Progreso Mensual
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              Gráfico de progreso mensual (simulado)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
