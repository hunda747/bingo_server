// routes/cashiers.js
const express = require('express');
const cashierController = require('../controllers/CashierController');

const router = express.Router();

router.get('/', cashierController.getAll);
router.get('/getByShopowner/:id', cashierController.getByShopowner);
router.get('/:id', cashierController.getById);
router.post('/', cashierController.create);
router.post('/addCashier', cashierController.addCashier);
router.post('/extendCashierLimit', cashierController.extendCashierLimit);
router.put('/:id', cashierController.update);
router.delete('/:id', cashierController.delete);
router.post('/login', cashierController.login);
router.post('/changePassword/:id', cashierController.changePassword);
router.post('/changeOwnPassword/:id', cashierController.changeOwnPassword);
router.post('/refresh', cashierController.refreshToken);
router.post('/resetCashierLimit', cashierController.resetCashierLimit);

module.exports = router;
