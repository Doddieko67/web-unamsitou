import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ThemeToggle } from '../ThemeToggle';

// Mock del ThemeProvider
const mockToggleTheme = vi.fn();
vi.mock('../../providers/ThemeProvider', () => ({
  useTheme: () => ({
    theme: 'light',
    toggleTheme: mockToggleTheme,
  }),
}));

describe('ThemeToggle', () => {
  it('should render theme toggle button', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Cambiar a modo oscuro');
  });

  it('should call toggleTheme when clicked', () => {
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledOnce();
  });

  it('should render with different variants', () => {
    const { rerender } = render(<ThemeToggle variant="icon" />);
    let button = screen.getByRole('button');
    expect(button).toBeInTheDocument();

    rerender(<ThemeToggle variant="switch" />);
    button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<ThemeToggle className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});