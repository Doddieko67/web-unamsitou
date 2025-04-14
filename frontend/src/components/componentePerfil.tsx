export function componentePerfil() {
  return (
  <div class="bg-white rounded-xl shadow-md overflow-hidden mb-8">
              <div class="p-6">
                  <div class="flex flex-col md:flex-row items-center md:items-start">
                      <img class="h-24 w-24 rounded-full object-cover mb-4 md:mb-0 md:mr-6" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Profile photo">
                      <div class="text-center md:text-left">
                          <h1 class="text-2xl font-bold text-gray-800">Juan Pérez</h1>
                          <p class="text-gray-600 mb-2">Estudiante de Ingeniería</p>
                          <div class="flex flex-wrap justify-center md:justify-start gap-2">
                              <span class="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full">Matemáticas</span>
                              <span class="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">Biología</span>
                              <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">Física</span>
                              <span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">Química</span>
                          </div>
                      </div>
                      <div class="ml-auto mt-4 md:mt-0">
                          <button class="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700">
                              <i class="fas fa-edit mr-2"></i> Editar Perfil
                          </button>
                      </div>
                  </div>
              </div>
          </div>
  );
}
