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
    <div className="auth-background">

      {/* Screenshots Collage Background */}
      <div className="auth-screenshots-collage">
        <div className="screenshot-item screenshot-1">
          <img src="/screenshots/captura_1.jpg" alt="Dashboard VikDev" />
          <div className="screenshot-overlay">
            <h4>Dashboard Intuitivo</h4>
            <p>Accede a todos tus exámenes y estadísticas en un solo lugar</p>
          </div>
        </div>
        <div className="screenshot-item screenshot-2">
          <img src="/screenshots/captura_2.jpg" alt="Configuración de examen" />
          <div className="screenshot-overlay">
            <h4>Configuración Avanzada</h4>
            <p>Personaliza cada detalle de tu examen con IA</p>
          </div>
        </div>
        <div className="screenshot-item screenshot-3">
          <img src="/screenshots/captura_3.jpg" alt="Simulación de examen" />
          <div className="screenshot-overlay">
            <h4>Simulación Realista</h4>
            <p>Experiencia de examen completa con cronómetro y navegación</p>
          </div>
        </div>
        <div className="screenshot-item screenshot-4">
          <img src="/screenshots/captura_4.jpg" alt="Resultados detallados" />
          <div className="screenshot-overlay">
            <h4>Análisis Detallado</h4>
            <p>Obtén resultados precisos y retroalimentación inteligente</p>
          </div>
        </div>
      </div>


      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-brand-icon">
            <i className="fas fa-brain text-3xl text-white"></i>
          </div>
          <h1 className="auth-title">VikDev</h1>
          <p className="auth-subtitle">Regístrate y comienza a generar exámenes</p>
        </div>

        <div className="auth-form-container">
          <form onSubmit={handleSignUp}>
            <div className="auth-input-group">
              <label htmlFor="email" className="auth-label">
                Correo electrónico
              </label>
              <div className="auth-input-container">
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="auth-input"
                  placeholder="tucorreo@ejemplo.com"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <i className="fas fa-envelope auth-input-icon"></i>
              </div>
            </div>

            <div className="auth-input-group">
              <label htmlFor="password" className="auth-label">
                Contraseña
              </label>
              <div className="auth-input-container">
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="auth-input"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i className="fas fa-lock auth-input-icon"></i>
                <i className="fas fa-eye-slash auth-password-toggle"></i>
              </div>
            </div>

            <div className="auth-input-group">
              <button type="submit" className="auth-button">
                <span>Crear cuenta</span>
              </button>
            </div>
          </form>
          <div className="auth-link">
            ¿Ya tienes una cuenta?{" "}
            <Link to="/login">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
