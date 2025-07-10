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
          <p className="auth-subtitle">Inicia sesión para acceder a tu cuenta</p>
        </div>

        <div className="auth-form-container">
          <form onSubmit={handleSignIn}>
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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="auth-label">
                  Contraseña
                </label>
                <Link
                  to="/reset-password"
                  style={{ 
                    color: 'rgba(99, 102, 241, 1)', 
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
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
                <span>Iniciar sesión</span>
              </button>
            </div>
          </form>

          <div className="auth-divider">
            <span className="auth-divider-text">O inicia sesión con</span>
          </div>

          <button onClick={handleGoogleSignIn} className="auth-social-button">
            <i className="fab fa-google text-red-400"></i>
            <span>Continuar con Google</span>
          </button>

          <div className="auth-link">
            ¿No tienes una cuenta?{" "}
            <Link to="/signup">Regístrate ahora</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
