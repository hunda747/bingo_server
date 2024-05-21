// models/ShopOwner.js
const { Model } = require('objection');

class AdminOwner extends Model {
  static get tableName() {
    return 'admins';
  }

  // Exclude password field from JSON representation
  $formatJson(json) {
    json = super.$formatJson(json);
    delete json.password;
    return json;
  }
}

module.exports = AdminOwner;
