/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
// migrations/YYYYMMDDHHMMSS_create_admins.js
exports.up = function (knex) {
  return knex.schema.createTable('admins', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('username').unique().notNullable();
    table.string('password').notNullable();
    // Add other fields as needed
    // ...

    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('admins');
};