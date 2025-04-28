export function componentePerfil() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <img
            className="h-24 w-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="Profile photo"
          ></img>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-800">Juan Pérez</h1>
            <p className="text-gray-600 mb-2">Estudiante de Ingeniería</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">
                Matemáticas
              </span>
              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                Biología
              </span>
              <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                Física
              </span>
              <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                Química
              </span>
            </div>
          </div>
          <div className="ml-auto mt-4 md:mt-0">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
              <i className="fas fa-edit mr-2"></i> Editar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
