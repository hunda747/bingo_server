/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('drawn_numbers', function (table) {
    table.increments('id').primary();
    table.integer('gameId').unsigned().notNullable();
    table.foreign('gameId').references('games.id');
    table.integer('number').notNullable();
    table.timestamp('drawTime').defaultTo(knex.fn.now());

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('drawn_numbers');
};
