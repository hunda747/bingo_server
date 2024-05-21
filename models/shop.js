// models/Shop.js
const { Model } = require('objection');

class Shop extends Model {
  static get tableName() {
    return 'shops';
  }

  static get relationMappings() {
    const Cashier = require('./cashier');
    const ShopOwner = require('./ShopOwner');
    const Slip = require('./tickets');
    return {
      owner: {
        modelClass: ShopOwner,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'shops.shopOwnerId',
          to: 'shop_owners.id',
        },
      },
      tickets: {
        relation: Model.HasManyRelation,
        modelClass: Slip,
        join: {
          from: 'shops.id',
          to: 'tickets.shopId',
        },
      },
    };
  }
}

module.exports = Shop;
