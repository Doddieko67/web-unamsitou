# 🎓 REACTI v2.0.0 - Sistema Inteligente de Exámenes

Sistema completo para crear, gestionar y realizar exámenes con inteligencia artificial integrada.

## ✨ Características

- 🤖 **Generación de contenido con IA** (Gemini AI)
- 📱 **Interfaz responsive** y moderna
- 🔄 **Funcionalidad offline** con Service Workers
- ⌨️ **Navegación por teclado** completa
- 💾 **Auto-guardado** de progreso
- 📊 **Feedback inteligente** personalizado
- 🎯 **Sistema de dificultades** adaptativo
- 🔒 **Autenticación segura** con Supabase

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase
- API Key de Google Gemini

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/reacti.git
cd reacti/frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp ../.env.example .env
# Editar .env con tus credenciales

# Ejecutar en desarrollo
npm run dev
```

### Variables de Entorno Requeridas

```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_publica
VITE_GEMINI_API_KEY=tu_api_key_gemini
```

## 🛠️ Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run build:check  # Build con verificación de tipos
npm run preview      # Preview del build
npm run test         # Ejecutar tests
npm run test:ui      # Tests con interfaz visual
npm run lint         # Linting del código
```

## 🧪 Testing

El proyecto cuenta con **726 tests automatizados** que cubren:

- ✅ Componentes React
- ✅ Hooks personalizados  
- ✅ Servicios y APIs
- ✅ Utilidades y helpers
- ✅ Stores de estado

```bash
# Ejecutar todos los tests
npm run test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm test
```

## 📁 Estructura del Proyecto

```
reacti/
├── frontend/          # Aplicación principal React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # APIs y servicios
│   │   ├── stores/        # Estado global (Zustand)
│   │   ├── utils/         # Utilidades
│   │   ├── pages/         # Páginas principales
│   │   └── __tests__/     # Tests
│   ├── public/            # Assets estáticos
│   └── dist/             # Build de producción
├── .env.example          # Variables de entorno ejemplo
└── README.md             # Este archivo
```

## 🚀 Deployment

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```

### Netlify
1. Conectar repositorio GitHub
2. Build command: `npm run build`
3. Publish directory: `dist`

### Variables de Entorno en Producción
Configura estas variables en tu plataforma de deploy:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GEMINI_API_KEY`

## 🔧 Tecnologías

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4
- **Testing**: Vitest + React Testing Library
- **Backend**: Supabase
- **IA**: Google Gemini AI
- **Estado**: Zustand
- **Routing**: React Router 7

## 📊 Performance

- ⚡ **Build time**: ~5.6s
- 📦 **Bundle size**: ~1.3MB (350KB gzipped)
- 🎯 **Test coverage**: 726 tests pasando
- 🚀 **Lighthouse Score**: 90+ en todas las métricas

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama: `git checkout -b feature/nueva-caracteristica`
3. Commit: `git commit -m 'Añadir nueva característica'`
4. Push: `git push origin feature/nueva-caracteristica`
5. Abrir Pull Request

## 📝 Changelog

### v2.0.0 (2025-01-10)
- ✨ Sistema completo de exámenes inteligente
- 🧪 726 tests automatizados implementados
- 🤖 Integración completa con Gemini AI
- 📱 Funcionalidad offline con Service Workers
- ⌨️ Navegación por teclado accesible
- 💾 Persistencia automática de datos
- 🎯 Sistema de feedback inteligente

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 📧 Email: tu-email@dominio.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/reacti/issues)
- 📚 Docs: [Documentación completa](https://tu-docs.com)

---

**Desarrollado con ❤️ y ☕ usando Claude Code**