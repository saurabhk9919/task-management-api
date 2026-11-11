const { prisma } = require('../config/prisma');

// Request bodies and IDs are validated by the validate middleware
// (see src/validators/taskValidator.js) before these handlers run.

function taskNotFoundResponse(res, id) {
  return res.status(404).json({
    success: false,
    message: `Task with ID ${id} not found.`,
  });
}

// POST /api/tasks
async function createTask(req, res) {
  const task = await prisma.task.create({ data: req.body });
  res.status(201).json({ success: true, data: task });
}

// GET /api/tasks
async function getAllTasks(req, res) {
  const tasks = await prisma.task.findMany({ orderBy: { id: 'asc' } });
  res.status(200).json({ success: true, count: tasks.length, data: tasks });
}

// GET /api/tasks/:id
async function getTaskById(req, res) {
  const { id } = req.validatedParams;

  const task = await prisma.task.findUnique({ where: { id } });
  if (!task) return taskNotFoundResponse(res, id);

  res.status(200).json({ success: true, data: task });
}

// PUT /api/tasks/:id
async function updateTask(req, res) {
  const { id } = req.validatedParams;

  try {
    const task = await prisma.task.update({ where: { id }, data: req.body });
    res.status(200).json({ success: true, data: task });
  } catch (error) {
    if (error.code === 'P2025') return taskNotFoundResponse(res, id);
    throw error;
  }
}

// DELETE /api/tasks/:id
async function deleteTask(req, res) {
  const { id } = req.validatedParams;

  try {
    const task = await prisma.task.delete({ where: { id } });
    res.status(200).json({ success: true, message: 'Task deleted successfully.', data: task });
  } catch (error) {
    if (error.code === 'P2025') return taskNotFoundResponse(res, id);
    throw error;
  }
}

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
