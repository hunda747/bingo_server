/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/YYYYMMDDHHMMSS_create_shop_owners.js
exports.up = function (knex) {
  return knex.schema.createTable('shop_owners', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('share');
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.enu('status', ['active', 'inactive', 'pending']).defaultTo('active');

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('shop_owners');
};

