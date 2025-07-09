import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { getExtendedChartPalette, withOpacity, getPerformanceColor } from '../../utils/chartColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ScoreDistributionChartProps {
  scoreRanges: {
    '90-100': number;
    '80-89': number;
    '70-79': number;
    '60-69': number;
    '50-59': number;
    '0-49': number;
  };
}

export function ScoreDistributionChart({ scoreRanges }: ScoreDistributionChartProps) {
  const palette = getExtendedChartPalette();
  
  const labels = ['90-100%', '80-89%', '70-79%', '60-69%', '50-59%', '0-49%'];
  const dataValues = [
    scoreRanges['90-100'],
    scoreRanges['80-89'],
    scoreRanges['70-79'],
    scoreRanges['60-69'],
    scoreRanges['50-59'],
    scoreRanges['0-49'],
  ];
  
  // Colores basados en performance
  const backgroundColors = [
    withOpacity(getPerformanceColor(95), 0.8),
    withOpacity(getPerformanceColor(85), 0.8),
    withOpacity(getPerformanceColor(75), 0.8),
    withOpacity(getPerformanceColor(65), 0.8),
    withOpacity(getPerformanceColor(55), 0.8),
    withOpacity(getPerformanceColor(25), 0.8),
  ];
  
  const borderColors = [
    getPerformanceColor(95),
    getPerformanceColor(85),
    getPerformanceColor(75),
    getPerformanceColor(65),
    getPerformanceColor(55),
    getPerformanceColor(25),
  ];

  const data = {
    labels,
    datasets: [
      {
        label: 'Número de Exámenes',
        data: dataValues,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
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
          title: function(context: any) {
            return `Rango de puntuación: ${context[0].label}`;
          },
          label: function(context: any) {
            const total = dataValues.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
            return `${context.raw} exámenes (${percentage}%)`;
          },
          afterLabel: function(context: any) {
            const range = context.label.replace('%', '').split('-');
            const avgRange = (parseInt(range[0]) + parseInt(range[1] || range[0])) / 2;
            
            if (avgRange >= 90) return '🏆 Excelente performance';
            if (avgRange >= 80) return '✅ Buen performance';
            if (avgRange >= 70) return '📊 Performance satisfactorio';
            if (avgRange >= 60) return '⚠️ Performance regular';
            if (avgRange >= 50) return '📉 Performance bajo';
            return '🔴 Necesita mejora';
          }
        }
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Rango de Puntuación',
          color: palette.textSecondary,
          font: {
            size: 13,
            weight: '600' as const,
          },
        },
        ticks: {
          color: palette.textSecondary,
          font: {
            size: 11,
            weight: '500' as const,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Cantidad de Exámenes',
          color: palette.textSecondary,
          font: {
            size: 13,
            weight: '600' as const,
          },
        },
        ticks: {
          color: palette.textSecondary,
          font: {
            size: 11,
            weight: '500' as const,
          },
          stepSize: 1,
          callback: function(value: any) {
            return Number.isInteger(value) ? value : '';
          }
        },
        grid: {
          color: withOpacity(palette.borderPrimary, 0.3),
          drawBorder: false,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart' as const,
    },
  };

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  );
}