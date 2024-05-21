// models/Shop.js
const { Model } = require('objection');

class GameWinner extends Model {
  static get tableName() {
    return 'game_winners';
  }

  static get relationMappings() {
    const Tickets = require('./tickets');
    const Game = require('./game');
    return {
      game: {
        modelClass: Game,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'game_winners.gameId',
          to: 'games.id',
        },
      },
      ticket: {
        modelClass: Tickets,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'game_winners.ticketId',
          to: 'tickets.id',
        },
      },
    };
  }
}

module.exports = GameWinner;
