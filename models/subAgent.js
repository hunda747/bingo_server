// models/Shop.js
const { Model } = require('objection');

class Subagents extends Model {
  static get tableName() {
    return 'sub_agents';
  }

  static get relationMappings() {
    const ShopOwner = require('./ShopOwner');
    return {
      owner: {
        modelClass: ShopOwner,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'sub_agents.shopOwnerId',
          to: 'shop_owners.id',
        },
      },
      sub_agent_shops: {
        relation: Model.HasManyRelation,
        modelClass: require('./subAgentShop'),
        join: {
          from: 'sub_agents.id',
          to: 'sub_agent_shops.subAgentId',
        },
        on: [
          { 'sub_agent_shops.subAgentId': 'sub_agents.id' },
          { 'sub_agent_shops.shopId': 'shops.id' },
        ],
      },
    };
  }
}

module.exports = Subagents;
