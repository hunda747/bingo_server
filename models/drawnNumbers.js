// models/Shop.js
const { Model } = require('objection');

class DrawnNumber extends Model {
  static get tableName() {
    return 'drawn_numbers';
  }

}

module.exports = DrawnNumber;
