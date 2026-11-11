# Task Management API

A JavaScript and CommonJS starter for a task management REST API using Express, PostgreSQL, and Prisma.

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

The database URL in `.env.example` is a placeholder. This starter does not connect to a database.

## Run

```powershell
npm run dev
```

For a non-watching start, run `npm start`.

## Prisma

The PostgreSQL schema and Prisma CLI configuration are initialized. No data models or migrations are included yet.

```powershell
npm run prisma:validate
npm run prisma:generate
```

## Source layout

- `src/app.js` configures the Express application.
- `src/server.js` loads environment variables and starts the HTTP server.
- `src/config/` holds application configuration.
- `src/controllers/` holds request handlers.
- `src/routes/` holds route definitions.
- `src/middleware/` holds Express middleware.
- `src/validators/` holds request validation logic.
- `prisma/` holds the Prisma schema and future migrations.