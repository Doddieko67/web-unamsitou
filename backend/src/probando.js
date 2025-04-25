import {
  CreateAuthExamUser,
  SelectAuthExamUser,
  CreateAuthFeedback,
  verifyAuthExamUser,
} from "./reqSupabase.js";

import { GoogleGenAI } from "@google/genai";

import dotenv from "dotenv";

dotenv.config(); // Carga variables de entorno desde .env

const apiKey = process.env.GEMINI_API_KEY; // ¡NO VITE_! Clave del servidor
if (!apiKey) {
  throw new Error("Falta la variable de entorno GEMINI_API_KEY");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const main = async () => {
  const exam_id = "44450937-36bc-4430-b76c-4148ef333690";
  const id_user = "d58ffc4b-8f0c-4eaf-a650-a84113232124";
  const resultado = await verifyAuthExamUser(id_user, exam_id);
  console.log(resultado);

  const model = "gemini-2.5-pro-exp-03-25";
  const response = await ai.models.generateContent({
    model: model,
    contents: [
      "hola que te parecio el examen de un estudante?",
      JSON.stringify(resultado),
    ],
  });

  console.log(response.text);
};

main();
