import { Link } from "react-router";
import { useAuthStore } from "../stores/authStore";
import { useState } from "react";
import Swal from "sweetalert2";

export function Login() {
  const { signIn, signInWithGoogle } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto
    try {
      await signIn(email, password);
      // La redirección se maneja en el AuthContext
    } catch (error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Contrasenia o correo incorrecto. Intentalo de nuevo",
      });
      console.error(error);
    }
  };

  const handleGoogleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signInWithGoogle();
      // La redirección se maneja en el AuthContext
    } catch (error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Error al iniciar sesion con Google",
      });
      console.error(error);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div 
            className="mx-auto h-16 w-16 flex items-center justify-center rounded-full shadow-md mb-4 transition-colors duration-300"
            style={{
              backgroundColor: 'var(--theme-bg-primary)',
              boxShadow: 'var(--theme-shadow-md)'
            }}
          >
            <i className="fas fa-brain text-3xl text-indigo-600 dark:text-indigo-400"></i>
          </div>
          <h1 
            className="text-3xl font-bold transition-colors duration-300"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            ExamGen AI
          </h1>
          <p 
            className="mt-2 transition-colors duration-300"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        <div 
          className="rounded-2xl login-container p-8 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            boxShadow: 'var(--theme-shadow-lg)'
          }}
        >
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1 transition-colors duration-300"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i 
                    className="fas fa-envelope transition-colors duration-300"
                    style={{ color: 'var(--theme-text-muted)' }}
                  ></i>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="input-field w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--theme-bg-primary)',
                    borderColor: 'var(--theme-border-primary)',
                    color: 'var(--theme-text-primary)'
                  }}
                  placeholder="tucorreo@ejemplo.com"
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium transition-colors duration-300"
                  style={{ color: 'var(--theme-text-secondary)' }}
                >
                  Contraseña
                </label>
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i 
                    className="fas fa-lock transition-colors duration-300"
                    style={{ color: 'var(--theme-text-muted)' }}
                  ></i>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="input-field w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all duration-300"
                  style={{
                    backgroundColor: 'var(--theme-bg-primary)',
                    borderColor: 'var(--theme-border-primary)',
                    color: 'var(--theme-text-primary)'
                  }}
                  placeholder="••••••••"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <i
                    className="toggle-password fas fa-eye-slash transition-colors duration-300"
                    style={{ color: 'var(--theme-text-muted)' }}
                    id="togglePassword"
                  ></i>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p 
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--theme-text-secondary)' }}
              >
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
                >
                  Regístrate ahora
                </Link>
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
              >
                <span id="btnText">Iniciar sesión</span>
                <svg
                  id="loadingSpinner"
                  className="hidden ml-2 h-5 w-5 text-white loading-spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div 
                  className="w-full border-t transition-colors duration-300"
                  style={{ borderColor: 'var(--theme-border-primary)' }}
                ></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span 
                  className="px-2 transition-colors duration-300"
                  style={{
                    backgroundColor: 'var(--theme-bg-primary)',
                    color: 'var(--theme-text-muted)'
                  }}
                >
                  O inicia sesión con
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="social-btn w-full inline-flex justify-center items-center py-2 px-4 border rounded-lg text-sm font-medium transition-all duration-300 hover:shadow-sm"
              style={{
                backgroundColor: 'var(--theme-bg-primary)',
                borderColor: 'var(--theme-border-primary)',
                color: 'var(--theme-text-secondary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-hover-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--theme-bg-primary)';
              }}
            >
              <i className="fab fa-google text-red-500 mr-2"></i> Google
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
