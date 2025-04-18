import { supabase } from "../supabase.config.js";

export const SelectAuthExamUser = async (res, user_id, exam_id) => {
  let query = supabase.from("examenes").select("*").eq("user_id", user_id);

  // Añade la condición de exam_id solo si se proporciona
  if (exam_id) {
    query = query.eq("id", exam_id);
  }

  try {
    const { data: examen, error } = await query;
    if (error) {
      console.error(
        "Error al guardar visualizar el/los examen/es en Supabase:",
        error,
      );
      return res
        .status(500)
        .json({ error: "No se pudo recolectar el/los examen/es." });
    }

    if (!examen) {
      console.error("Supabase no devolvió un ID después de insertar.");
      return res
        .status(500)
        .json({ error: "Error al obtener ID del/de los examen/es." });
    }

    console.log("Examen visualiazdo", user_id);
  } catch (error) {
    console.error("Error general en /api/generate-content:", error);
    // ... (manejo de error de Gemini como antes) ...
    res.status(500).json({ error: "Error interno al generar el examen." });
  }
};

export const updateAuthExamUser = async (
  res,
  user_id,
  data,
  tiempo_tomado_segundos,
  puntaje_porcentaje,
) => {
  console.log(user_id);
  console.log(data);
};
export const CreateAuthExamUser = async (
  res,
  user_id,
  titulo,
  descripcion,
  dato,
  dificultad,
  numero_preguntas,
) => {
  console.log("Creando examen con:");
  console.log("  user_id:", user_id);
  console.log("  titulo:", titulo);
  console.log("  descripcion", descripcion);
  console.log("  dato:", dato);
  console.log("  dificultad:", dificultad);
  console.log("  numero_preguntas:", numero_preguntas);
  try {
    if (!user_id) return false;
    const { data: examenes, error: eor } = await supabase
      .from("examenes")
      .select("*")
      .eq("user_id", user_id);
    console.log(eor);
    console.log("Listado de examenes: ", examenes);
    const { data: examenGuardado, error } = await supabase
      .from("examenes")
      .insert({
        user_id: user_id,
        titulo: titulo,
        descripcion: descripcion,
        datos: dato,
        dificultad: dificultad,
        numero_preguntas: numero_preguntas,
      })
      .select("")
      .single();

    if (error) {
      console.error("Error al guardar examen en Supabase:", error);
      return res
        .status(500)
        .json({ error: "No se pudo guardar el examen generado." });
    }

    if (!examenGuardado || !examenGuardado.id) {
      console.error("Supabase no devolvió un ID después de insertar.");
      return res
        .status(500)
        .json({ error: "Error al obtener ID del examen guardado." });
    }

    console.log("Examen generado", user_id);
    res.status(201).json({ examId: examenGuardado.id }); // Estado 201 Creado
  } catch (error) {
    console.error("Error general en /api/generate-exam-test:", error);
    // ... (manejo de error de Gemini como antes) ...
    res.status(500).json({ error: "Error interno al generar el examen." });
  }
};
