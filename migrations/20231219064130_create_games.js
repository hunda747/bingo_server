/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// create_games_table.js

exports.up = function (knex) {
  return knex.schema.createTable('games', function (table) {
    table.increments('id').primary();
    table.integer('shopId').unsigned().notNullable();
    table.foreign('shopId').references('shops.id');
    table.integer('stake', 20).notNullable();
    table.integer('totalStake', 20);
    table.double('net', 20);
    table.integer('gameNumber', 20).notNullable();
    table.string('gameType', 20);
    table.string('winner');
    table.timestamp('gameStatingTime');
    table.integer('rtp').notNullable();
    table.string('gameType').notNullable();
    table.enu('status', ['pending', 'playing', 'done', 'error']).defaultTo('pending');

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('games');
};
