// models/Slip.js

const { Model } = require('objection');
const Game = require('./game');
const Shop = require('./shop');
const ShopOwner = require('./ShopOwner');
const Cashier = require('./cashier');

class Daily_reports extends Model {
  static get tableName() {
    return 'daily_reports';
  }

  static get relationMappings() {
    return {
      shopOwner: {
        relation: Model.BelongsToOneRelation,
        modelClass: ShopOwner,
        filter: query => query.select('id', 'name'),
        join: {
          from: 'daily_reports.shopOwnerId',
          to: 'shop_owners.id',
        }
      },
      shop: {
        relation: Model.BelongsToOneRelation,
        filter: query => query.select('id', 'username'),
        modelClass: Shop,
        join: {
          from: 'daily_reports.shopId',
          to: 'shops.id',
        }
      }
    }
  }
}
module.exports = Daily_reports;