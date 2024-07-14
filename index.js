// index.js

const express = require('express');
const app = express();
const cors = require('cors');

const { Model } = require('./config/dbconfig');
const adminRoutes = require('./routes/adminRoutes');
const shopOwnersRoutes = require('./routes/shopOwnerRoutes');
const shopRoutes = require('./routes/shopRoutes');
const gameRoutes = require('./routes/gameRoutes');
const slipRoutes = require('./routes/slipsRoutes');
const dailyReports = require('./routes/dailyReportRoutes');
const errorHandler = require('./middleware/errorHandlerMiddleware');

var schedule = require('node-schedule');
// Use this
const logger = require('./logger');
const { generateDailyReport, getCurrentDate } = require('./controllers/DailyReportController');

schedule.scheduleJob({ hour: 23, minute: 48, second: 0, tz: 'Africa/Nairobi' }, async function () {
  // schedule.scheduleJob({ hour: 22, minute: 52, second: 0, tz: 'Africa/Nairobi' }, async function () {
  // console.log('The answer to life, the universe, and everything!');
  const todayData = await generateDailyReport(getCurrentDate());
  logger.info(`Today report is generated! ${new Date().toLocaleString()}`);
});

// Middleware to parse JSON requests
app.use(express.json());
// Use cors middleware
app.use(cors({ origin: '*' }));

app.get('/', async (req, res) => {
  res.json('welcome');
});
app.use('/admin', adminRoutes);
app.use('/shop-owners', shopOwnersRoutes);
app.use('/shop', shopRoutes);
app.use('/game', gameRoutes);
app.use('/slip', slipRoutes);
app.use('/dailyReport', dailyReports);

app.use(errorHandler)

// Create HTTPS server
const PORT = process.env.PORT || 8700;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});