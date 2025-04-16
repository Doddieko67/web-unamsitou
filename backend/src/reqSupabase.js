import { supabase } from "../supabase.config.js";

export const CreateAuthExamUser = async (
  res,
  user_id,
  titulo,
  dato,
  dificultad,
  numero_preguntas,
) => {
  console.log("Creando examen con:");
  console.log("  user_id:", user_id);
  console.log("  titulo:", titulo);
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
