import { Link } from "react-router";
import { UserAuth } from "../context/AuthContext";
import { useState } from "react";
import Swal from "sweetalert2";

export function Login() {
  const { signInWithGoogle, signInWithEmail, signInWithFacebook } = UserAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto
    try {
      await signInWithEmail(email, password);
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

  const handleFacebookSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await signInWithFacebook();
      // La redirección se maneja en el AuthContext
    } catch (error) {
      Swal.fire({
        title: "Error",
        icon: "error",
        text: "Error al intentar iniciar sesion con Facebook",
      });
      console.error(error);
    }
  };

  return (
    <>
      <div className="relative w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-white shadow-md mb-4">
            <i className="fas fa-brain text-3xl text-indigo-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">ExamGen AI</h1>
          <p className="text-gray-600 mt-2">
            Inicia sesión para acceder a tu cuenta
          </p>
        </div>

        <div className="bg-white rounded-2xl login-container p-8">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-gray-400"></i>
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="input-field w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <Link
                  to="/reset-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-gray-400"></i>
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="input-field w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <i
                    className="toggle-password fas fa-eye-slash text-gray-400"
                    id="togglePassword"
                  ></i>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Recordar mi sesión
              </label>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
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
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  O inicia sesión con
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="social-btn w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <i className="fab fa-google text-red-500 mr-2"></i> Google
            </button>
            <button
              onClick={handleFacebookSignIn}
              className="social-btn w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <i className="fab fa-facebook text-blue-500 mr-2"></i> Facebook
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link
                to="/signup"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Regístrate ahora
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
