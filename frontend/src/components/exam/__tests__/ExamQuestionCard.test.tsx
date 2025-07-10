import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamQuestionCard } from '../ExamQuestionCard';

// Mock data for testing
const mockQuestion = {
  id: 1,
  pregunta: 'What is 2 + 2?',
  opciones: ['2', '3', '4', '5'],
  correcta: 2, // Index 2 is correct (answer '4')
  feedback: 'Two plus two equals four'
};

const defaultProps = {
  question: mockQuestion,
  questionIndex: 0,
  totalQuestions: 5,
  selectedAnswer: undefined,
  isSubmitted: false,
  feedback: undefined,
  isPinned: false,
  onAnswerSelect: vi.fn(),
  onTogglePin: vi.fn(),
  onPrevious: vi.fn(),
  onNext: vi.fn(),
  canGoPrevious: false,
  canGoNext: true,
  showFeedback: true,
  onScrollToOverview: vi.fn(),
};

describe('ExamQuestionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Question Display', () => {
    it('should render question text', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('should display question number correctly', () => {
      render(<ExamQuestionCard {...defaultProps} questionIndex={2} totalQuestions={10} />);
      
      expect(screen.getByText('Pregunta 3 de 10')).toBeInTheDocument();
    });

    it('should render all answer options', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should display option letters (A, B, C, D)', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      expect(screen.getByText('A.')).toBeInTheDocument();
      expect(screen.getByText('B.')).toBeInTheDocument();
      expect(screen.getByText('C.')).toBeInTheDocument();
      expect(screen.getByText('D.')).toBeInTheDocument();
    });
  });

  describe('Answer Selection', () => {
    it('should call onAnswerSelect when an option is clicked', () => {
      const mockOnAnswerSelect = vi.fn();
      render(<ExamQuestionCard {...defaultProps} onAnswerSelect={mockOnAnswerSelect} />);
      
      const optionButton = screen.getByText('4').closest('button');
      fireEvent.click(optionButton!);
      
      expect(mockOnAnswerSelect).toHaveBeenCalledWith(2);
    });

    it('should not call onAnswerSelect when exam is submitted', () => {
      const mockOnAnswerSelect = vi.fn();
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          isSubmitted={true}
          onAnswerSelect={mockOnAnswerSelect} 
        />
      );
      
      const optionButton = screen.getByText('4').closest('button');
      fireEvent.click(optionButton!);
      
      expect(mockOnAnswerSelect).not.toHaveBeenCalled();
    });

    it('should show selected answer with visual feedback', () => {
      render(<ExamQuestionCard {...defaultProps} selectedAnswer={2} />);
      
      const selectedButton = screen.getByText('4').closest('button');
      expect(selectedButton).toBeInTheDocument();
      
      // Check for check icon
      const checkIcon = selectedButton!.querySelector('.fa-check-circle');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show unselected options with circle icons', () => {
      render(<ExamQuestionCard {...defaultProps} selectedAnswer={2} />);
      
      const unselectedButton = screen.getByText('2').closest('button');
      expect(unselectedButton).toBeInTheDocument();
      
      // Check for circle icon
      const circleIcon = unselectedButton!.querySelector('.fa-circle');
      expect(circleIcon).toBeInTheDocument();
    });
  });

  describe('Pin Functionality', () => {
    it('should call onTogglePin when pin button is clicked', () => {
      const mockOnTogglePin = vi.fn();
      render(<ExamQuestionCard {...defaultProps} onTogglePin={mockOnTogglePin} />);
      
      const pinButton = screen.getByTitle('Fijar pregunta');
      fireEvent.click(pinButton);
      
      expect(mockOnTogglePin).toHaveBeenCalled();
    });

    it('should show pinned state correctly', () => {
      render(<ExamQuestionCard {...defaultProps} isPinned={true} />);
      
      const pinButton = screen.getByTitle('Desfijar pregunta');
      expect(pinButton).toBeInTheDocument();
      
      // Should have filled star icon
      const filledStar = pinButton.querySelector('.fas.fa-star');
      expect(filledStar).toBeInTheDocument();
    });

    it('should show unpinned state correctly', () => {
      render(<ExamQuestionCard {...defaultProps} isPinned={false} />);
      
      const pinButton = screen.getByTitle('Fijar pregunta');
      expect(pinButton).toBeInTheDocument();
      
      // Should have outline star icon
      const outlineStar = pinButton.querySelector('.far.fa-star');
      expect(outlineStar).toBeInTheDocument();
    });
  });

  describe('Overview Navigation', () => {
    it('should call onScrollToOverview when question header is clicked', () => {
      const mockOnScrollToOverview = vi.fn();
      render(<ExamQuestionCard {...defaultProps} onScrollToOverview={mockOnScrollToOverview} />);
      
      const overviewButton = screen.getByTitle('Ver en Vista General de Preguntas');
      fireEvent.click(overviewButton);
      
      expect(mockOnScrollToOverview).toHaveBeenCalled();
    });

    it('should display external link icon in overview button', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const overviewButton = screen.getByTitle('Ver en Vista General de Preguntas');
      const linkIcon = overviewButton.querySelector('.fa-external-link-alt');
      expect(linkIcon).toBeInTheDocument();
    });
  });

  describe('Submitted State', () => {
    const submittedProps = {
      ...defaultProps,
      isSubmitted: true,
      selectedAnswer: 1, // Incorrect answer (selected '3', correct is '4')
    };

    it('should show answer status for incorrect answer', () => {
      render(<ExamQuestionCard {...submittedProps} />);
      
      expect(screen.getByText('Respuesta incorrecta')).toBeInTheDocument();
      
      // Should show times icon
      const timesIcon = screen.getByText('Respuesta incorrecta').closest('div')!.querySelector('.fa-times-circle');
      expect(timesIcon).toBeInTheDocument();
    });

    it('should show answer status for correct answer', () => {
      render(<ExamQuestionCard {...submittedProps} selectedAnswer={2} />); // Correct answer
      
      expect(screen.getByText('Respuesta correcta')).toBeInTheDocument();
      
      // Should show check icon
      const checkIcon = screen.getByText('Respuesta correcta').closest('div')!.querySelector('.fa-check-circle');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should show no answer status when no answer selected', () => {
      render(<ExamQuestionCard {...submittedProps} selectedAnswer={undefined} />);
      
      expect(screen.getByText('Sin respuesta')).toBeInTheDocument();
      
      // Should show question icon
      const questionIcon = screen.getByText('Sin respuesta').closest('div')!.querySelector('.fa-question-circle');
      expect(questionIcon).toBeInTheDocument();
    });

    it('should highlight correct answer in green', () => {
      render(<ExamQuestionCard {...submittedProps} />);
      
      const correctAnswerButton = screen.getByText('4').closest('button');
      expect(correctAnswerButton).toBeInTheDocument();
      
      // Should have check icon for correct answer
      const checkIcon = correctAnswerButton!.querySelector('.fa-check-circle');
      expect(checkIcon).toBeInTheDocument();
    });

    it('should highlight incorrect selected answer in red', () => {
      render(<ExamQuestionCard {...submittedProps} />);
      
      const incorrectAnswerButton = screen.getByText('3').closest('button');
      expect(incorrectAnswerButton).toBeInTheDocument();
      
      // Should have times icon for incorrect answer
      const timesIcon = incorrectAnswerButton!.querySelector('.fa-times-circle');
      expect(timesIcon).toBeInTheDocument();
    });

    it('should disable answer buttons when submitted', () => {
      render(<ExamQuestionCard {...submittedProps} />);
      
      const answerButtons = screen.getAllByRole('button').filter(button => 
        button.textContent?.includes('A.') || 
        button.textContent?.includes('B.') || 
        button.textContent?.includes('C.') || 
        button.textContent?.includes('D.')
      );
      
      answerButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Feedback Display', () => {
    it('should show feedback when exam is submitted and feedback is provided', () => {
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          isSubmitted={true}
          feedback="Two plus two equals four"
          showFeedback={true}
        />
      );
      
      expect(screen.getByText('Retroalimentación')).toBeInTheDocument();
      expect(screen.getByText('Two plus two equals four')).toBeInTheDocument();
    });

    it('should not show feedback when exam is not submitted', () => {
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          isSubmitted={false}
          feedback="Two plus two equals four"
          showFeedback={true}
        />
      );
      
      expect(screen.queryByText('Retroalimentación')).not.toBeInTheDocument();
      expect(screen.queryByText('Two plus two equals four')).not.toBeInTheDocument();
    });

    it('should not show feedback when showFeedback is false', () => {
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          isSubmitted={true}
          feedback="Two plus two equals four"
          showFeedback={false}
        />
      );
      
      expect(screen.queryByText('Retroalimentación')).not.toBeInTheDocument();
    });

    it('should show lightbulb icon in feedback section', () => {
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          isSubmitted={true}
          feedback="Two plus two equals four"
          showFeedback={true}
        />
      );
      
      // Check for the lightbulb icon more specifically
      const lightbulbIcons = document.querySelectorAll('.fa-lightbulb');
      expect(lightbulbIcons.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Hints', () => {
    it('should show navigation hint when exam is not submitted', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      expect(screen.getByText('← → para navegar | 1-4 para responder')).toBeInTheDocument();
    });

    it('should show keyboard tip when exam is not submitted', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      // Check for the tip text using a more flexible matcher
      expect(screen.getByText(/Usa las teclas 1-4 para seleccionar respuestas rápidamente/)).toBeInTheDocument();
    });

    it('should not show navigation hints when exam is submitted', () => {
      render(<ExamQuestionCard {...defaultProps} isSubmitted={true} />);
      
      expect(screen.queryByText('← → para navegar | 1-4 para responder')).not.toBeInTheDocument();
      expect(screen.queryByText(/Usa las teclas 1-4 para seleccionar respuestas rápidamente/)).not.toBeInTheDocument();
    });
  });

  describe('Question Without Options', () => {
    it('should handle question without options gracefully', () => {
      const questionWithoutOptions = {
        ...mockQuestion,
        opciones: undefined
      };

      render(<ExamQuestionCard {...defaultProps} question={questionWithoutOptions} />);
      
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      // Should not crash and should not show any option buttons
      expect(screen.queryByText('A.')).not.toBeInTheDocument();
    });

    it('should handle empty options array', () => {
      const questionWithEmptyOptions = {
        ...mockQuestion,
        opciones: []
      };

      render(<ExamQuestionCard {...defaultProps} question={questionWithEmptyOptions} />);
      
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
      expect(screen.queryByText('A.')).not.toBeInTheDocument();
    });
  });

  describe('Component Props', () => {
    it('should handle undefined onScrollToOverview gracefully', () => {
      render(<ExamQuestionCard {...defaultProps} onScrollToOverview={undefined} />);
      
      const overviewButton = screen.getByTitle('Ver en Vista General de Preguntas');
      expect(() => fireEvent.click(overviewButton)).not.toThrow();
    });

    it('should handle undefined navigation functions gracefully', () => {
      render(
        <ExamQuestionCard 
          {...defaultProps} 
          onPrevious={undefined}
          onNext={undefined}
        />
      );
      
      // Component should render without errors
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });

    it('should use default values for optional props', () => {
      const minimalProps = {
        question: mockQuestion,
        questionIndex: 0,
        totalQuestions: 1,
        isSubmitted: false,
        isPinned: false,
        onAnswerSelect: vi.fn(),
        onTogglePin: vi.fn(),
      };

      render(<ExamQuestionCard {...minimalProps} />);
      
      expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    });
  });

  describe('Mouse Interactions', () => {
    it('should handle mouse hover on overview button', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const overviewButton = screen.getByTitle('Ver en Vista General de Preguntas');
      
      expect(() => {
        fireEvent.mouseEnter(overviewButton);
        fireEvent.mouseLeave(overviewButton);
      }).not.toThrow();
    });

    it('should handle mouse hover on pin button', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const pinButton = screen.getByTitle('Fijar pregunta');
      
      expect(() => {
        fireEvent.mouseEnter(pinButton);
        fireEvent.mouseLeave(pinButton);
      }).not.toThrow();
    });

    it('should handle mouse hover on answer buttons', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const answerButton = screen.getByText('4').closest('button');
      
      expect(() => {
        fireEvent.mouseEnter(answerButton!);
        fireEvent.mouseLeave(answerButton!);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should have proper title attributes for interactive elements', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      expect(screen.getByTitle('Ver en Vista General de Preguntas')).toBeInTheDocument();
      expect(screen.getByTitle('Fijar pregunta')).toBeInTheDocument();
    });

    it('should maintain semantic structure with headings', () => {
      render(<ExamQuestionCard {...defaultProps} />);
      
      const questionHeading = screen.getByRole('heading');
      expect(questionHeading).toHaveTextContent('What is 2 + 2?');
    });
  });

  describe('Different Question Types', () => {
    it('should handle question with different number of options', () => {
      const questionWithTwoOptions = {
        ...mockQuestion,
        opciones: ['True', 'False'],
        correcta: 0
      };

      render(<ExamQuestionCard {...defaultProps} question={questionWithTwoOptions} />);
      
      expect(screen.getByText('True')).toBeInTheDocument();
      expect(screen.getByText('False')).toBeInTheDocument();
      expect(screen.getByText('A.')).toBeInTheDocument();
      expect(screen.getByText('B.')).toBeInTheDocument();
      expect(screen.queryByText('C.')).not.toBeInTheDocument();
    });

    it('should handle long question text', () => {
      const longQuestion = {
        ...mockQuestion,
        pregunta: 'This is a very long question that might wrap to multiple lines and should be displayed properly without breaking the layout or causing any visual issues in the component.'
      };

      render(<ExamQuestionCard {...defaultProps} question={longQuestion} />);
      
      expect(screen.getByText(/This is a very long question/)).toBeInTheDocument();
    });

    it('should handle long answer options', () => {
      const questionWithLongOptions = {
        ...mockQuestion,
        opciones: [
          'This is a very long answer option that might wrap to multiple lines',
          'Another long option with detailed explanation',
          'Short answer',
          'Medium length answer option'
        ]
      };

      render(<ExamQuestionCard {...defaultProps} question={questionWithLongOptions} />);
      
      expect(screen.getByText(/This is a very long answer option/)).toBeInTheDocument();
      expect(screen.getByText(/Another long option/)).toBeInTheDocument();
    });
  });
});