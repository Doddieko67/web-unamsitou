import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeProvider';

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme, setTheme } = useTheme();
  
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <button data-testid="toggle-theme" onClick={toggleTheme}>
        Toggle
      </button>
      <button data-testid="set-light" onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid="set-dark" onClick={() => setTheme('dark')}>
        Set Dark
      </button>
    </div>
  );
};

// Component outside provider to test error
const ComponentWithoutProvider = () => {
  const { theme } = useTheme();
  return <div>{theme}</div>;
};

describe('ThemeProvider', () => {
  let mockLocalStorage: { [key: string]: string };
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let mockAddEventListener: ReturnType<typeof vi.fn>;
  let mockRemoveEventListener: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn((key: string) => mockLocalStorage[key] || null),
        setItem: vi.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: vi.fn(() => {
          mockLocalStorage = {};
        }),
      },
      writable: true,
    });

    // Mock document.documentElement
    Object.defineProperty(document, 'documentElement', {
      value: {
        setAttribute: vi.fn(),
        removeAttribute: vi.fn(),
      },
      writable: true,
    });

    // Mock matchMedia
    mockAddEventListener = vi.fn();
    mockRemoveEventListener = vi.fn();
    mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Theme Initialization', () => {
    it('should use light theme as default when no saved theme and no system preference', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should use saved theme from localStorage when available', () => {
      mockLocalStorage['theme'] = 'dark';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should use system preference when no saved theme', () => {
      mockMatchMedia.mockReturnValue({
        matches: true, // Prefers dark theme
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should prioritize saved theme over system preference', () => {
      mockLocalStorage['theme'] = 'light';
      mockMatchMedia.mockReturnValue({
        matches: true, // System prefers dark
        media: '(prefers-color-scheme: dark)',
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('Theme Toggling', () => {
    it('should toggle from light to dark', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should toggle from dark to light', () => {
      mockLocalStorage['theme'] = 'dark';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      
      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });

    it('should save theme to localStorage when toggling', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('toggle-theme'));
      
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('Theme Setting', () => {
    it('should set theme to light explicitly', () => {
      mockLocalStorage['theme'] = 'dark';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-light'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    it('should set theme to dark explicitly', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));
      
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
      expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });
  });

  describe('DOM Manipulation', () => {
    it('should set data-theme attribute when dark theme is active', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-dark'));
      
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });

    it('should remove data-theme attribute when light theme is active', () => {
      mockLocalStorage['theme'] = 'dark';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      fireEvent.click(screen.getByTestId('set-light'));
      
      expect(document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
    });

    it('should update DOM when theme changes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Start with light theme
      expect(document.documentElement.removeAttribute).toHaveBeenCalledWith('data-theme');
      
      // Toggle to dark
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    });
  });

  describe('System Theme Changes', () => {
    it('should listen to system theme changes', () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update theme when system preference changes and no explicit theme is set', () => {
      let changeHandler: (e: MediaQueryListEvent) => void;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // Simulate system theme change to dark
      act(() => {
        changeHandler({ matches: true } as MediaQueryListEvent);
      });

      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should NOT update theme when system changes if user has explicitly set theme', () => {
      let changeHandler: (e: MediaQueryListEvent) => void;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === 'change') {
          changeHandler = handler;
        }
      });

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // User explicitly sets dark theme
      fireEvent.click(screen.getByTestId('set-dark'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Simulate system theme change to light
      act(() => {
        changeHandler({ matches: false } as MediaQueryListEvent);
      });

      // Should still be dark because user explicitly set it
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useTheme is used outside ThemeProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(<ComponentWithoutProvider />);
      }).toThrow('useTheme must be used within a ThemeProvider');

      console.error = originalError;
    });

    it('should handle invalid theme values from localStorage', () => {
      // Test with invalid theme in localStorage
      // Note: The current implementation doesn't validate theme values,
      // so it will use whatever is in localStorage
      mockLocalStorage['theme'] = 'invalid-theme';

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      // The component uses the stored value as-is (this is current behavior)
      expect(screen.getByTestId('current-theme')).toHaveTextContent('invalid-theme');
      
      // But we can still toggle to valid themes
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    });
  });

  describe('Multiple Children', () => {
    it('should provide theme context to multiple children', () => {
      const ChildA = () => {
        const { theme } = useTheme();
        return <div data-testid="child-a">{theme}</div>;
      };

      const ChildB = () => {
        const { theme } = useTheme();
        return <div data-testid="child-b">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <ChildA />
          <ChildB />
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId('child-a')).toHaveTextContent('light');
      expect(screen.getByTestId('child-b')).toHaveTextContent('light');
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      fireEvent.click(screen.getByTestId('toggle-theme'));

      expect(screen.getByTestId('child-a')).toHaveTextContent('dark');
      expect(screen.getByTestId('child-b')).toHaveTextContent('dark');
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    });
  });

  describe('Performance', () => {
    it('should maintain theme state consistency across renders', () => {
      const renderSpy = vi.fn();
      
      const SpyComponent = () => {
        renderSpy();
        const { theme } = useTheme();
        return <div data-testid="spy-component">{theme}</div>;
      };

      render(
        <ThemeProvider>
          <SpyComponent />
          <TestComponent />
        </ThemeProvider>
      );

      const initialRenderCount = renderSpy.mock.calls.length;

      // Toggle theme to dark
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');

      // Toggle back to light
      fireEvent.click(screen.getByTestId('toggle-theme'));
      expect(screen.getByTestId('current-theme')).toHaveTextContent('light');

      // Should have rendered more times due to actual theme changes
      expect(renderSpy.mock.calls.length).toBeGreaterThan(initialRenderCount);
    });
  });
});