// models/Slip.js

const { Model } = require('objection');
const Game = require('./game');
const Shop = require('./shop');

class Ticket extends Model {
  static get tableName() {
    return 'tickets';
  }

  static get relationMappings() {
    return {
      game: {
        relation: Model.BelongsToOneRelation,
        modelClass: Game,
        join: {
          from: 'tickets.gameId',
          to: 'games.id',
        },
      },
      shop: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shop,
        filter: query => query.select('id', 'username'),
        join: {
          from: 'tickets.shopId',
          to: 'shops.id',
        }
      }
    }
  }
}
module.exports = Ticket;
