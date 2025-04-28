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
        <div className="flex flex-col items-center bg-indigo-100 rounded-lg p-2 shadow-md">
          <div className="flex flex-row gap-1 mb-1">
            <button
              className="w-7 h-7 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors"
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
              className="w-7 h-7 flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white rounded-full transition-colors"
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
            className="bg-white w-14 h-14 text-center text-2xl font-bold text-indigo-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-inner"
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
        <p className="mt-2 text-sm font-medium text-gray-700">{label}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-center gap-6 p-4 pb-2 bg-white rounded-xl shadow-lg">
        <TimeUnit
          value={hour}
          onChange={handleHourChange}
          max={99}
          label="Horas"
        />
        <div className="text-3xl font-bold text-indigo-400 -mt-4">:</div>
        <TimeUnit
          value={minute}
          onChange={handleMinuteChange}
          max={59}
          label="Minutos"
        />
        <div className="text-3xl font-bold text-indigo-400 -mt-4">:</div>
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
            className="w-full h-3 bg-gradient-to-r from-indigo-200 to-indigo-500 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />

          {/* Marcas y etiquetas */}
          <div className="flex justify-between mt-2 px-1 text-xs text-gray-600">
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
