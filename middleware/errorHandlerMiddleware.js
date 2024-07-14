// middleware/errorHandlerMiddleware.js
const { UniqueViolationError } = require('objection');
const logger = require('../logger');

function errorHandlerMiddleware(err, req, res, next) {
  // console.log('handlingt');
  console.error(err);
  if (err instanceof UniqueViolationError) {
    if (err.constraint === 'shop_owners_username_unique') {
      return res.status(400).json({ error: 'Shop Owner Username already taken. Please choose a different one.' });
    }
    if (err.constraint === 'shops_username_unique') {
      return res.status(400).json({ error: 'Shop Username already taken. Please choose a different one.' });
    }
    if (err.constraint === 'username_unique') {
      return res.status(400).json({ error: 'Username already taken. Please choose a different one.' });
    }
    if (err.constraint === 'name_unique') {
      return res.status(400).json({ error: 'Shop name is already taken. Please choose a different one.' });
    }
    // Add more conditions for other UniqueViolationError constraints if needed
  }

  // Handle other common errors if needed
  logger.error(err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandlerMiddleware;
