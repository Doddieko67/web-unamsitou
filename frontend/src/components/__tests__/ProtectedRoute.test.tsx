import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { ProtectedRoute } from '../ProtectedRoute';

// Mock del LoadingSpinner
vi.mock('../LoadingSpinner', () => ({
  LoadingSpinner: ({ text }: { text?: string }) => (
    <div data-testid="loading-spinner">{text}</div>
  ),
}));

// Mock del router Navigate
const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: any) => {
      mockNavigate({ to, state, replace });
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
    useLocation: () => ({ pathname: '/protected-page', search: '', hash: '', state: null, key: 'test' }),
  };
});

// Mock del AuthStore
const mockAuthStore = {
  user: null,
  loading: false,
  session: null,
  error: null,
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

// Wrapper con router para testing
const RouterWrapper = ({ children, initialEntries = ['/'] }: { children: React.ReactNode; initialEntries?: string[] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    {children}
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  const TestChild = () => <div data-testid="protected-content">Protected Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockAuthStore.user = null;
    mockAuthStore.loading = false;
    mockAuthStore.session = null;
    mockAuthStore.error = null;
  });

  describe('Loading State', () => {
    it('should show loading spinner when loading is true', () => {
      mockAuthStore.loading = true;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should not show protected content when loading', () => {
      mockAuthStore.loading = true;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should redirect to login when user is null', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/login',
        state: { from: { pathname: '/protected-page', search: '', hash: '', state: null, key: 'test' } },
        replace: true,
      });
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when redirectTo is provided', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute redirectTo="/custom-login">
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/custom-login',
        state: { from: { pathname: '/protected-page', search: '', hash: '', state: null, key: 'test' } },
        replace: true,
      });
    });

    it('should pass location state for post-login redirect', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({
            from: expect.any(Object),
          }),
        })
      );
    });
  });

  describe('Authenticated State', () => {
    it('should render protected content when user is authenticated', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com', 
        user_metadata: { name: 'Test User' } 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should render multiple children when authenticated', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should not redirect when user is present', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });
  });

  describe('Props Handling', () => {
    it('should use default redirectTo when not provided', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/login',
        })
      );
    });

    it('should handle empty children gracefully', () => {
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            {null}
          </ProtectedRoute>
        </RouterWrapper>
      );

      // Should not crash and should not show any content
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should prioritize loading state over user state', () => {
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      mockAuthStore.loading = true; // Loading takes priority
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle falsy user values correctly', () => {
      mockAuthStore.user = undefined;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <TestChild />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/login',
        })
      );
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should work with complex nested children', () => {
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      mockAuthStore.loading = false;
      
      const NestedComponent = () => (
        <div data-testid="nested-component">
          <div data-testid="deeply-nested">
            <span>Deeply nested content</span>
          </div>
        </div>
      );
      
      render(
        <RouterWrapper>
          <ProtectedRoute>
            <NestedComponent />
          </ProtectedRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('nested-component')).toBeInTheDocument();
      expect(screen.getByTestId('deeply-nested')).toBeInTheDocument();
      expect(screen.getByText('Deeply nested content')).toBeInTheDocument();
    });
  });
});