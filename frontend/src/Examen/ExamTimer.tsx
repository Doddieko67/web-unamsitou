interface ExamTimerProps {
  timeLeft: number;
  formatTime: (time: number) => string;
  isSubmitted: boolean;
}

export function ExamTimer({
  timeLeft,
  formatTime,
  isSubmitted,
}: ExamTimerProps) {
  const getTimerClasses = () => {
    const base =
      "text-center px-4 py-3 rounded-lg font-semibold text-xl sm:text-2xl border transition-colors duration-300 flex items-center justify-center shadow-inner";

    if (timeLeft <= 300 && timeLeft > 0 && !isSubmitted) {
      // Menos de 5 mins, advertencia pulsante
      return `${base} bg-red-50 border-red-200 text-red-700 animate-pulse`;
    } else if (timeLeft === 0 || isSubmitted) {
      // Tiempo agotado o enviado, gris/inactivo
      return `${base} bg-gray-100 border-gray-200 text-gray-500`;
    } else {
      // Tiempo normal, activo
      return `${base} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const statusText = isSubmitted
    ? "(Finalizado)"
    : timeLeft > 0
      ? "(Activo)"
      : "(Agotado)";

  return (
    <div className={getTimerClasses()}>
      <i className="far fa-clock mr-2 text-lg sm:text-xl"></i>
      <span>{formatTime(timeLeft)}</span>
      <span className="ml-2 text-xs sm:text-sm font-medium opacity-80">
        {statusText}
      </span>
    </div>
  );
}
