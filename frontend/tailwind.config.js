/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Definir colores basados en variables CSS
        'primary': 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'secondary': 'var(--secondary)',
        'tertiary': 'var(--terciary)',
        'quaternary': 'var(--cuaternary)',
        'dark': 'var(--dark)',
        'light': 'var(--light)',
        
        // Theme colors
        'theme-bg-primary': 'var(--theme-bg-primary)',
        'theme-bg-secondary': 'var(--theme-bg-secondary)',
        'theme-bg-tertiary': 'var(--theme-bg-tertiary)',
        'theme-bg-accent': 'var(--theme-bg-accent)',
        
        'theme-text-primary': 'var(--theme-text-primary)',
        'theme-text-secondary': 'var(--theme-text-secondary)',
        'theme-text-tertiary': 'var(--theme-text-tertiary)',
        'theme-text-muted': 'var(--theme-text-muted)',
        'theme-text-accent': 'var(--theme-text-accent)',
        
        'theme-border-primary': 'var(--theme-border-primary)',
        'theme-border-secondary': 'var(--theme-border-secondary)',
        'theme-border-accent': 'var(--theme-border-accent)',
        
        'theme-success': 'var(--theme-success)',
        'theme-success-light': 'var(--theme-success-light)',
        'theme-success-dark': 'var(--theme-success-dark)',
        'theme-warning': 'var(--theme-warning)',
        'theme-warning-light': 'var(--theme-warning-light)',
        'theme-warning-dark': 'var(--theme-warning-dark)',
        'theme-error': 'var(--theme-error)',
        'theme-error-light': 'var(--theme-error-light)',
        'theme-error-dark': 'var(--theme-error-dark)',
        'theme-info': 'var(--theme-info)',
        'theme-info-light': 'var(--theme-info-light)',
        'theme-info-dark': 'var(--theme-info-dark)',
        
        'theme-hover-bg': 'var(--theme-hover-bg)',
        'theme-active-bg': 'var(--theme-active-bg)',
      },
      boxShadow: {
        'theme-sm': 'var(--theme-shadow-sm)',
        'theme-md': 'var(--theme-shadow-md)',
        'theme-lg': 'var(--theme-shadow-lg)',
        'theme-xl': 'var(--theme-shadow-xl)',
      },
      ringColor: {
        'theme-focus': 'var(--theme-focus-ring)',
      },
      backgroundImage: {
        'theme-gradient-primary': 'var(--theme-gradient-primary)',
        'theme-gradient-purple': 'var(--theme-gradient-purple)',
        'theme-gradient-card': 'var(--theme-gradient-card)',
      }
    },
  },
  plugins: [],
}