### Muy buenas

```
git clone -b master https://github.com/Doddieko67/web-unamsitou
```
```
cd frontend
npm install
npm run dev
```

```
cd backend
npm install
node --watch src/index.js
```
## Crea un .env en frontend y backend por separados para el funcionamiento de supabase y gemini

reacti
  |- frontend /
    |- .env /
  |- backend /
    |- .env /

# Frontend
```
VITE_SUPABASE_URL=https://lazazrhysqbkgmfqdlug.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhemF6cmh5c3Fia2dtZnFkbHVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTcxMjAsImV4cCI6MjA1OTYzMzEyMH0.vMMn48ulGvMo0RYto44I1dPhUWVZRJ3uH3YpGcjhyys
```

# Backend
```
GEMINI_API_KEY=AIzaSyDz-WYNCd0y1Zycydm1fW9DbL66StkIx38
SUPABASE_URL=https://lazazrhysqbkgmfqdlug.supabase.co
PORT=3000
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhemF6cmh5c3Fia2dtZnFkbHVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDA1NzEyMCwiZXhwIjoyMDU5NjMzMTIwfQ.JUdtsfeXQsqnFnz4D6YEXYQSC8hy4xCdfrmUoqvIu2U
```
