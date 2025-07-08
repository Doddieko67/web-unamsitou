interface ExamTimerProps {
  timeLeft: number | null;
  formatTime: (time: number | null) => string;
  isSubmitted: boolean;
}

export function ExamTimer({
  timeLeft,
  formatTime,
  isSubmitted,
}: ExamTimerProps) {
  const getTimerStyles = () => {
    const baseClasses = "text-center px-4 py-3 rounded-lg font-semibold text-xl sm:text-2xl border transition-all duration-300 flex items-center justify-center shadow-inner";

    if (timeLeft === null) {
      // Tiempo no disponible, gris/inactivo
      return {
        classes: baseClasses,
        styles: {
          backgroundColor: 'var(--theme-bg-accent)',
          borderColor: 'var(--theme-border-primary)',
          color: 'var(--theme-text-muted)',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
        }
      };
    } else if (timeLeft <= 300 && timeLeft > 0 && !isSubmitted) {
      // Menos de 5 mins, advertencia pulsante
      return {
        classes: `${baseClasses} animate-pulse`,
        styles: {
          backgroundColor: 'var(--theme-error-light)',
          borderColor: 'var(--theme-error)',
          color: 'var(--theme-error-dark)',
          boxShadow: 'inset 0 2px 4px 0 rgba(239, 68, 68, 0.2)'
        }
      };
    } else if (timeLeft === 0 || isSubmitted) {
      // Tiempo agotado o enviado, gris/inactivo
      return {
        classes: baseClasses,
        styles: {
          backgroundColor: 'var(--theme-bg-accent)',
          borderColor: 'var(--theme-border-primary)',
          color: 'var(--theme-text-muted)',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
        }
      };
    } else {
      // Tiempo normal, activo
      return {
        classes: baseClasses,
        styles: {
          backgroundColor: 'var(--theme-info-light)',
          borderColor: 'var(--theme-info)',
          color: 'var(--theme-info-dark)',
          boxShadow: 'inset 0 2px 4px 0 rgba(59, 130, 246, 0.2)'
        }
      };
    }
  };

  const statusText = isSubmitted
    ? "(Finalizado)"
    : timeLeft && timeLeft > 0
      ? "(Activo)"
      : "(Agotado)";

  const timerConfig = getTimerStyles();

  return (
    <div 
      className={timerConfig.classes}
      style={timerConfig.styles}
    >
      <i className="far fa-clock mr-2 text-lg sm:text-xl"></i>
      <span>{timeLeft && formatTime(timeLeft)}</span>
      <span className="ml-2 text-xs sm:text-sm font-medium opacity-80">
        {statusText}
      </span>
    </div>
  );
}
