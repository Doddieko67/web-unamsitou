import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '../supabase.config';
import type { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<{ provider: string; url: string } | null>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  initialize: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // State
      user: null,
      session: null,
      loading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Auth methods
      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión';
          set({
            error: message,
            loading: false,
            user: null,
            session: null,
          });
          throw error;
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              emailRedirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          set({
            user: data.user,
            session: data.session,
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al registrarse';
          set({
            error: message,
            loading: false,
            user: null,
            session: null,
          });
          throw error;
        }
      },

      signInWithGoogle: async () => {
        try {
          set({ loading: true, error: null });
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: window.location.origin,
            },
          });

          if (error) throw error;

          set({ loading: false });
          return data;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al iniciar sesión con Google';
          set({
            error: message,
            loading: false,
          });
          return null;
        }
      },

      signOut: async () => {
        try {
          set({ loading: true, error: null });
          
          const { error } = await supabase.auth.signOut();
          
          if (error) throw error;

          set({
            user: null,
            session: null,
            loading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al cerrar sesión';
          set({
            error: message,
            loading: false,
          });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
          });

          if (error) throw error;

          set({ loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al enviar email de recuperación';
          set({
            error: message,
            loading: false,
          });
          throw error;
        }
      },

      updatePassword: async (newPassword: string) => {
        try {
          set({ loading: true, error: null });
          
          const { error } = await supabase.auth.updateUser({
            password: newPassword,
          });

          if (error) throw error;

          set({ loading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al actualizar contraseña';
          set({
            error: message,
            loading: false,
          });
          throw error;
        }
      },

      initialize: async () => {
        try {
          set({ loading: true, error: null });

          // Obtener sesión actual
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) throw error;

          set({
            user: session?.user ?? null,
            session: session,
            loading: false,
          });

          // Escuchar cambios de auth
          supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            set({
              user: session?.user ?? null,
              session: session,
              loading: false,
            });
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Error al inicializar autenticación';
          set({
            error: message,
            loading: false,
            user: null,
            session: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
      }),
    }
  )
);