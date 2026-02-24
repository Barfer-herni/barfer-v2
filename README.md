# Barfer Admin Panel v2

## Requisitos

- Node.js 18+
- PostgreSQL
- MongoDB

## Setup

1. Instalar dependencias:

```bash
npm install
```

2. Copiar el archivo de variables de entorno y completar los valores:

```bash
cp .env.example .env
```

3. Correr en modo desarrollo:

```bash
npm run dev
```

Abre http://localhost:4000

## Variables de entorno

### Obligatorias (la app no corre sin estas)

| Variable | Descripcion |
|---|---|
| `JWT_SECRET` | Secreto para firmar tokens JWT |
| `DATABASE_URL` | Connection string de PostgreSQL (ej: `postgresql://user:pass@localhost:5432/barfer`) |
| `MONGODB_URL` | Connection string de MongoDB (ej: `mongodb://localhost:27017/barfer`) |

### Opcionales (funcionalidades extra)

| Variable | Servicio |
|---|---|
| `RESEND_TOKEN` / `RESEND_FROM` | Envio de emails (Resend) |
| `ARCJET_KEY` | Proteccion DDoS/bots (Arcjet) |
| `LIVEBLOCKS_SECRET` | Colaboracion en tiempo real |
| `KNOCK_API_KEY` / `KNOCK_SECRET_API_KEY` | Notificaciones in-app (Knock) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `NEXT_PUBLIC_POSTHOG_HOST` | Analytics (PostHog) |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics |
| `BETTERSTACK_API_KEY` / `BETTERSTACK_URL` | Monitoreo (BetterStack) |
| `SVIX_TOKEN` | Webhooks (Svix) |
| `FLAGS_SECRET` | Feature flags |

## Comandos

| Comando | Descripcion |
|---|---|
| `npm run dev` | Servidor de desarrollo (puerto 4000) |
| `npm run build` | Build de produccion |
| `npm start` | Servidor de produccion (puerto 3000) |
| `npm run lint` | Linter |
| `npm run typecheck` | Chequeo de tipos |
| `npm test` | Tests |
