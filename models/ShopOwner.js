// models/ShopOwner.js
const { Model } = require('objection');
const Shop = require('./shop');

class ShopOwner extends Model {
  static get tableName() {
    return 'shop_owners';
  }

  static get relationMappings() {
    return {
      shops: {
        relation: Model.HasManyRelation,
        modelClass: Shop,
        join: {
          from: 'shop_owners.id',
          to: 'shops.shopOwnerId',
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

module.exports = ShopOwner;
