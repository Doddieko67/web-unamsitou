# 🟡 REACTI - DEVELOPMENT SETUP

## 🌿 **Development Branch**

Esta rama está configurada para **desarrollo local** sin Cloudflare tunnel.

---

## ⚡ **QUICK START**

### **1. Backend Setup**
```bash
cd backend
cp .env.example .env
# Editar .env con tus credenciales reales
npm install
npm run dev
```

### **2. Frontend Setup**
```bash
cd frontend
cp .env.example .env
# Editar .env con tus credenciales reales
npm install
npm run dev
```

### **3. Acceso Local**
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## 🐳 **DOCKER DEVELOPMENT**

### **Solo Backend**
```bash
docker-compose up backend
```

### **Stack Completo (sin tunnel)**
```bash
docker-compose up -d
```

---

## 🔧 **CONFIGURACIÓN LOCALHOST**

### **Puertos por Defecto:**
- **Frontend**: 5173 (Vite dev server)
- **Backend**: 3000 (Express server)
- **Database**: Supabase cloud

### **URLs de Desarrollo:**
- **Frontend → Backend**: `http://localhost:3000`
- **CORS permitido**: `http://localhost:5173`

---

## 📁 **ESTRUCTURA DE ARCHIVOS**

### **Backend (.env)**
```env
GEMINI_API_KEY=tu_api_key
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_KEY=tu_service_role_key
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENCRYPTION_KEY=tu_clave_32_caracteres
```

### **Frontend (.env)**
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_KEY=tu_anon_key
VITE_BACKEND_URL=http://localhost:3000
```

---

## 🧪 **TESTING**

```bash
# Frontend tests
cd frontend && npm test

# Backend tests (si existen)
cd backend && npm test

# Build test
cd frontend && npm run build
```

---

## 🔄 **DIFERENCIAS CON PRODUCTION**

| Aspecto | Development | Production |
|---------|-------------|------------|
| **Backend URL** | `localhost:3000` | `api.vikdev.dev` |
| **Environment** | `development` | `production` |
| **Cloudflare** | ❌ Deshabilitado | ✅ Activo |
| **CORS** | Localhost only | Dominios públicos |
| **Logs** | Verbose | Minimal |

---

## 🚀 **PARA DEPLOY A PRODUCTION**

1. **Switch to production branch:**
   ```bash
   git checkout production
   git merge development
   ```

2. **Configure production env:**
   - Set `NODE_ENV=production`
   - Set `VITE_BACKEND_URL=https://api.vikdev.dev`
   - Enable cloudflared in docker-compose.yml

3. **Deploy:**
   ```bash
   docker-compose up -d
   ```

---

## 🛠️ **TROUBLESHOOTING**

### **Backend no inicia:**
- Verificar `.env` existe y tiene credenciales
- Puerto 3000 libre: `lsof -i :3000`
- Database conecta: `curl localhost:3000/health`

### **Frontend no conecta:**
- CORS error: Verificar `FRONTEND_URL` en backend
- 404 error: Verificar `VITE_BACKEND_URL` en frontend
- Auth error: Verificar Supabase keys

### **Docker issues:**
- Clean rebuild: `docker-compose down && docker-compose build && docker-compose up`
- Check health: `docker-compose ps`
- View logs: `docker-compose logs backend`

---

**¡Happy coding! 🚀**