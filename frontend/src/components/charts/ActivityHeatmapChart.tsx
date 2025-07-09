import React from 'react';
import { getChartColors, withOpacity } from '../../utils/chartColors';

interface ActivityHeatmapChartProps {
  activityData: Array<{
    date: string;
    intensity: number;
    performance: number;
  }>;
}

export function ActivityHeatmapChart({ activityData }: ActivityHeatmapChartProps) {
  const colors = getChartColors();
  
  // Agrupar por semanas para mejor visualización
  const weeks = [];
  for (let i = 0; i < activityData.length; i += 7) {
    weeks.push(activityData.slice(i, i + 7));
  }

  const getIntensityColor = (intensity: number, performance: number) => {
    if (intensity === 0) return withOpacity(colors.borderPrimary, 0.1);
    
    // Color base según intensidad
    const baseIntensity = Math.min(intensity / 5, 1);
    
    // Modificar según performance
    if (performance >= 90) {
      return withOpacity(colors.success, baseIntensity);
    } else if (performance >= 70) {
      return withOpacity(colors.info, baseIntensity);
    } else if (performance >= 50) {
      return withOpacity(colors.warning, baseIntensity);
    } else if (performance > 0) {
      return withOpacity(colors.error, baseIntensity);
    } else {
      return withOpacity(colors.borderPrimary, baseIntensity);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDayLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return days[date.getDay()];
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 
          className="text-sm font-semibold mb-2"
          style={{ color: 'var(--theme-text-primary)' }}
        >
          Actividad de los últimos 90 días
        </h4>
        <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--theme-text-secondary)' }}>
          <span>Menos</span>
          <div className="flex space-x-1">
            {[0.1, 0.3, 0.5, 0.7, 1.0].map((opacity, index) => (
              <div
                key={index}
                className="w-3 h-3 rounded-sm"
                style={{ 
                  backgroundColor: withOpacity(colors.success, opacity),
                  border: `1px solid ${colors.borderPrimary}`
                }}
              ></div>
            ))}
          </div>
          <span>Más</span>
        </div>
      </div>
      
      <div className="flex flex-col space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex space-x-1">
            {week.map((day, dayIndex) => (
              <div
                key={day.date}
                className="w-4 h-4 rounded-sm border cursor-pointer hover:scale-110 transition-transform"
                style={{
                  backgroundColor: getIntensityColor(day.intensity, day.performance),
                  borderColor: colors.borderPrimary
                }}
                title={`${formatDate(day.date)}: ${day.intensity} exámenes${
                  day.performance > 0 ? `, ${day.performance}% promedio` : ''
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      
      {/* Day labels */}
      <div className="flex space-x-1 mt-2">
        {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map((day, index) => (
          <div
            key={index}
            className="w-4 text-center text-xs"
            style={{ color: 'var(--theme-text-muted)' }}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}