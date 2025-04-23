import express from "express";
import { GoogleGenAI } from "@google/genai";
import cors from "cors"; // Para permitir solicitudes desde tu frontend
import { getUserFromRequest } from "./reqAuthMiddleware.js";
import dotenv from "dotenv";
import { CreateAuthExamUser, SelectAuthExamUser } from "./reqSupabase.js";
import { content_documents, delete_documents, get_ready } from "./local.js";

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
        devuelves basandote en la siguiente estructura JSON
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
            }
          ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 3,
          "descripcion": "Ecuaciones lineales, ecuaciones cuadráticas, conversión de temperaturas.",
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

    if (!prompt)
      return res.status(400).json({ error: "Falta el prompt en el body" });

    if (prompt.estado == "terminado")
      res.status(401).json({
        message: "Ya esta terminado, no hay necesidad de retroalimentacion",
      });

    const user_id = req.user.id;
    console.log(user_id);

    SelectAuthExamUser(res, examen_id, user_id);

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: `El usuario termino el examen, pero necesita
        saber la retroalimentacion de algunos examenes con resultados,
        entonces, necesito que analices, y en cada pregunta,
        que le expliques por que su respuesta podria
        estar mal y otra que esta bien. Pero no solo eso, puede ser que
       el usuario seleccione la respuesta al azar dejando al suerte y
      sorprendemente, la responde bien, entonces, tambien explica este.
     Basate en el ejemplo que te doy y
        devuelves en formato JSON de la siguiente estructura:
        {
          "1": "Tu respuesta (a = 3) no es la solución a la ecuación. Es importante recordar que al resolver ecuaciones, cada paso cuenta.  Podrías haberte equivocado al distribuir, combinar términos semejantes o al despejar la variable 'a'. Para verificar tu respuesta, puedes sustituir a = 3 en la ecuación original: (3+2)/3 + (3-2)/5 = 5/3 + 1/5 = 25/15 + 3/15 = 28/15.  Esto es diferente a 12/15, lo que indica que a = 3 no satisface la ecuación. \n\nLa solución correcta es a = 1.  Resolviendo la ecuación:\n\n1.  Encuentra un denominador común: El denominador común para 3 y 5 es 15.\n2.  Multiplica ambos lados de la ecuación por el denominador común: 15 * [(a + 2)/3 + (a - 2)/5] = 15 * (12/15)\n3.  Simplifica: 5(a + 2) + 3(a - 2) = 12\n4.  Distribuye: 5a + 10 + 3a - 6 = 12\n5.  Combina términos semejantes: 8a + 4 = 12\n6.  Resta 4 de ambos lados: 8a = 8\n7.  Divide ambos lados por 8: a = 1.\n\nComprueba tu respuesta: (1+2)/3 + (1-2)/5 = 3/3 - 1/5 = 1 - 1/5 = 4/5 = 12/15. Esto confirma que a = 1 es la solución correcta."
          "2": "Tu respuesta (x₁ = -1, x₂ = -1/3) no representa las raíces correctas de la ecuación. Es crucial verificar tus soluciones en la ecuación original. Si sustituimos x = -1 en 3x² - 2x - 1 = 0 obtenemos: 3(-1)² - 2(-1) - 1 = 3 + 2 - 1 = 4, que no es igual a 0. Por lo tanto, x = -1 no es una solución.  Igualmente, puedes comprobar x = -1/3 para confirmar que tampoco es solución. El error probablemente ocurrió al aplicar la fórmula cuadrática o al factorizar.\n\nLa solución correcta es x₁ = 1, x₂ = -1/3. Para encontrar las raíces, puedes usar la fórmula cuadrática: x = [-b ± √(b² - 4ac)] / 2a. En este caso, a = 3, b = -2, y c = -1.\n\n1.  Sustituye los valores: x = [2 ± √((-2)² - 4 * 3 * -1)] / (2 * 3)\n2.  Simplifica: x = [2 ± √(4 + 12)] / 6 = [2 ± √16] / 6 = [2 ± 4] / 6\n3.  Calcula las dos soluciones: x₁ = (2 + 4) / 6 = 6 / 6 = 1  y  x₂ = (2 - 4) / 6 = -2 / 6 = -1/3\n\nComprueba las soluciones: Para x₁ = 1: 3(1)² - 2(1) - 1 = 3 - 2 - 1 = 0. Para x₂ = -1/3: 3(-1/3)² - 2(-1/3) - 1 = 3(1/9) + 2/3 - 1 = 1/3 + 2/3 - 1 = 1 - 1 = 0. Ambas soluciones son correctas."
          "3": "Tu respuesta (9/140 ≤ °C ≤ 80/3) no corresponde al intervalo correcto en grados Celsius.  Parece que hubo una inversión en el orden de las operaciones o una confusión al sustituir los valores en la fórmula.  Es vital recordar el orden de las operaciones (PEMDAS/BODMAS) y asegurarse de que la sustitución se realiza correctamente.  Revisa cuidadosamente cada paso del cálculo. \n\nLa solución correcta es 140/9 ≤ °C ≤ 80/3. Para convertir el intervalo de Fahrenheit a Celsius, aplica la fórmula °C = 5/9(F - 32) a cada extremo del intervalo:\n\n1.  Para F = 60°: °C = 5/9(60 - 32) = 5/9(28) = 140/9 ≈ 15.56°C\n2.  Para F = 80°: °C = 5/9(80 - 32) = 5/9(48) = 240/9 = 80/3 ≈ 26.67°C\n\nPor lo tanto, el intervalo en °C es 140/9 ≤ °C ≤ 80/3."
          "4": "Tu respuesta no es la mejor opción en este caso. La pregunta busca la causa *principal* de la Revolución Francesa. Si bien la hambruna y la crisis económica (tu respuesta) fueron factores importantes y contribuyeron al descontento popular, no fueron las únicas causas, ni necesariamente las más profundas. Las otras opciones también jugaron un papel, pero la clave está en identificar el factor más *fundamental*.\n\n*   **Tu respuesta:** La hambruna y la crisis económica exacerbaron la situación, pero fueron síntomas de problemas más grandes.\n*   **Opción correcta:** La desigualdad social y los privilegios de la nobleza fue la causa principal. Este sistema injusto generó resentimiento y fue el catalizador de la revolución.\n*   **Otras opciones incorrectas:**\n    *   La debilidad del rey Luis XVI fue un factor contribuyente, pero no la causa fundamental.\n    *   La influencia de la Ilustración influyó en el pensamiento revolucionario, pero no causó directamente la revolución.",
          "5": "Tu respuesta no es incorrecta, pero no es *tan* completa como la opción correcta. La pregunta se centra en el objetivo *principal* del Protocolo de Kioto. Si bien la reducción de emisiones es un resultado deseado del protocolo (y una de sus funciones), no es su objetivo central.\n\n*   **Tu respuesta:** Si bien es cierto que el protocolo se centra en la reducción de emisiones, este es el resultado de una causa mayor.\n*   **Opción correcta:** El objetivo principal del Protocolo de Kioto es establecer compromisos vinculantes para los países desarrollados en la reducción de emisiones de gases de efecto invernadero. Define responsabilidades y un marco legal.\n*   **Otras opciones incorrectas:**\n    *   Financiar proyectos de energías renovables es una consecuencia, no el objetivo.\n    *   Promover la investigación científica es importante, pero no es el objetivo principal del protocolo.",
          "6": "Tu respuesta no captura la *complejidad* del concepto de 'plusvalía' en la teoría marxista. Si bien la plusvalía está relacionada con la ganancia del capitalista, no es simplemente 'la ganancia'.\n\n*   **Tu respuesta:** La plusvalía va más allá de solo la ganancia. Se centra en el valor extraído del trabajo del obrero.\n*   **Opción correcta:** La plusvalía es la diferencia entre el valor creado por el trabajo del obrero y el salario que recibe, apropiada por el capitalista. Es la base de la acumulación de capital.\n*   **Otras opciones incorrectas:**\n    *   La inversión en tecnología no es plusvalía. Es un factor que *puede* aumentar la plusvalía.\n    *   La eficiencia en la producción es un medio para generar plusvalía, no la plusvalía en sí misma.",
          "7": "Tu respuesta es un aspecto *parcial* de la globalización, pero la pregunta busca una definición más completa e integral. Si bien el aumento del comercio internacional es un componente de la globalización, no es la única característica definitoria.\n\n*   **Tu respuesta:** La globalización abarca mas que el comercio, si bien el crecimiento del comercio internacional es un factor determinante.\n*   **Opción correcta:** La globalización es la creciente interconexión e interdependencia de los países a través del comercio, las finanzas, la cultura y la política.\n*   **Otras opciones incorrectas:**\n    *   El desarrollo de internet es un *facilitador* de la globalización, no la globalización en sí.\n    *   La migración de personas es una *consecuencia* de la globalización, no su definición principal."
          "8": "¡Así es! Tu respuesta es correcta. La función principal de la mitocondria es la producción de energía celular a través de la respiración celular. Este proceso convierte los nutrientes en trifosfato de adenosina (ATP), que es la principal fuente de energía utilizada por la célula para llevar a cabo sus funciones.\n\n*   **Otras opciones:**\n    *   La síntesis de proteínas es realizada principalmente por los ribosomas.\n    *   El almacenamiento de material genético es la función del núcleo celular.\n    *   La digestión celular es llevada a cabo por los lisosomas.",
          "9": "¡Correcto! La Declaración de Independencia de los Estados Unidos establece que todos los hombres son creados iguales, que están dotados por su Creador de ciertos derechos inalienables, entre los cuales están la vida, la libertad y la búsqueda de la felicidad. Esta declaración fundamental de principios influyó en numerosas constituciones y movimientos de derechos humanos en todo el mundo.\n\n*   **Otras opciones:**\n    *   Si bien promueve la libertad religiosa, la declaración se centra en los derechos inherentes.\n    *   La abolición de la esclavitud no fue abordada directamente en la Declaración de Independencia (aunque la idea de igualdad eventualmente condujo a ese resultado).\n    *   Establecer un sistema de gobierno republicano fue un objetivo posterior, derivado de los principios expresados en la declaración."
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

    // Envía la respuesta de vuelta al frontend
  } catch (error) {
    console.error("Error en /api/generate-content:", error);
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
            }
          ],
          "titulo": "Álgebra y Razonamiento Matemático",
          "numero_preguntas": 3,
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
