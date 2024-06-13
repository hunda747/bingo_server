// routes/index.js

const express = require('express');
const gameController = require('../controllers/GameController');
const { Mutex } = require('async-mutex');
const gameMutex = new Mutex();
const router = express.Router();


// Games Routes
router.get('/', gameController.getAllGames);
router.get('/searchGame', gameController.searchGame);
router.get('/getCartelas', gameController.getCartelas);
router.get('/:gameId', gameController.getGameById);
router.post('/', gameController.createGame);
// router.get('/getSpinRecentResult', gameController.getSpinRecentResult);
router.get('/drawNumberForGame/:gameId', gameController.drawNumberForGame);
router.get('/activateGame/:gameId', gameController.activateGame);
router.get('/closeGame/:gameId', gameController.closeGame);
router.get('/getCurrentGame/:shopId', gameController.getCurrentGame);
router.get('/getPreviousResult/:gameNumber/:shop', gameController.getGameRusult);
// router.post('/calculate/:gameNumber', gameController.calculateWiningNumbers);
router.put('/:id', gameController.updateGame);
router.delete('/:id', gameController.deleteGame);

module.exports = router;
