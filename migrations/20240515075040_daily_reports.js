/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('daily_reports', function (table) {
    table.increments('id').primary();
    table.date('reportDate').notNullable();
    table.integer('shopId').unsigned();
    table.foreign('shopId').references('shops.id');
    table.integer('shopOwnerId').unsigned();
    table.foreign('shopOwnerId').references('shop_owners.id');
    table.integer('totalTickets').defaultTo(0);
    table.boolean('active').defaultTo(false);
    table.decimal('totalStake', 10, 2).defaultTo(0);
    table.decimal('totalPayout', 10, 2).defaultTo(0);
    table.decimal('totalPayoutCount').defaultTo(0);
    table.integer('totalRevoked', 10, 2).defaultTo(0);
    table.integer('totalRevokedCount').defaultTo(0);
    table.decimal('totalNetBalance', 10, 2).defaultTo(0);
    table.timestamps(true, true);
  });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {

};
