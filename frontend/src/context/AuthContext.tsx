import {
  ReactNode,
  useEffect,
  useState,
  createContext,
  useContext,
} from "react";
import { supabase } from "../supabase.config";
import { useNavigate } from "react-router"; // Asegúrate que la importación sea correcta (react-router-dom)
import { Provider, QueryData, Session, User } from "@supabase/supabase-js"; // Importa User y Session

interface PreguntaRespuestaData {
  id: number | string; // ID de la pregunta
  pregunta: string;
  opciones: { texto: string }[];
  correcta: number; // Índice de la opción correcta
  respuesta_usuario_indice?: number | null;
  // Índice de la respuesta dada por el usuario
  // ... otros campos que puedas tener por pregunta
}

const examsQuery = supabase.from("examenes").select("*");

type Exam = QueryData<typeof examsQuery>;

interface AuthContextType {
  signUpNewUser: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null } | null>;
  signInWithEmail: (
    email: string,
    password: string,
  ) => Promise<{ user: User | null; session: Session | null } | null>;
  signInWithGoogle: () => Promise<{ provider: Provider; url: string } | null>;
  signInWithFacebook: () => Promise<{ provider: Provider; url: string } | null>;
  signOut: () => Promise<void>;
  user: User | null; // El usuario puede ser User o null
  session: Session | null; // Puedes exponer la sesión completa si es útil
  loading: boolean; // Añadir estado de carga
  updatePassword: (password: string) => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<void>;
  exams: Exam[] | null;
  createExam: (
    titulo: string,
    dato: JSON,
    dificultad: string,
    numero_preguntas: number,
  ) => Promise<boolean | undefined>;
  updateExam: (
    examId: string,
    finalDatos: PreguntaRespuestaData[], // Usamos la interfaz para tipar
    tiempoTomadoSegundos: number,
  ) => Promise<boolean | undefined>;
}

interface AuthContextProviderProps {
  children: ReactNode;
}

// No es necesario exportar AuthContext directamente si tienes el hook UserAuth
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider: React.FC<AuthContextProviderProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null); // Estado para el usuario
  const [session, setSession] = useState<Session | null>(null); // Estado para la sesión
  const [loading, setLoading] = useState<boolean>(true); // Estado para saber si aún se está cargando la sesión inicial
  const [exams, setExams] = useState<Exam[] | null>(null);

  async function signUpNewUser(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null } | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      if (error) {
        console.error("Error durante la autenticación:", error);
        throw new Error("Ha ocurrido un error durante la autenticación");
      }
      return data;
    } catch (error) {
      console.error("Error during sign up:", error);
      throw new Error("An error occurred during sign up");
    }
  }

  async function signInWithEmail(
    email: string,
    password: string,
  ): Promise<{ user: User | null; session: Session | null } | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        console.error("Error durante la autenticación:", error.message);
        throw new Error("Ha ocurrido un error durante la autenticación");
      }
      return data;
    } catch (error) {
      console.error("Error during sign in:", error);
      throw new Error("An error occurred during sign in");
    }
  }
  async function signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        // Opcional: Puedes añadir opciones como redirectTo
        options: {
          redirectTo: window.location.origin, // Redirige de vuelta a tu app tras el login
        },
      });

      if (error) {
        console.error("Error durante la autenticación:", error.message);
        throw new Error("Ha ocurrido un error durante la autenticación");
      }
      return data; // data contiene { provider, url }
    } catch (error) {
      console.error("Error en signInWithGoogle:", error);
      return null; // Devuelve null en caso de error
    }
  }

  async function signInWithFacebook() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        // Opcional: Puedes añadir opciones como redirectTo
        options: {
          redirectTo: window.location.origin, // Redirige de vuelta a tu app tras el login
        },
      });
      if (error) {
        console.error("Error durante la autenticación:", error.message);
        throw new Error("Ha ocurrido un error durante la autenticación");
      }
      // signInWithOAuth redirige, no necesitas retornar `data` directamente aquí
      // La sesión se establecerá a través del onAuthStateChange
      // Si necesitas la URL para redirigir manualmente (menos común con OAuth), puedes retornarla
      return data; // data contiene { provider, url }
    } catch (error) {
      console.error("Error en signInWithGoogle:", error);
      return null; // Devuelve null en caso de error
    }
  }

  async function signOut() {
    setLoading(true); // Muestra carga mientras se cierra sesión
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error al salir:", error.message);
      setLoading(false); // Quita la carga si hay error
      throw new Error("Ha ocurrido un error al salir de la cuenta");
    }
  }

  async function resetPasswordForEmail(email: string) {
    setLoading(true); // Muestra carga mientras se restablece la contraseña
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) {
      console.error("Error al restablecer la contraseña:", error.message);
      setLoading(false); // Quita la carga si hay error
      throw new Error("Ha ocurrido un error al restablecer la contraseña");
    }
    setLoading(false); // Termina la carga después de un cambio
  }

  async function updatePassword(password: string) {
    await supabase.auth.updateUser({
      password: password,
    });
  }

  async function loadExamenes() {
    try {
      if (!user) return;
      const { data, error } = await supabase.from("examenes").select("*");

      if (error) throw error;
      setExams(data);
    } catch (error) {
      console.log(error);
    }
  }

  async function createExam(
    titulo: string,
    dato: JSON,
    dificultad: string,
    numero_preguntas: number,
  ) {
    try {
      if (!user) return false;
      const { error } = await supabase.from("examenes").insert({
        user_id: user.id,
        titulo: titulo,
        dato: dato,
        dificultad: dificultad,
        numero_preguntas: numero_preguntas,
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Actualiza un examen existente, lo marca como terminado y calcula los resultados.
   * @param examId El ID del examen a actualizar.
   * @param finalDatos El array JSONB completo con las respuestas del usuario incluidas.
   * @param tiempoTomadoSegundos El tiempo total empleado en el examen en segundos.
   * @returns {Promise<boolean>} True si la actualización fue exitosa, false en caso contrario.
   */
  async function updateExam(
    examId: string,
    finalDatos: PreguntaRespuestaData[], // Usamos la interfaz para tipar
    tiempoTomadoSegundos: number,
  ): Promise<boolean> {
    // Añadimos tipo de retorno Promise<boolean>
    try {
      // 1. Obtener el usuario actual
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error(
          "Usuario no autenticado para actualizar examen:",
          authError?.message,
        );
        return false;
      }

      // 2. Validar datos de entrada (básico)
      if (!examId || !Array.isArray(finalDatos) || tiempoTomadoSegundos < 0) {
        console.error("Datos inválidos para updateExam:", {
          examId,
          finalDatos,
          tiempoTomadoSegundos,
        });
        return false;
      }

      // 3. Calcular resultados desde finalDatos
      const numeroPreguntas = finalDatos.length;
      let numeroCorrectas = 0;

      finalDatos.forEach((pregunta) => {
        // Comprobar si la respuesta del usuario existe y es igual al índice correcto
        if (
          pregunta.respuesta_usuario_indice !== null &&
          pregunta.respuesta_usuario_indice !== undefined && // Más seguro
          pregunta.respuesta_usuario_indice === pregunta.correcta
        ) {
          numeroCorrectas++;
        }
      });

      // Calcular porcentaje (evitar división por cero)
      const puntajePorcentaje =
        numeroPreguntas > 0
          ? parseFloat(((numeroCorrectas / numeroPreguntas) * 100).toFixed(2)) // Calcula y redondea a 2 decimales
          : 0;

      // 4. Preparar el objeto de actualización para Supabase
      const updates = {
        estado: "terminado",
        fecha_fin: new Date().toISOString(), // Fecha actual en formato ISO para TIMESTAMPTZ
        tiempo_tomado_segundos: Math.round(tiempoTomadoSegundos), // Asegurar que sea entero
        numero_correctas: numeroCorrectas,
        puntaje_porcentaje: puntajePorcentaje,
        datos: finalDatos, // Guarda el estado final del JSONB con las respuestas
      };

      // 5. Ejecutar la actualización en Supabase
      const { error: updateError, data: updatedData } = await supabase
        .from("examenes")
        .update(updates)
        .eq("id", examId) // Asegúrate de actualizar solo el examen correcto
        .eq("user_id", user.id) // ¡MUY IMPORTANTE POR SEGURIDAD! Solo el dueño puede actualizar
        .eq("estado", "pendiente") // Opcional: Prevenir actualizar si ya está terminado o no ha empezado
        .select("id"); // Seleccionar algo para confirmar que se actualizó (opcional)

      if (updateError) {
        console.error(
          `Error actualizando examen ${examId} en Supabase:`,
          updateError,
        );
        throw updateError; // Propagar el error para manejo externo si es necesario
      }

      // Verificar si alguna fila fue actualizada (data tendrá contenido si .select() devuelve algo)
      if (!updatedData || updatedData.length === 0) {
        console.warn(
          `No se actualizó el examen ${examId}. Posibles razones: no encontrado, no pertenece al usuario, o no estaba en estado 'en_progreso'.`,
        );
        return false; // Indicar que no hubo actualización efectiva
      }

      console.log(
        `Examen ${examId} actualizado y marcado como terminado exitosamente.`,
      );
      return true; // Indicar éxito
    } catch (error) {
      // Capturar cualquier excepción inesperada
      console.error("Excepción en updateExam:", error);
      return false; // Indicar fallo general
    }
  }

  useEffect(() => {
    setLoading(true);
    // Intenta obtener la sesión inicial al cargar el componente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false); // Termina la carga inicial
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`Evento Supabase: ${event}`, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Termina la carga después de un cambio

        const currentPath = window.location.pathname;
        const publicRoutes = ["/login", "/signup", "/reset-password"]; // Rutas públicas permitidas

        if (
          (event === "SIGNED_OUT" || session === null) &&
          !publicRoutes.includes(currentPath)
        ) {
          navigate("/login", { replace: true });
        }
      },
    );

    // Limpia el listener cuando el componente se desmonta
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (user) {
      loadExamenes();
    } else {
      setExams(null);
    }
  }, [user]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <AuthContext.Provider
      value={{
        signUpNewUser,
        signInWithEmail,
        signInWithGoogle,
        signInWithFacebook,
        signOut,
        user,
        session,
        loading,
        resetPasswordForEmail,
        updatePassword,
        exams,
        createExam,
        updateExam,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("UserAuth debe ser usado dentro de un AuthContextProvider");
  }
  return context;
};
