import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { getExtendedChartPalette, withOpacity } from '../../utils/chartColors';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ExamDistributionChartProps {
  completed: number;
  inProgress: number;
  pending: number;
  suspended: number;
}

export function ExamDistributionChart({ 
  completed, 
  inProgress, 
  pending, 
  suspended 
}: ExamDistributionChartProps) {
  const palette = getExtendedChartPalette();
  
  const data = {
    labels: ['Completados', 'En Progreso', 'Pendientes', 'Suspendidos'],
    datasets: [
      {
        data: [completed, inProgress, pending, suspended],
        backgroundColor: [
          withOpacity(palette.statusColors[0], 0.8), // Completados
          withOpacity(palette.statusColors[1], 0.8), // En progreso
          withOpacity(palette.statusColors[2], 0.8), // Pendientes
          withOpacity(palette.statusColors[3], 0.8), // Suspendidos
        ],
        borderColor: palette.statusColorsDark,
        borderWidth: 3,
        hoverBorderWidth: 4,
        hoverBackgroundColor: palette.statusColors,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: palette.statusColorsDark[0], // Use computed color
          padding: 20,
          usePointStyle: true,
          font: {
            size: 13,
            weight: '600' as const,
          },
          generateLabels: function(chart: any) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            
            // Personalizar cada label con su color correspondiente
            labels.forEach((label: any, index: number) => {
              label.fillStyle = palette.statusColors[index];
              label.strokeStyle = palette.statusColorsDark[index];
              label.lineWidth = 2;
            });
            
            return labels;
          }
        },
      },
      tooltip: {
        backgroundColor: palette.bgPrimary,
        titleColor: palette.textPrimary,
        bodyColor: palette.textSecondary,
        borderColor: palette.borderPrimary,
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: any) {
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? ((context.raw / total) * 100).toFixed(1) : '0';
            return `${context.label}: ${context.raw} exámenes (${percentage}%)`;
          },
          title: function() {
            return 'Distribución de Exámenes';
          }
        }
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1200,
      easing: 'easeInOutQuart' as const,
    },
    cutout: '60%', // Hacer el donut más grueso
    radius: '90%',
  };

  return (
    <div className="h-64">
      <Doughnut data={data} options={options} />
    </div>
  );
}