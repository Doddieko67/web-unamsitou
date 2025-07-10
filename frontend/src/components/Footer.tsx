export function Footer() {
  return (
    <footer className="py-8 transition-colors duration-300" style={{ 
      backgroundColor: 'var(--theme-bg-secondary)',
      color: 'var(--theme-text-primary)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-row justify-evenly gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">VikDev</h3>
            <p className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
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
                  className="text-sm transition-colors hover:text-blue-500"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <i className="fa-solid fa-envelope"></i>
                </a>
              </li>
              <li>
                <span className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                  55 4370 6437
                </span>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/hernandez-tellez-hector-fidel-a710b72a8/"
                  target="_blank"
                  className="text-sm transition-colors hover:text-blue-500"
                  style={{ color: 'var(--theme-text-muted)' }}
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm" style={{ 
          borderTop: '1px solid var(--theme-border-primary)',
          color: 'var(--theme-text-muted)'
        }}>
          <p>© 2025 VikDev.</p>
        </div>
      </div>
    </footer>
  );
}
