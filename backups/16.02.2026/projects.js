const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');

router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

router.get('/:projectId/tasks', taskController.getTasksByProject);
router.post('/:projectId/tasks', taskController.createTask);

module.exports = router;