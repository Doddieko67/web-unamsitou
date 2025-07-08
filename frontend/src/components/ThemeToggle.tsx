import React from 'react';
import { useTheme } from '../providers/ThemeProvider';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button' | 'switch';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  variant = 'button'
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'switch') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          relative inline-flex items-center justify-center rounded-full p-2
          transition-all duration-300 ease-in-out
          bg-gray-200 hover:bg-gray-300
          dark:bg-gray-700 dark:hover:bg-gray-600
          ${sizeClasses[size]} ${className}
        `}
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        <div className="relative">
          <i className={`
            fas fa-sun absolute transition-all duration-300
            ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}
            ${iconClasses[size]} text-yellow-500
          `} />
          <i className={`
            fas fa-moon transition-all duration-300
            ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}
            ${iconClasses[size]} text-blue-300
          `} />
        </div>
      </button>
    );
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          inline-flex items-center justify-center rounded-full
          transition-all duration-300 ease-in-out
          text-gray-600 hover:text-gray-800
          dark:text-gray-300 dark:hover:text-gray-100
          hover:bg-gray-100 dark:hover:bg-gray-800
          ${sizeClasses[size]} ${className}
        `}
        title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      >
        {theme === 'light' ? (
          <i className={`fas fa-moon ${iconClasses[size]}`} />
        ) : (
          <i className={`fas fa-sun ${iconClasses[size]}`} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
        transition-all duration-300 ease-in-out
        bg-white border border-gray-200 hover:bg-gray-50
        dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700
        text-gray-700 dark:text-gray-300
        hover:shadow-md active:scale-95
        ${className}
      `}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
    >
      {theme === 'light' ? (
        <>
          <i className="fas fa-moon text-blue-500" />
          <span className="text-sm font-medium">Modo Oscuro</span>
        </>
      ) : (
        <>
          <i className="fas fa-sun text-yellow-500" />
          <span className="text-sm font-medium">Modo Claro</span>
        </>
      )}
    </button>
  );
};