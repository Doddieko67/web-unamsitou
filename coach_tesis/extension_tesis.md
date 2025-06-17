# Extensión de Tesis: Sistema de Exámenes Interactivos con IA

## Arquitectura General del Sistema

El proyecto consiste en una aplicación web full-stack que utiliza inteligencia artificial para generar exámenes personalizados y proporcionar retroalimentación educativa. La arquitectura se compone de:

- **Frontend**: React + TypeScript con Vite
- **Backend**: Node.js + Express
- **Base de Datos**: Supabase (PostgreSQL)
- **IA**: Google Gemini AI
- **Autenticación**: Supabase Auth

---

## FRONTEND - Arquitectura y Funcionamiento

### Estructura de Archivos y Funciones Principales

```
frontend/
├── src/
│   ├── API/
│   │   └── Gemini.tsx                    # Interfaz con backend para IA
│   ├── components/                       # Componentes reutilizables
│   │   ├── Main/                        # Componentes principales
│   │   │   ├── DifficultExam.tsx        # Selector de dificultad
│   │   │   ├── ExamConf.tsx             # Configuración de exámenes
│   │   │   ├── Materias.tsx             # Gestión de materias
│   │   │   └── QuestionConf.tsx         # Configuración de preguntas
│   │   ├── Navbar.tsx                   # Navegación principal
│   │   ├── Footer.tsx                   # Pie de página
│   │   └── Estadisticas.tsx             # Dashboard de estadísticas
│   ├── Examen/                          # Módulo de exámenes
│   │   ├── ExamenPage.tsx               # Página principal del examen
│   │   ├── PreguntaCard.tsx             # Tarjeta individual de pregunta
│   │   ├── ExamTimer.tsx                # Temporizador del examen
│   │   └── ResultDisplay.tsx            # Visualización de resultados
│   ├── context/
│   │   └── AuthContext.tsx              # Contexto de autenticación global
│   ├── pages/                           # Páginas de la aplicación
│   │   ├── Login.tsx                    # Página de inicio de sesión
│   │   ├── SignUp.tsx                   # Página de registro
│   │   ├── Examenes.tsx                 # Lista de exámenes
│   │   └── Perfil.tsx                   # Perfil del usuario
│   └── routers/
       └── routes.tsx                    # Configuración de rutas
```

### Uso de Modelos de IA en el Frontend

#### 1. Integración con Google Gemini

El frontend utiliza Google Gemini AI a través del backend para:

**Archivo: `src/API/Gemini.tsx`**
```typescript
export async function handleGenerate(input: string) {
  const { session } = UserAuth();
  try {
    const token = session?.access_token;
    // Llama al backend, no directamente a Google
    const response = await fetch(`${url_backend}/api/generate-content`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer: ${token}`,
      },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await response.json();
    return data.generatedText;
  } catch (err) {
    console.error("Error fetching from backend:", err);
  }
}
```

**Funcionalidades del modelo:**
- Generación de preguntas basadas en texto libre
- Creación de opciones múltiples automáticas
- Análisis de dificultad del contenido
- Generación de retroalimentación personalizada

#### 2. Contexto de Autenticación y Gestión de Estado

**Archivo: `src/context/AuthContext.tsx`**

El contexto maneja:
- Autenticación de usuario con Supabase
- Gestión de sesiones
- CRUD de exámenes
- Integración con base de datos

```typescript
interface PreguntaRespuestaData {
  id: number | string;
  pregunta: string;
  opciones: { texto: string }[];
  correcta: number;
  respuesta_usuario_indice?: number | null;
}

// Función para crear examen
async function createExam(
  titulo: string,
  dato: JSON,
  dificultad: string,
  numero_preguntas: number,
) {
  const { error } = await supabase.from("examenes").insert({
    user_id: user.id,
    titulo: titulo,
    dato: dato,
    dificultad: dificultad,
    numero_preguntas: numero_preguntas,
  });
}

// Función para actualizar examen con respuestas
async function updateExam(
  examId: string,
  finalDatos: PreguntaRespuestaData[],
  tiempoTomadoSegundos: number,
) {
  // Calcular resultados
  const numeroCorrectas = finalDatos.filter(pregunta => 
    pregunta.respuesta_usuario_indice === pregunta.correcta
  ).length;
  
  const puntajePorcentaje = (numeroCorrectas / finalDatos.length) * 100;
  
  // Actualizar en base de datos
  await supabase.from("examenes").update({
    estado: "terminado",
    fecha_fin: new Date().toISOString(),
    tiempo_tomado_segundos: Math.round(tiempoTomadoSegundos),
    numero_correctas: numeroCorrectas,
    puntaje_porcentaje: puntajePorcentaje,
    datos: finalDatos,
  }).eq("id", examId);
}
```

#### 3. Componentes Principales

**ExamenPage.tsx**: Controlador principal del examen
- Gestiona el estado de las preguntas
- Controla el temporizador
- Maneja la navegación entre preguntas
- Envía respuestas al backend

**PreguntaCard.tsx**: Componente individual de pregunta
```typescript
interface PreguntaProps {
  pregunta: string;
  opciones: string[];
  onRespuesta: (indice: number) => void;
  respuestaSeleccionada?: number;
}
```

**ExamTimer.tsx**: Temporizador con funciones avanzadas
- Cuenta regresiva visual
- Alertas de tiempo restante
- Auto-envío al terminar tiempo

---

## BACKEND - API y Procesamiento

### Estructura de Archivos del Backend

```
backend/
├── src/
│   ├── index.js                 # Servidor principal y rutas API
│   ├── analize.js              # Procesamiento de exámenes históricos
│   ├── reqSupabase.js          # Funciones de base de datos
│   ├── reqAuthMiddleware.js    # Middleware de autenticación
│   ├── local.js                # Procesamiento de archivos locales
│   └── probando.js             # Scripts de prueba
└── supabase.config.js          # Configuración de Supabase
```

### APIs Principales y Funcionalidad

#### 1. Generación de Exámenes - `/api/generate-content`

**Archivo: `src/index.js:315-459`**

```javascript
app.post("/api/generate-content", getUserFromRequest, async (req, res) => {
  const { exams_id, prompt, dificultad, tiempo_limite_segundos } = req.body;
  const user_id = req.user.id;

  // Seleccionar modelo según dificultad
  const model = dificultad == "easy" ? "gemini-2.0-flash" : "gemini-2.5-pro-exp-03-25";
  
  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: {
      systemInstruction: `Analiza el texto y crea preguntas de opción múltiple.
      Devuelve en formato JSON:
      {
        "dato": [
          {
            "id": 1,
            "pregunta": "Texto de la pregunta",
            "opciones": ["Opción A", "Opción B", "Opción C", "Opción D"],
            "correcta": 2
          }
        ],
        "titulo": "Título del Examen",
        "numero_preguntas": 5,
        "descripcion": "Descripción del contenido"
      }`
    }
  });
});
```

**Proceso:**
1. Usuario envía prompt con contenido de estudio
2. Backend autentica usuario con middleware
3. Gemini AI procesa el contenido y genera preguntas
4. Sistema valida formato JSON de respuesta
5. Se guarda examen en Supabase con estado "pendiente"

#### 2. Exámenes Basados en Historial - `/api/generate-content-based-on-history`

**Archivo: `src/index.js:461-611`**

```javascript
app.post("/api/generate-content-based-on-history", getUserFromRequest, async (req, res) => {
  const { exams_id, prompt, tiempo_limite_segundos } = req.body;
  const user_id = req.user.id;

  // Procesar exámenes seleccionados por el usuario
  const examenesProcesados = await processExamsSelected(user_id, exams_id);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-exp-03-25",
    contents: [prompt, examenesProcesados],
    config: {
      systemInstruction: `Analiza los exámenes anteriores del usuario.
      Crea un nuevo examen enfocado en mejorar las áreas donde cometió errores.
      Incluye preguntas similares pero con variaciones para reforzar el aprendizaje.`
    }
  });
});
```

#### 3. Procesamiento de Archivos - `/api/upload_files`

**Archivo: `src/index.js:34-197`**

Permite subir documentos PDF, Word, imágenes para generar exámenes:

```javascript
app.post("/api/upload_files", getUserFromRequest, get_ready, async (req, res) => {
  const { prompt, tiempo_limite_segundos } = req.body;
  const name_file = req.files;
  const targetDirectory = req.targetDirectory;
  
  // Procesar contenido de archivos
  const content = await content_documents(prompt, targetDirectory);
  
  // Generar examen con Gemini AI
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro-exp-03-25",
    contents: content,
    config: { systemInstruction: "Analiza los documentos y crea examen educativo..." }
  });
});
```

#### 4. Generación de Retroalimentación - `/api/generate-feedback`

**Archivo: `src/index.js:200-313`**

```javascript
app.post("/api/generate-feedback", getUserFromRequest, async (req, res) => {
  const { examen_id } = req.body;
  const user_id = req.user.id;

  // Obtener datos del examen completado
  const promptData = await verifyAuthExamUser(res, user_id, examen_id);
  
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: promptData,
    config: {
      systemInstruction: `Analiza cada respuesta del estudiante.
      Para cada pregunta explica:
      - Por qué su respuesta podría estar incorrecta
      - Por qué la respuesta correcta es válida
      - Conceptos clave para entender el tema
      
      Formato de respuesta:
      ##PREGUNTA_1##
      Explicación detallada...
      ##FIN_PREGUNTA_1##`
    }
  });
});
```

### Gestión de Base de Datos

#### Funciones de Supabase (`src/reqSupabase.js`)

**1. Creación de Exámenes:**
```javascript
export const CreateAuthExamUser = async (
  res, user_id, titulo, descripcion, dato, dificultad, numero_preguntas, tiempo_limite_segundos
) => {
  const { data: examenGuardado, error } = await supabase
    .from("examenes")
    .insert({
      user_id: user_id,
      titulo: titulo,
      descripcion: descripcion,
      datos: dato,                    // Preguntas en formato JSON
      dificultad: dificultad,
      numero_preguntas: numero_preguntas,
      tiempo_limite_segundos: tiempo_limite_segundos,
    })
    .select()
    .single();
}
```

**2. Verificación y Procesamiento:**
```javascript
export const verifyAuthExamUser = async (res, user_id, examen_id) => {
  const { data: examenCompleto } = await supabase
    .from("examenes")
    .select("feedback, datos, respuestas_usuario")
    .eq("id", examen_id)
    .eq("user_id", user_id)
    .single();

  // Procesar respuestas para generar feedback
  const examenProcesado = examenCompleto.datos.map((pregunta, index) => {
    const respuestaUsuarioIndex = examenCompleto.respuestas_usuario[index];
    return {
      pregunta: pregunta.pregunta,
      opciones: pregunta.opciones,
      correcta: pregunta.correcta,
      respuestaUsuario: respuestaUsuarioIndex,
      esCorrecta: pregunta.correcta === respuestaUsuarioIndex
    };
  });
}
```

---

## FLUJO DE DATOS: De Respuesta del Usuario a Base de Datos

### 1. Captura de Respuesta en Frontend

```typescript
// En PreguntaCard.tsx
const handleSeleccionOpcion = (indice: number) => {
  setRespuestaSeleccionada(indice);
  onRespuesta(indice); // Envía al componente padre
};

// En ExamenPage.tsx
const handleRespuesta = (indicePregunta: number, indiceRespuesta: number) => {
  setRespuestas(prev => ({
    ...prev,
    [indicePregunta]: indiceRespuesta
  }));
};
```

### 2. Procesamiento y Envío

```typescript
// Al finalizar examen
const finalizarExamen = async () => {
  const finalDatos = preguntas.map((pregunta, index) => ({
    ...pregunta,
    respuesta_usuario_indice: respuestas[index] || null
  }));

  const tiempoTomado = (Date.now() - tiempoInicio) / 1000;
  
  // Enviar al contexto para actualizar base de datos
  await updateExam(examId, finalDatos, tiempoTomado);
};
```

### 3. Almacenamiento en Base de Datos

**Estructura de la tabla `examenes` en Supabase:**

```sql
CREATE TABLE examenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  datos JSONB NOT NULL,           -- Preguntas originales
  respuestas_usuario INTEGER[],   -- Array de índices de respuestas
  estado TEXT DEFAULT 'pendiente',
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  fecha_fin TIMESTAMPTZ,
  tiempo_tomado_segundos INTEGER,
  tiempo_limite_segundos INTEGER,
  numero_preguntas INTEGER NOT NULL,
  numero_correctas INTEGER,
  puntaje_porcentaje DECIMAL(5,2),
  dificultad TEXT CHECK (dificultad IN ('easy', 'medium', 'hard', 'mixed')),
  feedback JSONB                  -- Retroalimentación generada por IA
);
```

### 4. Formato de Datos Almacenados

**Ejemplo de `datos` (JSONB):**
```json
[
  {
    "id": 1,
    "pregunta": "¿Cuál es la capital de Francia?",
    "opciones": ["Londres", "Berlín", "París", "Madrid"],
    "correcta": 2
  },
  {
    "id": 2,
    "pregunta": "¿En qué año comenzó la Segunda Guerra Mundial?",
    "opciones": ["1938", "1939", "1940", "1941"],
    "correcta": 1
  }
]
```

**Ejemplo de `respuestas_usuario` (INTEGER[]):**
```sql
{2, 1, 0, 3}  -- Índices de las opciones seleccionadas
```

**Ejemplo de `feedback` (JSONB):**
```json
{
  "1": "Excelente, París es efectivamente la capital de Francia. Es importante conocer las capitales europeas principales.",
  "2": "Correcto, la Segunda Guerra Mundial comenzó en 1939 con la invasión de Polonia por parte de Alemania."
}
```

### 5. Cálculo Automático de Resultados

```javascript
// En AuthContext.tsx - función updateExam
const numeroCorrectas = finalDatos.filter(pregunta => 
  pregunta.respuesta_usuario_indice !== null &&
  pregunta.respuesta_usuario_indice === pregunta.correcta
).length;

const puntajePorcentaje = numeroPreguntas > 0 
  ? parseFloat(((numeroCorrectas / numeroPreguntas) * 100).toFixed(2))
  : 0;

const updates = {
  estado: "terminado",
  fecha_fin: new Date().toISOString(),
  tiempo_tomado_segundos: Math.round(tiempoTomadoSegundos),
  numero_correctas: numeroCorrectas,
  puntaje_porcentaje: puntajePorcentaje,
  datos: finalDatos  // Incluye respuestas del usuario
};
```

---

## Integración de IA y Personalización

### Modelos Utilizados

1. **Gemini 2.0 Flash** (Exámenes fáciles y feedback)
   - Respuestas rápidas
   - Menor costo computacional
   - Adecuado para retroalimentación básica

2. **Gemini 2.5 Pro** (Exámenes complejos y análisis avanzado)
   - Análisis profundo de documentos
   - Generación de preguntas complejas
   - Procesamiento de múltiples archivos

### Personalización por Usuario

El sistema adapta el contenido según:
- **Historial de respuestas**: Identifica áreas débiles
- **Dificultad preferida**: Ajusta complejidad de preguntas
- **Tiempo de respuesta**: Optimiza duración de exámenes
- **Temas de interés**: Enfoca contenido en materias específicas

### Ejemplo de Prompt Avanzado

```javascript
const systemInstruction = `
Eres un tutor educativo experto. Analiza el historial de exámenes del estudiante:
- Identifica patrones en respuestas incorrectas
- Determina conceptos que necesita reforzar
- Crea preguntas que aborden específicamente sus debilidades
- Incluye explicaciones pedagógicas en la retroalimentación
- Ajusta la dificultad gradualmente para mejorar el aprendizaje

Formato de respuesta: JSON con preguntas estructuradas y metadata educativa.
`;
```

---

## Seguridad y Autenticación

### Middleware de Autenticación

**Archivo: `src/reqAuthMiddleware.js`**
```javascript
export const getUserFromRequest = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]; // "Bearer TOKEN"
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }
  
  req.user = user;
  next();
};
```

### Validaciones de Seguridad

1. **Validación de propietario**: Solo el usuario puede acceder a sus exámenes
2. **Sanitización de entrada**: Validación de datos antes de procesamiento
3. **Rate limiting**: Control de frecuencia de peticiones a la IA
4. **Validación de formato**: Verificación de estructura de datos JSON

---

## Conclusiones y Beneficios del Sistema

### Ventajas Técnicas

1. **Escalabilidad**: Arquitectura modular que permite crecimiento
2. **Flexibilidad**: Soporte para múltiples tipos de contenido
3. **Inteligencia**: IA adaptativa que mejora con el uso
4. **Seguridad**: Autenticación robusta y validación de datos

### Beneficios Educativos

1. **Personalización**: Exámenes adaptados al nivel del estudiante
2. **Retroalimentación inmediata**: Explicaciones detalladas de errores
3. **Aprendizaje continuo**: Sistema que identifica y refuerza áreas débiles
4. **Diversidad de contenido**: Soporte para texto, documentos e imágenes

### Impacto en el Proceso de Aprendizaje

El sistema revoluciona la evaluación educativa al:
- Proporcionar feedback instantáneo y personalizado
- Identificar patrones de aprendizaje individuales
- Crear rutas de estudio adaptativas
- Reducir la carga de trabajo docente en evaluación
- Aumentar la motivación estudiantil con gamificación

Este sistema representa un avance significativo en la aplicación de IA para educación, combinando tecnologías modernas con principios pedagógicos sólidos para crear una experiencia de aprendizaje verdaderamente personalizada.