import { supabase } from "../supabase.config.js";

export const processExamsSelected = async (user_id, exams_id) => {
  // Inicializar como un array
  const processedExamsData = [];

  for (const examen_id in exams_id) {
    const { data: examenCompleto, error: fetchFullError } = await supabase
      .from("examenes")
      .select("datos, respuestas_usuario")
      .eq("id", examen_id)
      .eq("user_id", user_id)
      .single();

    // Manejar errores de consulta (cualquier error, incluyendo 'no encontrado' si single() falla por otra razón)
    if (fetchFullError) {
      // Si es el error de "no rows found", lo manejamos como 404 más abajo
      if (fetchFullError.code !== "PGRST116") {
         console.error(
           `Error al buscar examen con ID ${examen_id} para el usuario ${user_id} en Supabase:`,
           fetchFullError,
         );
         // return res.status(500).json({ error: `Error al buscar el examen con ID ${examen_id}.` });
      }
    }

    // Verificar si el examen existe (maneja PGRST116)
    if (!examenCompleto) {
      console.warn(`Examen con ID ${examen_id} no encontrado para el usuario ${user_id}.`);
      // Decides si devolver 404 inmediatamente o continuar con los otros exámenes.
      // Si devuelves 404 aquí, paras el bucle. Manteniendo el comportamiento original:
      // return res.status(404).json({ error: `Examen con ID ${examen_id} no encontrado.` });
      // Si quieres procesar los demás y notificar los faltantes al final, necesitarías otra lógica
    }

    // Procesar las preguntas, enfocándonos en las INCORRECTAS (si ese es el objetivo real)
    const preguntasIncorrectas = examenCompleto.datos.filter((pregunta, index) => {
        const respuestaUsuarioIndex = examenCompleto.respuestas_usuario[index];
        // Queremos las respuestas INCORRECTAS
        return pregunta.correcta !== respuestaUsuarioIndex || respuestaUsuarioIndex === null;
    }).map((pregunta, indexOriginal) => { // Opcional: Mapear para dar formato si es necesario
         // El index aquí es el del array filtrado, no el original.
         // Si necesitas el index original, tendrías que pasarlo o calcularlo.
         // Si solo necesitas la pregunta y la respuesta, este map es más simple.
         const respuestaUsuarioIndex = examenCompleto.respuestas_usuario[indexOriginal]; // Usar indexOriginal para la respuesta del usuario

         return {
             pregunta: pregunta.pregunta,
             opciones: pregunta.opciones,
             correcta: pregunta.correcta, // Mantener la respuesta correcta para dar contexto
             respuestaUsuario: respuestaUsuarioIndex,
             // Podrías añadir aquí un flag 'esCorrecta: false' si quieres ser explícito
         };
    });

    // Agregar los datos procesados de este examen al array principal
    processedExamsData.push({
        examen_id: examen_id, // Incluir el ID del examen para identificarlo
        // Usar la variable que contiene el resultado del procesamiento deseado
        preguntas: preguntasIncorrectas // O todasLasPreguntasProcesadas, etc.
    });
  }

  // Devolver los datos procesados para generar el prompt
  // Ya es un array de objetos, JSON.stringify lo manejará bien
  // Devolver un 200 OK con los datos
  return JSON.stringify(processedExamsData);
};
