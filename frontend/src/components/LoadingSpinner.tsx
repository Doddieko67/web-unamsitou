interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  text = 'Cargando...', 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const getSpinnerColor = () => {
    switch (color) {
      case 'primary':
        return 'var(--primary)';
      case 'secondary':
        return 'var(--secondary)';
      case 'success':
        return 'var(--theme-success)';
      case 'error':
        return 'var(--theme-error)';
      case 'info':
        return 'var(--theme-info)';
      case 'warning':
        return 'var(--theme-warning)';
      default:
        return 'var(--primary)';
    }
  };

  const spinner = (
    <div className="text-center">
      <div 
        className={`animate-spin rounded-full border-b-2 mx-auto mb-2 transition-colors duration-300 ${sizeClasses[size]}`}
        style={{ borderBottomColor: getSpinnerColor() }}
      ></div>
      {text && (
        <p 
          className="text-sm transition-colors duration-300"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
};