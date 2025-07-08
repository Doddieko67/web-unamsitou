import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock simple de Supabase
vi.mock('../../supabase.config', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ subscription: { unsubscribe: vi.fn() } })),
    },
  },
}));

import { useAuthStore } from '../authStore';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.getState().setUser(null);
    useAuthStore.getState().setSession(null);
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setError(null);
    
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Basic State Management', () => {
    it('should set user correctly', () => {
      const mockUser = { id: 'test-id', email: 'test@example.com' } as any;
      
      useAuthStore.getState().setUser(mockUser);
      
      expect(useAuthStore.getState().user).toEqual(mockUser);
    });

    it('should set session correctly', () => {
      const mockSession = { access_token: 'token', user: { id: 'test' } } as any;
      
      useAuthStore.getState().setSession(mockSession);
      
      expect(useAuthStore.getState().session).toEqual(mockSession);
    });

    it('should set loading state correctly', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().loading).toBe(true);
      
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().loading).toBe(false);
    });

    it('should set error correctly', () => {
      const error = 'Test error';
      
      useAuthStore.getState().setError(error);
      expect(useAuthStore.getState().error).toBe(error);
    });

    it('should clear error', () => {
      useAuthStore.getState().setError('Test error');
      useAuthStore.getState().clearError();
      
      expect(useAuthStore.getState().error).toBeNull();
    });
  });
});