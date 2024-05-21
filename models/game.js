// models/Game.js

const { Model } = require('objection');

class Game extends Model {
  static get tableName() {
    return 'games';
  }

  static get relationMappings() {
    const DrawnNumber = require('./drawnNumbers');
    const Shop = require('./shop');
    return {
      shop: {
        modelClass: Shop,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'games.shopId',
          to: 'shops.id',
        },
      },
    };
  }
}

module.exports = Game;
