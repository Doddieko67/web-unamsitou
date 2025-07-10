# 🔐 GUÍA DE REGENERACIÓN DE CREDENCIALES - CRÍTICO

## ⚠️ IMPORTANTE: ESTAS CREDENCIALES ESTÁN COMPROMETIDAS

Las siguientes credenciales han sido expuestas en el repositorio y **DEBEN** ser regeneradas inmediatamente:

### 🚨 CREDENCIALES COMPROMETIDAS:

1. **Supabase URL**: `https://lazazrhysqbkgmfqdlug.supabase.co`
2. **Supabase Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. **Gemini API Key**: `AIzaSyDz-WYNCd0y1Zycydm1fW9DbL66StkIx38`

---

## 🔧 PASOS DE REGENERACIÓN INMEDIATA

### 1. SUPABASE (URGENTE)

#### A. Acceder al Dashboard
1. Ir a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto `lazazrhysqbkgmfqdlug`

#### B. Regenerar Service Role Key
1. **Settings** → **API**
2. En **Project API Keys** → **service_role key**
3. Hacer click en **Regenerate key**
4. **COPIAR LA NUEVA KEY INMEDIATAMENTE**

#### C. Regenerar Anon Key (opcional pero recomendado)
1. **Settings** → **API**
2. En **Project API Keys** → **anon public key**
3. Hacer click en **Regenerate key**
4. **COPIAR LA NUEVA KEY**

### 2. GOOGLE GEMINI API (URGENTE)

#### A. Deshabilitar API Key Actual
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services** → **Credentials**
3. Buscar la key `AIzaSyDz-WYNCd0y1Zycydm1fW9DbL66StkIx38`
4. **DELETE** o **RESTRICT** inmediatamente

#### B. Crear Nueva API Key
1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **API Key**
3. Configurar restricciones:
   - **Application restrictions**: HTTP referrers
   - **API restrictions**: Generative Language API
4. **COPIAR LA NUEVA KEY**

### 3. CLOUDFLARE TUNNEL (si es necesario)

Si el tunnel ID `2558a4f2-2a36-4d77-97ac-fed235a38b21` fue expuesto públicamente:

1. **Regenerar tunnel**:
   ```bash
   cloudflared tunnel delete vikdev-api
   cloudflared tunnel create vikdev-api-new
   ```

2. **Actualizar configuración**:
   - Nuevo tunnel ID en `config.yml`
   - Nuevas credenciales JSON

---

## 🔒 CONFIGURACIÓN SEGURA POST-REGENERACIÓN

### 1. Variables de Entorno Seguras

#### Backend (.env)
```bash
# NO SUBIR A GIT - AGREGAR A .gitignore
SUPABASE_URL=https://lazazrhysqbkgmfqdlug.supabase.co
SUPABASE_KEY=[NUEVA_SERVICE_ROLE_KEY]
GEMINI_API_KEY=[NUEVA_GEMINI_KEY]
ENCRYPTION_KEY=[CLAVE_SEGURA_DE_32_CARACTERES]
NODE_ENV=production
```

#### Frontend (.env)
```bash
# NO SUBIR A GIT
VITE_SUPABASE_URL=https://lazazrhysqbkgmfqdlug.supabase.co
VITE_SUPABASE_KEY=[NUEVA_ANON_KEY]
VITE_BACKEND_URL=https://api.vikdev.dev
```

### 2. Configuración de Deployment

#### Vercel/Netlify
```bash
# Environment Variables (NO en código)
SUPABASE_URL=https://lazazrhysqbkgmfqdlug.supabase.co
SUPABASE_KEY=[NUEVA_SERVICE_ROLE_KEY]
GEMINI_API_KEY=[NUEVA_GEMINI_KEY]
ENCRYPTION_KEY=[CLAVE_SEGURA]
```

#### Docker
```dockerfile
# docker-compose.yml - usar secrets
secrets:
  supabase_key:
    external: true
  gemini_key:
    external: true
```

### 3. Seguridad del Repositorio

#### .gitignore (VERIFICAR)
```bash
# Environment files
.env
.env.local
.env.production
.env.staging

# Credentials
**/credentials.json
**/*.pem
**/config.yml

# Logs
logs/
*.log
```

#### Limpiar Historial de Git
```bash
# Si las credenciales están en commits anteriores
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch backend/.env' \
--prune-empty --tag-name-filter cat -- --all

# Forzar push
git push origin --force --all
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Pre-Deploy
- [ ] ✅ Nuevas credenciales de Supabase generadas
- [ ] ✅ Nueva API key de Gemini creada
- [ ] ✅ Variables de entorno actualizadas localmente
- [ ] ✅ Variables de entorno configuradas en deployment
- [ ] ✅ .env agregado a .gitignore
- [ ] ✅ Historial de git limpiado (si es necesario)
- [ ] ✅ Tests de conexión ejecutados

### Post-Deploy
- [ ] Frontend conecta correctamente
- [ ] Backend autentica usuarios
- [ ] API de Gemini funciona
- [ ] Tunnel de Cloudflare operativo
- [ ] Logs no muestran credenciales

### Monitoreo Continuo
- [ ] Configurar alertas de Supabase
- [ ] Monitorear uso de API Gemini
- [ ] Revisar logs de seguridad
- [ ] Audit periódico de accesos

---

## 🆘 EN CASO DE EMERGENCIA

### Si el sistema está comprometido:

1. **DESHABILITAR TODO INMEDIATAMENTE**:
   - Revocar todas las API keys
   - Deshabilitar acceso a Supabase
   - Parar el tunnel de Cloudflare

2. **INVESTIGAR**:
   - Revisar logs de acceso
   - Verificar actividad sospechosa
   - Confirmar scope del compromiso

3. **RECUPERAR**:
   - Crear nuevas credenciales
   - Cambiar todas las contraseñas
   - Redeploy completo del sistema

---

## 📞 CONTACTOS DE EMERGENCIA

- **Google Cloud Support**: [https://cloud.google.com/support](https://cloud.google.com/support)
- **Supabase Support**: [https://supabase.com/support](https://supabase.com/support)
- **Cloudflare Support**: [https://support.cloudflare.com](https://support.cloudflare.com)

---

**⚠️ RECORDATORIO: NO subir este archivo al repositorio público. Mantenerlo local hasta que las credenciales sean regeneradas.**