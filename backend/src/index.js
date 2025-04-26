import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors"; // Para permitir solicitudes desde tu frontend
import { getUserFromRequest } from "./reqAuthMiddleware.js";
import dotenv from "dotenv";
import {
  CreateAuthExamUser,
  SelectAuthExamUser,
  CreateAuthFeedback,
  verifyAuthExamUser,
} from "./reqSupabase.js";
import { content_documents, delete_documents, get_ready } from "./local.js";
import { ok } from "node:assert";

dotenv.config(); // Carga variables de entorno desde .env

const app = express();
app.use(express.json()); // Para parsear el body de las requests JSON

// Configura CORS para permitir tu frontend (¡sé específico en producción!)
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia esto a la URL de tu frontend
  }),
);

const apiKey = process.env.GEMINI_API_KEY; // ¡NO VITE_! Clave del servidor
if (!apiKey) {
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

app.post(
  "/api/upload_files",
  getUserFromRequest,
  get_ready,
  async (req, res) => {
    try {
      console.log("aqui?");
      const { prompt } = req.body; // Recibe el input del frontend
      let { tiempo_limite_segundos } = req.body;
      if (typeof tiempo_limite_segundos === "string") {
        tiempo_limite_segundos = parseInt(tiempo_limite_segundos);
      }

      const name_file = req.files;
      console.log(req);
      if (!prompt && !name_file)
        return res.status(400).json({ error: "Faltan ambos en el body" });

      const user_id = req.user.id;
      const targetDirectory = req.targetDirectory;
      const content = await content_documents(prompt, targetDirectory);
      console.log(content);

      const model = "gemini-2.5-pro-exp-03-25";
      // Llama a la API de Google desde el backend

      const response = await ai.models.generateContent({
        model: model,
        contents: content,
        config: {
          systemInstruction: `lees y analizas todo,
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
            },
            {
              "id": 2,
              "pregunta": "Las raíces de la ecuación 3x² - 2x - 1 = 0",
              "opciones": [
                "x₁ = 1, x₂ = 1/3",
                "x₁ = -1, x₂ = 1/3",
                "x₁ = 1, x₂ = -1/3",
                "x₁ = -1, x₂ = -1/3"
              ],
              "correcta": 2
            },
            {
              "id": 3,
              "pregunta": "Expresa en °C el intervalo de la temperatura 60° ≤ F ≤ 80° si se sabe que la relación es °C = 5/9(F - 32)",
              "opciones": [
                "140/9 ≤ °C ≤ 80/3",
                "9/140 ≤ °C ≤ 80/3",
                "60/9 ≤ °C ≤ 5/80",
                "9/60 ≤ °C ≤ 3/80"
              ],
              "correcta": 0
            },
            {
              "pregunta": "En la feria\nKhalil Gibran\nDesde la campiña llegó a la feria una niña muy bonita. En su rostro había un lirio y una rosa. Había ocaso en su cabello,\ny el amanecer sonreía en sus labios.\nNi bien la hermosa extranjera apareció ante sus ojos, los jóvenes se asomaron y la rodearon. Uno deseaba bailar\ncon ella, y otro día cortar una torta en su honor. Yo todos deseaban besar su mejilla. Después de todo, ¿no se trataba acaso\nde una bella feria?\nMas la niña se sorprendió y molestó, y pensó mal de los jóvenes. Los reprendió, y encima golpeó en la cara a uno o\ndos de ellos. Luego huyó.\nEn el camino a casa, aquella tarde, decía en su corazón: \"Estoy disgustada. ¡Qué groseros y mal educados son\nestos hombres! Sobrepasan toda paciencia\".\nY pasó un año, durante el cual la hermosa niña pensó mucho en ferias y hombres. Entonces regresó a la feria con\nel lirio y la rosa en el rostro, el ocaso en su cabello y la sonrisa del amanecer en sus labios.\nPero ahora los jóvenes viéndola, le dieron la espalda. Y permaneció todo el día ignorada y sola.\nY, al atardecer, mientras marchaba camino a su casa, lloraba en su corazón: \"Estoy disgustada. ¿Qué groseros y\nmal educados son estos hombres! Sobrepasan toda paciencia\"."
            },
            {
              "id": 4,
              "pregunta": "Por su modo discursivo, ¿cómo se clasifica el texto anterior?",
              "opciones": [
                "Narrativo",
                "Diálogo",
                "Argumentativo",
                "Literario",
                "Descriptivo"
              ],
              "correcta": 0
            },
            {
              "id": 5,
              "pregunta": "¿Cómo se clasifica la parte en negritas?",
              "opciones": [
                "Narrativo",
                "Diálogo",
                "Argumentativo",
                "Literario",
                "Descriptivo"
              ],
              "correcta": 4
            }
          ],
          "titulo": "Razonamiento Matemático y verbal",
          "numero_preguntas": 5,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas. Comprension lectora",
          "dificultad": "easy"
        }`,
        },
      });

      let responseText = response.text;
      responseText = responseText.replace("```json", "").replace("```", "");
      let examenData;
      try {
        examenData = JSON.parse(responseText); // Intenta analizar la respuesta como JSON
      } catch (error) {
        console.error("Error al analizar la respuesta JSON de Gemini:", error);
        console.error("Respuesta de Gemini:", responseText); // Muestra la respuesta sin analizar
        return res.status(500).json({
          error:
            "Error al procesar la respuesta de Gemini. La respuesta no es un JSON válido.",
        });
      }
      delete_documents(targetDirectory);

      // Valida que el objeto JSON tenga las propiedades necesarias
      if (
        !examenData ||
        typeof examenData !== "object" ||
        !examenData.titulo ||
        !examenData.descripcion ||
        !examenData.dato ||
        !examenData.numero_preguntas ||
        !examenData.dificultad
      ) {
        console.error(
          "Respuesta de Gemini no tiene la estructura esperada:",
          examenData,
        );
        return res.status(500).json({
          error:
            "La respuesta de Gemini no tiene la estructura JSON esperada (falta titulo, dato, o numero_preguntas).",
        });
      }

      CreateAuthExamUser(
        res,
        user_id,
        examenData.titulo,
        examenData.descripcion,
        examenData.dato,
        examenData.dificultad,
        examenData.numero_preguntas,
        tiempo_limite_segundos,
      );

      // Envía la respuesta de vuelta al frontend
    } catch (error) {
      console.error("Error en /api/generate-content:", error);
      res.status(500).json({ error: `Error al generar contenido ${error}` });
    }
  },
);

// Función para generar retroalimentación
app.post("/api/generate-feedback", getUserFromRequest, async (req, res) => {
  try {
    const { examen_id } = req.body;
    const user_id = req.user.id;

    console.log(
      `Generando retroalimentación para usuario ${user_id}, examen ${examen_id}`,
    );

    // Verificar autorización y obtener datos procesados del examen
    const promptData = await verifyAuthExamUser(res, user_id, examen_id);

    if (!promptData || promptData.error) {
      // Si verifyAuthExamUser ya manejó el error o devolvió una respuesta
      return;
    }

    console.log(
      `Generando nueva retroalimentación para examen ${examen_id}...`,
    );

    // Instrucción mejorada para el sistema
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
          No necesitas decirle que la respuesta es correcta o incorrecta.

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

    console.log(promptData);
    // Generar retroalimentación con la IA
    const model = "gemini-2.0-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: promptData,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    let responseText = response.text;

    // Procesar la respuesta con delimitadores
    const examenData = {};
    const regex = /##PREGUNTA_(\d+)##([\s\S]*?)##FIN_PREGUNTA_\d+##/g;
    let match;

    while ((match = regex.exec(responseText)) !== null) {
      const questionNumber = match[1];
      const explanation = match[2].trim();
      examenData[questionNumber] = explanation;
    }

    // Verificar que se hayan encontrado explicaciones
    if (Object.keys(examenData).length === 0) {
      console.error(
        "No se pudieron encontrar explicaciones en el formato esperado",
      );
      console.error("Respuesta recibida:", responseText);

      // Intento de respaldo: probar con análisis JSON
      try {
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        const jsonData = JSON.parse(cleanedText);

        if (
          jsonData &&
          typeof jsonData === "object" &&
          Object.keys(jsonData).length > 0
        ) {
          console.log("Respuesta procesada como JSON después de fallback");
          await CreateAuthFeedback(res, user_id, examen_id, jsonData);
          return;
        }
      } catch (jsonError) {
        console.error(
          "El intento de fallback a JSON también falló:",
          jsonError,
        );
      }

      return res.status(500).json({
        error:
          "Error al procesar la respuesta. No se encontraron explicaciones en el formato esperado.",
      });
    }

    // Crear feedback en la base de datos
    await CreateAuthFeedback(res, user_id, examen_id, examenData);
  } catch (error) {
    console.error("Error en /api/generate-feedback:", error);
    res.status(500).json({ error: "Error al generar contenido" });
  }
});

app.post("/api/generate-content", getUserFromRequest, async (req, res) => {
  try {
    console.log("aqui?");
    const { prompt, dificultad, tiempo_limite_segundos } = req.body; // Recibe el input del frontend

    if (!prompt)
      return res.status(400).json({ error: "Falta el prompt en el body" });

    const user_id = req.user.id;
    console.log(user_id);

    console.log(prompt);

    const model =
      dificultad == "easy" ? "gemini-2.0-flash" : "gemini-2.5-pro-exp-03-25";
    // Llama a la API de Google desde el backend

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: `lees y analizas todo,
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
          },
          {
            "id": 2,
            "pregunta": "Las raíces de la ecuación 3x² - 2x - 1 = 0",
            "opciones": [
              "x₁ = 1, x₂ = 1/3",
              "x₁ = -1, x₂ = 1/3",
              "x₁ = 1, x₂ = -1/3",
              "x₁ = -1, x₂ = -1/3"
            ],
            "correcta": 2
          },
          {
            "id": 3,
            "pregunta": "Expresa en °C el intervalo de la temperatura 60° ≤ F ≤ 80° si se sabe que la relación es °C = 5/9(F - 32)",
            "opciones": [
              "140/9 ≤ °C ≤ 80/3",
              "9/140 ≤ °C ≤ 80/3",
              "60/9 ≤ °C ≤ 5/80",
              "9/60 ≤ °C ≤ 3/80"
            ],
            "correcta": 0
          },
          {
            "pregunta": "En la feria\nKhalil Gibran\nDesde la campiña llegó a la feria una niña muy bonita. En su rostro había un lirio y una rosa. Había ocaso en su cabello,\ny el amanecer sonreía en sus labios.\nNi bien la hermosa extranjera apareció ante sus ojos, los jóvenes se asomaron y la rodearon. Uno deseaba bailar\ncon ella, y otro día cortar una torta en su honor. Yo todos deseaban besar su mejilla. Después de todo, ¿no se trataba acaso\nde una bella feria?\nMas la niña se sorprendió y molestó, y pensó mal de los jóvenes. Los reprendió, y encima golpeó en la cara a uno o\ndos de ellos. Luego huyó.\nEn el camino a casa, aquella tarde, decía en su corazón: \"Estoy disgustada. ¡Qué groseros y mal educados son\nestos hombres! Sobrepasan toda paciencia\".\nY pasó un año, durante el cual la hermosa niña pensó mucho en ferias y hombres. Entonces regresó a la feria con\nel lirio y la rosa en el rostro, el ocaso en su cabello y la sonrisa del amanecer en sus labios.\nPero ahora los jóvenes viéndola, le dieron la espalda. Y permaneció todo el día ignorada y sola.\nY, al atardecer, mientras marchaba camino a su casa, lloraba en su corazón: \"Estoy disgustada. ¿Qué groseros y\nmal educados son estos hombres! Sobrepasan toda paciencia\"."
          },
          {
            "id": 4,
            "pregunta": "Por su modo discursivo, ¿cómo se clasifica el texto anterior?",
            "opciones": [
              "Narrativo",
              "Diálogo",
              "Argumentativo",
              "Literario",
              "Descriptivo"
            ],
            "correcta": 0
          },
          {
            "id": 5,
            "pregunta": "¿Cómo se clasifica la parte en negritas?",
            "opciones": [
              "Narrativo",
              "Diálogo",
              "Argumentativo",
              "Literario",
              "Descriptivo"
            ],
            "correcta": 4
          }
        ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 5,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas."
        }`,
      },
    });

    let responseText = response.text;
    responseText = responseText.replace("```json", "").replace("```", "");
    let examenData;
    try {
      examenData = JSON.parse(responseText); // Intenta analizar la respuesta como JSON
    } catch (error) {
      console.error("Error al analizar la respuesta JSON de Gemini:", error);
      console.error("Respuesta de Gemini:", responseText); // Muestra la respuesta sin analizar
      return res.status(500).json({
        error:
          "Error al procesar la respuesta de Gemini. La respuesta no es un JSON válido.",
      });
    }

    // Valida que el objeto JSON tenga las propiedades necesarias
    if (
      !examenData ||
      typeof examenData !== "object" ||
      !examenData.titulo ||
      !examenData.descripcion ||
      !examenData.dato ||
      !examenData.numero_preguntas
    ) {
      console.error(
        "Respuesta de Gemini no tiene la estructura esperada:",
        examenData,
      );
      return res.status(500).json({
        error:
          "La respuesta de Gemini no tiene la estructura JSON esperada (falta titulo, dato, o numero_preguntas).",
      });
    }

    CreateAuthExamUser(
      res,
      user_id,
      examenData.titulo,
      examenData.descripcion,
      examenData.dato,
      dificultad,
      examenData.numero_preguntas,
      tiempo_limite_segundos,
    );

    // Envía la respuesta de vuelta al frontend
  } catch (error) {
    console.error("Error en /api/generate-content:", error);
    res.status(500).json({ error: "Error al generar contenido" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
