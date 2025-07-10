import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router';
import { PublicRoute } from '../PublicRoute';

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
    Navigate: ({ to, replace }: any) => {
      mockNavigate({ to, replace });
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
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

describe('PublicRoute', () => {
  const TestChild = () => <div data-testid="public-content">Public Content</div>;

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
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.getByText('Verificando autenticación...')).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });

    it('should not show public content when loading', () => {
      mockAuthStore.loading = true;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated State', () => {
    it('should redirect to default page when user is authenticated', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com',
        user_metadata: { name: 'Test User' }
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/inicio',
        replace: true,
      });
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when redirectTo is provided', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute redirectTo="/dashboard">
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith({
        to: '/dashboard',
        replace: true,
      });
    });

    it('should not show public content when authenticated', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
    });

    it('should use replace navigation to prevent back button issues', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          replace: true,
        })
      );
    });
  });

  describe('Unauthenticated State', () => {
    it('should render public content when user is null', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(screen.getByText('Public Content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should render multiple children when unauthenticated', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <div data-testid="child-1">Login Form</div>
            <div data-testid="child-2">Footer</div>
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });

    it('should not redirect when user is not present', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('should handle undefined user correctly', () => {
      mockAuthStore.user = undefined;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('public-content')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Props Handling', () => {
    it('should use default redirectTo when not provided', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/inicio',
        })
      );
    });

    it('should handle empty children gracefully when unauthenticated', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      render(
        <RouterWrapper>
          <PublicRoute>
            {null}
          </PublicRoute>
        </RouterWrapper>
      );

      // Should not crash and should not redirect
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should accept custom redirectTo paths', () => {
      mockAuthStore.user = { 
        id: 'user-123', 
        email: 'test@example.com' 
      };
      mockAuthStore.loading = false;
      
      const customPaths = ['/home', '/dashboard', '/profile', '/admin'];
      
      customPaths.forEach((path) => {
        vi.clearAllMocks();
        
        render(
          <RouterWrapper>
            <PublicRoute redirectTo={path}>
              <TestChild />
            </PublicRoute>
          </RouterWrapper>
        );

        expect(mockNavigate).toHaveBeenCalledWith(
          expect.objectContaining({
            to: path,
          })
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should prioritize loading state over user state', () => {
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      mockAuthStore.loading = true; // Loading takes priority
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(screen.queryByTestId('public-content')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should work with complex nested children', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      const LoginForm = () => (
        <div data-testid="login-form">
          <input data-testid="email-input" placeholder="Email" />
          <input data-testid="password-input" placeholder="Password" />
          <button data-testid="submit-button">Login</button>
        </div>
      );
      
      render(
        <RouterWrapper>
          <PublicRoute>
            <LoginForm />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByTestId('email-input')).toBeInTheDocument();
      expect(screen.getByTestId('password-input')).toBeInTheDocument();
      expect(screen.getByTestId('submit-button')).toBeInTheDocument();
    });

    it('should handle rapid auth state changes', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      const { rerender } = render(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      // Initially should show public content
      expect(screen.getByTestId('public-content')).toBeInTheDocument();

      // Simulate user login
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      
      rerender(
        <RouterWrapper>
          <PublicRoute>
            <TestChild />
          </PublicRoute>
        </RouterWrapper>
      );

      // Should now redirect
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/inicio',
        })
      );
    });

    it('should handle different user object shapes', () => {
      const userVariations = [
        { id: 'user-1', email: 'test1@example.com' },
        { id: 'user-2', email: 'test2@example.com', user_metadata: { name: 'Test User' } },
        { id: 'user-3', email: 'test3@example.com', user_metadata: { name: 'Test', avatar: 'url' } },
      ];

      userVariations.forEach((user, index) => {
        vi.clearAllMocks();
        mockAuthStore.user = user;
        mockAuthStore.loading = false;
        
        render(
          <RouterWrapper>
            <PublicRoute>
              <TestChild />
            </PublicRoute>
          </RouterWrapper>
        );

        expect(mockNavigate).toHaveBeenCalledWith(
          expect.objectContaining({
            to: '/inicio',
          })
        );
      });
    });
  });

  describe('Integration with Auth Flow', () => {
    it('should work correctly in login/signup flow', () => {
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      
      const LoginPage = () => (
        <div data-testid="login-page">
          <h1>Login</h1>
          <form data-testid="login-form">
            <input name="email" placeholder="Email" />
            <input name="password" type="password" placeholder="Password" />
            <button type="submit">Sign In</button>
          </form>
        </div>
      );
      
      render(
        <RouterWrapper initialEntries={['/login']}>
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        </RouterWrapper>
      );

      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});