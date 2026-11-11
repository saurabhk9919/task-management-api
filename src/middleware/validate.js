// Validates parts of the request against Zod schemas before the controller runs.
// Usage: validate({ params: taskIdParamsSchema, body: createTaskSchema })
// On success, req.body is replaced with the parsed (trimmed, unknown-field-free) data
// and parsed params are available on req.validatedParams.
function validate(schemas) {
  return (req, res, next) => {
    const errors = [];
    const parsed = {};

    for (const [source, schema] of Object.entries(schemas)) {
      // A request without a JSON body leaves req.body undefined; treat it as empty.
      const result = schema.safeParse(req[source] ?? {});

      if (result.success) {
        parsed[source] = result.data;
        continue;
      }

      for (const issue of result.error.issues) {
        const field = issue.keys
          ? issue.keys.join(', ') // unrecognized keys
          : issue.path.join('.') || source;
        errors.push({ location: source, field, message: issue.message });
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    if (parsed.body) req.body = parsed.body;
    if (parsed.params) req.validatedParams = parsed.params;
    next();
  };
}

module.exports = validate;
