import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import logger from "../utils/logger.js";
import { ExamService } from "../services/examService.js";
import { GeminiService } from "../services/geminiService.js";
import { content_documents, delete_documents } from "../local.js";
import { processExamsSelected } from "../analize.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

export class ExamController {
  // Controlador para subir archivos y generar examen
  static async uploadFiles(req, res) {
    try {
      logger.info('Iniciando procesamiento de archivos', { 
        userId: req.user.id,
        hasFiles: !!req.files 
      });

      const { prompt, tiempo_limite_segundos, model } = req.body;
      const name_file = req.files;
      const user_id = req.user.id;
      const targetDirectory = req.targetDirectory;
      
      // Convertir tiempo_limite_segundos a number si viene como string
      const tiempoLimiteSegundos = typeof tiempo_limite_segundos === 'string' 
        ? parseInt(tiempo_limite_segundos, 10) 
        : tiempo_limite_segundos;

      // Usar el modelo seleccionado por el usuario, con fallback a gemini-2.5-flash
      const selectedModel = model || "gemini-2.5-flash";
      
      // Validar que el modelo sea uno de los permitidos
      const modelosPermitidos = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
      if (!modelosPermitidos.includes(selectedModel)) {
        logger.error('Modelo no permitido', { 
          modelo: selectedModel,
          userId: user_id,
          modelosPermitidos 
        });
        return res.status(400).json({
          error: `Modelo ${selectedModel} no permitido. Usa uno de: ${modelosPermitidos.join(', ')}`
        });
      }

      const content = await content_documents(prompt, targetDirectory);
      logger.debug('Contenido de documentos procesado', { 
        contentLength: content.length,
        userId: user_id 
      });
      const systemInstruction = `lees y analizas todo,
        creas el titulo general del examen, la dificultad de acuerdo,
        al contenido que se te presento, tienes que hacer el mismo examen
        basandote en el archivo o si el usuario presenta varios archivos,
        puede que tu necesites hacer el examen del conjunto de preguntas
        con sus opciones multiples basandote en las fuentes de los archivos
        al final,
        devuelves basandote en la siguiente estructura JSON, y siempre todo
        esta en espaniol
        (nota, en la dificultad, acepta solo "easy","medium","hard","mixed"):
        {
          "dato": [
            {
              "id": 1,
              "pregunta": "El valor a en la siguiente ecuación: (a + 2)/3 + (a - 2)/5 = 12/15",
              "opciones": [
                "a = 2",
                "a = 3",
                "a = 1",
                "a = 4"
              ],
              "correcta": 2
            }
          ],
          "titulo": "Razonamiento Matemático y verbal",
          "numero_preguntas": 5,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas. Comprension lectora",
          "dificultad": "easy"
        }`;

      // Obtener la API key del usuario
      const userApiKey = await GeminiService.getUserApiKey(user_id);
      if (!userApiKey.success) {
        logger.error('Usuario no tiene API key configurada', { userId: user_id });
        return res.status(400).json({
          error: 'Debes configurar una API key de Gemini válida antes de generar exámenes'
        });
      }

      // Crear cliente con la API key del usuario
      const userAI = new GoogleGenAI({ apiKey: userApiKey.apiKey });

      const response = await userAI.models.generateContent({
        model: selectedModel,
        contents: content,
        config: { systemInstruction }
      });

      const examenData = ExamController.parseAIResponse(response.text);
      if (!examenData) {
        logger.error('Error al procesar respuesta de IA', { userId: user_id });
        return res.status(500).json({
          error: "Error al procesar la respuesta de Gemini. La respuesta no es un JSON válido."
        });
      }

      // Limpiar archivos temporales
      delete_documents(targetDirectory);

      // Crear examen usando el servicio
      const examCreated = await ExamService.createExam({
        user_id: user_id,
        titulo: examenData.titulo,
        descripcion: examenData.descripcion,
        datos: examenData.dato,
        dificultad: examenData.dificultad,
        numero_preguntas: examenData.numero_preguntas,
        tiempo_limite_segundos: tiempoLimiteSegundos
      });

      logger.info('Examen creado exitosamente', { 
        userId: user_id,
        titulo: examenData.titulo,
        numeroPreguntas: examenData.numero_preguntas,
        modelo: selectedModel,
        examId: examCreated.id
      });

      return res.status(201).json({ 
        examId: examCreated.id,
        message: 'Examen generado exitosamente desde archivos'
      });

    } catch (error) {
      logger.error('Error en uploadFiles:', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id 
      });
      
      res.status(500).json({ 
        error: `Error al generar contenido: ${error.message}` 
      });
    }
  }

  // Controlador para generar contenido basado en prompt
  static async generateContent(req, res) {
    try {
      logger.info('Generando contenido', { 
        userId: req.user.id,
        dificultad: req.body.dificultad,
        modelo: req.body.modelo 
      });

      const { exams_id, prompt, dificultad, tiempo_limite_segundos, modelo } = req.body;
      const user_id = req.user.id;

      // Usar el modelo seleccionado por el usuario, con fallback a gemini-2.5-flash
      const model = modelo || "gemini-2.5-flash";
      
      // Validar que el modelo sea uno de los permitidos
      const modelosPermitidos = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
      if (!modelosPermitidos.includes(model)) {
        logger.error('Modelo no permitido', { 
          modelo: model,
          userId: user_id,
          modelosPermitidos 
        });
        return res.status(400).json({
          error: `Modelo ${model} no permitido. Usa uno de: ${modelosPermitidos.join(', ')}`
        });
      }
      
      const systemInstruction = `lees y analizas todo,
        creas el titulo general del examen y un conjunto de preguntas con sus opciones
        al final,
        devuelves basandote en la siguiente estructura JSON:
        {
        "dato": [
          {
            "id": 1,
            "pregunta": "El valor a en la siguiente ecuación: (a + 2)/3 + (a - 2)/5 = 12/15",
            "opciones": [
              "a = 2",
              "a = 3",
              "a = 1",
              "a = 4"
            ],
            "correcta": 2
          }
        ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 5,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas."
        }`;

      // Obtener la API key del usuario
      const userApiKey = await GeminiService.getUserApiKey(user_id);
      if (!userApiKey.success) {
        logger.error('Usuario no tiene API key configurada', { userId: user_id });
        return res.status(400).json({
          error: 'Debes configurar una API key de Gemini válida antes de generar exámenes'
        });
      }

      // Crear cliente con la API key del usuario
      const userAI = new GoogleGenAI({ apiKey: userApiKey.apiKey });

      const response = await userAI.models.generateContent({
        model: model,
        contents: prompt,
        config: { systemInstruction }
      });

      const examenData = ExamController.parseAIResponse(response.text);
      if (!examenData) {
        logger.error('Error al procesar respuesta de IA', { userId: user_id });
        return res.status(500).json({
          error: "Error al procesar la respuesta de Gemini. La respuesta no es un JSON válido."
        });
      }

      // Crear examen usando el servicio
      const examCreated = await ExamService.createExam({
        user_id: user_id,
        titulo: examenData.titulo,
        descripcion: examenData.descripcion,
        datos: examenData.dato,
        dificultad: dificultad,
        numero_preguntas: examenData.numero_preguntas,
        tiempo_limite_segundos: tiempo_limite_segundos
      });

      logger.info('Contenido generado exitosamente', { 
        userId: user_id,
        titulo: examenData.titulo,
        dificultad: dificultad,
        modelo: model,
        examId: examCreated.id
      });

      return res.status(201).json({ 
        examId: examCreated.id,
        message: 'Examen generado exitosamente'
      });

    } catch (error) {
      logger.error('Error en generateContent:', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id 
      });
      
      res.status(500).json({ 
        error: "Error al generar contenido" 
      });
    }
  }

  // Controlador para generar feedback
  static async generateFeedback(req, res) {
    try {
      logger.info('Generando feedback', { 
        userId: req.user.id,
        examenId: req.body.examen_id 
      });

      const { examen_id } = req.body;
      const user_id = req.user.id;

      // Verificar autorización y obtener datos del examen
      const examData = await ExamService.verifyExamOwnership(user_id, examen_id);
      
      if (!examData) {
        logger.warn('Acceso no autorizado al examen', { 
          userId: user_id,
          examenId: examen_id 
        });
        return res.status(403).json({ 
          error: "No autorizado para acceder a este examen" 
        });
      }

      // Preparar datos del examen para el prompt (similar a la función original)
      const promptData = JSON.stringify({
        preguntas: examData.preguntas.map((pregunta, index) => ({
          id: pregunta.id,
          pregunta: pregunta.pregunta,
          opciones: pregunta.opciones,
          correcta: pregunta.correcta,
          respuestaUsuario: examData.respuestas_usuario?.[index] || null,
          esCorrecta: pregunta.correcta === (examData.respuestas_usuario?.[index] || null)
        }))
      });

      const systemInstruction = `
        Analiza el siguiente examen completado por un estudiante y proporciona retroalimentación detallada.
        Para cada pregunta:
        - Verifica si la respuesta del usuario (índice respuestaUsuario) coincide con la respuesta correcta (índice correcta).
        - Si coinciden, la respuesta es correcta. Si no, es incorrecta.
        - IMPORTANTE: Los índices en las respuestas empiezan desde 0, así que la opción 1 corresponde al índice 0, la opción 2 al índice 1, etc.
        El usuario termino el examen, pero necesita
                saber la retroalimentacion de algunos examenes con resultados,
                entonces, necesito que analices, y en cada pregunta,
                que le expliques por que su respuesta podria
                estar mal y otra que esta bien. Pero no solo eso, puede ser que
               el usuario seleccione la respuesta al azar dejando al suerte y
              sorprendemente, la responde bien, entonces, tambien explica este.
              Recuerda que no necesitas decirle que la respuesta es correcta o incorrecta.

        Tu respuesta debe seguir EXACTAMENTE este formato:
        ##PREGUNTA_1##
        Tu explicación detallada para la pregunta 1 aquí.
        ##FIN_PREGUNTA_1##
        ##PREGUNTA_2##
        Tu explicación detallada para la pregunta 2 aquí.
        ##FIN_PREGUNTA_2##

        No incluyas ningún otro texto fuera de los delimitadores.
        Usa solo texto plano (no JSON, no markdown). Todo en español.
      `;

      // Obtener la API key del usuario para generar feedback
      const userApiKey = await GeminiService.getUserApiKey(user_id);
      if (!userApiKey.success) {
        logger.error('Usuario no tiene API key configurada para feedback', { userId: user_id });
        return res.status(400).json({
          error: 'Debes configurar una API key de Gemini válida antes de generar feedback'
        });
      }

      // Crear cliente con la API key del usuario
      const userAI = new GoogleGenAI({ apiKey: userApiKey.apiKey });

      const model = "gemini-2.0-flash";
      const response = await userAI.models.generateContent({
        model: model,
        contents: promptData,
        config: { systemInstruction }
      });

      const feedbackData = ExamController.parseFeedbackResponse(response.text);
      if (!feedbackData) {
        logger.error('Error al procesar respuesta de feedback', { 
          userId: user_id,
          examenId: examen_id 
        });
        return res.status(500).json({
          error: "Error al procesar la respuesta. No se encontraron explicaciones en el formato esperado."
        });
      }

      // Guardar feedback usando el servicio
      await ExamService.createFeedback(user_id, examen_id, feedbackData);

      logger.info('Feedback generado exitosamente', { 
        userId: user_id,
        examenId: examen_id,
        preguntasCount: Object.keys(feedbackData).length
      });

      return res.status(200).json({ 
        message: 'Feedback generado exitosamente',
        feedback: feedbackData
      });

    } catch (error) {
      logger.error('Error en generateFeedback:', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id 
      });
      
      res.status(500).json({ 
        error: "Error al generar contenido" 
      });
    }
  }

  // Controlador para generar contenido basado en historial
  static async generateContentBasedOnHistory(req, res) {
    try {
      logger.info('Generando contenido basado en historial', { 
        userId: req.user.id,
        examsCount: req.body.exams_id.length 
      });

      const { exams_id, prompt, tiempo_limite_segundos, model } = req.body;
      const user_id = req.user.id;

      // Usar el modelo seleccionado por el usuario, con fallback a gemini-2.5-flash
      const selectedModel = model || "gemini-2.5-flash";
      
      // Validar que el modelo sea uno de los permitidos
      const modelosPermitidos = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.0-flash"];
      if (!modelosPermitidos.includes(selectedModel)) {
        logger.error('Modelo no permitido', { 
          modelo: selectedModel,
          userId: user_id,
          modelosPermitidos 
        });
        return res.status(400).json({
          error: `Modelo ${selectedModel} no permitido. Usa uno de: ${modelosPermitidos.join(', ')}`
        });
      }

      const examenesProcesados = await processExamsSelected(user_id, exams_id);
      
      if (!examenesProcesados || examenesProcesados.error) {
        logger.warn('Error procesando exámenes seleccionados', { 
          userId: user_id,
          examsIds: exams_id 
        });
        return res.status(400).json({ 
          error: "Error al procesar exámenes seleccionados" 
        });
      }
      const systemInstruction = `El usuario escogio los examenes y quiere que hagas
        un nuevo examen para mejorar y aprender de los errores que cometió en los examenes anteriores.
        Creas el titulo adecuado del examen abarcando los temas de los examenes procesados, la
        dificultad de acuerdo basandote en el contenido de los examenes procesados.
        Devuelve basandote en la siguiente estructura JSON
        (nota, en la dificultad, acepta solo "easy","medium","hard","mixed"):
        {
        "dato": [
          {
            "id": 1,
            "pregunta": "El valor a en la siguiente ecuación: (a + 2)/3 + (a - 2)/5 = 12/15",
            "opciones": [
              "a = 2",
              "a = 3",
              "a = 1",
              "a = 4"
            ],
            "correcta": 2
          }
        ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 5,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas.",
          "dificultad": "easy"
        }`;

      // Obtener la API key del usuario
      const userApiKey = await GeminiService.getUserApiKey(user_id);
      if (!userApiKey.success) {
        logger.error('Usuario no tiene API key configurada', { userId: user_id });
        return res.status(400).json({
          error: 'Debes configurar una API key de Gemini válida antes de generar exámenes'
        });
      }

      // Crear cliente con la API key del usuario
      const userAI = new GoogleGenAI({ apiKey: userApiKey.apiKey });

      const response = await userAI.models.generateContent({
        model: selectedModel,
        contents: [prompt, examenesProcesados],
        config: { systemInstruction }
      });

      const examenData = ExamController.parseAIResponse(response.text);
      if (!examenData) {
        logger.error('Error al procesar respuesta de IA', { userId: user_id });
        return res.status(500).json({
          error: "Error al procesar la respuesta de Gemini. La respuesta no es un JSON válido."
        });
      }

      // Crear examen usando el servicio
      const examCreated = await ExamService.createExam({
        user_id: user_id,
        titulo: examenData.titulo,
        descripcion: examenData.descripcion,
        datos: examenData.dato,
        dificultad: examenData.dificultad,
        numero_preguntas: examenData.numero_preguntas,
        tiempo_limite_segundos: tiempo_limite_segundos
      });

      logger.info('Contenido basado en historial generado exitosamente', { 
        userId: user_id,
        titulo: examenData.titulo,
        dificultad: examenData.dificultad,
        modelo: selectedModel,
        examId: examCreated.id
      });

      return res.status(201).json({ 
        examId: examCreated.id,
        message: 'Examen generado exitosamente basado en historial'
      });

    } catch (error) {
      logger.error('Error en generateContentBasedOnHistory:', { 
        error: error.message,
        stack: error.stack,
        userId: req.user?.id 
      });
      
      res.status(500).json({ 
        error: "Error al generar contenido" 
      });
    }
  }

  // Método auxiliar para parsear respuesta de IA
  static parseAIResponse(responseText) {
    try {
      const cleanedText = responseText.replace(/```json|```/g, "").trim();
      const examenData = JSON.parse(cleanedText);
      
      // Validar estructura requerida
      if (!examenData || 
          typeof examenData !== "object" || 
          !examenData.titulo || 
          !examenData.descripcion || 
          !examenData.dato || 
          !examenData.numero_preguntas) {
        return null;
      }
      
      return examenData;
    } catch (error) {
      logger.error('Error parseando respuesta de IA:', { 
        error: error.message,
        responseText: responseText.substring(0, 200) + "..." 
      });
      return null;
    }
  }

  // Método auxiliar para parsear respuesta de feedback
  static parseFeedbackResponse(responseText) {
    try {
      const examenData = {};
      const regex = /##PREGUNTA_(\d+)##([\s\S]*?)##FIN_PREGUNTA_\d+##/g;
      let match;

      while ((match = regex.exec(responseText)) !== null) {
        const questionNumber = match[1];
        const explanation = match[2].trim();
        examenData[questionNumber] = explanation;
      }

      return Object.keys(examenData).length > 0 ? examenData : null;
    } catch (error) {
      logger.error('Error parseando feedback:', { 
        error: error.message,
        responseText: responseText.substring(0, 200) + "..." 
      });
      return null;
    }
  }
}