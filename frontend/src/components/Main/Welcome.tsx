export function Welcome() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="md:flex">
        <div className="p-8">
          <div className="uppercase tracking-wide text-sm text-indigo-600 font-semibold inline">
            Bienvenido de vuelta
          </div>{" "}
          <h2 className="block mt-1 text-2xl font-medium text-gray-900">
            ¿Qué examen generaremos hoy?
          </h2>
          <p className="mt-2 text-gray-500">
            Selecciona entre nuestras opciones inteligentes para crear el examen
            perfecto para tus necesidades.
          </p>
        </div>
        <div className="md:flex-shrink-0 flex items-center justify-center p-8 md:w-1/3 bg-indigo-50">
          <i className="fas fa-robot text-6xl text-indigo-400"></i>
        </div>
      </div>
    </div>
  );
}
