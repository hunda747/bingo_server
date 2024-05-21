// User.js

const { Model } = require('objection');

class User extends Model {
  static get tableName() {
    return 'users'; // Replace with your actual table name
  }
}

module.exports = User;
