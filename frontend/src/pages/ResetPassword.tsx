import { useState } from "react";
import { useAuthStore } from "../stores/authStore";
import { Link } from "react-router";
import Swal from "sweetalert2";

export function ResetPassword() {
  const { resetPassword } = useAuthStore();
  const [email, setEmail] = useState("");

  const handleResetPasswordForEmail = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    try {
      await resetPassword(email);
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: "Se ha enviado un correo de restablecimiento correctamente, revise su bandeja de entrada",
      });
      // La redirección se maneja en el AuthContext
    } catch (error) {
      console.log(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error al enviar el correo de restablecimiento",
      });
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
          <p className="auth-subtitle">Recupera tu contraseña</p>
        </div>

        <div className="auth-form-container">
          <form onSubmit={handleResetPasswordForEmail}>
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
                  placeholder="Ingresa tu correo electrónico"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <i className="fas fa-envelope auth-input-icon"></i>
              </div>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '0.75rem', 
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                Te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            <div className="auth-input-group">
              <button type="submit" className="auth-button">
                <i className="fas fa-paper-plane mr-2"></i>
                <span>Enviar correo de recuperación</span>
              </button>
            </div>
          </form>
          <div className="auth-link">
            <i className="fas fa-arrow-left mr-2"></i>
            Regresar a{" "}
            <Link to="/login">Iniciar sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
