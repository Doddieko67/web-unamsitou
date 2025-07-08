import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error para debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Aquí podrías enviar el error a un servicio de monitoring
    // como Sentry, LogRocket, etc.
    this.setState({
      error,
      errorInfo,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback personalizada
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="min-h-screen flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: 'var(--theme-bg-tertiary)' }}
        >
          <div className="max-w-md w-full mx-auto p-6">
            <div 
              className="rounded-lg shadow-lg p-8 text-center transition-colors duration-300"
              style={{ 
                backgroundColor: 'var(--theme-bg-primary)',
                boxShadow: 'var(--theme-shadow-lg)'
              }}
            >
              <div 
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors duration-300"
                style={{ backgroundColor: 'var(--theme-error-light)' }}
              >
                <svg 
                  className="w-8 h-8 transition-colors duration-300" 
                  style={{ color: 'var(--theme-error)' }}
                  fill="none" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h1 
                className="text-xl font-semibold mb-2 transition-colors duration-300"
                style={{ color: 'var(--theme-text-primary)' }}
              >
                ¡Oops! Algo salió mal
              </h1>
              
              <p 
                className="mb-6 transition-colors duration-300"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Ha ocurrido un error inesperado. Por favor, intenta recargar la página o ponte en contacto con soporte si el problema persiste.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary 
                    className="cursor-pointer text-sm transition-colors duration-300 hover:opacity-80"
                    style={{ color: 'var(--theme-text-secondary)' }}
                  >
                    Ver detalles del error (solo en desarrollo)
                  </summary>
                  <div 
                    className="mt-2 p-3 rounded text-xs font-mono overflow-auto max-h-32 transition-colors duration-300"
                    style={{ 
                      backgroundColor: 'var(--theme-bg-secondary)',
                      color: 'var(--theme-text-secondary)'
                    }}
                  >
                    <div className="font-bold mb-1">Error:</div>
                    <div className="mb-2">{this.state.error.message}</div>
                    <div className="font-bold mb-1">Stack:</div>
                    <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                  </div>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 text-white rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: 'var(--primary)',
                    '--tw-ring-color': 'var(--primary)',
                    '--tw-ring-opacity': '0.5'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--primary)';
                  }}
                >
                  Intentar de nuevo
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="px-4 py-2 text-white rounded-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: 'var(--theme-text-secondary)',
                    '--tw-ring-color': 'var(--theme-text-secondary)',
                    '--tw-ring-opacity': '0.5'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--theme-text-secondary)';
                  }}
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}