// routes/shopOwners.js
const express = require('express');
const shopOwnerController = require('../controllers/ShopOwnerController');
const adminController = require('../controllers/AdminController');

const router = express.Router();

router.get('/', shopOwnerController.getAll);
router.get('/:id', shopOwnerController.getById);
router.post('/', shopOwnerController.create);
router.post('/login', shopOwnerController.login);
router.post('/changePassword/:id', shopOwnerController.changePassword);
router.post('/changeOwnPassword/:id', shopOwnerController.changeOwnPassword);
router.post('/refresh', shopOwnerController.refreshToken);
router.put('/:id', shopOwnerController.update);
router.delete('/:id', shopOwnerController.delete);

module.exports = router;
