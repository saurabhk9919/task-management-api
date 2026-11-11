const { Prisma } = require('@prisma/client');


function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}


function errorHandler(err, req, res, next) {
  // Malformed JSON in the request body.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Request body contains invalid JSON.' });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message:
        'Invalid task data. "title" is required; "title" and "description" must be strings; ' +
        '"status" must be one of PENDING, IN_PROGRESS, COMPLETED.',
    });
  }

  // Record not found (fallback; controllers handle this case directly).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }

  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
