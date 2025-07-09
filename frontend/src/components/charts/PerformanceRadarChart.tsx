import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { getExtendedChartPalette, withOpacity } from '../../utils/chartColors';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface PerformanceRadarChartProps {
  difficultyStats?: {
    easy: { count: number; avgScore: number };
    medium: { count: number; avgScore: number };
    hard: { count: number; avgScore: number };
    mixed: { count: number; avgScore: number };
  };
  competencyData?: {
    speed: number;
    accuracy: number;
    comprehension: number;
    analysis: number;
    memory: number;
    application: number;
  };
}

export function PerformanceRadarChart({ difficultyStats, competencyData }: PerformanceRadarChartProps) {
  const palette = getExtendedChartPalette();
  
  // Si tenemos competencyData, usar ese formato más avanzado
  if (competencyData) {
    const data = {
      labels: ['Velocidad', 'Precisión', 'Comprensión', 'Análisis', 'Memoria', 'Aplicación'],
      datasets: [
        {
          label: 'Competencias',
          data: [
            competencyData.speed,
            competencyData.accuracy,
            competencyData.comprehension,
            competencyData.analysis,
            competencyData.memory,
            competencyData.application,
          ],
          backgroundColor: withOpacity(palette.statusColors[0], 0.3),
          borderColor: palette.statusColors[0],
          borderWidth: 3,
          pointBackgroundColor: palette.statusColors[0],
          pointBorderColor: palette.statusColorsDark[0],
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: palette.statusColorsDark[0],
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: palette.bgPrimary,
          titleColor: palette.textPrimary,
          bodyColor: palette.textSecondary,
          borderColor: palette.borderPrimary,
          borderWidth: 2,
          cornerRadius: 8,
          callbacks: {
            label: function(context: any) {
              const labels = ['Velocidad', 'Precisión', 'Comprensión', 'Análisis', 'Memoria', 'Aplicación'];
              const descriptions = [
                'Qué tan rápido resuelves problemas',
                'Porcentaje de respuestas correctas',
                'Entendimiento de conceptos',
                'Capacidad de análisis complejo',
                'Retención de información',
                'Aplicación práctica del conocimiento'
              ];
              return `${labels[context.dataIndex]}: ${context.raw.toFixed(1)}% - ${descriptions[context.dataIndex]}`;
            }
          }
        },
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 100,
          ticks: {
            stepSize: 20,
            color: palette.textMuted,
            font: {
              size: 11,
            },
            callback: function(value: any) {
              return value + '%';
            }
          },
          grid: {
            color: withOpacity(palette.borderPrimary, 0.3),
          },
          angleLines: {
            color: withOpacity(palette.borderPrimary, 0.3),
          },
          pointLabels: {
            color: palette.textSecondary,
            font: {
              size: 12,
              weight: '600' as const,
            },
          },
        },
      },
      animation: {
        duration: 1500,
        easing: 'easeInOutQuint' as const,
      },
    };

    return (
      <div className="h-80">
        <Radar data={data} options={options} />
      </div>
    );
  }
  
  // Fallback al formato original si no hay competencyData
  if (!difficultyStats) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p style={{ color: 'var(--theme-text-muted)' }}>
          No hay datos suficientes para mostrar
        </p>
      </div>
    );
  }

  const data = {
    labels: ['Fácil', 'Medio', 'Difícil', 'Mixto', 'Consistencia', 'Progreso'],
    datasets: [
      {
        label: 'Performance Score',
        data: [
          difficultyStats.easy.avgScore || 0,
          difficultyStats.medium.avgScore || 0,
          difficultyStats.hard.avgScore || 0,
          difficultyStats.mixed.avgScore || 0,
          calculateConsistency(difficultyStats),
          calculateProgress(difficultyStats),
        ],
        backgroundColor: withOpacity(palette.statusColors[0], 0.3),
        borderColor: palette.statusColors[0],
        borderWidth: 3,
        pointBackgroundColor: palette.statusColors[0],
        pointBorderColor: palette.statusColorsDark[0],
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: palette.statusColorsDark[0],
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: palette.bgPrimary,
        titleColor: palette.textPrimary,
        bodyColor: palette.textSecondary,
        borderColor: palette.borderPrimary,
        borderWidth: 2,
        cornerRadius: 8,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            if (context.dataIndex === 4) return `Consistencia: ${value.toFixed(1)}%`;
            if (context.dataIndex === 5) return `Progreso: ${value.toFixed(1)}%`;
            return `${context.label}: ${value.toFixed(1)}% promedio`;
          }
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          color: palette.textMuted,
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '%';
          }
        },
        grid: {
          color: withOpacity(palette.borderPrimary, 0.3),
        },
        angleLines: {
          color: withOpacity(palette.borderPrimary, 0.3),
        },
        pointLabels: {
          color: palette.textSecondary,
          font: {
            size: 12,
            weight: '600' as const,
          },
        },
      },
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuint' as const,
    },
  };

  return (
    <div className="h-80">
      <Radar data={data} options={options} />
    </div>
  );
}

// Función para calcular consistencia
function calculateConsistency(stats: any): number {
  const scores = [
    stats.easy.avgScore || 0,
    stats.medium.avgScore || 0,
    stats.hard.avgScore || 0,
    stats.mixed.avgScore || 0,
  ].filter(score => score > 0);

  if (scores.length === 0) return 0;
  
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);
  
  // Convertir a score de consistencia (menos desviación = más consistencia)
  return Math.max(0, 100 - (standardDeviation * 2));
}

// Función para calcular progreso (basado en dificultad vs performance)
function calculateProgress(stats: any): number {
  const easyScore = stats.easy.avgScore || 0;
  const mediumScore = stats.medium.avgScore || 0;
  const hardScore = stats.hard.avgScore || 0;
  
  // Si tiene buen performance en dificultades altas, mayor progreso
  const progressWeight = (easyScore * 0.2) + (mediumScore * 0.3) + (hardScore * 0.5);
  return Math.min(100, progressWeight);
}