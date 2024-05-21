
const Knex = require('knex');
const { Model } = require('objection');

const knexConfig = require('./knexfiles');

// Initialize Knex
const knex = Knex(knexConfig);

// Give the Knex instance to Objection
Model.knex(knex);

module.exports = { knex, Model };