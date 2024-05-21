/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/YYYYMMDDHHMMSS_create_shops.js
exports.up = function (knex) {
  return knex.schema.createTable('shops', (table) => {
    table.increments('id').primary();
    table.integer('shopOwnerId').unsigned().notNullable();
    table.foreign('shopOwnerId').references('shop_owners.id').onDelete('CASCADE');
    table.string('username').unique().notNullable();
    table.string('password');
    table.string('location');
    table.integer('rtp').defaultTo(30);
    table.integer('stake').defaultTo(20);
    table.enu('gameType', ['default']).defaultTo('default');
    table.enu('status', ['active', 'inactive', 'pending']).defaultTo('active');
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('shops');
};

