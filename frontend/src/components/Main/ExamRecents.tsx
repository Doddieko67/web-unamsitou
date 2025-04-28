// src/components/ExamRecents.tsx
import { useCallback, useEffect, useState, useMemo } from "react"; // <-- Añadir useMemo
import { UserAuth } from "../../context/AuthContext"; // Ensure this path is correct
import { supabase } from "../../supabase.config"; // Ensure this path is correct

// Importa la interfaz ExamenData (si no está en este archivo)
import { ExamenData } from "./interfacesExam"; // Ajusta la ruta a tu interfaz

// Importa el nuevo componente de tarjeta
import { PreviewableRecentExamCard } from "./PreviewableExamRecents"; // Usar este que ya envuelve la tarjeta

import { useNavigate } from "react-router";

// --- Helper Functions (puedes dejarlas aquí o moverlas a un archivo separado e importarlas) ---
// Es recomendable moverlas a un archivo de utils y exportarlas para usarlas en RecentExamCard
// Si las mueves, elimina estas definiciones de aquí.
// Por simplicidad para este ejemplo, asumiré que están en un archivo separado importado en RecentExamCard.
// (Mantener el comentario como recordatorio)

// --- React Component ---
export function ExamRecents() {
  const { user } = UserAuth();
  const [recentExams, setRecentExams] = useState<ExamenData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para los IDs de exámenes pinneados
  // Idealmente, este estado podría persistir en localStorage o en la DB del usuario.
  // Por ahora, se mantiene solo en memoria.
  const [pinnedExams, setPinnedExams] = useState<{ [examId: string]: boolean }>(
    {},
  );

  const navigate = useNavigate();

  const handlePinExam = useCallback((examId: string) => {
    setPinnedExams((prevPinned) => {
      const newPinned = { ...prevPinned };
      // Toggle logic
      if (newPinned[examId]) {
        delete newPinned[examId]; // Unpin
      } else {
        newPinned[examId] = true; // Pin
      }
      // TODO: Consider persisting this state (e.g., localStorage, user metadata in DB)
      // so pins aren't lost on refresh.
      return newPinned;
    });
  }, []);

  const handleDeleteExam = useCallback(async (examId: string) => {
    setIsLoading(true); // O manejar el estado de carga solo para la eliminación si quieres
    try {
      // Primero, quita el pin si está pinneado para evitar inconsistencias
      setPinnedExams((prevPinned) => {
        const newPinned = { ...prevPinned };
        delete newPinned[examId];
        return newPinned;
      });

      const { error: examError } = await supabase
        .from("examenes")
        .delete()
        .eq("id", examId);

      if (examError) {
        console.error("Error deleting exam:", examError);
        // Podrías revertir el estado si la eliminación falla
      } else {
        // Si la eliminación en la DB fue exitosa, actualiza el estado local
        setRecentExams((prevExams) =>
          prevExams.filter((exam) => exam.id !== examId),
        );
      }
    } catch (error) {
      console.error("Error deleting exam:", error);
      // Podrías mostrar un mensaje de error al usuario
    } finally {
      // Si manejas la carga global, restablece aquí
      // setIsLoading(false);
    }
    // Podríamos dejar isLoading true hasta que se recarguen los datos, o solo para la eliminación
    // Para simplificar, asumiremos que la UI se actualiza rápidamente al filtrar.
    setIsLoading(false); // Reset loading state after deletion process
  }, []); // Dependencies might include user if you need to fetch data again

  // Estado para la paginación de los NO pinneados
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const fetchRecentExams = async () => {
      if (!user) {
        setRecentExams([]);
        setIsLoading(false);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("examenes")
          .select("*")
          .eq("user_id", user.id)
          .order("fecha_inicio", { ascending: false });

        if (error) {
          setError(`Error: ${error.message}`);
          setRecentExams([]);
        } else {
          const formattedData = data.map((item) => ({
            ...item,
            // Asegúrate de que 'datos' sea un array.
            // Si los datos en Supabase pueden ser null o no array, valida:
            datos: Array.isArray(item.datos) ? item.datos : [],
            // Aquí podrías inicializar el estado 'pinnedExams' al cargar si
            // estuviera guardado en los datos del usuario o en otro lugar.
            // Por ahora, 'pinnedExams' empieza vacío y el usuario fija desde 0 cada vez.
          }));
          setRecentExams(formattedData as ExamenData[]); // Cast after validation
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setRecentExams([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentExams();
  }, [user]); // Dependencia 'user' asegura que se cargan cuando el usuario cambia/se autentica

  // --- Derivar estados o listas a partir de los estados principales ---
  // Usamos useMemo para evitar recalcular estas listas en cada render
  // si recentExams o pinnedExams no han cambiado.
  const pinnedExamList = useMemo(() => {
    return recentExams.filter((exam) => pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]);

  const nonPinnedExamList = useMemo(() => {
    return recentExams.filter((exam) => !pinnedExams[exam.id]);
  }, [recentExams, pinnedExams]);

  // Aplicar paginación solo a la lista de no pinneados
  const slicedNonPinnedExams = useMemo(() => {
    return nonPinnedExamList.slice(0, visibleCount);
  }, [nonPinnedExamList, visibleCount]);

  const handleLoadMore = useCallback(() => {
    setVisibleCount((prev) => prev + 6); // Carga 6 más de la lista de no pinneados
  }, []);

  const handleEntireCard = useCallback(
    (examId: string) => {
      navigate(`/examen/${examId}`); // Navega a la página de detalles del examen
    },
    [navigate],
  ); // Dependencia 'navigate'

  // Comprobación para saber si hay contenido total (pinneados o no)
  const hasExams = recentExams.length > 0;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          Tus exámenes recientes
        </h2>
      </div>

      {/* Mensajes de estado global */}
      {isLoading && (
        <p className="text-gray-600 text-center">Cargando exámenes...</p>
      )}

      {!isLoading && error && (
        <p className="text-red-600 text-center">{error}</p>
      )}

      {!isLoading && !error && !hasExams && (
        <p className="text-gray-600 text-center">
          No tienes exámenes recientes. Crea uno para empezar.
        </p>
      )}

      {/* Contenido si hay exámenes cargados */}
      {!isLoading && !error && hasExams && (
        <>
          {" "}
          {/* Usamos un fragmento para agrupar las secciones */}
          {/* Sección de Exámenes Fijados */}
          {pinnedExamList.length > 0 && (
            <div className="mb-8">
              {" "}
              {/* Añadir margen inferior si hay pinneados */}
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                Exámenes Fijados ({pinnedExamList.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pinnedExamList.map((exam, index) => (
                  <PreviewableRecentExamCard
                    key={exam.id}
                    exam={exam}
                    onDelete={handleDeleteExam}
                    // El índice aquí es dentro de la lista de pinneados.
                    // Ajusta la lógica de posicionamiento de la preview si es necesario.
                    index={index}
                    onPinToggle={handlePinExam}
                    isPinneable={true}
                    isThisPinned={true}
                    onEntireToggle={handleEntireCard}
                  />
                ))}
              </div>
              {/* Separador visual si también hay exámenes no pinneados */}
              {slicedNonPinnedExams.length > 0 && (
                <div className="border-t border-gray-200 mt-6 pt-6"></div>
              )}
            </div>
          )}
          {/* Sección de Exámenes Recientes (No Fijados) */}
          {slicedNonPinnedExams.length > 0 && (
            <div className={`${pinnedExamList.length > 0 ? "" : ""} mt-6`}>
              {" "}
              {/* Añadir margen superior si no había pinneados */}
              {/* Mostrar encabezado solo si hay pinneados arriba O si esta es la única sección */}
              {(pinnedExamList.length > 0 || pinnedExamList.length === 0) && (
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  {pinnedExamList.length > 0
                    ? "Otros Exámenes Recientes"
                    : "Exámenes Recientes"}{" "}
                  ({nonPinnedExamList.length})
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slicedNonPinnedExams.map((exam, index) => (
                  <PreviewableRecentExamCard
                    key={exam.id}
                    exam={exam}
                    onDelete={handleDeleteExam}
                    // El índice aquí es dentro de la lista paginada de no pinneados.
                    index={index}
                    onPinToggle={handlePinExam}
                    isPinneable={true}
                    onEntireToggle={handleEntireCard}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Mensaje si hay exámenes pero ninguno pinneado y no se muestran no pinneados */}
          {/* Esto se podría refinar, quizás solo si hay exámenes totales pero la lista de pinneados está vacía */}
          {!isLoading &&
            !error &&
            hasExams &&
            pinnedExamList.length === 0 &&
            slicedNonPinnedExams.length === 0 &&
            visibleCount >= nonPinnedExamList.length && (
              <p className="text-gray-500 text-center mt-4">
                No hay exámenes que coincidan con tu filtro actual (si aplicas
                alguno) o no hay más exámenes recientes sin fijar.
              </p>
            )}
          {/* Mensaje "Fija una pregunta" si hay exámenes pero ninguno pinneado */}
          {!isLoading && !error && hasExams && pinnedExamList.length === 0 && (
            <p className="text-gray-500 text-center mt-4">
              Fija exámenes para verlos en una sección destacada aquí arriba.
            </p>
          )}
        </>
      )}

      {/* Botón Cargar más */}
      {/* Mostrar si no está cargando, no hay error, y aún quedan no pinneados por mostrar */}
      {!isLoading && !error && visibleCount < nonPinnedExamList.length && (
        <div className="col-span-full flex justify-center mt-6">
          <button
            onClick={handleLoadMore}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition"
          >
            Cargar más ({Math.min(6, nonPinnedExamList.length - visibleCount)})
          </button>
        </div>
      )}
    </div>
  );
}
