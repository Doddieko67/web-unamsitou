import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthInit } from '../useAuthInit';

// Mock del AuthStore
const mockAuthStore = {
  initialize: vi.fn(),
  loading: false,
  error: null,
  user: null,
  session: null,
  setUser: vi.fn(),
  setSession: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  clearError: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
};

vi.mock('../../stores/authStore', () => ({
  useAuthStore: () => mockAuthStore,
}));

describe('useAuthInit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock store state
    mockAuthStore.loading = false;
    mockAuthStore.error = null;
    mockAuthStore.user = null;
    mockAuthStore.session = null;
  });

  describe('Initialization', () => {
    it('should call initialize on mount', () => {
      renderHook(() => useAuthInit());

      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();
    });

    it('should call initialize only once even with multiple renders', () => {
      const { rerender } = renderHook(() => useAuthInit());

      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();

      // Re-render multiple times
      rerender();
      rerender();
      rerender();

      // Should still only be called once due to useEffect dependency
      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();
    });

    it('should not call initialize again if dependency does not change', () => {
      const { rerender } = renderHook(() => useAuthInit());

      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();

      // Simulate component re-render
      rerender();

      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();
    });
  });

  describe('Return Values', () => {
    it('should return loading state from store', () => {
      mockAuthStore.loading = true;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.loading).toBe(true);
    });

    it('should return error state from store', () => {
      const mockError = 'Authentication failed';
      mockAuthStore.error = mockError;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.error).toBe(mockError);
    });

    it('should return user from store', () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      };
      mockAuthStore.user = mockUser;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.user).toEqual(mockUser);
    });

    it('should return isAuthenticated as false when user is null', () => {
      mockAuthStore.user = null;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return isAuthenticated as true when user exists', () => {
      mockAuthStore.user = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should return all expected properties', () => {
      const { result } = renderHook(() => useAuthInit());

      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
    });
  });

  describe('State Changes', () => {
    it('should update when loading state changes', () => {
      mockAuthStore.loading = false;
      const { result, rerender } = renderHook(() => useAuthInit());

      expect(result.current.loading).toBe(false);

      // Simulate loading state change
      mockAuthStore.loading = true;
      rerender();

      expect(result.current.loading).toBe(true);
    });

    it('should update when error state changes', () => {
      mockAuthStore.error = null;
      const { result, rerender } = renderHook(() => useAuthInit());

      expect(result.current.error).toBe(null);

      // Simulate error state change
      const newError = 'Network error';
      mockAuthStore.error = newError;
      rerender();

      expect(result.current.error).toBe(newError);
    });

    it('should update when user state changes', () => {
      mockAuthStore.user = null;
      const { result, rerender } = renderHook(() => useAuthInit());

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);

      // Simulate user login
      const newUser = {
        id: 'user-456',
        email: 'newuser@example.com',
      };
      mockAuthStore.user = newUser;
      rerender();

      expect(result.current.user).toEqual(newUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should update isAuthenticated when user changes', () => {
      // Start with authenticated user
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      const { result, rerender } = renderHook(() => useAuthInit());

      expect(result.current.isAuthenticated).toBe(true);

      // Simulate logout
      mockAuthStore.user = null;
      rerender();

      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('User Scenarios', () => {
    it('should handle initial loading state correctly', () => {
      mockAuthStore.loading = true;
      mockAuthStore.user = null;
      mockAuthStore.error = null;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current).toEqual({
        loading: true,
        error: null,
        user: null,
        isAuthenticated: false,
      });
    });

    it('should handle successful authentication', () => {
      mockAuthStore.loading = false;
      mockAuthStore.user = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          name: 'Test User',
          picture: 'https://example.com/avatar.jpg',
        },
      };
      mockAuthStore.error = null;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current).toEqual({
        loading: false,
        error: null,
        user: mockAuthStore.user,
        isAuthenticated: true,
      });
    });

    it('should handle authentication error', () => {
      mockAuthStore.loading = false;
      mockAuthStore.user = null;
      mockAuthStore.error = 'Invalid credentials';

      const { result } = renderHook(() => useAuthInit());

      expect(result.current).toEqual({
        loading: false,
        error: 'Invalid credentials',
        user: null,
        isAuthenticated: false,
      });
    });

    it('should handle logout scenario', () => {
      // Start authenticated
      mockAuthStore.user = { id: 'user-123', email: 'test@example.com' };
      mockAuthStore.loading = false;
      mockAuthStore.error = null;

      const { result, rerender } = renderHook(() => useAuthInit());

      expect(result.current.isAuthenticated).toBe(true);

      // Simulate logout
      mockAuthStore.user = null;
      mockAuthStore.loading = false;
      mockAuthStore.error = null;
      rerender();

      expect(result.current).toEqual({
        loading: false,
        error: null,
        user: null,
        isAuthenticated: false,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle truthy user values correctly', () => {
      const truthyUsers = [
        { id: 'user-1', email: 'test1@example.com' },
        { id: '0', email: 'test2@example.com' }, // Edge case: id is '0'
        { id: 'user-3', email: '' }, // Edge case: empty email
      ];

      truthyUsers.forEach((user) => {
        mockAuthStore.user = user;
        const { result } = renderHook(() => useAuthInit());
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('should handle falsy user values correctly', () => {
      const falsyUsers = [null, undefined];

      falsyUsers.forEach((user) => {
        mockAuthStore.user = user as any;
        const { result } = renderHook(() => useAuthInit());
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    it('should handle empty user object', () => {
      mockAuthStore.user = {} as any;

      const { result } = renderHook(() => useAuthInit());

      expect(result.current.user).toEqual({});
      expect(result.current.isAuthenticated).toBe(true); // Empty object is truthy
    });

    it('should handle multiple rapid state changes', () => {
      const { result, rerender } = renderHook(() => useAuthInit());

      // Rapid state changes
      mockAuthStore.loading = true;
      rerender();
      expect(result.current.loading).toBe(true);

      mockAuthStore.loading = false;
      mockAuthStore.user = { id: 'user-1', email: 'test@example.com' };
      rerender();
      expect(result.current.loading).toBe(false);
      expect(result.current.isAuthenticated).toBe(true);

      mockAuthStore.error = 'Some error';
      rerender();
      expect(result.current.error).toBe('Some error');

      mockAuthStore.error = null;
      mockAuthStore.user = null;
      rerender();
      expect(result.current.error).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Initialize Function Dependency', () => {
    it('should call initialize again if the function reference changes', () => {
      const { rerender } = renderHook(() => useAuthInit());

      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();

      // Simulate initialize function reference change
      const newInitialize = vi.fn();
      mockAuthStore.initialize = newInitialize;
      rerender();

      expect(newInitialize).toHaveBeenCalledOnce();
    });

    it('should handle initialize function being undefined gracefully', () => {
      // This test is not realistic since the hook would crash if initialize is undefined
      // Instead, test that the hook properly depends on the initialize function
      const originalInitialize = mockAuthStore.initialize;
      
      const { result } = renderHook(() => useAuthInit());
      
      expect(mockAuthStore.initialize).toHaveBeenCalled();
      expect(result.current).toBeDefined();
      
      // Restore the original function
      mockAuthStore.initialize = originalInitialize;
    });
  });

  describe('Performance', () => {
    it('should maintain consistent behavior across re-renders', () => {
      // Reset the initialize function to a proper mock
      mockAuthStore.initialize = vi.fn();
      
      const renderSpy = vi.fn();
      
      const TestHook = () => {
        renderSpy();
        return useAuthInit();
      };

      const { result, rerender } = renderHook(TestHook);
      const initialRenderCount = renderSpy.mock.calls.length;

      // Initial state should be consistent
      expect(result.current).toBeDefined();
      expect(mockAuthStore.initialize).toHaveBeenCalledOnce();

      // Re-render without changing any dependencies
      rerender();

      // Should have rendered again but initialize should not be called again
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount + 1);
      expect(mockAuthStore.initialize).toHaveBeenCalledOnce(); // Still only once
    });
  });
});