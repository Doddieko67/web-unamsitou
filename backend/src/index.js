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

app.post("/api/generate-feedback", getUserFromRequest, async (req, res) => {
  try {
    const { examen_id } = req.body;

    const user_id = req.user.id;
    console.log(user_id);

    const prompt = await verifyAuthExamUser(res, user_id, examen_id);
    console.log(prompt);

    console.log(
      `Feedback no encontrado para examen ${examen_id}. Generando nueva retroalimentación...`,
    );

    const model = "gemini-2.0-flash";
    const response = await ai.models.generateContent({
      model: model,
      contents: JSON.stringify(prompt),
      config: {
        systemInstruction: `El usuario terminó el examen y necesita retroalimentación detallada.
        Para cada pregunta, analiza si la respuesta del usuario es correcta o incorrecta, y proporciona una explicación
        clara de por qué. Si la respuesta es incorrecta, explica por qué está mal y cuál sería la correcta.
        Si la respuesta es correcta (incluso si fue por azar), felicita al usuario y explica por qué es correcta.
        Si el usuario no proporciona una respuesta, explicale cual es la respuesta correcta y por que.
        No debe ser en markdown

        Tu respuesta debe seguir EXACTAMENTE este formato:

        ##PREGUNTA_1##
        Tu explicación detallada para la pregunta 1 aquí.
        Puedes usar varios párrafos, listas, y todo el formato necesario para una explicación clara.
        ##FIN_PREGUNTA_1##

        ##PREGUNTA_2##
        Tu explicación detallada para la pregunta 2 aquí.
        ##FIN_PREGUNTA_2##

        Y así sucesivamente para cada pregunta.

        NO incluyas ningún otro texto fuera de los delimitadores ##PREGUNTA_X## y ##FIN_PREGUNTA_X##.
        NO uses formato JSON. Usa solo texto plano dentro de los delimitadores.
        Todo el texto debe estar en español.`,
      },
    });

    let responseText = response.text;

    // Procesar la respuesta con delimitadores en lugar de JSON
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

      // Intento de respaldo: probar con análisis JSON si el formato de delimitadores falló
      try {
        // Eliminar posibles marcadores de código markdown
        const cleanedText = responseText.replace(/```json|```/g, "").trim();
        const jsonData = JSON.parse(cleanedText);

        if (
          jsonData &&
          typeof jsonData === "object" &&
          Object.keys(jsonData).length > 0
        ) {
          console.log("Respuesta procesada como JSON después de fallback");
          CreateAuthFeedback(res, user_id, examen_id, jsonData);
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

    // Continuar con el procesamiento normal
    CreateAuthFeedback(res, user_id, examen_id, examenData);
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
