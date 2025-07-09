Hola claude, eres un experto fullstack en react y nodejs
Me gustaria que analizaras en el fondo las carpetas se-
paradas "backend" y "frontend". Todavía era un junior,
así que me gustaría que analizarás como si fueras un se- 
nior con años de experiencia, entonces, no solo analizas 
también, buscas en el Internet, especialmente en Reddit 
sobre las herramientas integradas y verifiques que si es-
ta actualizado y listo para la produccion. Quiero que me
des informe de analisis para poner en marcha el plan de 
mejoramiento.

## CONTEXTO DE SENIOR DEVELOPER

Debes seguir siendo senior en todo momento. Por lo tanto, no solo vas a escribir líneas de código, también vas a testearlo y si surge un error que no tiene una causa obvia, investigalo en Internet. Mantén este contexto de senior y que eres experto en estas cosas.

Principios a seguir:
- Testear todo código nuevo antes de continuar
- Investigar errores no obvios en fuentes confiables
- Aplicar mejores prácticas de la industria
- Mantener código limpio y escalable
- Documentar decisiones arquitectónicas importantes

## 📊 PLAN DE MEJORAMIENTO - PROYECTO REACTI

### **CONFIGURACIÓN DE PUERTOS**
- **Frontend**: Puerto 5173 (http://localhost:5173)
- **Backend**: Puerto 3001 (http://localhost:3001)
- Esta configuración evita conflictos entre servicios

### **COMANDOS DE DESARROLLO**
```bash
# Backend (desde /backend)
npm run dev          # Servidor con --watch en puerto 3001
npm start           # Servidor de producción
npm test            # Tests con Jest

# Frontend (desde /frontend)  
npm run dev         # Vite dev server en puerto 5173
npm run build       # Build para producción
npm run test        # Tests con Vitest
```

# 📋 REACTI - CONTEXTO DE PROYECTO

## 🎯 DESCRIPCIÓN
Sistema de simulación de exámenes con IA generativa usando Gemini 2.5. Permite crear, configurar y realizar exámenes con diferentes modalidades.

## 🏗️ ARQUITECTURA ACTUAL

### **Stack Tecnológico**
```
Frontend: React 18 + TypeScript + Vite + Tailwind CSS
Backend: Node.js + Express + ES Modules
Database: Supabase + PostgreSQL
IA: Google Gemini 2.5 (Pro/Flash/Flash-Lite)
State: Zustand + localStorage
Auth: Google OAuth + JWT
Icons: Font Awesome
```

### **Configuración de Puertos**
```
Frontend: http://localhost:5174 (Vite dev server)
Backend: http://localhost:3001 (Express server)
```

### **Estructura de Carpetas**
```
proyecto/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── stores/
│   │   └── utils/
│   └── package.json
```

## 🔌 ENDPOINTS BACKEND

### **Autenticación**
```
POST /api/auth/google - Login con Google OAuth
POST /api/auth/logout - Cerrar sesión
GET /api/auth/verify - Verificar JWT token
```

### **Gestión de API Keys**
```
POST /api/gemini/validate - Validar API key de Gemini
GET /api/gemini/keys - Obtener keys del usuario
PUT /api/gemini/keys - Actualizar API key
```

### **Exámenes**
```
POST /api/exams/generate - Generar examen nuevo
POST /api/exams/generate-from-file - Examen desde archivo
POST /api/exams/generate-from-history - Examen desde historial
GET /api/exams/user - Obtener exámenes del usuario
POST /api/exams/submit - Enviar respuestas del examen
```

### **Modelos IA**
```
GET /api/models - Lista de modelos Gemini disponibles
Modelos: gemini-2.0-flash, gemini-2.5-flash, gemini-2.5-pro
```

## 🏛️ ARQUITECTURA DEL SISTEMA

### **Patrón Arquitectónico**
```
Frontend: Component-Based Architecture + Custom Hooks Pattern
Backend: MVC (Model-View-Controller) + Service Layer
Database: Row Level Security (RLS) + PostgreSQL
Estado: Flux Pattern con Zustand
```

### **Separación de Responsabilidades**
```
Controllers/ - Manejo de requests HTTP
Services/ - Lógica de negocio y IA
Models/ - Estructura de datos y validación
Middleware/ - Autenticación, CORS, validación
Routes/ - Definición de endpoints
Utils/ - Funciones helper reutilizables
```

### **Frontend Architecture**
```
Pages/ - Componentes de página (routing)
Components/ - Componentes reutilizables UI
Hooks/ - Custom hooks para lógica específica
Stores/ - Gestión de estado global (Zustand)
Services/ - Llamadas API y comunicación backend
Utils/ - Helpers y funciones utilitarias
```

## 📱 FUNCIONALIDADES IMPLEMENTADAS

### **✅ SISTEMA DE AUTENTICACIÓN**
- ✅ Google OAuth 2.0 integration
- ✅ JWT token management
- ✅ Session persistence
- ✅ Automatic token refresh
- ✅ Logout and session cleanup
- ✅ Protected routes middleware

### **✅ GESTIÓN DE IA Y API KEYS**
- ✅ API keys individuales por usuario (encrypted storage)
- ✅ Validación en tiempo real de API keys
- ✅ Selección de modelos Gemini (2.0-flash, 2.5-flash, 2.5-pro)
- ✅ Rate limiting por usuario
- ✅ Fallback de modelos automático
- ✅ Cache de configuraciones IA

### **✅ SISTEMA DE EXÁMENES COMPLETO**
- ✅ Generación inteligente con IA (prompts personalizados)
- ✅ 3 tipos de dificultad (Fácil, Intermedio, Difícil)
- ✅ Cantidad personalizable de preguntas (5-50)
- ✅ Temas y contextos específicos
- ✅ Validación de parámetros antes de generación
- ✅ Preview de configuración antes de crear

### **✅ SIMULACIÓN DE EXAMEN AVANZADA**
- ✅ **Timer inteligente**: Countdown con alertas visuales y sonoras
- ✅ **Autoguardado optimizado**: Cada 30 segundos (optimizado desde 7s)
- ✅ **Navegación libre**: Ir a cualquier pregunta, marcar para revisión
- ✅ **Indicadores visuales**: Respondidas, no respondidas, marcadas
- ✅ **Prevención de pérdida de datos**: Confirmación antes de salir
- ✅ **Estados de pregunta**: Normal, seleccionada, correcta, incorrecta
- ✅ **Finalización automática**: Cuando tiempo llega a 0
- ✅ **Guardado manual**: Botón para forzar guardado

### **✅ INTERFAZ USUARIO (UI/UX)**
- ✅ **Dark/Light Mode**: Sistema completo con CSS variables
- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Loading States**: Spinners y skeletons en todas las cargas
- ✅ **Error Boundaries**: Manejo elegante de errores
- ✅ **Toast Notifications**: SweetAlert2 para feedback
- ✅ **Keyboard Navigation**: Shortcuts para navegación rápida
- ✅ **Accessibility**: ARIA labels y contrast compliance

### **✅ GESTIÓN DE ESTADO AVANZADA**
- ✅ **Zustand Store**: Estado global consolidado
- ✅ **Persistence**: localStorage para configuraciones
- ✅ **Optimistic Updates**: UI actualiza antes de confirmación
- ✅ **Estado derivado**: Computed values automáticos
- ✅ **Subscription patterns**: Re-renders mínimos
- ✅ **State normalization**: Estructura optimizada

### **✅ OPTIMIZACIONES DE PERFORMANCE**
- ✅ **Code Splitting**: React.lazy para chunks optimizados
- ✅ **Memoization**: React.memo y useMemo estratégicos
- ✅ **Debounced Operations**: Autoguardado y búsquedas
- ✅ **Bundle Optimization**: Tree shaking y minification
- ✅ **Asset Optimization**: Lazy loading de imágenes
- ✅ **Memory Management**: Cleanup de intervals y listeners

### **✅ SEGURIDAD IMPLEMENTADA**
- ✅ **API Key Encryption**: Base64 + RLS en Supabase
- ✅ **CORS Configuration**: Restricción de dominios
- ✅ **Rate Limiting**: Prevención de abuse
- ✅ **Input Validation**: Joi schemas en backend
- ✅ **XSS Protection**: Sanitización de inputs
- ✅ **JWT Security**: Short-lived tokens + refresh

### **✅ SISTEMA DE TEMAS COMPLETO**
- ✅ **CSS Variables**: Sistema escalable de colores
- ✅ **Auto-detection**: Preferencias del sistema operativo
- ✅ **Persistence**: Recordar selección del usuario
- ✅ **Smooth Transitions**: Animaciones entre temas
- ✅ **Component Coverage**: 100% de componentes soportan ambos temas

### **🔄 EN DESARROLLO**
- 🔄 **Exámenes Multimedia**: Upload PDF/imagen + procesamiento IA
- 🔄 **Exámenes por Historial**: Generación basada en exámenes previos
- 🔄 **Validación final**: Edge cases y error handling

### **❌ PENDIENTE (PRIORIDAD BAJA)**
- ❌ Testing automatizado (Vitest + Testing Library)
- ❌ PWA capabilities (Service Workers)
- ❌ Analytics y métricas de uso
- ❌ Export resultados (PDF/Excel)
- ❌ Notificaciones push

## 🔧 CARACTERÍSTICAS TÉCNICAS DETALLADAS

### **⚡ SISTEMA DE AUTOGUARDADO INTELIGENTE**
```typescript
// Configuración optimizada
Frecuencia: 30 segundos (reducido desde 7s para mejor performance)
Trigger: Solo cuando hay cambios en respuestas
Debounce: Evita múltiples guardados simultáneos
Feedback: Indicador visual "Guardado automáticamente"
Fallback: Guardado manual disponible
Error handling: Reintentos automáticos en caso de fallo
```

### **⏱️ TIMER AVANZADO**
```typescript
// Características del cronómetro
Precisión: Actualización cada segundo
Estados visuales: Normal → Advertencia (5min) → Crítico (1min)
Notificaciones: Alertas sonoras opcionales
Persistencia: Continúa funcionando tras recargar página
Auto-submit: Envío automático cuando llega a 0
Pausable: Solo por administrador/desarrollador
Display: Formato MM:SS con colores adaptativos
```

### **🎯 NAVEGACIÓN DE PREGUNTAS**
```typescript
// Funcionalidades de navegación
Navegación libre: Clic en cualquier número de pregunta
Indicadores de estado:
  - Verde: Respondida
  - Gris: No respondida  
  - Azul: Pregunta actual
  - Amarillo: Marcada para revisión
Atajos de teclado:
  - Anterior: ← o A
  - Siguiente: → o D
  - Marcar: M
  - Enviar: Ctrl+Enter
```

### **💾 GESTIÓN DE ESTADO ZUSTAND**
```typescript
// Store principal consolidado
interface ExamState {
  // Estado del examen
  currentExam: Exam | null;
  currentQuestionIndex: number;
  answers: Record<questionId, answerId>;
  reviewFlags: Record<questionId, boolean>;
  
  // Timer y navegación
  timeRemaining: number;
  isTimerRunning: boolean;
  isExamSubmitted: boolean;
  
  // Configuración IA
  selectedModel: 'gemini-2.0-flash' | 'gemini-2.5-flash' | 'gemini-2.5-pro';
  apiKeyConfigured: boolean;
  
  // UI States
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
}

// Acciones optimizadas
Actions: {
  setAnswer: (questionId, answerId) => void;
  toggleReviewFlag: (questionId) => void;
  goToQuestion: (index) => void;
  submitExam: () => Promise<void>;
  autoSave: () => Promise<void>;
}
```

### **🎨 CONFIGURACIÓN DE IA UNIFICADA**
```typescript
// AIConfiguration.tsx - Componente reutilizable
Características:
- Validación de API key en tiempo real
- Selector de modelo con descriptions
- Caché de configuraciones válidas
- Feedback visual de estado
- Usado en: ExamConf, ExamQuestions, ExamBasedOnHistory
- Persistencia en localStorage + Zustand
```

### **🎭 ARQUITECTURA DE COMPONENTES**
```typescript
// Jerarquía de componentes principal
App.tsx
├── ThemeProvider (Context)
├── Router
│   ├── Navbar (theme toggle, user menu)
│   ├── Pages/
│   │   ├── Dashboard (recent exams, stats)
│   │   ├── ExamConf (configuración básica)
│   │   ├── ExamQuestions (desde preguntas)
│   │   ├── ExamBasedOnHistory (desde historial)
│   │   ├── ExamSimulation (simulación completa)
│   │   └── ExamResults (resultados y análisis)
│   └── Footer

// Componentes de examen especializados
ExamSimulation/
├── ExamTimer (cronómetro inteligente)
├── ExamProgress (barra de progreso + estadísticas)
├── QuestionCard (display de pregunta actual)
├── AnswerOptions (opciones con estados visuales)
├── NavigationPanel (grid de preguntas + navegación)
└── ExamActions (guardar, enviar, salir)
```

### **🔐 SEGURIDAD Y VALIDACIÓN**
```typescript
// Backend validation layers
1. JWT Middleware: Verificación de token válido
2. Rate Limiting: 100 requests/hour por usuario
3. Joi Schemas: Validación de estructura de datos
4. API Key Validation: Verificación con Google antes de uso
5. CORS: Restricción a dominios autorizados
6. Input Sanitization: Limpieza de inputs maliciosos

// Frontend validation
1. Form validation con React Hook Form
2. TypeScript strict mode
3. Zod schemas para runtime validation
4. XSS protection en renders
```

### **📊 GESTIÓN DE ERRORES**
```typescript
// Error Boundaries implementados
<ExamErrorBoundary>: Captura errores en simulación
<GlobalErrorBoundary>: Captura errores generales
<APIErrorBoundary>: Manejo específico de errores de API

// Error handling patterns
- Try-catch en todas las async operations
- Error states en Zustand store
- User-friendly error messages
- Automatic retry mechanisms
- Fallback UI components
```

### **🎪 CARACTERÍSTICAS UI/UX AVANZADAS**
```typescript
// Loading states granulares
- Skeleton screens durante carga inicial
- Spinners en botones durante acciones
- Progress bars para operaciones largas
- Shimmer effects en placeholder content

// Feedback visual
- Toast notifications con SweetAlert2
- Status indicators con iconos
- Color-coded states (success, warning, error)
- Smooth transitions (300ms CSS transitions)
- Hover effects y micro-interactions
```

### **⚙️ CONFIGURACIÓN ESPECÍFICA DEL SISTEMA**
```typescript
// Vite configuration
- Hot Module Replacement (HMR)
- TypeScript path mapping
- Environment variables
- Build optimizations
- Dev server proxy para CORS

// Tailwind configuration
- Custom color palette
- CSS variables integration
- Responsive breakpoints
- Custom utilities
- Dark mode strategy

// ESLint + Prettier
- React best practices rules
- TypeScript strict rules
- Import order enforcement
- Code formatting consistency
```

## 🗄️ ESTRUCTURA DE BASE DE DATOS

### **Tablas Supabase Implementadas**
```sql
-- Usuarios y autenticación
auth.users (Supabase native)
├── id: uuid (primary key)
├── email: varchar
├── created_at: timestamp
└── user_metadata: jsonb

-- API Keys de Gemini (encrypted)
gemini_api_keys
├── id: uuid (primary key)
├── user_id: uuid (foreign key → auth.users.id)
├── api_key: text (encrypted base64)
├── is_valid: boolean
├── created_at: timestamp
└── updated_at: timestamp

-- Exámenes generados
exams
├── id: uuid (primary key)
├── user_id: uuid (foreign key → auth.users.id)
├── title: varchar
├── description: text
├── difficulty: enum ('easy', 'medium', 'hard')
├── questions_count: integer
├── time_limit: integer (seconds)
├── model_used: varchar
├── status: enum ('draft', 'active', 'completed')
├── created_at: timestamp
└── updated_at: timestamp

-- Preguntas del examen
exam_questions
├── id: uuid (primary key)
├── exam_id: uuid (foreign key → exams.id)
├── question_number: integer
├── question_text: text
├── options: jsonb (array of options)
├── correct_answer: integer
├── explanation: text
└── created_at: timestamp

-- Respuestas y progreso
exam_submissions
├── id: uuid (primary key)
├── exam_id: uuid (foreign key → exams.id)
├── user_id: uuid (foreign key → auth.users.id)
├── answers: jsonb (questionId → answerId mapping)
├── time_spent: integer (seconds)
├── score: decimal(5,2)
├── submitted_at: timestamp
├── auto_saved_at: timestamp
└── is_completed: boolean

-- Row Level Security (RLS) habilitado en todas las tablas
```

### **🔒 POLÍTICAS DE SEGURIDAD RLS**
```sql
-- Usuarios solo pueden ver sus propios datos
gemini_api_keys: user_id = auth.uid()
exams: user_id = auth.uid()
exam_questions: exam_id IN (SELECT id FROM exams WHERE user_id = auth.uid())
exam_submissions: user_id = auth.uid()
```

## 🎨 SISTEMA DE DISEÑO COMPLETO

### **Paleta de Colores Extendida**
```css
:root {
  /* Colores principales */
  --primary: #6366f1;         /* Indigo-500 */
  --primary-dark: #4f46e5;    /* Indigo-600 */
  --secondary: #10b981;       /* Emerald-500 */
  --terciary: oklch(51.1% 0.262 276.966);
  --cuaternary: oklch(55.8% 0.288 302.321);
  
  /* Superficies */
  --surface-primary: #ffffff;
  --surface-secondary: #f8fafc;
  --surface-tertiary: #f1f5f9;
  
  /* Texto */
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  
  /* Estados */
  --success: #16a34a; --success-bg: #dcfce7;
  --warning: #ca8a04; --warning-bg: #fef9c3;
  --error: #dc2626; --error-bg: #fee2e2;
  --info: #2563eb; --info-bg: #dbeafe;
  
  /* Bordes y sombras */
  --border-primary: #e5e7eb;
  --border-secondary: #d1d5db;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

[data-theme="dark"] {
  /* Dark mode variants */
  --primary: #818cf8;
  --secondary: #34d399;
  --surface-primary: #1e293b;
  --surface-secondary: #334155;
  --surface-tertiary: #475569;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-tertiary: #94a3b8;
  --border-primary: #475569;
  --border-secondary: #64748b;
}
```

### **Componentes de UI Standardizados**
```css
/* Buttons */
.btn-primary: primary color + hover effects
.btn-secondary: secondary color + outlined variant
.btn-danger: error color for destructive actions
.btn-ghost: transparent background + hover

/* Cards */
.card-base: standard padding + border + shadow
.card-elevated: enhanced shadow for importance
.card-flat: minimal shadow for subtle elevation

/* Forms */
.input-base: consistent styling + focus states
.input-error: error state with red border
.input-success: success state with green border

/* Status indicators */
.status-answered: green background for completed
.status-unanswered: gray background for pending
.status-current: blue background for active
.status-flagged: yellow background for review
```

### **Componentes Principales**
```
Navbar.tsx - Navegación principal con theme toggle
ExamSimulation.tsx - Página principal de examen (refactorizada)
ExamTimer.tsx - Cronómetro optimizado
ExamQuestionCard.tsx - Display de preguntas
ThemeToggle.tsx - Selector de tema
AIConfiguration.tsx - Configuración de IA reutilizable
```

## 🔧 CONFIGURACIÓN ESPECÍFICA

### **🎨 TAILWIND CSS + VARIABLES CSS**

#### **Buenas Prácticas para Variables CSS:**
```css
/* ✅ RECOMENDADO: Definir colores en tailwind.config.js */
theme: {
  extend: {
    colors: {
      'theme-primary': 'var(--theme-text-primary)',
      'theme-secondary': 'var(--theme-text-secondary)',
      'theme-success': 'var(--theme-success)',
      'theme-error': 'var(--theme-error)',
      'theme-warning': 'var(--theme-warning)',
      'theme-info': 'var(--theme-info)',
    }
  }
}

/* ✅ ALTERNATIVA: Clases CSS en index.css */
.text-theme-primary { color: var(--theme-text-primary); }
.text-theme-secondary { color: var(--theme-text-secondary); }
.bg-theme-primary { background-color: var(--theme-bg-primary); }
```

#### **Evitar (causa warnings CSS):**
```typescript
// ❌ EVITAR: Mezcla de className + style con variables
<div 
  className="p-4 rounded-xl"
  style={{ color: 'var(--theme-text-primary)' }}
>

// ✅ MEJOR: Solo clases CSS
<div className="p-4 rounded-xl text-theme-primary">
```

#### **Problema identificado:**
- **145+ componentes** usan estilos inline con variables CSS
- Esto puede causar selectores CSS inválidos en DevTools
- Especialmente problemático en: ExamQuestions.tsx, ExamContainer.tsx, ExamQuestionCard.tsx

### **Zustand Store**
```typescript
// stores/examStore.ts - Estado consolidado
interface ExamState {
  currentExam: Exam | null;
  currentQuestionIndex: number;
  answers: Record<number, number>;
  timeRemaining: number;
  isTimerRunning: boolean;
}
```

### **Modelos Gemini Disponibles**
```typescript
const AVAILABLE_MODELS = [
  'gemini-2.0-flash',      // Rápido y eficiente
  'gemini-2.5-flash',      // Mejor balance precio/rendimiento  
  'gemini-2.5-pro'         // Máximo rendimiento
];
```

### **Comandos de Desarrollo**
```bash
# Backend
cd backend && npm run dev    # Puerto 3001 con --watch

# Frontend  
cd frontend && npm run dev   # Puerto 5174 con Vite

# Build
npm run build               # Build de producción
```

## 🎯 ESTADO ACTUAL Y PRÓXIMOS PASOS

### **Progreso Actual: 90% completado**
1. **Verificar multimedia**: Subida de archivos + procesamiento con Gemini
2. **Verificar historial**: Selección de exámenes previos + generación nueva
3. **Testing básico**: Implementar Vitest para las 2 features nuevas
4. **Deploy**: Preparar para producción

### **Bloqueadores Potenciales**
- Límites de archivo en Gemini (tamaño/formato)
- Performance en queries de historial
- Validación de edge cases

### **Decisiones Técnicas Clave**
- ✅ Zustand sobre Redux (mejor para este proyecto)
- ✅ @google/genai oficial sobre generative-ai
- ✅ Vite sobre Create React App  
- ✅ Componentes atómicos sobre monolitos
- ✅ API keys individuales por seguridad

## 🔍 DEBUGGING

### **Variables de Entorno Necesarias**
```
GOOGLE_API_KEY=tu_api_key_gemini
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_key
JWT_SECRET=tu_jwt_secret
```

### **Logs Importantes**
```
Backend: Winston logs en /logs
Frontend: Console.log + browser devtools
Database: Supabase dashboard
```

## 🔄 WORKFLOWS Y PATRONES DE DESARROLLO

### **📝 FLUJO DE CREACIÓN DE EXAMEN**
```typescript
// 1. Selección de modalidad
ExamConf → ExamQuestions → ExamBasedOnHistory
    ↓
// 2. Configuración IA unificada
AIConfiguration.tsx (reutilizable)
- Validar API key
- Seleccionar modelo
- Configurar parámetros
    ↓
// 3. Generación con IA
Backend: /api/exams/generate
- Validación de parámetros
- Llamada a Gemini API
- Estructuración de respuesta
- Guardado en Supabase
    ↓
// 4. Navegación a simulación
Router → /exam/:examId
ExamSimulation.tsx carga datos
```

### **🎯 FLUJO DE SIMULACIÓN DE EXAMEN**
```typescript
// 1. Inicialización
ExamSimulation.tsx
├── useExamState() - Cargar datos
├── useExamTimer() - Inicializar cronómetro  
├── useExamPersistence() - Configurar autoguardado
└── useExamNavigation() - Configurar navegación

// 2. Durante el examen
User Actions → Zustand Store → Auto-save (30s)
- Responder pregunta: setAnswer()
- Navegar: goToQuestion()
- Marcar: toggleReviewFlag()
- Tiempo: timer countdown

// 3. Finalización
submitExam() → Backend validation → Results page
```

### **🔌 PATRONES DE COMUNICACIÓN API**
```typescript
// Frontend → Backend communication
const examService = {
  generateExam: (config) => POST('/api/exams/generate', config),
  submitAnswers: (examId, answers) => POST('/api/exams/submit', { examId, answers }),
  autoSave: (examId, progress) => PUT('/api/exams/progress', { examId, progress })
};

// Error handling pattern
try {
  const result = await examService.generateExam(config);
  // Success handling
} catch (error) {
  // Specific error types
  if (error.status === 400) handleValidationError(error);
  if (error.status === 429) handleRateLimit(error);
  if (error.status === 500) handleServerError(error);
}

// Loading states pattern
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const handleAction = async () => {
  setLoading(true);
  setError(null);
  try {
    await apiCall();
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### **🎨 PATRONES DE COMPONENTES**
```typescript
// 1. Atomic Design Pattern
// Atoms: Button, Input, Icon
// Molecules: QuestionCard, TimerDisplay
// Organisms: NavigationPanel, ExamHeader
// Templates: ExamLayout
// Pages: ExamSimulation

// 2. Custom Hooks Pattern
useExamTimer() - Timer logic
useExamPersistence() - Auto-save logic
useExamNavigation() - Navigation logic
useAPIKey() - API key management
useTheme() - Theme management

// 3. Compound Components Pattern
<ExamSimulation>
  <ExamTimer />
  <ExamProgress />
  <QuestionCard />
  <NavigationPanel />
</ExamSimulation>

// 4. Render Props Pattern (for flexibility)
<DataLoader
  render={({ data, loading, error }) => (
    loading ? <Spinner /> : <ExamContent data={data} />
  )}
/>
```

### **🔧 CONFIGURACIONES ESPECÍFICAS**

#### **Vite Config Optimizations**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['@google/genai'],
          ui: ['@tailwindcss']
        }
      }
    }
  }
});
```

#### **ESLint + Prettier Setup**
```json
// .eslintrc.js rules específicas
{
  "rules": {
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal"],
      "newlines-between": "always"
    }]
  }
}
```

### **📊 MÉTRICAS Y MONITORING**

#### **Performance Metrics Tracked**
```typescript
// Core Web Vitals monitoring
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms  
- CLS (Cumulative Layout Shift): < 0.1
- Bundle size: < 1MB gzipped
- Time to Interactive: < 3s
```

#### **User Experience Metrics**
```typescript
// Custom metrics
- Exam completion rate: % usuarios que terminan
- Average exam duration: tiempo promedio
- API key setup success rate: % usuarios que configuran correctamente
- Error rates: por endpoint y tipo
- Auto-save success rate: % guardados exitosos
```

### **🚀 COMANDOS Y SCRIPTS**

#### **Comandos de Desarrollo**
```bash
# Desarrollo completo (ambos servidores)
npm run dev:all          # Backend + Frontend concurrentemente

# Backend específico
cd backend
npm run dev              # Puerto 3001 con nodemon --watch
npm run build            # Build para producción
npm run test             # Tests con Vitest (cuando se implemente)

# Frontend específico  
cd frontend
npm run dev              # Puerto 5174 con Vite HMR
npm run build            # Build optimizado para producción
npm run preview          # Preview del build en localhost:4173
npm run lint             # ESLint check
npm run type-check       # TypeScript validation
```

#### **Scripts de Mantenimiento**
```bash
# Limpieza
npm run clean            # Limpiar node_modules y builds
npm run fresh-install    # Clean install desde cero

# Base de datos
npm run db:reset         # Reset tablas Supabase (development)
npm run db:seed          # Poblar con datos de prueba
npm run db:backup        # Backup de datos importantes

# Deployment
npm run deploy:frontend  # Deploy a Vercel/Netlify
npm run deploy:backend   # Deploy a Railway/Heroku
```

### **🔍 DEBUGGING Y TROUBLESHOOTING**

#### **Herramientas de Debug**
```typescript
// React DevTools extensions
- React Developer Tools
- React Hook Form DevTools  
- Zustand DevTools (via Redux DevTools)

// Network debugging
- Browser Network tab para API calls
- Console.log strategics en desarrollo
- Winston logs en backend (/logs directory)

// Performance debugging
- React Profiler para re-renders
- Lighthouse para Core Web Vitals
- Bundle Analyzer para tamaño de chunks
```

#### **Common Issues & Solutions**
```typescript
// 1. CORS errors
Solution: Verificar configuración en backend/src/app.js

// 2. API key validation fails
Solution: Verificar formato y permisos en Google AI Studio

// 3. Timer no sincroniza
Solution: Verificar dependencies en useExamTimer hook

// 4. Auto-save failures
Solution: Verificar network connectivity y JWT validity

// 5. Dark mode not applying
Solution: Verificar data-theme attribute en <html>
```
