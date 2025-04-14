export function ExamQuestions() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden p-6 mb-8 ">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Convierte archivos en exámenes interactivos
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-6">
        <div className="flex justify-center mb-4">
          <i className="fas fa-file-upload text-4xl text-indigo-400"></i>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          Arrastra y suelta tus archivos aquí
        </h3>
        <p className="text-sm text-gray-500 mb-4">o</p>
        <label
          htmlFor="file-upload"
          className="cursor-pointer gradient-bg text-white px-4 py-2 rounded-md font-medium inline-block"
        >
          <i className="fas fa-folder-open mr-2"></i> Seleccionar archivos
        </label>
        <input type="file" className="hidden" multiple></input>
        <p className="text-xs text-gray-500 mt-4">
          Formatos soportados: PDF, DOCX, TXT (Máx. 10MB)
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          O pega tu texto directamente
        </h3>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Pega aquí el contenido de tu examen..."
        ></textarea>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          Configuración de procesamiento
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de preguntas a generar
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Detectar automáticamente</option>
              <option>Opción múltiple</option>
              <option>Verdadero/Falso</option>
              <option>Respuesta corta</option>
              <option>Mezcla de tipos</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificultad general
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
              <option>Detectar automáticamente</option>
              <option>Fácil</option>
              <option>Medio</option>
              <option>Difícil</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
