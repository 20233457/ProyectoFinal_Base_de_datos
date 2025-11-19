# Proyecto Final - Sistema de Mensajería tipo Telegram/Discord (FIXED)

Este proyecto contiene:

- `backend/`: API REST + Socket.io + MongoDB + subida de archivos (100MB)
- `frontend/`: React + TypeScript + Vite con interfaz tipo Telegram/Discord

Incluye correcciones:

- Mensajes ya no se duplican.
- Tus mensajes aparecen a la **izquierda**, los de otros a la **derecha**.
- El estado **"escribiendo..."** muestra el **nombre de usuario**, no el ID.
- La carpeta `uploads` se crea automáticamente y evita errores `ENOENT`.

## Backend

```bash
cd backend
npm install
cp .env.example .env
# Edita .env con tu MONGO_URI, JWT_SECRET y CLIENT_URL
npm run dev
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Ajusta VITE_API_URL si es necesario
npm run dev
```

Abre `http://localhost:5173`.
