const { Prisma } = require('@prisma/client');


function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
}

// Friendly messages for client errors raised by express.json() (body-parser).
const BODY_PARSER_MESSAGES = {
  'entity.parse.failed': 'Request body contains invalid JSON.',
  'entity.too.large': 'Request body is too large.',
  'charset.unsupported': 'Unsupported request body charset. Use UTF-8.',
  'encoding.unsupported': 'Unsupported Content-Encoding for the request body.',
};

function errorHandler(err, req, res, next) {
  // If a response is already being sent, let Express close the connection.
  if (res.headersSent) return next(err);

  // Client errors (4xx) from Express / body-parser, e.g. 400 invalid JSON,
  // 413 body too large, 415 unsupported charset or encoding.
  const status = err.status || err.statusCode;
  if (Number.isInteger(status) && status >= 400 && status < 500) {
    const message =
      BODY_PARSER_MESSAGES[err.type] || (err.expose ? err.message : 'Bad request.');
    return res.status(status).json({ success: false, message });
  }

  // Prisma rejected the data shape. Request validation normally catches this first.
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({ success: false, message: 'Invalid request data.' });
  }

  // Record not found (fallback; controllers handle this case directly).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ success: false, message: 'Resource not found.' });
  }

  // Anything else is unexpected: log the details, return a generic message.
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
}

module.exports = { notFound, errorHandler };
