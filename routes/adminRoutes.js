// routes/shopOwners.js
const express = require('express');
const adminController = require('../controllers/AdminController');
const { authenticateToken } = require('../middleware/authHandler');

const router = express.Router();

router.get('/', adminController.getAll);
router.get('/:id', adminController.getById);
router.post('/', adminController.create);
router.post('/login', adminController.login);
router.post('/changePassword/:id', adminController.changePassword);
router.post('/refresh', adminController.refreshToken);
router.put('/:id', adminController.update);
router.delete('/:id', adminController.delete);

module.exports = router;
