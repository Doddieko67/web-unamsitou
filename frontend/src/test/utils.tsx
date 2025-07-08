import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';

// Crear un QueryClient para tests
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Provider wrapper para tests
interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  const queryClient = createTestQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock para Zustand stores
export const mockAuthStore = {
  user: null,
  session: null,
  loading: false,
  error: null,
  setUser: vi.fn(),
  setSession: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  updatePassword: vi.fn(),
  initialize: vi.fn(),
  clearError: vi.fn(),
};


// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockExam = (overrides = {}) => ({
  id: 'test-exam-id',
  titulo: 'Test Exam',
  descripcion: 'Test Description',
  dificultad: 'easy' as const,
  numero_preguntas: 5,
  tiempo_limite_segundos: 300,
  dato: [
    {
      id: 1,
      pregunta: 'Test question 1?',
      opciones: ['Option A', 'Option B', 'Option C', 'Option D'],
      correcta: 0,
    },
  ],
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: createMockUser(),
  ...overrides,
});

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };