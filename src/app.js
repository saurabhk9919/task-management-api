const express = require('express');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(express.json());

app.use('/api/tasks', taskRoutes);

// Must be registered after all routes.
app.use(notFound);
app.use(errorHandler);

module.exports = app;
