const express = require('express');
const router = express.Router();
const contextController = require('../controllers/contextController');

router.get('/', contextController.getContexts);
router.get('/:filename', contextController.getContext);
router.post('/', contextController.createContext);
router.put('/:filename', contextController.updateContext);
router.delete('/:filename', contextController.deleteContext);

module.exports = router;