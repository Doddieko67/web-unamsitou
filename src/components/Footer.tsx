export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ExamGen AI</h3>
            <p className="text-gray-400 text-sm">
              La plataforma inteligente para crear exámenes personalizados con
              ayuda de IA.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Inicio
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Funciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Centro de ayuda
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white text-sm">
                  Términos
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Conéctate</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
            <p className="text-gray-400 text-sm mt-4">
              Suscríbete a nuestro boletín
            </p>
            <div className="mt-2 flex">
              <input
                type="email"
                placeholder="Tu email"
                className="px-3 py-2 bg-gray-700 text-white rounded-l-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm w-full"
              />
              <button className="bg-indigo-600 text-white px-3 py-2 rounded-r-md text-sm hover:bg-indigo-700">
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2023 ExamGen AI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
