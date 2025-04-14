import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors"; // Para permitir solicitudes desde tu frontend
import dotenv from "dotenv";

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

app.post("/api/generate-content", async (req, res) => {
  try {
    const { prompt } = req.body; // Recibe el input del frontend
    if (!prompt) {
      return res.status(400).json({ error: "Falta el prompt en el body" });
    }
    console.log(prompt)

    // Llama a la API de Google desde el backend
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a cat. Your name is Neko.",
      },
    });

    const text = response.text;

    // Envía la respuesta de vuelta al frontend
    res.json({ generatedText: text });
  } catch (error) {
    console.error("Error en /api/generate-content:", error);
    res.status(500).json({ error: "Error al generar contenido" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
