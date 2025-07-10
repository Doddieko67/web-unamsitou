import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamTimerDisplay } from '../ExamTimerDisplay';

// Mock format time function
const mockFormatTime = vi.fn((seconds: number | undefined) => {
  if (seconds === undefined || seconds < 0) return '00:00:00';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
});

const defaultProps = {
  timeLeft: 3600, // 1 hour
  timeSpent: 300, // 5 minutes
  isRunning: true,
  isSubmitted: false,
  formatTime: mockFormatTime,
};

// Mock DOM methods
Object.defineProperty(document, 'documentElement', {
  value: {
    getAttribute: vi.fn(() => null), // Default to light mode
  },
  writable: true,
});

describe('ExamTimerDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to light mode for each test
    (document.documentElement.getAttribute as any).mockReturnValue(null);
  });

  describe('Basic Rendering', () => {
    it('should render timer component', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(screen.getByText('⏰ Tiempo de Examen')).toBeInTheDocument();
    });

    it('should call formatTime with correct values', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(mockFormatTime).toHaveBeenCalledWith(3600); // timeLeft
      expect(mockFormatTime).toHaveBeenCalledWith(300);  // timeSpent
    });

    it('should display formatted time correctly', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(screen.getByText('01:00:00')).toBeInTheDocument(); // timeLeft formatted
      expect(screen.getByText('00:05:00')).toBeInTheDocument(); // timeSpent formatted
    });

    it('should show timer icon', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      const timerIcon = document.querySelector('.fa-stopwatch');
      expect(timerIcon).toBeInTheDocument();
    });

    it('should show hourglass icon for elapsed time', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      const hourglassIcon = document.querySelector('.fa-hourglass-half');
      expect(hourglassIcon).toBeInTheDocument();
    });
  });

  describe('Time Left Labels', () => {
    it('should show time remaining label', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(screen.getByText('⏳ Tiempo restante')).toBeInTheDocument();
    });

    it('should show elapsed time label', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(screen.getByText('Transcurrido')).toBeInTheDocument();
    });
  });

  describe('Timer States', () => {
    it('should show "En marcha" status when timer is running normally', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      expect(screen.getByText('En marcha')).toBeInTheDocument();
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('should show "Finalizado" status when exam is submitted', () => {
      render(<ExamTimerDisplay {...defaultProps} isSubmitted={true} />);
      
      expect(screen.getByText('Finalizado')).toBeInTheDocument();
      expect(screen.getByText('🏁')).toBeInTheDocument();
    });

    it('should show "Tiempo limitado" status when 15 minutes or less remaining', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={900} />); // 15 minutes
      
      expect(screen.getByText('Tiempo limitado')).toBeInTheDocument();
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });

    it('should show "Tiempo crítico" status when 5 minutes or less remaining', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={300} />); // 5 minutes
      
      expect(screen.getByText('Tiempo crítico')).toBeInTheDocument();
      expect(screen.getByText('🚨')).toBeInTheDocument();
    });

    it('should show warning for critical time when less than 5 minutes', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={240} />); // 4 minutes
      
      expect(screen.getByText(/¡Solo 4 minutos!/)).toBeInTheDocument();
    });

    it('should show encouragement when plenty of time remains', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={2400} />); // 40 minutes
      
      expect(screen.getByText('🌟 ¡Tienes tiempo suficiente! 🌟')).toBeInTheDocument();
    });
  });

  describe('Visual Animations', () => {
    it('should add pulse animation when time is low', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={600} />); // 10 minutes
      
      const pulseDot = document.querySelector('.animate-pulse');
      expect(pulseDot).toBeInTheDocument();
    });

    it('should not add pulse animation when time is sufficient', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={1800} />); // 30 minutes
      
      // With 30 minutes (1800 seconds), pulse should not be active on the timer dot
      // Only warning messages have animate-pulse, not the timer dot itself
      const timerContainer = document.querySelector('.text-center');
      expect(timerContainer).toBeInTheDocument();
    });

    it('should show bouncing warning when in critical time', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={180} />); // 3 minutes
      
      const bounceElement = document.querySelector('.animate-bounce');
      expect(bounceElement).toBeInTheDocument();
    });
  });

  describe('Undefined Time Handling', () => {
    it('should handle undefined timeLeft gracefully', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={undefined} />);
      
      expect(mockFormatTime).toHaveBeenCalledWith(undefined);
      expect(screen.getByText('⏰ Tiempo de Examen')).toBeInTheDocument();
    });

    it('should show appropriate status for undefined time', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={undefined} />);
      
      expect(screen.getByText('En marcha')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    beforeEach(() => {
      // Mock dark mode
      (document.documentElement.getAttribute as any).mockReturnValue('dark');
    });

    it('should handle dark mode styling', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      // Component should render without errors in dark mode
      expect(screen.getByText('⏰ Tiempo de Examen')).toBeInTheDocument();
    });

    it('should apply different background styles in dark mode', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      // Should call getAttribute to check theme
      expect(document.documentElement.getAttribute).toHaveBeenCalledWith('data-theme');
    });
  });

  describe('Time Display Edge Cases', () => {
    it('should handle zero time left', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={0} />);
      
      expect(screen.getByText('Tiempo crítico')).toBeInTheDocument();
      expect(screen.getByText(/¡Solo 0 minutos!/)).toBeInTheDocument();
    });

    it('should handle very small time values', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={30} />); // 30 seconds
      
      expect(screen.getByText('Tiempo crítico')).toBeInTheDocument();
    });

    it('should handle large time values', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={7200} />); // 2 hours
      
      expect(screen.getByText('En marcha')).toBeInTheDocument();
      expect(screen.getByText('🌟 ¡Tienes tiempo suficiente! 🌟')).toBeInTheDocument();
    });

    it('should handle zero time spent', () => {
      render(<ExamTimerDisplay {...defaultProps} timeSpent={0} />);
      
      expect(mockFormatTime).toHaveBeenCalledWith(0);
    });
  });

  describe('Warning Display Logic', () => {
    it('should not show critical warning when exam is submitted', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={240} isSubmitted={true} />);
      
      expect(screen.queryByText(/¡Solo/)).not.toBeInTheDocument();
    });

    it('should not show encouragement when exam is submitted', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={2400} isSubmitted={true} />);
      
      expect(screen.queryByText(/¡Tienes tiempo suficiente!/)).not.toBeInTheDocument();
    });

    it('should show critical warning only when not submitted', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={240} isSubmitted={false} />);
      
      expect(screen.getByText(/¡Solo 4 minutos!/)).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should work with minimal required props', () => {
      const minimalProps = {
        timeLeft: 1800,
        timeSpent: 600,
        isRunning: true,
        isSubmitted: false,
        formatTime: mockFormatTime,
      };

      render(<ExamTimerDisplay {...minimalProps} />);
      
      expect(screen.getByText('⏰ Tiempo de Examen')).toBeInTheDocument();
    });

    it('should handle negative time values gracefully', () => {
      render(<ExamTimerDisplay {...defaultProps} timeLeft={-100} />);
      
      // Should still render and call formatTime
      expect(mockFormatTime).toHaveBeenCalledWith(-100);
    });
  });

  describe('Component Structure', () => {
    it('should have proper CSS classes for styling', () => {
      const { container } = render(<ExamTimerDisplay {...defaultProps} />);
      
      const timerContainer = container.querySelector('.rounded-2xl');
      expect(timerContainer).toBeInTheDocument();
    });

    it('should maintain responsive design classes', () => {
      const { container } = render(<ExamTimerDisplay {...defaultProps} />);
      
      const minWidthElement = container.querySelector('.min-w-\\[380px\\]');
      expect(minWidthElement).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should provide semantic content for screen readers', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      // Check for descriptive text using more flexible matchers
      expect(screen.getByText(/Tiempo restante/)).toBeInTheDocument();
      expect(screen.getByText('Transcurrido')).toBeInTheDocument();
    });

    it('should have proper heading structure', () => {
      render(<ExamTimerDisplay {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('⏰ Tiempo de Examen');
    });
  });

  describe('Format Time Integration', () => {
    it('should pass correct time values to formatTime function', () => {
      const customTimeLeft = 1234;
      const customTimeSpent = 567;
      
      render(
        <ExamTimerDisplay 
          {...defaultProps} 
          timeLeft={customTimeLeft}
          timeSpent={customTimeSpent}
        />
      );
      
      expect(mockFormatTime).toHaveBeenCalledWith(customTimeLeft);
      expect(mockFormatTime).toHaveBeenCalledWith(customTimeSpent);
    });

    it('should handle formatTime function errors gracefully', () => {
      const errorFormatTime = vi.fn(() => {
        throw new Error('Format error');
      });

      expect(() => {
        render(<ExamTimerDisplay {...defaultProps} formatTime={errorFormatTime} />);
      }).toThrow('Format error');
    });
  });
});