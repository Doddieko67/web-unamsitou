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

export const verifyAuthExamUser = async (res, user_id, examen_id) => {
  const { data: examenCompleto, error: fetchFullError } = await supabase
    .from("examenes")
    .select("feedback, datos, respuestas_usuario") // Selecciona feedback Y los datos necesarios para generar el prompt
    .eq("id", examen_id)
    .eq("user_id", user_id) // Opcional: Añadir esta condición para asegurarse de que el usuario es el dueño del examen
    .single();

  if (fetchFullError && fetchFullError.code !== "PGRST116") {
    // PGRST116 es "No rows found"
    console.error(
      "Error al buscar examen completo en Supabase:",
      fetchFullError,
    );
    return res.status(500).json({ error: "Error al buscar examen." });
  }

  if (!examenCompleto) {
    console.warn(`Examen con ID ${examen_id} no encontrado.`);
    return res.status(404).json({ error: "Examen no encontrado." });
  }

  // --- PASO 2: Verificar si el feedback ya existe ---
  if (examenCompleto.feedback !== null) {
    console.log(
      `Feedback ya existe para examen ${examen_id}. Devolviendo existente.`,
    );
    // Si ya existe, lo devolvemos directamente.
    return res.status(200);
  }
  return examenCompleto;
};

export const CreateAuthExamUser = async (
  res,
  user_id,
  titulo,
  descripcion,
  dato,
  dificultad,
  numero_preguntas,
  tiempo_limite_segundos,
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
        tiempo_limite_segundos: tiempo_limite_segundos,
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

export const CreateAuthFeedback = async (res, user_id, exam_id, feedback) => {
  try {
    console.log(feedback);
    const { error } = await supabase
      .from("examenes")
      .update({ feedback: feedback })
      .eq("id", exam_id);

    if (error) {
      console.error("Error al guardar examen en Supabase:", error);
      return res
        .status(500)
        .json({ error: "No se pudo guardar el examen generado." });
    }

    console.log("Examen generado", user_id);
    res.sendStatus(200); // Estado 201 Creado
  } catch (error) {
    console.error("Error general en /api/generate-exam-test:", error);
    // ... (manejo de error de Gemini como antes) ...
    res.status(500).json({ error: "Error interno al generar el examen." });
  }
  res.status(200);
};
