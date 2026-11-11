# Task Management API

A JavaScript and CommonJS starter for a task management REST API using Express, PostgreSQL, and Prisma.

## Setup

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your local PostgreSQL credentials. The database is named `task_management_db`. `npm install` runs `prisma generate` automatically.

## Run

```powershell
npm run dev
```

For a non-watching start, run `npm start`.

## Prisma

Prisma 7 connects to PostgreSQL through the `@prisma/adapter-pg` driver adapter. The `prisma-client-js` generator is used because it produces a CommonJS client that `require()` can load. The newer `prisma-client` generator only produces ESM TypeScript.

- `prisma.config.cjs` gives the Prisma CLI its `DATABASE_URL`.
- `src/config/prisma.js` exports one shared `prisma` client and a `checkDatabaseConnection()` helper.

There are no data models or migrations yet.

```powershell
npm run prisma:validate
npm run prisma:generate
npm run db:check   # verifies the PostgreSQL connection
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