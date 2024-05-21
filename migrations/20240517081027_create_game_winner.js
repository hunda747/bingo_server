/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('game_winners', function (table) {
    table.increments('id').primary();
    table.integer('gameId').unsigned().notNullable();
    table.foreign('gameId').references('games.id');
    table.integer('number').notNullable();
    table.integer('ticketId').unsigned().notNullable();
    table.foreign('ticketId').references('tickets.id');
    table.timestamp('redeemTime').defaultTo(knex.fn.now());

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};
