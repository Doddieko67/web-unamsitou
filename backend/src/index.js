import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors"; // Para permitir solicitudes desde tu frontend
import { getUserFromRequest } from "./reqAuthMiddleware.js";
import dotenv from "dotenv";
import { CreateAuthExamUser } from "./reqSupabase.js";

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

app.post("/api/generate-content", getUserFromRequest, async (req, res) => {
  try {
    console.log("aqui?");
    const { prompt, dificultad } = req.body; // Recibe el input del frontend

    if (!prompt)
      return res.status(400).json({ error: "Falta el prompt en el body" });

    const user_id = req.user.id;
    console.log(user_id);

    console.log(prompt);

    // Llama a la API de Google desde el backend
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
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
            }
          ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 3
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
      examenData.dato,
      dificultad,
      examenData.numero_preguntas,
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
