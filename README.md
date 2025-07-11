# 🎓 VikDev - Sistema Inteligente de Exámenes v2.0.0

Sistema completo full-stack para crear, gestionar y realizar exámenes con inteligencia artificial integrada usando Gemini AI.

🌐 **Demo en vivo**: [https://vikdev.dev](https://vikdev.dev)  
📊 **API Backend**: [https://server.vikdev.dev](https://server.vikdev.dev)

## ✨ Características

- 🤖 **Generación de contenido con IA** (Gemini AI personalizado por usuario)
- 📱 **Interfaz responsive** y moderna con dark/light mode
- 🔄 **Funcionalidad offline** con Service Workers y persistencia local
- ⌨️ **Navegación por teclado** completa y accesible
- 💾 **Auto-guardado** de progreso en tiempo real
- 📊 **Feedback inteligente** personalizado con análisis detallado
- 🎯 **Sistema de dificultades** adaptativo
- 🔒 **Autenticación segura** con Supabase
- ❌ **Cancelación de requests** para mejor UX
- 📁 **Upload de archivos** para generación de exámenes
- 🏷️ **Sistema de etiquetas** y categorización

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase
- Docker y Docker Compose (opcional)

### Instalación Completa

```bash
# Clonar repositorio
git clone https://github.com/Doddieko67/web-unamsitou.git
cd web-unamsitou

# === FRONTEND SETUP ===
cd frontend
npm install

# Configurar variables de entorno del frontend
cp .env.example .env
# Editar frontend/.env con tus credenciales

# === BACKEND SETUP ===
cd ../backend
npm install

# Configurar variables de entorno del backend
cp .env.example .env
# Editar backend/.env con tus credenciales

# === EJECUTAR EN DESARROLLO ===
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### Variables de Entorno Requeridas

#### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_public_key_de_supabase
VITE_BACKEND_URL=http://localhost:3000
VITE_ENCRYPTION_KEY=your_32_character_encryption_key_here
```

#### Backend (`backend/.env`)
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3000
NODE_ENV=development
ENCRYPTION_KEY=your_32_character_encryption_key_here
```

**🔒 Importante**: Las claves `VITE_ENCRYPTION_KEY` y `ENCRYPTION_KEY` deben ser **idénticas** en ambos archivos para que funcione la encriptación AES-256 de las API keys de Gemini.

**🔧 Generar clave de encriptación**:
```bash
# Generar clave segura de 32 caracteres
openssl rand -hex 16
```

## 🛠️ Scripts Disponibles

### Frontend
```bash
cd frontend
npm run dev          # Servidor de desarrollo (Puerto 5173)
npm run build        # Build para producción
npm run preview      # Preview del build
npm run test         # Ejecutar tests con Vitest
npm run test:ui      # Tests con interfaz visual
npm run lint         # Linting del código
```

### Backend
```bash
cd backend
npm run dev          # Servidor de desarrollo con nodemon
npm start            # Servidor de producción
npm test             # Ejecutar tests de backend
```

### Docker (Opcional)
```bash
# Ejecutar todo el stack con Docker
docker-compose up -d

# Solo backend en Docker
docker-compose up backend

# Rebuild containers
docker-compose up --build
```

## 🧪 Testing

El proyecto cuenta con **525+ tests automatizados** que cubren:

- ✅ Componentes React (exam, shared, main)
- ✅ Hooks personalizados (18 hooks críticos)
- ✅ Servicios y APIs (Gemini, apiKey, backend)
- ✅ Utilidades y helpers
- ✅ Stores de estado (auth, persistence)
- ✅ Configuración y setup

```bash
# Frontend tests
cd frontend
npm run test              # Ejecutar todos los tests
npm run test:ui          # Tests con interfaz visual Vitest
npm run test -- --run    # Tests sin modo watch

# Backend tests  
cd backend
npm test                 # Tests de API y servicios
```

## 📁 Estructura del Proyecto

```
vikdev/
├── frontend/              # Aplicación React + TypeScript
│   ├── src/
│   │   ├── components/       # Componentes React
│   │   │   ├── exam/         # Sistema de exámenes
│   │   │   ├── shared/       # Componentes reutilizables  
│   │   │   └── Main/         # Componentes principales
│   │   ├── hooks/            # Custom hooks (18 archivos)
│   │   ├── services/         # APIs y servicios
│   │   ├── stores/           # Estado global (Zustand)
│   │   ├── utils/            # Utilidades y helpers
│   │   ├── pages/            # Páginas principales
│   │   ├── providers/        # Context providers
│   │   └── __tests__/        # Tests completos
│   ├── public/               # Assets estáticos
│   ├── dist/                # Build de producción
│   └── .env.example         # Variables frontend
├── backend/               # API Node.js + Express
│   ├── src/
│   │   ├── controllers/      # Controladores de API
│   │   ├── services/         # Lógica de negocio
│   │   ├── middleware/       # Middleware personalizado
│   │   ├── routes/           # Rutas de API
│   │   ├── utils/            # Utilidades backend
│   │   └── database/         # Esquemas y configuración
│   ├── tests/               # Tests de backend
│   ├── logs/                # Logs del sistema
│   ├── Dockerfile           # Docker configuration
│   └── .env.example        # Variables backend
├── docker-compose.yml     # Orquestación Docker
├── LICENSE               # Licencia MIT
└── README.md            # Este archivo
```

## 🚀 Deployment

### Producción en Hostinger (Configuración Actual)

#### Frontend
```bash
cd frontend
npm run build

# Subir contenido de dist/ a public_html/ en Hostinger
# Configurado para vikdev.dev
```

#### Backend  
```bash
cd backend
npm start

# Desplegado en server.vikdev.dev
# Con configuración de proxy reverso
```

### Docker Deployment
```bash
# Build y deploy completo
docker-compose up -d --build

# Solo producción
docker-compose -f docker-compose.prod.yml up -d
```

### Variables de Entorno en Producción

#### Frontend (Hostinger)
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_public_key
VITE_BACKEND_URL=https://server.vikdev.dev
VITE_ENCRYPTION_KEY=your_production_encryption_key_32_chars
```

#### Backend (Servidor)
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
PORT=3000
NODE_ENV=production
ENCRYPTION_KEY=your_production_encryption_key_32_chars
```

**⚠️ Importante**: En producción, asegúrate de que `VITE_ENCRYPTION_KEY` y `ENCRYPTION_KEY` sean **la misma clave** y diferente a la de desarrollo.

### Cloudflare Tunnel (Configurado)
```bash
# Túnel configurado para proxy seguro
# server.vikdev.dev -> localhost:3000
# Configurado en docker-cloudflared-config.yml
```

## 🔧 Tecnologías

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build Tool**: Vite 6.0
- **Styling**: TailwindCSS 3.4
- **Testing**: Vitest 3.2 + React Testing Library 16.3
- **State Management**: Zustand 5
- **Routing**: React Router DOM 6
- **UI Components**: Lucide React, SweetAlert2
- **AI Integration**: Google Gemini AI (user-specific keys)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Processing**: Multer, PDF parsing
- **Security**: AES-256 encryption, CORS, rate limiting
- **Logging**: Winston
- **Testing**: Jest + Supertest

### DevOps & Deployment
- **Containerization**: Docker + Docker Compose
- **Proxy**: Cloudflare Tunnel
- **Hosting**: Hostinger (Frontend), VPS (Backend)
- **CI/CD**: Git-based deployment
- **Monitoring**: Winston logging, error tracking

## 📊 Performance

- ⚡ **Build time**: ~8.2s (frontend), ~3.1s (backend)
- 📦 **Bundle size**: ~1.4MB (420KB gzipped)
- 🎯 **Test coverage**: 525+ tests passing
- 🚀 **Lighthouse Score**: 90+ en todas las métricas
- 🔄 **Offline capability**: Service Workers + IndexedDB
- ⚡ **Load time**: <2s primera carga, <500ms navegación

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature: `git checkout -b feature/nueva-caracteristica`
3. Commit tus cambios: `git commit -m 'feat: añadir nueva característica'`
4. Push a la rama: `git push origin feature/nueva-caracteristica`
5. Abre un Pull Request

### Convenciones
- **Commits**: Usar [Conventional Commits](https://conventionalcommits.org/)
- **Testing**: Todos los PRs deben incluir tests
- **Code Style**: ESLint + Prettier configurado

## 📝 Changelog

### v2.0.0 (2025-01-10)
- ✨ **Full-stack architecture**: Frontend React + Backend Node.js
- 🧪 **525+ tests**: Comprehensive testing suite implemented
- 🤖 **Gemini AI integration**: User-specific API keys with encryption
- 📱 **Offline functionality**: Service Workers + IndexedDB persistence
- ⌨️ **Keyboard navigation**: Complete accessibility support
- 💾 **Real-time persistence**: Auto-save with optimistic updates
- 🎯 **Intelligent feedback**: AI-powered personalized analysis
- ❌ **Request cancellation**: Improved UX with AbortController
- 📁 **File upload**: PDF and document processing for exam generation
- 🔒 **Security**: AES-256 encryption, secure authentication
- 🐳 **Docker support**: Full containerization with docker-compose
- 🌐 **Production ready**: Deployed on vikdev.dev with Cloudflare

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- 🌐 **Demo**: [https://vikdev.dev](https://vikdev.dev)
- 🐛 **Issues**: [GitHub Issues](https://github.com/Doddieko67/web-unamsitou/issues)
- 📊 **API Status**: [https://server.vikdev.dev/health](https://server.vikdev.dev/health)
- 📧 **Contact**: A través de GitHub Issues

---

**Desarrollado con ❤️ y ☕ usando Claude Code**  
*Sistema educativo inteligente para la nueva era digital*