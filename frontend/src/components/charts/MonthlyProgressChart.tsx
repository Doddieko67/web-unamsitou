import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getExtendedChartPalette, withOpacity } from '../../utils/chartColors';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyProgressChartProps {
  monthlyData: Array<{
    month: string;
    completed: number;
    started: number;
  }>;
}

export function MonthlyProgressChart({ monthlyData }: MonthlyProgressChartProps) {
  const palette = getExtendedChartPalette();
  
  const data = {
    labels: monthlyData.map(item => item.month),
    datasets: [
      {
        label: 'Exámenes Completados',
        data: monthlyData.map(item => item.completed),
        borderColor: palette.statusColors[0], // Success color
        backgroundColor: withOpacity(palette.statusColors[0], 0.1),
        fill: true,
        tension: 0.4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: palette.statusColors[0],
        pointBorderColor: palette.statusColorsDark[0],
        pointBorderWidth: 3,
        pointHoverBackgroundColor: palette.statusColorsDark[0],
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        borderWidth: 3,
      },
      {
        label: 'Exámenes Iniciados',
        data: monthlyData.map(item => item.started),
        borderColor: palette.statusColors[1], // Info color
        backgroundColor: withOpacity(palette.statusColors[1], 0.1),
        fill: true,
        tension: 0.4,
        pointRadius: 8,
        pointHoverRadius: 12,
        pointBackgroundColor: palette.statusColors[1],
        pointBorderColor: palette.statusColorsDark[1],
        pointBorderWidth: 3,
        pointHoverBackgroundColor: palette.statusColorsDark[1],
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 3,
        borderDash: [8, 4],
        borderWidth: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: palette.textPrimary,
          padding: 20,
          usePointStyle: true,
          font: {
            size: 13,
            weight: '600' as const,
          },
        },
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
            return `Mes de ${context[0].label}`;
          },
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw} exámenes`;
          },
          footer: function(context: any) {
            const completed = context.find((c: any) => c.datasetIndex === 0)?.raw || 0;
            const started = context.find((c: any) => c.datasetIndex === 1)?.raw || 0;
            const completionRate = started > 0 ? ((completed / started) * 100).toFixed(1) : '0';
            return `Tasa de finalización: ${completionRate}%`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Período',
          color: palette.textSecondary,
          font: {
            size: 13,
            weight: '600' as const,
          },
        },
        ticks: {
          color: palette.textSecondary,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
        grid: {
          color: withOpacity(palette.borderPrimary, 0.3),
          drawBorder: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Número de Exámenes',
          color: palette.textSecondary,
          font: {
            size: 13,
            weight: '600' as const,
          },
        },
        ticks: {
          color: palette.textSecondary,
          font: {
            size: 12,
            weight: '500' as const,
          },
          beginAtZero: true,
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
      duration: 1500,
      easing: 'easeInOutQuint' as const,
    },
    elements: {
      line: {
        borderJoinStyle: 'round' as const,
        borderCapStyle: 'round' as const,
      },
    },
  };

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  );
}