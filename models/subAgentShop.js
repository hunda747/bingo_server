// models/Shop.js
const { Model } = require('objection');

class Subagents extends Model {
  static get tableName() {
    return 'sub_agent_shops';
  }
  
  static get relationMappings() {
    const Subagent = require('./subAgent');
    return {
      subAgent: {
        modelClass: Subagent,
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'sub_agent_shops.subAgentId',
          to: 'sub_agents.id',
        },
      },
      shop: {
        modelClass: require('./shop'),
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'sub_agent_shops.shopId',
          to: 'shops.id',
        },
      },
    };
  }
}

module.exports = Subagents;
