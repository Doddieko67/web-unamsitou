import { memo } from "react";

export const Welcome = memo(function Welcome() {
  return (
    <div 
      className="rounded-xl shadow-md overflow-hidden mb-8 transition-colors duration-300"
      style={{ 
        backgroundColor: 'var(--theme-bg-primary)',
        boxShadow: 'var(--theme-shadow-md)'
      }}
    >
      <div className="md:flex">
        <div className="p-8">
          <div 
            className="uppercase tracking-wide text-sm font-semibold inline transition-colors duration-300"
            style={{ color: 'var(--primary)' }}
          >
            Bienvenido de vuelta
          </div>{" "}
          <h2 
            className="block mt-1 text-2xl font-medium transition-colors duration-300"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            ¿Qué examen generaremos hoy?
          </h2>
          <p 
            className="mt-2 transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Selecciona entre nuestras opciones inteligentes para crear el examen
            perfecto para tus necesidades.
          </p>
        </div>
        <div 
          className="md:flex-shrink-0 flex items-center justify-center p-8 md:w-1/3 transition-colors duration-300"
          style={{ backgroundColor: 'var(--theme-bg-accent)' }}
        >
          <i 
            className="fas fa-robot text-6xl transition-colors duration-300"
            style={{ color: 'var(--primary)' }}
          ></i>
        </div>
      </div>
    </div>
  );
});
