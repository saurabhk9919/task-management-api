const express = require('express');
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  taskIdParamsSchema,
} = require('../validators/taskValidator');

const router = express.Router();

router
  .route('/')
  .post(validate({ body: createTaskSchema }), createTask)
  .get(getAllTasks);

router
  .route('/:id')
  .get(validate({ params: taskIdParamsSchema }), getTaskById)
  .put(validate({ params: taskIdParamsSchema, body: updateTaskSchema }), updateTask)
  .delete(validate({ params: taskIdParamsSchema }), deleteTask);

module.exports = router;
