/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('tickets', function (table) {
    table.increments('id').primary();
    table.integer('gameId').unsigned();
    table.foreign('gameId').references('games.id').onDelete('CASCADE');
    table.decimal('netWinning', 10, 2);
    table.integer('pickedNumber', 10, 2);
    table.integer('shopId').unsigned();
    table.foreign('shopId').references('shops.id').onDelete('CASCADE');
    table.integer('shopOwnerId').unsigned();
    table.foreign('shopOwnerId').references('shop_owners.id').onDelete('CASCADE');
    table.enu('status', ['active', 'redeem', 'redeemed', 'canceled', 'blocked']).defaultTo('active');

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('tickets');
};
