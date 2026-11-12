# Task Management API

A REST API for managing tasks, built with **Express 5**, **PostgreSQL** and **Prisma 7** in plain JavaScript (CommonJS). It supports creating, listing, fetching, updating and deleting tasks, and uses **Zod** to validate every request before it reaches the database.

## Tech stack

| Purpose | Tool |
|---|---|
| Web framework | Express 5 |
| Database | PostgreSQL |
| ORM and migrations | Prisma 7 (with the `@prisma/adapter-pg` driver adapter) |
| Request validation | Zod 4 |
| Environment variables | dotenv |
| Development auto-restart | nodemon |

## Prerequisites

- **Node.js 20.19+, 22.12+ or 24+** (required by Prisma 7)
- **PostgreSQL** running locally. Version 17 was used during development.

## Setup

The commands below are for PowerShell on Windows. On macOS or Linux, use `cp` instead of `Copy-Item`.

### 1. Install dependencies

```powershell
npm install
```

This also runs `prisma generate`, which builds the Prisma client.

### 2. Create the database

Create an empty PostgreSQL database named `task_management_db`. You can use pgAdmin (right-click **Databases → Create → Database**) or `psql`:

```powershell
psql -U postgres -h localhost -c "CREATE DATABASE task_management_db;"
```

If `psql` is not on your PATH, call it by its full path, for example `& "C:\Program Files\PostgreSQL\17\bin\psql.exe"`.

### 3. Configure environment variables

```powershell
Copy-Item .env.example .env
```

Then edit `.env`:

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/task_management_db?schema=public
```

Replace `USER` and `PASSWORD` with your PostgreSQL credentials. If the password contains special characters, URL-encode them (`@` → `%40`, `#` → `%23`, `/` → `%2F`, `:` → `%3A`).

`.env` is git-ignored. Never commit it.

### 4. Apply the database migration

```powershell
npx prisma migrate deploy
```

This creates the `tasks` table and the `TaskStatus` enum from `prisma/migrations/`.

### 5. Verify the database connection

```powershell
npm run db:check
```

On success it prints `Connected to PostgreSQL database "task_management_db".`

## Running the server

```powershell
npm run dev    # development, restarts on file changes
npm start      # without auto-restart
```

The server listens on `http://localhost:5000` by default. To use another port, change `PORT` in `.env`.

## Task model

| Field | Type | Notes |
|---|---|---|
| `id` | Integer | Primary key, auto-incremented |
| `title` | String | Required |
| `description` | String | Optional (can be `null`) |
| `status` | Enum | `PENDING`, `IN_PROGRESS` or `COMPLETED`. Defaults to `PENDING` |
| `created_at` | DateTime | Set automatically when the task is created |

The schema is defined in [prisma/schema.prisma](prisma/schema.prisma).

## API endpoints

Base URL: `http://localhost:5000/api/tasks`

| Method | Endpoint | Description | Success status |
|---|---|---|---|
| `POST` | `/api/tasks` | Create a task | `201 Created` |
| `GET` | `/api/tasks` | Get all tasks, ordered by ID | `200 OK` |
| `GET` | `/api/tasks/:id` | Get a task by ID | `200 OK` |
| `PUT` | `/api/tasks/:id` | Update a task | `200 OK` |
| `DELETE` | `/api/tasks/:id` | Delete a task | `200 OK` |

Send request bodies as JSON with the header `Content-Type: application/json`.

### Create a task

`POST /api/tasks`

```json
{
  "title": "Complete backend assignment",
  "description": "Build a Task Management REST API",
  "status": "PENDING"
}
```

Response `201 Created`:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Complete backend assignment",
    "description": "Build a Task Management REST API",
    "status": "PENDING",
    "created_at": "2026-11-11T14:30:00.000Z"
  }
}
```

### Get all tasks

`GET /api/tasks`

Response `200 OK`:

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "title": "Complete backend assignment",
      "description": "Build a Task Management REST API",
      "status": "PENDING",
      "created_at": "2026-11-11T14:30:00.000Z"
    }
  ]
}
```

### Get a task by ID

`GET /api/tasks/1`

Response `200 OK`: `{ "success": true, "data": { ...task } }`

### Update a task

`PUT /api/tasks/1`

`PUT` updates only the fields you send. Fields you leave out keep their current values. At least one field is required.

```json
{
  "status": "IN_PROGRESS"
}
```

Response `200 OK`: `{ "success": true, "data": { ...updated task } }`

### Delete a task

`DELETE /api/tasks/1`

Response `200 OK`:

```json
{
  "success": true,
  "message": "Task deleted successfully.",
  "data": { "...": "the deleted task" }
}
```

## Validation rules

Every request is validated with Zod before it reaches the controller or the database.

| Field | Rules |
|---|---|
| `title` | Required when creating. Must be a string. Leading and trailing spaces are trimmed. Cannot be empty or whitespace-only. At most 200 characters |
| `description` | Optional. A string or `null` (`null` clears it on update). Trimmed. At most 1000 characters |
| `status` | Optional. Exactly `PENDING`, `IN_PROGRESS` or `COMPLETED` (uppercase) |
| `:id` (URL) | A positive integer, up to 2147483647 |

- Unknown fields such as `id` or `created_at` are rejected. Only `title`, `description` and `status` can be set.
- `PUT` requests must include at least one of `title`, `description` or `status`.

## Error responses

All errors return JSON with `"success": false`.

Validation errors (`400 Bad Request`) list every problem in the request:

```json
{
  "success": false,
  "message": "Validation failed.",
  "errors": [
    { "location": "body", "field": "title", "message": "Title cannot be empty or contain only whitespace." },
    { "location": "body", "field": "status", "message": "Status must be one of: PENDING, IN_PROGRESS, COMPLETED." }
  ]
}
```

`location` is `body` for request-body fields or `params` for the URL `:id`.

| Situation | Status | Example `message` |
|---|---|---|
| Invalid body or ID | `400` | `Validation failed.` (details in `errors`) |
| Malformed JSON | `400` | `Request body contains invalid JSON.` |
| Request body larger than 100 KB | `413` | `Request body is too large.` |
| Unsupported body charset or Content-Encoding | `415` | `Unsupported request body charset. Use UTF-8.` |
| Task does not exist | `404` | `Task with ID 999 not found.` |
| Unknown route | `404` | `Route GET /api/unknown not found.` |
| Database or server failure | `500` | `Internal server error.` (details are logged on the server only) |

## Testing

All endpoints were tested manually with Postman. To test them yourself:

1. Start the server with `npm run dev`.
2. Send the requests from [API endpoints](#api-endpoints) to `http://localhost:5000/api/tasks`.
3. For `POST` and `PUT`, choose **Body → raw → JSON** in Postman.
4. To check validation, send invalid bodies, for example `{"title": "   "}`, `{"title": "A", "status": "DONE"}`, `{"title": "A", "id": 5}` or `{}`, and invalid IDs such as `/api/tasks/abc` or `/api/tasks/0`.

## npm scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the server with nodemon |
| `npm start` | Start the server with Node |
| `npm run db:check` | Check the database connection |
| `npm run prisma:validate` | Validate the Prisma schema |
| `npm run prisma:generate` | Regenerate the Prisma client |

## Project structure

```text
task-management-api/
├── prisma/
│   ├── migrations/            # SQL migrations (applied with prisma migrate deploy)
│   └── schema.prisma          # Task model and TaskStatus enum
├── scripts/
│   └── check-db.js            # Database connection check (npm run db:check)
├── src/
│   ├── config/
│   │   └── prisma.js          # Shared Prisma client using the PostgreSQL adapter
│   ├── controllers/
│   │   └── taskController.js  # Database operations for each endpoint
│   ├── middleware/
│   │   ├── errorHandler.js    # 404 handler and central error handler
│   │   └── validate.js        # Runs Zod schemas against requests
│   ├── routes/
│   │   └── taskRoutes.js      # Maps endpoints to validation and controllers
│   ├── validators/
│   │   └── taskValidator.js   # Zod schemas for task bodies and IDs
│   ├── app.js                 # Express app: JSON parsing, routes, error handling
│   └── server.js              # Loads .env and starts the HTTP server
├── .env.example               # Template for environment variables
├── prisma.config.cjs          # Prisma CLI configuration (reads DATABASE_URL)
└── package.json
```

## Implementation notes

- **Prisma 7 with CommonJS:** the `prisma-client-js` generator is used because it produces a CommonJS client that `require()` can load. The newer `prisma-client` generator only produces ESM TypeScript.
- **Driver adapter:** Prisma 7 connects to PostgreSQL through `@prisma/adapter-pg`, configured in `src/config/prisma.js`.
- **Changing the schema:** edit `prisma/schema.prisma`, then run `npx prisma migrate dev --name <change_name>` followed by `npm run prisma:generate`.
