export function Contacto() {
  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white shadow-md mb-4">
          <i className="fas fa-paper-plane text-3xl text-indigo-600"></i>
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Contáctanos</h1>
        <p className="text-gray-600 mt-2">
          ¿Tienes alguna pregunta o sugerencia? Estamos aquí!
        </p>
      </div>

      <div className="bg-white rounded-2xl contact-container p-8 text-start">
        <form className="space-y-6">
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Asunto
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-tag text-gray-400"></i>
              </div>
              <select
                name="subject"
                required
                className="input-field w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none"
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona un asunto
                </option>
                <option value="support">Soporte técnico</option>
                <option value="sales">Consultas comerciales</option>
                <option value="feedback">Feedback/Sugerencias</option>
                <option value="other">Otro</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <i className="fas fa-chevron-down text-gray-400"></i>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Mensaje
            </label>
            <div className="relative">
              <textarea
                name="message"
                required
                className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Escribe tu mensaje aquí..."
              ></textarea>
            </div>
          </div>

          <div>
            <label
              htmlFor="attachment"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Adjuntar archivo (opcional)
            </label>
            <div className="mt-1 flex items-center">
              <label htmlFor="attachment" className="cursor-pointer">
                <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <i className="fas fa-paperclip mr-2"></i> Seleccionar archivo
                </span>
                <input name="attachment" type="file" className="sr-only" />
              </label>
              <span className="ml-2 text-sm text-gray-500">
                Ningún archivo seleccionado
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Formatos soportados: PDF, JPG, PNG (Max. 5MB)
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              <span id="btnText">Enviar mensaje</span>
              <svg
                id="loadingSpinner"
                className="hidden ml-2 h-5 w-5 text-white loading-spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          </div>
        </form>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Nuestro Equipo
          </h3>
          
          {/* Victor Gabriel Rivero Flores */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900">Victor Gabriel Rivero Flores</h4>
            <p className="text-sm text-gray-600 mb-3">Desarrollador Frontend</p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Vikktorrf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <i className="fab fa-github mr-2"></i>
                <span className="text-sm">Vikktorrf</span>
              </a>
            </div>
          </div>
          
          {/* Hector Fidel Hernandez Tellez */}
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900">Hector Fidel Hernandez Tellez</h4>
            <p className="text-sm text-gray-600 mb-3">Desarrollador Fullstack</p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Doddieko67"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <i className="fab fa-github mr-2"></i>
                <span className="text-sm">Doddieko67</span>
              </a>
              <a
                href="mailto:hern04045@gmail.com"
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <i className="fas fa-envelope mr-2"></i>
                <span className="text-sm">hern04045@gmail.com</span>
              </a>
              <a
                href="https://www.linkedin.com/in/hernandez-tellez-hector-fidel-a710b72a8/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-700 hover:text-indigo-600 transition-colors"
              >
                <i className="fab fa-linkedin mr-2"></i>
                <span className="text-sm">LinkedIn</span>
              </a>
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-1">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <i className="fas fa-envelope text-indigo-600"></i>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">contacto@vikdev.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
