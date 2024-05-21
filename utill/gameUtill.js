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