// routes/index.js

const express = require('express');
const slipController = require('../controllers/TicketController');

const router = express.Router();

// Slips Routes
router.post('/getSlip', slipController.getAllSlips);
router.post('/checkSlip', slipController.checkSlip);
router.get('/generateDetailCashierReport', slipController.generateDetailCashierReport);
router.get('/getByGameNumber', slipController.getSlipByGamenumber);
router.get('/:id', slipController.getSlipById);
router.get('/getCashierReport/:shopId', slipController.generateCashierReport);
router.get('/recallBetsReport/:cashierId', slipController.recallBetsReport);
router.post('/', slipController.createSlip);
router.put('/cancelslip', slipController.cancelSlip);
router.put('/redeem/:id/:shop/:cashId', slipController.redeemSlip);
router.put('/:id', slipController.updateSlip);
router.delete('/:id', slipController.deleteSlip);

module.exports = router;









// // routes/slipsRoutes.js
// const express = require('express');
// const slipController = require('../controllers/slipController');
// const authHandler = require('../middleware/authHandler');
// const checkBingoCard = require('../game_validator');

// const router = express.Router();

// // Slips Routes
// router.get('/', authHandler('admin'), slipController.getAllSlips);
// router.get('/:id', authHandler('user'), slipController.getSlipById);
// router.get('/search', authHandler('user'), slipController.getSlipByGamenumber);
// router.post('/', authHandler('user'), checkBingoCard, slipController.createSlip);
// router.post('/check', authHandler('user'), slipController.checkSlip);
// router.put('/:id', authHandler('admin'), slipController.updateSlip);
// router.put('/redeem/:id/:shop/:cashId', authHandler('admin'), slipController.redeemSlip);
// router.delete('/cancel', authHandler('admin'), slipController.cancelSlip);
// router.get('/report/:shopId', authHandler('admin'), slipController.generateCashierReport);
// router.get('/detail-report', authHandler('admin'), slipController.generateDetailCashierReport);
// router.get('/bets/:cashierId', authHandler('admin'), slipController.recallBetsReport);
// router.delete('/:id', authHandler('admin'), slipController.deleteSlip);

// module.exports = router;







