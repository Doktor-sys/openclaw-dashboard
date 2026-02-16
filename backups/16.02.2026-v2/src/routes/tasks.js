const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');

router.get('/project/:projectId', taskController.getTasksByProject);
router.post('/project/:projectId/tasks', taskController.createTaskForProject);
router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/bulk', taskController.bulkUpdate);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

module.exports = router;
