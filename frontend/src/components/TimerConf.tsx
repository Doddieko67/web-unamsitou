interface TimerConfProp {
  hour: number;
  setHour: (hour: number) => void;
  minute: number;
  setMinute: (minute: number) => void;
  second: number;
  setSecond: (second: number) => void;
}

// Presets comunes para exámenes
const TIMER_PRESETS = [
  { label: "15 min", hours: 0, minutes: 15, seconds: 0, color: "success" },
  { label: "30 min", hours: 0, minutes: 30, seconds: 0, color: "success" },
  { label: "45 min", hours: 0, minutes: 45, seconds: 0, color: "warning" },
  { label: "1 hora", hours: 1, minutes: 0, seconds: 0, color: "warning" },
  { label: "1.5h", hours: 1, minutes: 30, seconds: 0, color: "info" },
  { label: "2 horas", hours: 2, minutes: 0, seconds: 0, color: "info" },
  { label: "3 horas", hours: 3, minutes: 0, seconds: 0, color: "error" },
  { label: "Sin límite", hours: 0, minutes: 0, seconds: 0, color: "neutral" }
];

export function TimerConf({
  hour,
  setHour,
  minute,
  setMinute,
  second,
  setSecond,
}: TimerConfProp) {
  const totalSeconds = hour * 3600 + minute * 60 + second;

  // Función para aplicar un preset
  const applyPreset = (hours: number, minutes: number, seconds: number) => {
    setHour(hours);
    setMinute(minutes);
    setSecond(seconds);
  };

  // Función para formatear tiempo
  const formatTime = (h: number, m: number, s: number) => {
    if (h === 0 && m === 0 && s === 0) return "Sin límite";
    if (h === 0) return `${m}:${s.toString().padStart(2, '0')}`;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Función para incrementar/decrementar tiempo
  const adjustTime = (increment: boolean) => {
    const currentTotal = totalSeconds;
    const change = increment ? 300 : -300; // 5 minutos
    const newTotal = Math.max(0, Math.min(currentTotal + change, 12 * 3600));
    
    const h = Math.floor(newTotal / 3600);
    const m = Math.floor((newTotal % 3600) / 60);
    const s = newTotal % 60;
    
    setHour(h);
    setMinute(m);
    setSecond(s);
  };

  // Verificar si un preset está activo
  const isPresetActive = (h: number, m: number, s: number) => {
    return hour === h && minute === m && second === s;
  };

  // Obtener colores del tema según el tipo
  const getPresetColors = (color: string, isActive: boolean) => {
    const colorMap = {
      success: {
        bg: isActive ? 'var(--theme-success)' : 'var(--theme-success-light)',
        text: isActive ? 'white' : 'var(--theme-success-dark)',
        border: 'var(--theme-success)'
      },
      warning: {
        bg: isActive ? 'var(--theme-warning)' : 'var(--theme-warning-light)',
        text: isActive ? 'white' : 'var(--theme-warning-dark)',
        border: 'var(--theme-warning)'
      },
      info: {
        bg: isActive ? 'var(--theme-info)' : 'var(--theme-info-light)',
        text: isActive ? 'white' : 'var(--theme-info-dark)',
        border: 'var(--theme-info)'
      },
      error: {
        bg: isActive ? 'var(--theme-error)' : 'var(--theme-error-light)',
        text: isActive ? 'white' : 'var(--theme-error-dark)',
        border: 'var(--theme-error)'
      },
      dark: {
        bg: isActive ? 'var(--theme-text-primary)' : 'var(--theme-bg-secondary)',
        text: isActive ? 'white' : 'var(--theme-text-secondary)',
        border: 'var(--theme-border-primary)'
      },
      neutral: {
        bg: isActive ? 'var(--primary)' : 'var(--theme-bg-secondary)',
        text: isActive ? 'white' : 'var(--theme-text-primary)',
        border: 'var(--primary)'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.info;
  };

  return (
    <div className="space-y-6">
      {/* Quick Presets Grid */}
      <div>
        <h4 
          className="text-sm font-medium mb-3"
          style={{ color: 'var(--theme-text-secondary)' }}
        >
          Presets Rápidos
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {TIMER_PRESETS.map((preset) => {
            const isActive = isPresetActive(preset.hours, preset.minutes, preset.seconds);
            const colors = getPresetColors(preset.color, isActive);
            
            return (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset.hours, preset.minutes, preset.seconds)}
                className={`p-3 rounded-xl border-2 text-center transition-all duration-300 hover:scale-105 ${
                  isActive ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                  color: colors.text,
                  cursor: 'pointer',
                  '--tw-ring-color': colors.border
                } as any}
              >
                <div className="font-semibold text-sm">{preset.label}</div>
                <div className="text-xs opacity-80 mt-1">
                  {formatTime(preset.hours, preset.minutes, preset.seconds)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Time Display & Controls */}
      <div 
        className="p-6 rounded-xl border-2 transition-all duration-300"
        style={{
          backgroundColor: 'var(--theme-bg-primary)',
          borderColor: 'var(--theme-border-primary)',
          boxShadow: 'var(--theme-shadow-md)'
        }}
      >
        <div className="text-center space-y-4">
          <div 
            className="text-4xl lg:text-5xl font-bold tracking-wider"
            style={{ color: 'var(--primary)' }}
          >
            {formatTime(hour, minute, second)}
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => adjustTime(false)}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--theme-error-light)',
                color: 'var(--theme-error-dark)',
                border: `2px solid var(--theme-error)`,
                cursor: 'pointer'
              }}
              disabled={totalSeconds <= 0}
              aria-label="Reducir 5 minutos"
            >
              <i className="fas fa-minus text-lg lg:text-xl"></i>
            </button>
            
            <div className="text-center px-4">
              <div 
                className="text-sm font-medium"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Ajustar por 5 min
              </div>
            </div>
            
            <button
              onClick={() => adjustTime(true)}
              className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--theme-success-light)',
                color: 'var(--theme-success-dark)',
                border: `2px solid var(--theme-success)`,
                cursor: 'pointer'
              }}
              disabled={totalSeconds >= 12 * 3600}
              aria-label="Agregar 5 minutos"
            >
              <i className="fas fa-plus text-lg lg:text-xl"></i>
            </button>
          </div>
          
          <div 
            className="text-xs opacity-80"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            {totalSeconds === 0 ? 'No hay límite de tiempo' : `Total: ${Math.floor(totalSeconds / 60)} minutos`}
          </div>
        </div>
      </div>
    </div>
  );
}
