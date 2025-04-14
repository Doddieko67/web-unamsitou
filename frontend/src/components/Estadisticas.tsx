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
            Rendimiento por Materia
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Materia
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Exámenes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Promedio
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mejor Calificación
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Progreso
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-full mr-3">
                        <i className="fas fa-square-root-alt text-indigo-600"></i>
                      </div>
                      <span className="font-medium">Matemáticas</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">8</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      92%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">100%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full w-{92%}"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <i className="fas fa-dna text-green-600"></i>
                      </div>
                      <span className="font-medium">Biología</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">6</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      85%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">95%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-blue-600 h-2.5 rounded-full w-{85%}"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full mr-3">
                        <i className="fas fa-atom text-blue-600"></i>
                      </div>
                      <span className="font-medium">Física</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">5</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                      78%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">88%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-yellow-500 h-2.5 rounded-full w-{78%}"></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full mr-3">
                        <i className="fas fa-flask text-purple-600"></i>
                      </div>
                      <span className="font-medium">Química</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">5</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                      82%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">90%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full w-{82%}"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
