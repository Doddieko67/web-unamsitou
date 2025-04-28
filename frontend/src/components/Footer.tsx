export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-evenly gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ExamGen AI</h3>
            <p className="text-gray-400 text-sm">
              La plataforma inteligente para crear exámenes personalizados con
              ayuda de IA.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="flex flex-row gap-4">
              <li>
                <a
                  href="mailto:hern04045@gmail.com"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  <i className="fa-solid fa-envelope"></i>
                </a>
              </li>
              <li>
                <span className="text-gray-400 hover:text-white text-sm">
                  55 4370 6437
                </span>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/hernandez-tellez-hector-fidel-a710b72a8/"
                  target="_blank"
                  className="text-gray-400 hover:text-white text-sm"
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>© 2025 ExamGen AI.</p>
        </div>
      </div>
    </footer>
  );
}
