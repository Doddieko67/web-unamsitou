interface TimerConfProp {
  hour: number;
  setHour: (hour: number) => void;
  minute: number;
  setMinute: (minute: number) => void;
  second: number;
  setSecond: (second: number) => void;
}

export function TimerConf({
  hour,
  setHour,
  minute,
  setMinute,
  second,
  setSecond,
}: TimerConfProp) {
  // Función para asegurar que los valores estén dentro de los rangos correctos
  const validateValue = (value: number, max: number) => {
    if (value < 0) return 0;
    if (value > max) return max;
    return value;
  };

  // Funciones para manejar cambios en los inputs
  const handleHourChange = (value: number) => {
    setHour(validateValue(value, 12));
  };

  const handleMinuteChange = (value: number) => {
    setMinute(validateValue(value, 59));
  };

  const handleSecondChange = (value: number) => {
    setSecond(validateValue(value, 59));
  };

  // Convertir el tiempo total a segundos para el slider
  const totalSeconds = hour * 3600 + minute * 60 + second;

  // Valor máximo para el slider (12 horas en segundos)
  const maxSliderValue = 8 * 3600;

  // Función para manejar el cambio en el slider
  const handleSliderChange = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;

    setHour(h);
    setMinute(m);
    setSecond(s);
  };

  // Component para cada unidad de tiempo
  const TimeUnit = ({
    value,
    onChange,
    max,
    label,
  }: {
    value: number;
    onChange: (value: number) => void;
    max: number;
    label: string;
  }) => {
    return (
      <div className="flex flex-col items-center">
        <div 
          className="flex flex-col items-center rounded-lg p-2 shadow-md transition-colors duration-300"
          style={{ backgroundColor: 'var(--theme-info-light)' }}
        >
          <div className="flex flex-row gap-1 mb-1">
            <button
              className="w-7 h-7 flex items-center justify-center text-white rounded-full transition-all duration-200"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
              onClick={() => onChange(value + 1)}
              aria-label={`Incrementar ${label}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              className="w-7 h-7 flex items-center justify-center text-white rounded-full transition-all duration-200"
              style={{ backgroundColor: 'var(--primary)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
              }}
              onClick={() => onChange(value - 1)}
              aria-label={`Decrementar ${label}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <input
            type="text"
            className="w-14 h-14 text-center text-2xl font-bold rounded-md focus:outline-none focus:ring-2 shadow-inner transition-colors duration-300"
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              color: 'var(--primary)',
              '--tw-ring-color': 'var(--primary)',
              '--tw-ring-opacity': '0.4'
            } as React.CSSProperties}
            value={String(value).padStart(2, "0")}
            onChange={(e) => {
              const newValue =
                e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              if (!isNaN(newValue)) {
                onChange(newValue);
              }
            }}
            onBlur={(e) => {
              const value =
                e.target.value === "" ? 0 : parseInt(e.target.value, 10);
              onChange(validateValue(value, max));
            }}
            min="0"
            max={max}
          />
        </div>
        <p 
          className="mt-2 text-sm font-medium transition-colors duration-300"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          {label}
        </p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div 
        className="flex items-center justify-center gap-6 p-4 pb-2 rounded-xl shadow-lg transition-colors duration-300"
        style={{ 
          backgroundColor: 'var(--theme-bg-primary)',
          boxShadow: 'var(--theme-shadow-lg)'
        }}
      >
        <TimeUnit
          value={hour}
          onChange={handleHourChange}
          max={99}
          label="Horas"
        />
        <div 
          className="text-3xl font-bold -mt-4 transition-colors duration-300"
          style={{ color: 'var(--primary)' }}
        >
          :
        </div>
        <TimeUnit
          value={minute}
          onChange={handleMinuteChange}
          max={59}
          label="Minutos"
        />
        <div 
          className="text-3xl font-bold -mt-4 transition-colors duration-300"
          style={{ color: 'var(--primary)' }}
        >
          :
        </div>
        <TimeUnit
          value={second}
          onChange={handleSecondChange}
          max={59}
          label="Segundos"
        />
      </div>

      {/* Control deslizante maestro */}
      <div className="w-full mt-6 px-6 max-w-lg">
        <div className="relative">
          <input
            type="range"
            min="300"
            max={maxSliderValue}
            value={totalSeconds}
            onChange={(e) => handleSliderChange(parseInt(e.target.value, 10))}
            className="w-full h-3 slide-range rounded-lg cursor-pointer transition-colors duration-300"
          />

          {/* Marcas y etiquetas */}
          <div 
            className="flex justify-between mt-2 px-1 text-xs transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            <span>5m</span>
            <span>2h</span>
            <span>4h</span>
            <span>6h</span>
            <span>8h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
