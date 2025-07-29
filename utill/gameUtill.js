const DrawnNumber = require("../models/drawnNumbers");
const GameWinner = require("../models/gameWinner");
const Slip = require("../models/tickets");


const { cardData } = require('../card/cards');

const getDrawnNumberByGameId = async (gameId) => {
  const drawnNumbers = await DrawnNumber.query()
    .where('gameId', gameId)
    .orderBy('drawTime'); // Optional: Order by drawTime if needed
  return drawnNumbers.map(obj => obj.number)
}

const getSelectedNumberByGameId = async (gameId) => {
  const ticket = await Slip.query().where({ gameId }).andWhereNot({ status: 'canceled' });
  return ticket.map((tic) => tic.pickedNumber);
}

const getWinnerByGameId = async (gameId) => {
  const gameWinner = await GameWinner.query().where({ gameId });
  gameWinner.forEach((gamewin) => {
    gamewin.card = cardData[gamewin?.number - 1];
  })
  return gameWinner;
}

const addAdditionalInfoOnGame = async (game) => {
  game.drawnNumbers = await getDrawnNumberByGameId(game.id);
  game.selectedNumbers = await getSelectedNumberByGameId(game.id);
  game.winner = await getWinnerByGameId(game.id)
}

module.exports = { addAdditionalInfoOnGame }











// const DrawnNumber = require("../models/drawnNumbers");
// const GameWinner = require("../models/gameWinner");
// const Slip = require("../models/tickets");

// const africaCartelas = require('../card/cards');
// const classicCartelas = require('../card/card2');

// exports.getCartelaByType = (cartelaType, cartelaIndex) => {
//   if (!['africa', 'classic'].includes(cartelaType)) {
//     throw new Error(`Invalid cartela type: ${cartelaType}. Must be 'africa' or 'classic'.`);
//   }
//   const cartelas = cartelaType === 'classic' ? classicCartelas : africaCartelas;
//   if (!cartelas[cartelaIndex]) {
//     throw new Error(`Invalid cartela index: ${cartelaIndex} for ${cartelaType} type`);
//   }
//   return cartelas[cartelaIndex];
// };

// exports.validateCartelaNumbers = (cartela, cartelaType) => {
//   const ranges = {
//     B: [1, 15],
//     I: [16, 30],
//     N: [31, 45],
//     G: [46, 60],
//     O: [61, 75]
//   };
//   for (const column of ['B', 'I', 'N', 'G', 'O']) {
//     if (!cartela[column]) {
//       throw new Error(`Missing column ${column} in ${cartelaType} cartela`);
//     }
//     cartela[column].forEach((num, index) => {
//       if (column === 'N' && index === 2 && num === null) return; // Allow null in N[2]
//       if (typeof num !== 'number' || num < ranges[column][0] || num > ranges[column][1]) {
//         throw new Error(`Invalid number ${num} in column ${column} for ${cartelaType} cartela`);
//       }
//     });
//   }
//   return true;
// };

// const getDrawnNumberByGameId = async (gameId) => {
//   const drawnNumbers = await DrawnNumber.query()
//     .where('gameId', gameId)
//     .orderBy('drawTime');
//   return drawnNumbers.map(obj => obj.number);
// };

// const getSelectedNumberByGameId = async (gameId) => {
//   const ticket = await Slip.query().where({ gameId }).andWhereNot({ status: 'canceled' });
//   return ticket.map((tic) => tic.pickedNumber);
// };

// const getWinnerByGameId = async (gameId) => {
//   const gameWinner = await GameWinner.query().where({ gameId });
//   const game = await require('../models/game').findById(gameId);
//   gameWinner.forEach((gamewin) => {
//     const cartelaType = game?.cartela_type || 'africa'; // Fallback to 'africa' if not found
//     gamewin.card = exports.getCartelaByType(cartelaType, gamewin.number - 1);
//   });
//   return gameWinner;
// };

// const addAdditionalInfoOnGame = async (game) => {
//   game.drawnNumbers = await getDrawnNumberByGameId(game.id);
//   game.selectedNumbers = await getSelectedNumberByGameId(game.id);
//   game.winner = await getWinnerByGameId(game.id);
// };

// module.exports = { getCartelaByType, validateCartelaNumbers, addAdditionalInfoOnGame };








