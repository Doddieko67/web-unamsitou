import { useState } from "react";
import { UserAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

export function UpdatePassword() {
  const { updatePassword } = UserAuth();
  const [password, setPassword] = useState("");

  const handleUpdatePassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await updatePassword(password);
      Swal.fire({
        icon: "success",
        title: "Contraseña actualizada",
        text: "Se ha actualizado la contraseña correctamente",
      });
      // La redirección se maneja en el AuthContext
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar la contraseña",
        text: "Ha ocurrido un error al actualizar la contraseña",
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
          <p className="text-gray-600 mt-2">Cambio de contrasenia</p>
        </div>

        <div className="bg-white rounded-2xl login-container p-8">
          <form onSubmit={handleUpdatePassword} className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
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
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <i
                    className="toggle-password fas fa-eye-slash text-gray-400"
                    id="togglePassword"
                  ></i>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
              >
                <span id="btnText">Cambiar contraseña</span>
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
        </div>
      </div>
    </>
  );
}
