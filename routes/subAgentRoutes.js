// subAgentRoutes.js
const express = require('express');
const router = express.Router();
const subAgentController = require('../controllers/SubAgentController');

// Routes for sub-agents
router.post('/', subAgentController.createSubAgent);
router.post('/login', subAgentController.login);
router.post('/changePassword/:id', subAgentController.changePassword);
router.post('/changeOwnPassword', subAgentController.changeOwnPassword);
router.get('/', subAgentController.getAllSubAgents);
router.get('/:id', subAgentController.getSubAgentById);
router.put('/:id', subAgentController.updateSubAgentById);
router.get('/getCashiers/:subAgentId', subAgentController.getCashierssBySubAgentId);
router.delete('/:id', subAgentController.deleteSubAgentById);

module.exports = router;