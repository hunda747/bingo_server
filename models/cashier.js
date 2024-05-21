// models/Cashier.js
const { Model } = require('objection');

class Cashier extends Model {
  static get tableName() {
    return 'cashiers';
  }

  static get relationMappings() {
    const Shop = require('./shop');
    const Slip = require('./tickets');
    return {
      shop: {
        relation: Model.BelongsToOneRelation,
        modelClass: Shop,
        join: {
          from: 'cashiers.shopId',
          to: 'shops.id',
        },
      },
      slips: {
        relation: Model.HasManyRelation,
        modelClass: Slip,
        join: {
          from: 'cashiers.id',
          to: 'slips.cashierId',
        },
      },
    };
  }

  // Exclude password field from JSON representation
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }
}

module.exports = Cashier;
