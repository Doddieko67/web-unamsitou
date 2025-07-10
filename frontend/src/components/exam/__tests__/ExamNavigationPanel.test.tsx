import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamNavigationPanel } from '../ExamNavigationPanel';

const defaultProps = {
  canGoPrevious: true,
  canGoNext: true,
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  isSubmitted: false,
  currentIndex: 1, // Second question (0-indexed)
  totalQuestions: 5,
};

describe('ExamNavigationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render navigation panel', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    it('should display current question counter', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      expect(screen.getByText('2 de 5')).toBeInTheDocument();
    });

    it('should show navigation arrows', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const leftArrow = document.querySelector('.fa-arrow-left');
      const rightArrow = document.querySelector('.fa-arrow-right');
      
      expect(leftArrow).toBeInTheDocument();
      expect(rightArrow).toBeInTheDocument();
    });

    it('should show keyboard navigation hint when not submitted', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      expect(screen.getByText('(Use ← → para navegar)')).toBeInTheDocument();
    });

    it('should not show keyboard navigation hint when submitted', () => {
      render(<ExamNavigationPanel {...defaultProps} isSubmitted={true} />);
      
      expect(screen.queryByText('(Use ← → para navegar)')).not.toBeInTheDocument();
    });
  });

  describe('Previous Button', () => {
    it('should call onPrevious when previous button is clicked', () => {
      const mockOnPrevious = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} onPrevious={mockOnPrevious} />);
      
      const previousButton = screen.getByText('Anterior');
      fireEvent.click(previousButton);
      
      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    });

    it('should be enabled when canGoPrevious is true', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={true} />);
      
      const previousButton = screen.getByText('Anterior');
      expect(previousButton).not.toBeDisabled();
    });

    it('should be disabled when canGoPrevious is false', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} />);
      
      const previousButton = screen.getByText('Anterior').closest('button');
      expect(previousButton).toBeDisabled();
    });

    it('should not call onPrevious when disabled and clicked', () => {
      const mockOnPrevious = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} onPrevious={mockOnPrevious} />);
      
      const previousButton = screen.getByText('Anterior');
      fireEvent.click(previousButton);
      
      expect(mockOnPrevious).not.toHaveBeenCalled();
    });

    it('should have proper styling when enabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={true} />);
      
      const previousButton = screen.getByText('Anterior').closest('button');
      expect(previousButton).toHaveClass('bg-gray-100', 'text-gray-700');
    });

    it('should have proper styling when disabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} />);
      
      const previousButton = screen.getByText('Anterior').closest('button');
      expect(previousButton).toHaveClass('bg-gray-50', 'text-gray-400', 'cursor-not-allowed');
    });
  });

  describe('Next Button', () => {
    it('should call onNext when next button is clicked', () => {
      const mockOnNext = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} onNext={mockOnNext} />);
      
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it('should be enabled when canGoNext is true', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoNext={true} />);
      
      const nextButton = screen.getByText('Siguiente');
      expect(nextButton).not.toBeDisabled();
    });

    it('should be disabled when canGoNext is false', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoNext={false} />);
      
      const nextButton = screen.getByText('Siguiente').closest('button');
      expect(nextButton).toBeDisabled();
    });

    it('should not call onNext when disabled and clicked', () => {
      const mockOnNext = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} canGoNext={false} onNext={mockOnNext} />);
      
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);
      
      expect(mockOnNext).not.toHaveBeenCalled();
    });

    it('should have proper styling when enabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoNext={true} />);
      
      const nextButton = screen.getByText('Siguiente').closest('button');
      expect(nextButton).toHaveClass('bg-blue-100', 'text-blue-700');
    });

    it('should have proper styling when disabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoNext={false} />);
      
      const nextButton = screen.getByText('Siguiente').closest('button');
      expect(nextButton).toHaveClass('bg-gray-50', 'text-gray-400', 'cursor-not-allowed');
    });
  });

  describe('Question Counter Display', () => {
    it('should show correct counter for first question', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={0} totalQuestions={10} />);
      
      expect(screen.getByText('1 de 10')).toBeInTheDocument();
    });

    it('should show correct counter for middle question', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={4} totalQuestions={10} />);
      
      expect(screen.getByText('5 de 10')).toBeInTheDocument();
    });

    it('should show correct counter for last question', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={9} totalQuestions={10} />);
      
      expect(screen.getByText('10 de 10')).toBeInTheDocument();
    });

    it('should handle single question exam', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={0} totalQuestions={1} />);
      
      expect(screen.getByText('1 de 1')).toBeInTheDocument();
    });

    it('should handle large question numbers', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={99} totalQuestions={100} />);
      
      expect(screen.getByText('100 de 100')).toBeInTheDocument();
    });
  });

  describe('Exam States', () => {
    it('should show navigation hint during exam', () => {
      render(<ExamNavigationPanel {...defaultProps} isSubmitted={false} />);
      
      expect(screen.getByText('(Use ← → para navegar)')).toBeInTheDocument();
    });

    it('should hide navigation hint after submission', () => {
      render(<ExamNavigationPanel {...defaultProps} isSubmitted={true} />);
      
      expect(screen.queryByText('(Use ← → para navegar)')).not.toBeInTheDocument();
    });

    it('should maintain counter display after submission', () => {
      render(<ExamNavigationPanel {...defaultProps} isSubmitted={true} />);
      
      expect(screen.getByText('2 de 5')).toBeInTheDocument();
    });

    it('should maintain button functionality after submission', () => {
      const mockOnNext = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} isSubmitted={true} onNext={mockOnNext} />);
      
      const nextButton = screen.getByText('Siguiente');
      fireEvent.click(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle both buttons disabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} canGoNext={false} />);
      
      const previousButton = screen.getByText('Anterior').closest('button');
      const nextButton = screen.getByText('Siguiente').closest('button');
      
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should handle zero current index', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={0} />);
      
      expect(screen.getByText('1 de 5')).toBeInTheDocument();
    });

    it('should handle negative current index gracefully', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={-1} />);
      
      expect(screen.getByText('0 de 5')).toBeInTheDocument();
    });

    it('should handle current index beyond total questions', () => {
      render(<ExamNavigationPanel {...defaultProps} currentIndex={10} totalQuestions={5} />);
      
      expect(screen.getByText('11 de 5')).toBeInTheDocument();
    });

    it('should handle zero total questions', () => {
      render(<ExamNavigationPanel {...defaultProps} totalQuestions={0} />);
      
      expect(screen.getByText('2 de 0')).toBeInTheDocument();
    });
  });

  describe('Multiple Click Handling', () => {
    it('should handle rapid clicks on previous button', () => {
      const mockOnPrevious = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} onPrevious={mockOnPrevious} />);
      
      const previousButton = screen.getByText('Anterior');
      
      // Simulate rapid clicks
      fireEvent.click(previousButton);
      fireEvent.click(previousButton);
      fireEvent.click(previousButton);
      
      expect(mockOnPrevious).toHaveBeenCalledTimes(3);
    });

    it('should handle rapid clicks on next button', () => {
      const mockOnNext = vi.fn();
      render(<ExamNavigationPanel {...defaultProps} onNext={mockOnNext} />);
      
      const nextButton = screen.getByText('Siguiente');
      
      // Simulate rapid clicks
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      fireEvent.click(nextButton);
      
      expect(mockOnNext).toHaveBeenCalledTimes(3);
    });

    it('should prevent clicks when buttons are disabled', () => {
      const mockOnPrevious = vi.fn();
      const mockOnNext = vi.fn();
      render(
        <ExamNavigationPanel 
          {...defaultProps} 
          canGoPrevious={false}
          canGoNext={false}
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
        />
      );
      
      const previousButton = screen.getByText('Anterior');
      const nextButton = screen.getByText('Siguiente');
      
      fireEvent.click(previousButton);
      fireEvent.click(nextButton);
      
      expect(mockOnPrevious).not.toHaveBeenCalled();
      expect(mockOnNext).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    it('should handle mouse hover on previous button', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const previousButton = screen.getByText('Anterior');
      
      expect(() => {
        fireEvent.mouseEnter(previousButton);
        fireEvent.mouseLeave(previousButton);
      }).not.toThrow();
    });

    it('should handle mouse hover on next button', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const nextButton = screen.getByText('Siguiente');
      
      expect(() => {
        fireEvent.mouseEnter(nextButton);
        fireEvent.mouseLeave(nextButton);
      }).not.toThrow();
    });

    it('should have proper hover classes on enabled buttons', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const previousButton = screen.getByText('Anterior').closest('button');
      const nextButton = screen.getByText('Siguiente').closest('button');
      
      expect(previousButton).toHaveClass('hover:bg-gray-200');
      expect(nextButton).toHaveClass('hover:bg-blue-200');
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
    });

    it('should have descriptive button text', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      expect(screen.getByRole('button', { name: /anterior/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument();
    });

    it('should properly disable buttons when necessary', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} canGoNext={false} />);
      
      const previousButton = screen.getByRole('button', { name: /anterior/i });
      const nextButton = screen.getByRole('button', { name: /siguiente/i });
      
      expect(previousButton).toBeDisabled();
      expect(nextButton).toBeDisabled();
    });

    it('should maintain semantic structure', () => {
      const { container } = render(<ExamNavigationPanel {...defaultProps} />);
      
      const navigationPanel = container.firstChild;
      expect(navigationPanel).toBeInTheDocument();
    });
  });

  describe('Component Layout', () => {
    it('should have proper CSS classes for layout', () => {
      const { container } = render(<ExamNavigationPanel {...defaultProps} />);
      
      const mainContainer = container.querySelector('.flex.items-center.justify-between');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have proper padding and spacing', () => {
      const { container } = render(<ExamNavigationPanel {...defaultProps} />);
      
      const mainContainer = container.querySelector('.p-4');
      expect(mainContainer).toBeInTheDocument();
    });

    it('should have proper border styling', () => {
      const { container } = render(<ExamNavigationPanel {...defaultProps} />);
      
      const borderedContainer = container.querySelector('.border-t.border-gray-200');
      expect(borderedContainer).toBeInTheDocument();
    });

    it('should use flexbox for button spacing', () => {
      const { container } = render(<ExamNavigationPanel {...defaultProps} />);
      
      const buttonContainers = container.querySelectorAll('.flex.items-center.space-x-2');
      expect(buttonContainers.length).toBeGreaterThan(0);
    });
  });

  describe('Props Validation', () => {
    it('should work with minimal required props', () => {
      const minimalProps = {
        canGoPrevious: false,
        canGoNext: false,
        onPrevious: vi.fn(),
        onNext: vi.fn(),
        isSubmitted: false,
        currentIndex: 0,
        totalQuestions: 1,
      };

      render(<ExamNavigationPanel {...minimalProps} />);
      
      expect(screen.getByText('1 de 1')).toBeInTheDocument();
    });

    it('should handle undefined callback functions gracefully', () => {
      const propsWithUndefinedCallbacks = {
        ...defaultProps,
        onPrevious: undefined as any,
        onNext: undefined as any,
      };

      expect(() => {
        render(<ExamNavigationPanel {...propsWithUndefinedCallbacks} />);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle rapid prop changes without errors', () => {
      const { rerender } = render(<ExamNavigationPanel {...defaultProps} />);
      
      // Simulate rapid prop changes
      for (let i = 0; i < 10; i++) {
        rerender(
          <ExamNavigationPanel 
            {...defaultProps}
            currentIndex={i}
            canGoPrevious={i > 0}
            canGoNext={i < 9}
          />
        );
      }
      
      expect(screen.getByText('Anterior')).toBeInTheDocument();
      expect(screen.getByText('Siguiente')).toBeInTheDocument();
    });

    it('should memoize correctly with same props', () => {
      const { rerender } = render(<ExamNavigationPanel {...defaultProps} />);
      
      // Re-render with same props
      rerender(<ExamNavigationPanel {...defaultProps} />);
      
      expect(screen.getByText('2 de 5')).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('should show left arrow icon in previous button', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const previousButton = screen.getByText('Anterior').parentElement;
      const leftArrow = previousButton!.querySelector('.fa-arrow-left');
      expect(leftArrow).toBeInTheDocument();
    });

    it('should show right arrow icon in next button', () => {
      render(<ExamNavigationPanel {...defaultProps} />);
      
      const nextButton = screen.getByText('Siguiente').parentElement;
      const rightArrow = nextButton!.querySelector('.fa-arrow-right');
      expect(rightArrow).toBeInTheDocument();
    });

    it('should maintain icon visibility when buttons are disabled', () => {
      render(<ExamNavigationPanel {...defaultProps} canGoPrevious={false} canGoNext={false} />);
      
      const previousButton = screen.getByText('Anterior').parentElement;
      const nextButton = screen.getByText('Siguiente').parentElement;
      
      expect(previousButton!.querySelector('.fa-arrow-left')).toBeInTheDocument();
      expect(nextButton!.querySelector('.fa-arrow-right')).toBeInTheDocument();
    });
  });
});