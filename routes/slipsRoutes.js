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
