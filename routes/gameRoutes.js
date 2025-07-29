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
router.get('/cancelGame/:gameId', gameController.cancelGame);
router.get('/closeGame/:gameId', gameController.closeGame);
router.get('/getCurrentGame/:shopId', gameController.getCurrentGame);
router.get('/getPreviousResult/:gameNumber/:shop', gameController.getGameRusult);
// router.post('/calculate/:gameNumber', gameController.calculateWiningNumbers);
router.put('/:id', gameController.updateGame);
router.delete('/:id', gameController.deleteGame);

module.exports = router;



// // routes/gameRoutes.js
// const express = require('express');
// const gameController = require('../controllers/gameController');
// const authHandler = require('../middleware/authHandler');
// const { Mutex } = require('async-mutex');
// const gameMutex = new Mutex();
// const router = express.Router();

// // Games Routes
// router.get('/', authHandler('user'), gameController.getAllGames);
// router.get('/search', authHandler('user'), gameController.searchGame);
// router.get('/cartelas', authHandler('user'), gameController.getCartelas);
// router.get('/:gameId', authHandler('user'), gameController.getGameById);
// router.post('/', authHandler('admin'), async (req, res, next) => {
//   const release = await gameMutex.acquire();
//   try {
//     await gameController.createGame(req, res, next);
//   } finally {
//     release();
//   }
// });
// router.get('/draw/:gameId', authHandler('admin'), async (req, res, next) => {
//   const release = await gameMutex.acquire();
//   try {
//     await gameController.drawNumberForGame(req, res, next);
//   } finally {
//     release();
//   }
// });
// router.get('/activate/:gameId', authHandler('admin'), gameController.activateGame);
// router.get('/cancel/:gameId', authHandler('admin'), gameController.cancelGame);
// router.get('/close/:gameId', authHandler('admin'), gameController.closeGame);
// router.get('/current/:shopId', authHandler('user'), gameController.getCurrentGame);
// router.get('/result/:gameNumber/:shop', authHandler('user'), gameController.getGameRusult);
// router.put('/:id', authHandler('admin'), gameController.updateGame);
// router.delete('/:id', authHandler('admin'), gameController.deleteGame);

// module.exports = router;

