import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router";
import Swal from "sweetalert2";

export function SignUp() {
  const { signUp } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Se ha enviado un correo de confirmación correctamente, revise su bandeja de entrada",
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: "Ha ocurrido un error al registrar",
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
            Registrate
          </p>
        </div>

        <div 
          className="rounded-2xl login-container p-8 transition-colors duration-300"
          style={{
            backgroundColor: 'var(--theme-bg-primary)',
            boxShadow: 'var(--theme-shadow-lg)'
          }}
        >
          <form onSubmit={handleSignUp} className="space-y-6">
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
                  onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors duration-300"
              >
                <span>Registrar</span>
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
          <div className="mt-6 text-center">
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--theme-text-secondary)' }}
            >
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors duration-300"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
