import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExamProgressBar } from '../ExamProgressBar';

const defaultProps = {
  currentQuestion: 2, // 0-indexed, so this is question 3
  totalQuestions: 10,
  answeredQuestions: 5,
};

describe('ExamProgressBar', () => {
  beforeEach(() => {
    // Reset any potential state between tests
  });

  describe('Basic Rendering', () => {
    it('should render progress bar component', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      expect(screen.getByText('📊 Progreso del Examen')).toBeInTheDocument();
    });

    it('should show current question and total questions', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      expect(screen.getByText('3/10')).toBeInTheDocument();
      expect(screen.getByText('preguntas')).toBeInTheDocument();
    });

    it('should display tasks icon', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      const tasksIcon = document.querySelector('.fa-tasks');
      expect(tasksIcon).toBeInTheDocument();
    });
  });

  describe('Progress Calculations', () => {
    it('should calculate progress percentage correctly', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // Current question 2 (0-indexed) = question 3 out of 10 = 30%
      expect(screen.getByText('30%')).toBeInTheDocument();
    });

    it('should calculate answered percentage correctly', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // 5 answered out of 10 = 50%
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show correct answered questions count', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should handle edge case with zero total questions', () => {
      render(
        <ExamProgressBar 
          currentQuestion={0}
          totalQuestions={0}
          answeredQuestions={0}
        />
      );
      
      expect(screen.getByText('1/0')).toBeInTheDocument();
      expect(screen.getAllByText('0%')).toHaveLength(2); // Both progress and completed percentages should be 0
    });

    it('should handle case where answered questions exceed current question', () => {
      render(
        <ExamProgressBar 
          currentQuestion={2}
          totalQuestions={10}
          answeredQuestions={8} // More answered than current position
        />
      );
      
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument(); // Answered percentage
    });
  });

  describe('Different Progress States', () => {
    it('should handle beginning of exam', () => {
      render(
        <ExamProgressBar 
          currentQuestion={0}
          totalQuestions={20}
          answeredQuestions={0}
        />
      );
      
      expect(screen.getByText('1/20')).toBeInTheDocument();
      expect(screen.getByText('5%')).toBeInTheDocument(); // 1/20 = 5%
      expect(screen.getByText('0%')).toBeInTheDocument(); // 0 answered
      expect(screen.getByText('0')).toBeInTheDocument(); // Answered count
    });

    it('should handle middle of exam', () => {
      render(
        <ExamProgressBar 
          currentQuestion={9}
          totalQuestions={20}
          answeredQuestions={7}
        />
      );
      
      expect(screen.getByText('10/20')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument(); // 10/20 = 50%
      expect(screen.getByText('35%')).toBeInTheDocument(); // 7/20 = 35%
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should handle end of exam', () => {
      render(
        <ExamProgressBar 
          currentQuestion={9}
          totalQuestions={10}
          answeredQuestions={10}
        />
      );
      
      expect(screen.getByText('10/10')).toBeInTheDocument();
      expect(screen.getAllByText('100%')).toHaveLength(2); // Both progress and completed percentages should be 100%
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should handle single question exam', () => {
      render(
        <ExamProgressBar 
          currentQuestion={0}
          totalQuestions={1}
          answeredQuestions={1}
        />
      );
      
      expect(screen.getByText('1/1')).toBeInTheDocument();
      expect(screen.getAllByText('100%')).toHaveLength(2); // Both percentages should be 100%
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  describe('Stats Display', () => {
    it('should show all three stat columns', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // Check labels
      expect(screen.getByText('Respondidas')).toBeInTheDocument();
      expect(screen.getByText('Progreso')).toBeInTheDocument();
      expect(screen.getByText('Completado')).toBeInTheDocument();
    });

    it('should display stats in correct format', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // Answered questions (count)
      expect(screen.getByText('5')).toBeInTheDocument();
      
      // Progress percentage
      expect(screen.getByText('30%')).toBeInTheDocument();
      
      // Completed percentage
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should round percentages correctly', () => {
      render(
        <ExamProgressBar 
          currentQuestion={2} // 3/7 = 42.857...%
          totalQuestions={7}
          answeredQuestions={2} // 2/7 = 28.571...%
        />
      );
      
      expect(screen.getByText('43%')).toBeInTheDocument(); // Rounded progress
      expect(screen.getByText('29%')).toBeInTheDocument(); // Rounded answered
    });
  });

  describe('Visual Progress Bar', () => {
    it('should render progress bar with correct structure', () => {
      const { container } = render(<ExamProgressBar {...defaultProps} />);
      
      const progressBarContainer = container.querySelector('.w-full.rounded-full.h-4');
      expect(progressBarContainer).toBeInTheDocument();
    });

    it('should have position indicator', () => {
      const { container } = render(<ExamProgressBar {...defaultProps} />);
      
      const positionIndicator = container.querySelector('.absolute.top-0.h-4.w-1');
      expect(positionIndicator).toBeInTheDocument();
    });

    it('should have animated shine effect', () => {
      const { container } = render(<ExamProgressBar {...defaultProps} />);
      
      const shineEffect = container.querySelector('.animate-pulse');
      expect(shineEffect).toBeInTheDocument();
    });
  });

  describe('Custom Styling', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ExamProgressBar {...defaultProps} className="custom-class" />
      );
      
      const progressContainer = container.querySelector('.custom-class');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should have default empty className when not provided', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // Should not crash and should render normally
      expect(screen.getByText('📊 Progreso del Examen')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle negative current question gracefully', () => {
      render(
        <ExamProgressBar 
          currentQuestion={-1}
          totalQuestions={10}
          answeredQuestions={0}
        />
      );
      
      expect(screen.getByText('0/10')).toBeInTheDocument();
      expect(screen.getAllByText('0%')).toHaveLength(2); // Both progress and completed percentages should be 0%
    });

    it('should handle current question beyond total questions', () => {
      render(
        <ExamProgressBar 
          currentQuestion={15}
          totalQuestions={10}
          answeredQuestions={5}
        />
      );
      
      expect(screen.getByText('16/10')).toBeInTheDocument();
      expect(screen.getByText('160%')).toBeInTheDocument(); // Over 100%
    });

    it('should handle negative answered questions', () => {
      render(
        <ExamProgressBar 
          currentQuestion={2}
          totalQuestions={10}
          answeredQuestions={-1}
        />
      );
      
      expect(screen.getByText('-1')).toBeInTheDocument();
      expect(screen.getByText('-10%')).toBeInTheDocument(); // Negative answered percentage
      expect(screen.getByText('30%')).toBeInTheDocument(); // Progress percentage should still be positive
    });

    it('should handle very large numbers', () => {
      render(
        <ExamProgressBar 
          currentQuestion={999}
          totalQuestions={1000}
          answeredQuestions={500}
        />
      );
      
      expect(screen.getByText('1000/1000')).toBeInTheDocument();
      expect(screen.getByText('100%')).toBeInTheDocument(); // Progress percentage
      expect(screen.getByText('50%')).toBeInTheDocument(); // Answered percentage
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading structure', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('📊 Progreso del Examen');
    });

    it('should provide meaningful text for screen readers', () => {
      render(<ExamProgressBar {...defaultProps} />);
      
      // Check for descriptive labels
      expect(screen.getByText('Respondidas')).toBeInTheDocument();
      expect(screen.getByText('Progreso')).toBeInTheDocument();
      expect(screen.getByText('Completado')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have grid layout for stats', () => {
      const { container } = render(<ExamProgressBar {...defaultProps} />);
      
      const gridContainer = container.querySelector('.grid.grid-cols-3');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should have proper spacing classes', () => {
      const { container } = render(<ExamProgressBar {...defaultProps} />);
      
      const mainContainer = container.querySelector('.rounded-2xl.p-4');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes without errors', () => {
      const { rerender } = render(<ExamProgressBar {...defaultProps} />);
      
      // Simulate rapid prop changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <ExamProgressBar 
            currentQuestion={i}
            totalQuestions={10}
            answeredQuestions={i}
          />
        );
      }
      
      expect(screen.getByText('📊 Progreso del Examen')).toBeInTheDocument();
    });

    it('should memoize correctly with same props', () => {
      const { rerender } = render(<ExamProgressBar {...defaultProps} />);
      
      // Re-render with same props
      rerender(<ExamProgressBar {...defaultProps} />);
      
      expect(screen.getByText('📊 Progreso del Examen')).toBeInTheDocument();
    });
  });

  describe('Mathematical Precision', () => {
    it('should handle decimal percentages correctly', () => {
      render(
        <ExamProgressBar 
          currentQuestion={0} // 1/3 = 33.333...%
          totalQuestions={3}
          answeredQuestions={1} // 1/3 = 33.333...%
        />
      );
      
      expect(screen.getAllByText('33%')).toHaveLength(2); // Both progress and completion percentages should be 33%
    });

    it('should handle zero division gracefully', () => {
      render(
        <ExamProgressBar 
          currentQuestion={0}
          totalQuestions={0}
          answeredQuestions={0}
        />
      );
      
      // Should not crash and should show 0% for both percentages
      expect(screen.getAllByText('0%')).toHaveLength(2);
    });
  });
});