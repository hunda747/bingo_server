/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/YYYYMMDDHHMMSS_create_cashiers.js
exports.up = function (knex) {
  return knex.schema.createTable('cashiers', (table) => {
    table.increments('id').primary();
    table.integer('shopId').unsigned().notNullable();
    table.foreign('shopId').references('shops.id');
    table.string('name').notNullable();
    table.integer('cashierLimit');
    table.integer('netWinning');
    table.boolean('firstLogin').defaultTo(true);
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    table.boolean('status').defaultTo(true);

    table.timestamps(true, true);
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
*/
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('cashiers');
};
