// subAgentShopRoutes.js
const express = require('express');
const router = express.Router();
const subAgentShopController = require('../controllers/SubAgentShopController');

// Routes for sub_agent_shops
router.post('/', subAgentShopController.createSubAgentShop);
router.get('/', subAgentShopController.getAllSubAgentShops);
router.get('/:id', subAgentShopController.getSubAgentShopById);
router.get('/getShop/:subAgentId', subAgentShopController.getShopsBySubAgentId);
router.put('/:id', subAgentShopController.updateSubAgentShopById);
router.delete('/:id', subAgentShopController.deleteSubAgentShopById);

module.exports = router;
