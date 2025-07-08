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

### **FASE 1: Fundamentos (Semanas 1-2)**

**Backend:**
```bash
# Restructurar arquitectura
backend/
├── src/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── models/
│   └── utils/
├── tests/
└── docs/
```

**Acciones inmediatas:**
- Implementar arquitectura MVC
- Añadir validación con Joi/Yup
- Configurar Winston para logs
- Actualizar dependencias críticas

**Frontend:**
- Implementar Zustand/Redux para estado global
- Añadir React Query para cache
- Configurar lazy loading
- Implementar error boundaries

### **FASE 2: Seguridad y Performance (Semanas 3-4)**

**Backend:**
- Implementar rate limiting con express-rate-limit
- Configurar helmet para headers de seguridad
- Añadir validación de JWT robusta
- Implementar circuit breaker para APIs externas

**Frontend:**
- Optimizar bundle con code splitting
- Implementar PWA capabilities
- Añadir optimización de imágenes
- Configurar service workers

### **FASE 3: Testing y CI/CD (Semanas 5-6)**

**Backend:**
- Tests unitarios con Jest
- Tests de integración con Supertest
- Configurar GitHub Actions

**Frontend:**
- Tests unitarios con Vitest
- Tests de componentes con Testing Library
- Tests e2e con Playwright

### **FASE 4: Escalabilidad (Semanas 7-8)**

**Infraestructura:**
- Dockerización completa
- Configurar nginx como reverse proxy
- Implementar monitoring con Prometheus
- Configurar alertas

**Optimizaciones:**
- Implementar Redis para cache
- Configurar CDN para assets
- Optimizar queries de base de datos

## 💰 Estimación de Recursos

**Tiempo total:** 8 semanas
**Esfuerzo:** 1 desarrollador full stack senior
**Costo aproximado:** $12,000-15,000 USD

## 🔧 Comandos de Actualización Inmediata

```bash
# Backend
npm update @google/genai @supabase/supabase-js

# Frontend  
npm update react react-dom vite

# Agregar herramientas esenciales
npm install joi winston express-rate-limit helmet
npm install --save-dev jest supertest
```

## 📈 Métricas de Éxito

- **Performance:** Reducir tiempo de carga 60%
- **Seguridad:** Eliminar vulnerabilidades críticas
- **Mantenibilidad:** Aumentar cobertura de tests a 80%
- **Escalabilidad:** Soportar 10x más usuarios concurrentes

## 🏗️ PROPUESTA DE REFACTORIZACIÓN - SIMULACIÓN DE EXAMEN

### **PROBLEMAS ACTUALES IDENTIFICADOS**

**ExamenPage.tsx (1664 líneas - CRÍTICO):**
- ❌ Estado duplicado entre Zustand store y estado local
- ❌ Lógica de timer excesivamente compleja (495 líneas en useEffect)
- ❌ Auto-guardado cada 7 segundos (performance issue)
- ❌ Memory leaks potenciales en intervalos
- ❌ Re-renders excesivos por demasiadas dependencias
- ❌ Race conditions en finalización del examen

### **NUEVA ARQUITECTURA PROPUESTA**

```typescript
// 🎯 ARQUITECTURA LIMPIA CON SEPARATION OF CONCERNS

// 1. CUSTOM HOOKS ESPECIALIZADOS
hooks/
├── useExamTimer.ts          // Lógica del cronómetro
├── useExamPersistence.ts    // Auto-guardado optimizado
├── useExamNavigation.ts     // Navegación entre preguntas
├── useExamState.ts          // Estado consolidado
└── useExamFinalization.ts   // Lógica de finalización

// 2. COMPONENTES ATÓMICOS
components/exam/
├── ExamTimer.tsx           // Timer visual (50 líneas)
├── QuestionCard.tsx        // Pregunta individual (80 líneas)
├── AnswerOptions.tsx       // Opciones de respuesta (60 líneas)
├── NavigationPanel.tsx     // Panel de navegación (100 líneas)
├── ExamProgress.tsx        // Barra de progreso (40 líneas)
└── ExamActions.tsx         // Botones de acción (50 líneas)

// 3. PÁGINAS SIMPLIFICADAS
pages/
├── ExamSimulation.tsx      // Componente principal (200 líneas MAX)
└── ExamResults.tsx         // Resultados del examen
```

### **IMPLEMENTACIÓN DETALLADA**

#### **1. Estado Consolidado (Zustand Store)**
```typescript
// stores/examStore.ts
interface ExamState {
  // SINGLE SOURCE OF TRUTH
  currentExam: Exam | null;
  currentQuestionIndex: number;
  answers: Record<number, number>;
  timeRemaining: number;
  isTimerRunning: boolean;
  lastSavedAt: Date | null;
  
  // ACTIONS
  setAnswer: (questionIndex: number, answerIndex: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  finalizeExam: () => Promise<void>;
}
```

#### **2. Custom Hook para Timer Optimizado**
```typescript
// hooks/useExamTimer.ts
export const useExamTimer = (
  initialTime: number,
  onTimeUp: () => void
) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  
  // ✅ useRef para evitar closures
  const intervalRef = useRef<NodeJS.Timeout>();
  const onTimeUpRef = useRef(onTimeUp);
  
  // ✅ Cleanup automático
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);
  
  // ✅ Timer optimizado con cleanup
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUpRef.current();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);
  
  return {
    timeLeft,
    isRunning,
    start: () => setIsRunning(true),
    pause: () => setIsRunning(false),
    reset: (newTime: number) => {
      setTimeLeft(newTime);
      setIsRunning(false);
    }
  };
};
```

#### **3. Auto-guardado Inteligente**
```typescript
// hooks/useExamPersistence.ts
export const useExamPersistence = (examState: ExamState) => {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // ✅ Debounced save (30 segundos en lugar de 7)
  const debouncedSave = useMemo(
    () => debounce(async (state: ExamState) => {
      try {
        setSaveStatus('saving');
        await saveExamProgress(state);
        setLastSaved(new Date());
        setSaveStatus('saved');
      } catch (error) {
        setSaveStatus('error');
        console.error('Error saving exam:', error);
      }
    }, 30000), // 30 segundos
    []
  );
  
  // ✅ Save solo cuando hay cambios importantes
  useEffect(() => {
    if (examState.answers && Object.keys(examState.answers).length > 0) {
      debouncedSave(examState);
    }
  }, [examState.answers, examState.currentQuestionIndex, debouncedSave]);
  
  return { lastSaved, saveStatus };
};
```

#### **4. Componente Principal Simplificado**
```typescript
// pages/ExamSimulation.tsx (MAX 200 LÍNEAS)
export const ExamSimulation: React.FC = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  // ✅ Custom hooks para separar responsabilidades
  const examState = useExamState(examId);
  const timer = useExamTimer(examState.timeLimit, () => examState.finalizeExam());
  const persistence = useExamPersistence(examState);
  const navigation = useExamNavigation(examState);
  
  // ✅ Loading y error states simples
  if (examState.loading) return <ExamLoadingSpinner />;
  if (examState.error) return <ExamErrorDisplay error={examState.error} />;
  if (!examState.currentExam) return <ExamNotFound />;
  
  return (
    <ExamErrorBoundary>
      <div className="exam-simulation-container">
        {/* ✅ Componentes atómicos y enfocados */}
        <ExamTimer 
          timeLeft={timer.timeLeft}
          isRunning={timer.isRunning}
          onPause={timer.pause}
          onResume={timer.start}
        />
        
        <ExamProgress 
          current={examState.currentQuestionIndex + 1}
          total={examState.currentExam.questions.length}
          answered={Object.keys(examState.answers).length}
        />
        
        <QuestionCard 
          question={examState.currentQuestion}
          selectedAnswer={examState.answers[examState.currentQuestionIndex]}
          onAnswerSelect={examState.setAnswer}
        />
        
        <NavigationPanel 
          onPrevious={navigation.previous}
          onNext={navigation.next}
          onGoToQuestion={navigation.goToQuestion}
          currentIndex={examState.currentQuestionIndex}
          questionsStatus={examState.questionsStatus}
        />
        
        <ExamActions 
          onFinalize={examState.finalizeExam}
          onSave={() => persistence.forceSave()}
          saveStatus={persistence.saveStatus}
          canFinalize={examState.canFinalize}
        />
      </div>
    </ExamErrorBoundary>
  );
};
```

### **BENEFICIOS DE LA NUEVA ARQUITECTURA**

#### **Performance:**
- ✅ Reducir auto-guardado de 7s a 30s (85% menos requests)
- ✅ Eliminar re-renders innecesarios con memoización
- ✅ Componentes más pequeños = mejor tree shaking
- ✅ Lazy loading de componentes no críticos

#### **Mantenibilidad:**
- ✅ Componentes de 50-200 líneas (vs 1664 líneas actual)
- ✅ Single Responsibility Principle
- ✅ Custom hooks testeables independientemente
- ✅ Estado predecible con un solo store

#### **Testing:**
- ✅ Hooks unitarios testeables
- ✅ Componentes atómicos con props claras
- ✅ Mocks simples para dependencias
- ✅ Tests de integración enfocados

#### **Developer Experience:**
- ✅ Código autodocumentado
- ✅ TypeScript estricto
- ✅ Error boundaries granulares
- ✅ DevTools integrado con Zustand

### **PLAN DE MIGRACIÓN**

#### **Semana 1: Fundación**
1. Crear nuevo store consolidado
2. Implementar custom hooks básicos
3. Crear componentes atómicos

#### **Semana 2: Migración**
1. Migrar ExamenPage.tsx gradualmente
2. Probar cada componente independientemente
3. Mantener funcionalidad existente

#### **Semana 3: Optimización**
1. Optimizar rendimiento
2. Añadir tests unitarios
3. Documentar nueva arquitectura

#### **Semana 4: Validación**
1. Tests de integración completos
2. Performance testing
3. Validación con usuarios reales

### **MÉTRICAS DE ÉXITO ESPERADAS**

- **Líneas de código:** 1664 → ~600 líneas (reducción 65%)
- **Re-renders:** Reducir 80% con memoización
- **Network requests:** Reducir 85% auto-guardado
- **Time to interactive:** Mejorar 40%
- **Memory usage:** Reducir 30% eliminando memory leaks
- **Developer velocity:** Aumentar 200% para nuevas features

Esta arquitectura convierte el código existente de "funcional pero caótico" a "production-ready y escalable" siguiendo las mejores prácticas de React senior-level.

# 🌙 SISTEMA DE DARK/LIGHT MODE - ANÁLISIS Y PLAN DE IMPLEMENTACIÓN

## 🎨 ANÁLISIS DEL SISTEMA DE DISEÑO ACTUAL

### **PALETA DE COLORES PRINCIPAL**
```css
:root {
  --primary: #6366f1;         /* Indigo-500 - Color de marca principal */
  --primary-dark: #4f46e5;    /* Indigo-600 - Variante oscura */
  --terciary: oklch(51.1% 0.262 276.966);    /* Púrpura personalizado */
  --cuaternary: oklch(55.8% 0.288 302.321);  /* Púrpura-rosa personalizado */
  --secondary: #10b981;       /* Emerald-500 - Color secundario */
  --dark: #1e293b;           /* Slate-800 - Texto oscuro */
  --light: #f8fafc;          /* Slate-50 - Fondo claro */
}
```

### **COLORES DE ESTADO Y SEMÁNTICOS**
- **🟢 Éxito**: `#16a34a` (Green-600) con fondo `#dcfce7` (Green-50)
- **🟡 Advertencia**: `#ca8a04` (Yellow-600) con fondo `#fef9c3` (Yellow-50)
- **🔴 Error**: `#dc2626` (Red-600) con fondo `#fee2e2` (Red-50)
- **🔵 Información**: Espectro azul desde `#3b82f6` hasta `#dbeafe`

### **PALETA NEUTRAL ACTUAL**
- **Fondo principal**: `#f1f5f9` (Slate-100)
- **Superficies (cards)**: `#ffffff` (White)
- **Texto primario**: `#1f2937` (Gray-800)
- **Texto secundario**: `#6b7280` (Gray-500)
- **Bordes**: `#e5e7eb` (Gray-200) a `#d1d5db` (Gray-300)

## 🏗️ PATRONES DE COMPONENTES IDENTIFICADOS

### **1. SISTEMA DE NAVEGACIÓN**
```css
/* Actual */
.navbar {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
}

.nav-link.active {
  background: white;
  color: var(--primary);
}
```

### **2. JERARQUÍA DE CARDS**
```css
/* Exam Cards - Contenido Principal */
.exam-card {
  background: white;
  border-left: 4px solid var(--primary);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* Question Cards - Interfaz de Examen */
.question-item {
  background: white;
  border-left: 3px solid var(--primary);
  border-radius: 0.75rem;
}

/* Stats Cards - Dashboard */
.stats-card {
  background: colored backgrounds (blue-50, green-50, etc.);
  border-radius: 0.5rem;
  padding: 0.75rem;
}
```

### **3. ELEMENTOS INTERACTIVOS**
```css
/* Botones Primarios */
.gradient-bg-purple {
  background: linear-gradient(135deg, var(--terciary), var(--cuaternary));
  color: white;
  font-weight: 600;
}

/* Elementos de Formulario */
.input-field {
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.input-field:focus {
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  border-color: #6366f1;
}
```

### **4. ESTADOS DEL TIMER DE EXAMEN**
```css
/* Activo */
.timer-active { background: #dbeafe; border: #60a5fa; color: #1e40af; }

/* Advertencia (<5 min) */
.timer-warning { background: #fee2e2; border: #f87171; color: #dc2626; }

/* Inactivo/Terminado */
.timer-inactive { background: #f3f4f6; border: #d1d5db; color: #6b7280; }
```

### **5. OPCIONES DE RESPUESTA**
```css
/* No seleccionada */
.answer-option { border: #e5e7eb; background: white; }

/* Seleccionada (durante examen) */
.answer-selected { border: #6366f1; background: #dbeafe; color: #1e40af; }

/* Respuesta correcta (después de envío) */
.answer-correct { border: #10b981; background: #d1fae5; color: #065f46; }

/* Respuesta incorrecta (después de envío) */
.answer-wrong { border: #ef4444; background: #fee2e2; color: #dc2626; }
```

## 🌙 ARQUITECTURA PARA DARK MODE

### **SISTEMA DE VARIABLES CSS EXPANDIDO**
```css
:root {
  /* === COLORES PRINCIPALES === */
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --secondary: #10b981;
  
  /* === SUPERFICIES === */
  --surface-primary: #ffffff;      /* Cards, modales */
  --surface-secondary: #f8fafc;    /* Fondos secundarios */
  --surface-tertiary: #f1f5f9;     /* Fondo principal de la app */
  
  /* === TEXTO === */
  --text-primary: #1f2937;         /* Títulos, texto principal */
  --text-secondary: #6b7280;       /* Texto secundario */
  --text-tertiary: #9ca3af;        /* Texto de apoyo, placeholders */
  
  /* === BORDES === */
  --border-primary: #e5e7eb;       /* Bordes principales */
  --border-secondary: #d1d5db;     /* Bordes destacados */
  
  /* === ESTADOS === */
  --success-bg: #dcfce7;   --success-text: #16a34a;
  --warning-bg: #fef9c3;   --warning-text: #ca8a04;
  --error-bg: #fee2e2;     --error-text: #dc2626;
  --info-bg: #dbeafe;      --info-text: #2563eb;
}

/* === TEMA OSCURO === */
[data-theme="dark"] {
  /* === COLORES PRINCIPALES AJUSTADOS === */
  --primary: #818cf8;              /* Indigo-400 - mejor contraste */
  --primary-dark: #6366f1;         /* Indigo-500 - original */
  --secondary: #34d399;            /* Emerald-400 - más brillante */
  
  /* === SUPERFICIES OSCURAS === */
  --surface-primary: #1e293b;      /* Slate-800 - Cards */
  --surface-secondary: #334155;    /* Slate-700 - Fondos secundarios */
  --surface-tertiary: #475569;     /* Slate-600 - Fondo principal */
  
  /* === TEXTO CLARO === */
  --text-primary: #f8fafc;         /* Slate-50 - Títulos */
  --text-secondary: #cbd5e1;       /* Slate-300 - Texto secundario */
  --text-tertiary: #94a3b8;        /* Slate-400 - Texto de apoyo */
  
  /* === BORDES OSCUROS === */
  --border-primary: #475569;       /* Slate-600 */
  --border-secondary: #64748b;     /* Slate-500 */
  
  /* === ESTADOS OSCUROS === */
  --success-bg: rgba(52, 211, 153, 0.1);   --success-text: #6ee7b7;
  --warning-bg: rgba(251, 191, 36, 0.1);   --warning-text: #fcd34d;
  --error-bg: rgba(248, 113, 113, 0.1);    --error-text: #fca5a5;
  --info-bg: rgba(129, 140, 248, 0.1);     --info-text: #a5b4fc;
}
```

### **COMPONENTES ESPECÍFICOS PARA DARK MODE**

#### **1. NAVEGACIÓN OSCURA**
```css
[data-theme="dark"] .navbar {
  background: linear-gradient(135deg, #1e293b, #334155);
  border-bottom: 1px solid var(--border-primary);
}

[data-theme="dark"] .nav-link {
  color: var(--text-secondary);
}

[data-theme="dark"] .nav-link:hover {
  background: rgba(129, 140, 248, 0.1);
  color: var(--primary);
}

[data-theme="dark"] .nav-link.active {
  background: var(--surface-secondary);
  color: var(--primary);
}
```

#### **2. SISTEMA DE CARDS OSCURO**
```css
[data-theme="dark"] .exam-card {
  background: var(--surface-primary);
  border-left-color: var(--primary);
  border: 1px solid var(--border-primary);
  color: var(--text-primary);
}

[data-theme="dark"] .exam-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
  border-color: var(--primary);
}

[data-theme="dark"] .question-item {
  background: var(--surface-primary);
  border-left-color: var(--primary);
  border: 1px solid var(--border-primary);
}
```

#### **3. FORMULARIOS OSCUROS**
```css
[data-theme="dark"] .input-field {
  background: var(--surface-secondary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="dark"] .input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
  background: var(--surface-primary);
}

[data-theme="dark"] .input-field::placeholder {
  color: var(--text-tertiary);
}
```

#### **4. INTERFAZ DE EXAMEN OSCURA**

**Timer States:**
```css
[data-theme="dark"] .timer-active {
  background: rgba(129, 140, 248, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

[data-theme="dark"] .timer-warning {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #f87171;
}

[data-theme="dark"] .timer-inactive {
  background: var(--surface-secondary);
  border-color: var(--border-primary);
  color: var(--text-secondary);
}
```

**Answer Options:**
```css
[data-theme="dark"] .answer-option {
  background: var(--surface-secondary);
  border-color: var(--border-primary);
  color: var(--text-primary);
}

[data-theme="dark"] .answer-option:hover {
  background: var(--surface-tertiary);
  border-color: var(--border-secondary);
}

[data-theme="dark"] .answer-selected {
  background: rgba(129, 140, 248, 0.1);
  border-color: var(--primary);
  color: var(--primary);
}

[data-theme="dark"] .answer-correct {
  background: rgba(52, 211, 153, 0.1);
  border-color: var(--secondary);
  color: var(--secondary);
}

[data-theme="dark"] .answer-wrong {
  background: rgba(248, 113, 113, 0.1);
  border-color: #f87171;
  color: #f87171;
}
```

#### **5. BADGES Y PILLS OSCUROS**
```css
[data-theme="dark"] .difficulty-easy {
  background: var(--success-bg);
  color: var(--success-text);
}

[data-theme="dark"] .difficulty-medium {
  background: var(--warning-bg);
  color: var(--warning-text);
}

[data-theme="dark"] .difficulty-hard {
  background: var(--error-bg);
  color: var(--error-text);
}

[data-theme="dark"] .status-completed {
  background: rgba(52, 211, 153, 0.1);
  color: var(--secondary);
  border-color: var(--secondary);
}
```

## 🚀 PLAN DE IMPLEMENTACIÓN DETALLADO

### **SEMANA 1: FUNDACIÓN DEL SISTEMA**
```typescript
// 1. Theme Toggle Component
interface ThemeToggleProps {
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = "" }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-80 ${
        theme === 'dark' 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      } ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'dark' ? (
        <i className="fas fa-sun text-lg"></i>
      ) : (
        <i className="fas fa-moon text-lg"></i>
      )}
    </button>
  );
};

// 2. Theme Context Provider
interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
```

### **SEMANA 2: MIGRACIÓN DE COMPONENTES CORE**
```css
/* 3. Actualización de index.css con sistema de variables */
body {
  background-color: var(--surface-tertiary);
  color: var(--text-primary);
  font-family: "Poppins", sans-serif;
}

/* 4. Migración de clases Tailwind a variables CSS */
.card-base {
  background: var(--surface-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
}

.button-primary {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
}

.button-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.input-base {
  background: var(--surface-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.input-base:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  outline: none;
}

[data-theme="dark"] .input-base:focus {
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
}
```

### **SEMANA 3: INTERFAZ DE EXAMEN**
```typescript
// 5. Componentes de Examen Actualizados
export const ExamTimer: React.FC<ExamTimerProps> = ({ timeLeft, isRunning, isSubmitted }) => {
  const getTimerClasses = () => {
    const base = "px-4 py-3 rounded-lg font-semibold text-xl border transition-colors duration-300";
    
    if (timeLeft === null) {
      return `${base} bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-tertiary)]`;
    } else if (timeLeft <= 300 && timeLeft > 0 && !isSubmitted) {
      return `${base} bg-[var(--error-bg)] border-red-300 text-[var(--error-text)] animate-pulse`;
    } else if (timeLeft === 0 || isSubmitted) {
      return `${base} bg-[var(--surface-secondary)] border-[var(--border-primary)] text-[var(--text-tertiary)]`;
    } else {
      return `${base} bg-[var(--info-bg)] border-blue-300 text-[var(--info-text)]`;
    }
  };

  return (
    <div className={getTimerClasses()}>
      <i className="far fa-clock mr-2"></i>
      <span>{timeLeft && formatTime(timeLeft)}</span>
    </div>
  );
};

// 6. Question Cards con Dark Mode
export const ExamQuestionCard: React.FC<ExamQuestionCardProps> = ({ question, selectedAnswer, isSubmitted }) => {
  const getAnswerButtonClass = (optionIndex: number) => {
    const baseClass = "w-full text-left p-4 border-2 rounded-lg transition-all duration-200";
    
    if (!isSubmitted) {
      if (selectedAnswer === optionIndex) {
        return `${baseClass} border-[var(--primary)] bg-[var(--info-bg)] text-[var(--info-text)]`;
      }
      return `${baseClass} border-[var(--border-primary)] bg-[var(--surface-primary)] hover:border-[var(--border-secondary)]`;
    } else {
      const isCorrect = question.correcta === optionIndex;
      const isSelected = selectedAnswer === optionIndex;
      
      if (isCorrect) {
        return `${baseClass} border-[var(--secondary)] bg-[var(--success-bg)] text-[var(--success-text)]`;
      } else if (isSelected) {
        return `${baseClass} border-red-400 bg-[var(--error-bg)] text-[var(--error-text)]`;
      }
      return `${baseClass} border-[var(--border-primary)] bg-[var(--surface-secondary)] text-[var(--text-secondary)]`;
    }
  };

  return (
    <div className="bg-[var(--surface-primary)] rounded-xl p-6 border border-[var(--border-primary)]">
      <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
        {question.pregunta}
      </h2>
      
      {question.opciones?.map((option, index) => (
        <button
          key={index}
          className={getAnswerButtonClass(index)}
          disabled={isSubmitted}
        >
          {option}
        </button>
      ))}
    </div>
  );
};
```

### **SEMANA 4: OPTIMIZACIÓN Y POLISH**
```typescript
// 7. Performance Optimizations
const ThemeOptimizer = React.memo(() => {
  const { theme } = useTheme();
  
  // Preload dark mode assets when light mode is active
  useEffect(() => {
    if (theme === 'light') {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = '/dark-mode-assets.css';
      document.head.appendChild(link);
    }
  }, [theme]);

  return null;
});

// 8. Accessibility Improvements
const a11yThemeStyles = `
  @media (prefers-reduced-motion: reduce) {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
  
  @media (prefers-color-scheme: dark) {
    :root {
      color-scheme: dark;
    }
  }
  
  [data-theme="dark"] {
    color-scheme: dark;
  }
  
  [data-theme="light"] {
    color-scheme: light;
  }
`;

// 9. System Theme Detection
export const useSystemTheme = () => {
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return systemTheme;
};
```

## 📊 MÉTRICAS DE ÉXITO ESPERADAS

### **Experiencia de Usuario**
- **👁️ Reducción de fatiga visual:** 40% menos cansancio reportado en sesiones nocturnas
- **🔋 Ahorro de batería:** 15-25% en dispositivos OLED
- **♿ Accesibilidad mejorada:** Cumplimiento WCAG 2.1 AA en ambos temas
- **⚡ Adopción:** 60% de usuarios adoptan dark mode dentro del primer mes

### **Métricas Técnicas**
- **📦 Impacto en bundle:** <3KB adicionales (CSS variables + componente toggle)
- **🚀 Performance:** Sin impacto en métricas Core Web Vitals
- **🎨 Consistencia:** 100% de componentes soportan ambos temas
- **🔧 Mantenibilidad:** Tiempo de actualización de temas reducido 80%

### **Indicadores de Calidad**
- **🎯 Contraste:** Mínimo 4.5:1 para texto normal, 3:1 para texto grande
- **🔄 Transiciones:** Smooth theme switching <300ms
- **💾 Persistencia:** Preferencia guardada entre sesiones
- **📱 Responsive:** Funcional en todos los breakpoints

## 🔧 HERRAMIENTAS Y UTILIDADES RECOMENDADAS

### **Testing Dark Mode**
```typescript
// 10. Testing Utilities
export const ThemeTestUtils = {
  setDarkMode: () => {
    document.documentElement.setAttribute('data-theme', 'dark');
  },
  
  setLightMode: () => {
    document.documentElement.setAttribute('data-theme', 'light');
  },
  
  getCurrentTheme: () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },
  
  testContrastRatio: (foreground: string, background: string) => {
    // Implementation for contrast ratio testing
    return calculateContrastRatio(foreground, background);
  }
};

// 11. Development Tools
const ThemeDebugger: React.FC = () => {
  const { theme } = useTheme();
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 p-2 bg-black/80 text-white rounded text-xs">
      Current theme: {theme}
      <br />
      System preference: {window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'}
    </div>
  );
};
```

### **Color Palette Generator**
```typescript
// 12. Dynamic Color Generation
export const generateThemeColors = (baseHue: number) => {
  return {
    light: {
      primary: `hsl(${baseHue}, 70%, 50%)`,
      primaryDark: `hsl(${baseHue}, 70%, 40%)`,
      surface: `hsl(${baseHue}, 20%, 98%)`,
      text: `hsl(${baseHue}, 20%, 10%)`
    },
    dark: {
      primary: `hsl(${baseHue}, 70%, 60%)`,
      primaryDark: `hsl(${baseHue}, 70%, 50%)`,
      surface: `hsl(${baseHue}, 20%, 15%)`,
      text: `hsl(${baseHue}, 20%, 90%)`
    }
  };
};
```

## 🎯 ROADMAP POST-LANZAMIENTO

### **Fase 1: Estabilización (Mes 1-2)**
- Monitoreo de adopción y feedback de usuarios
- Corrección de bugs de contraste o usabilidad
- Optimizaciones de performance basadas en métricas reales

### **Fase 2: Expansión (Mes 3-4)**
- Temas adicionales (alto contraste, sepia)
- Personalización de colores por usuario
- Modo automático basado en hora del día

### **Fase 3: Avanzado (Mes 5-6)**
- Temas específicos por sección (modo focus para exámenes)
- Integración con preferencias del sistema operativo
- Analytics avanzados de uso de temas

Este plan asegura una implementación robusta, accesible y mantenible del sistema dark/light mode, elevando significativamente la experiencia de usuario de ExamGen AI.

## 🚀 ESTADO ACTUAL DE IMPLEMENTACIÓN (07/01/2025)

### ✅ **COMPLETADO - Fundación del Sistema de Temas**

#### **1. CSS Variables System**
- ✅ Definidas 30+ variables CSS para light/dark mode
- ✅ Sistema de colores semánticos (primary, secondary, success, error, etc.)
- ✅ Variables responsivas para sombras, gradientes e interacciones
- ✅ Soporte automático para `[data-theme="dark"]`

#### **2. Theme Context & Provider**
- ✅ Contexto React con TypeScript completo
- ✅ Persistencia en localStorage  
- ✅ Detección automática de preferencias del sistema
- ✅ Listener para cambios de tema del OS
- ✅ Hook `useTheme()` con API limpia

#### **3. Theme Toggle Component**
- ✅ 3 variantes: `icon`, `button`, `switch`
- ✅ 3 tamaños: `sm`, `md`, `lg`
- ✅ Animaciones fluidas con iconos Font Awesome
- ✅ Tooltips informativos en español
- ✅ Soporte completo para dark mode

#### **4. Integración Inicial**
- ✅ Navbar actualizada con theme toggle
- ✅ Footer adaptado a variables CSS
- ✅ App.tsx configurada con ThemeProvider
- ✅ Transiciones suaves de 300ms

### 🔄 **EN PROGRESO - Migración de Componentes**

#### **Componentes Actualizados (2/15)**
1. ✅ **Navbar.tsx** - Dropdown y gradientes con variables CSS
2. ✅ **Footer.tsx** - Colores adaptativos completos

#### **Pendientes de Actualización (13 componentes)**
3. ⏳ ExamQuestionCard.tsx
4. ⏳ RecentExamCard.tsx  
5. ⏳ ExamRecents.tsx
6. ⏳ ExamConf.tsx
7. ⏳ LoadingSpinner.tsx
8. ⏳ Login.tsx
9. ⏳ SignUp.tsx
10. ⏳ ResetPassword.tsx
11. ⏳ ExamenPage.tsx
12. ⏳ ExamTimer.tsx
13. ⏳ ExamResults.tsx
14. ⏳ ErrorBoundary.tsx
15. ⏳ Main pages components

### 🎮 **FUNCIONAMIENTO ACTUAL**

#### **Estado del Servidor**
- ✅ Dev server corriendo en `http://localhost:5174`
- ✅ Sistema de temas funcionando correctamente
- ✅ Toggle de temas operativo en navbar (desktop y mobile)
- ✅ Persistencia de preferencias funcionando

#### **Navegación Funcional**
- ✅ Light/Dark mode toggle con iconos animados
- ✅ Detección automática de tema del sistema
- ✅ Transiciones suaves entre temas
- ✅ Dropdown del usuario adaptativo

### 📋 **PRÓXIMOS PASOS PRIORITARIOS**

#### **Semana 1 - Componentes Core**
1. **ExamQuestionCard.tsx** - Componente más crítico
2. **ExamRecents.tsx** - Dashboard principal
3. **RecentExamCard.tsx** - Cards de exámenes
4. **LoadingSpinner.tsx** - Estados de carga

#### **Semana 2 - Páginas de Autenticación**
1. **Login.tsx** - Página de entrada
2. **SignUp.tsx** - Registro de usuarios
3. **ResetPassword.tsx** - Recuperación

#### **Semana 3 - Simulación de Examen**
1. **ExamenPage.tsx** - Página principal de examen
2. **ExamTimer.tsx** - Cronómetro
3. **ExamResults.tsx** - Resultados

#### **Semana 4 - Testing y Polish**
1. Tests automatizados
2. Verificación de contraste WCAG
3. Performance optimization
4. Documentation update

### 🛠️ **COMANDOS DE DESARROLLO ACTUALIZADOS**

```bash
# Frontend development
npm run dev         # http://localhost:5174 (theme system active)
npm run build       # Production build with theme support
npm run test        # Vitest with theme testing

# Theme testing commands
npm run test:theme  # Run theme-specific tests (pending)
npm run audit:a11y  # Accessibility audit (pending)
```

### 📊 **MÉTRICAS DE PROGRESO**

- **Arquitectura Base**: 100% ✅
- **Componentes Core**: 13% (2/15) 🔄
- **Testing Coverage**: 0% ⏳
- **Performance**: Baseline establecido ⏳
- **Accessibility**: Variables semánticas ✅

### 🎯 **OBJETIVOS ESTA SEMANA**

1. **Completar migración de ExamQuestionCard.tsx** (componente más complejo)
2. **Actualizar sistema de cards** (RecentExamCard + ExamRecents)
3. **Implementar tests básicos** del sistema de temas
4. **Verificar funcionamiento** en todas las páginas principales

El sistema de temas está **funcionalmente completo** en su base y **parcialmente implementado** en componentes. La arquitectura es sólida y escalable, lista para completar la migración de todos los componentes restantes.
