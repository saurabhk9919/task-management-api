const { z } = require('zod');
const { TaskStatus } = require('@prisma/client');

const TITLE_MAX_LENGTH = 200;
const DESCRIPTION_MAX_LENGTH = 1000;
// Largest value a PostgreSQL INTEGER (SERIAL) column can hold.
const MAX_TASK_ID = 2147483647;

// Allowed values come from the Prisma enum, so the schema stays the single source of truth.
const STATUS_VALUES = Object.values(TaskStatus);

const title = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'Title is required.' : 'Title must be a string.',
  })
  .trim()
  .min(1, 'Title cannot be empty or contain only whitespace.')
  .max(TITLE_MAX_LENGTH, `Title must be at most ${TITLE_MAX_LENGTH} characters.`);

// Optional; null clears an existing description.
const description = z
  .string({ error: 'Description must be a string or null.' })
  .trim()
  .max(DESCRIPTION_MAX_LENGTH, `Description must be at most ${DESCRIPTION_MAX_LENGTH} characters.`)
  .nullable()
  .optional();

const status = z
  .enum(STATUS_VALUES, { error: `Status must be one of: ${STATUS_VALUES.join(', ')}.` })
  .optional();

// strictObject rejects unknown fields such as id or created_at.
const createTaskSchema = z.strictObject(
  { title, description, status },
  {
    error: (issue) =>
      issue.code === 'unrecognized_keys'
        ? `Unknown field(s): ${issue.keys.join(', ')}. Allowed fields: title, description, status.`
        : 'Request body must be a JSON object.',
  }
);

// PUT accepts any subset of fields, but at least one must be provided.
const updateTaskSchema = createTaskSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    error: 'Provide at least one field to update: title, description, status.',
  });

const taskIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'Task ID must be a positive integer.')
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(1, 'Task ID must be a positive integer.')
        .max(MAX_TASK_ID, 'Task ID is too large.')
    ),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
};
