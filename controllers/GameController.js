// controllers/gameController.js

const Game = require("../models/game");
const Slip = require("../models/tickets");
const DrawnNumber = require("../models/drawnNumbers");
const knex = require("knex");
const { transaction } = require('objection');

const { Mutex } = require('async-mutex');
const gameMutex = new Mutex();

const { cardData } = require('../card/cards');
// const { generateRandomNumbersKeno } = require("../middleware/kenoResult");
const Shop = require("../models/shop");
const logger = require("../logger");
const { getCurrentDate } = require("./DailyReportController");
const { stringify } = require("uuid");
const GameWinner = require("../models/gameWinner");
const { addAdditionalInfoOnGame } = require("../utill/gameUtill");

const BINGOLOCK = 'bingo_lock'

const GameController = {
  constructor: () => {
    this.generateRandomNumbers = this.generateRandomNumbers.bind(this);
    this.createNewGameEntry = this.createNewGameEntry.bind(this);
  },

  getAllGames: async (req, res, next) => {
    const { date, shopId } = req.query;
    // console.log(date);
    if (!shopId) {
      return res.status(404).json({ error: "Please Provide shop id" })
    }
    try {
      let query = Game.query().where({ "shopId": shopId });

      if (date) {
        const { startOfDay, endOfDay } = getStartAndEndOfDayByDay(0, date);
        query = query.where("created_at", ">=", startOfDay);
        query = query.where("created_at", "<=", endOfDay);
      }
      const games = await query.limit(30).orderBy('gameNumber', 'desc').withGraphFetched("shop");
      await Promise.all(games.map(async (game) => {
        await addAdditionalInfoOnGame(game);
        // Clean parse the gameType
        game.gameType = parseGameType(game.gameType);
      }));

      res.json(games);
    } catch (error) {
      next(error);
    }
  },

  getGameById: async (req, res, next) => {
    const { gameId } = req.params;
    try {
      const game = await Game.query().findById(gameId).withGraphFetched("shop");
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      // Attach the fetched drawnNumbers to the game object
      await addAdditionalInfoOnGame(game);

      // Clean parse the gameType
      game.gameType = parseGameType(game.gameType);
      res.json(game);
    } catch (error) {
      next(error);
    }
  },

  createGame: async (req, res, next) => {
    const { shopId } = req.body;

    try {
      await transaction(Game.knex(), async (trx) => {

        const lastGame = await getLastGamePlayed(shopId);
        let newGameNumber;
        if (!lastGame) {
          newGameNumber = 100;
        } else if (lastGame.status === 'pending' || lastGame.status === 'playing') {
          return res.status(400).json({ error: "Last game didn't finish" });
        } else {
          newGameNumber = (lastGame.gameNumber + 1);
        }
        const shop = await Shop.query().findById(shopId);
        await checkRepeatNumber(trx, shopId, newGameNumber, BINGOLOCK);

        // Store gameType as JSON - simpler approach to avoid double encoding
        let gameTypes = shop.gameType;
        // If input is already a JSON string, parse it first to prevent double encoding
        if (typeof gameTypes === 'string' && (gameTypes.startsWith('[') || gameTypes.startsWith('{'))) {
          try {
            gameTypes = JSON.parse(gameTypes);
          } catch (e) {
            // If parsing fails, leave as is
          }
        }

        // Convert to array if needed
        if (!Array.isArray(gameTypes)) {
          gameTypes = [gameTypes];
        }

        // Convert to JSON string for storage
        const gameTypeJson = JSON.stringify(gameTypes);

        const newGame = await Game.query().insert({
          gameNumber: newGameNumber,
          shopId,
          stake: shop.stake,
          rtp: shop.rtp,
          gameType: gameTypeJson
        });

        // Parse the gameType for the response
        newGame.gameType = parseGameType(newGame.gameType);

        res.send(newGame);
      })
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  activateGame: async (req, res, next) => {
    const { gameId } = req.params;
    try {
      const game = await Game.query().findById(gameId).withGraphFetched("shop");
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      if (!(game.status === "pending")) {
        if (game.status === "playing") {
          return res.status(404).json({ error: "Game has already started" });
        } else if (game.status === "done") {
          return res.status(404).json({ error: "Game has ended" });
        }
        return res.status(404).json({ error: "Game not found" });
      }

      const tickets = await Slip.query().where({ gameId: game.id }).andWhereNot({ status: 'canceled' });
      const totalStake = game.stake * (tickets.length);
      const net = parseInt(totalStake * (game.shop.rtp / 100));
      const updatedGames = await Game.query().findById(gameId).patch({ status: "playing", gameStatingTime: new Date(), totalStake, net }).returning('*');
      const updatedGame = await Game.query().findById(gameId);
      await addAdditionalInfoOnGame(updatedGame);
      res.status(200).json(updatedGame)
    } catch (error) {
      next(error);
    }
  },

  cancelGame: async (req, res, next) => {
    const { gameId } = req.params;
    try {
      const game = await Game.query().findById(gameId).withGraphFetched("shop");
      if (!game) {
        return res.status(404).json({ error: "Game not found!" });
      }
      if (game.status === "pending") {
        return res.status(404).json({ error: "Game hasn't started yet!" });
      }
      if (game.status === "done" || game.status === "canceled") {
        return res.status(404).json({ error: "Game has ended" });
      }

      const updatedGames = await Game.query().findById(gameId).patch({ status: "canceled" }).returning('*');
      const tickets = await Slip.query().where({ gameId: game.id }).patch({ status: 'canceled' });

      res.status(200).json(updatedGames)
    } catch (error) {
      next(error);
    }
  },

  closeGame: async (req, res, next) => {
    const { gameId } = req.params;
    try {
      const game = await Game.query().findById(gameId).withGraphFetched("shop");
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }

      if (game.status === "pending") {
        return res.status(200).json({ error: "Game hasn't started" });
      }
      // else if (game.status === "done") {
      //   return res.status(200).json({ error: "Game was already closed!" });
      // }

      const tickets = await Slip.query()
        .where('gameId', gameId)
        .whereNotIn('status', ['redeemed', 'canceled', 'blocked'])
        .patch({ status: 'redeem', netWinning: 0 });


      const updatedGames = await Game.query().findById(gameId).patch({ status: "done" }).returning('*');
      const updatedGame = await Game.query().findById(gameId);

      res.status(200).json(updatedGame)
    } catch (error) {
      next(error);
    }
  },

  updateGame: async (req, res, next) => {
    const { id } = req.params;
    const updatedGameData = req.body;

    const updateQuery = {};

    if (updatedGameData.hasOwnProperty("winner")) {
      updateQuery.winner = updatedGameData.winner;
    }

    if (updatedGameData.hasOwnProperty("status")) {
      updateQuery.status = updatedGameData.status;
    }

    if (updatedGameData.hasOwnProperty("gameType")) {
      // Simplify the gameType processing
      let gameTypes = updatedGameData.gameType;

      // If input is already a JSON string, parse it first
      if (typeof gameTypes === 'string' && (gameTypes.startsWith('[') || gameTypes.startsWith('{'))) {
        try {
          gameTypes = JSON.parse(gameTypes);
        } catch (e) {
          // If parsing fails, treat as a single value
        }
      }

      // Ensure it's an array
      if (!Array.isArray(gameTypes)) {
        gameTypes = [gameTypes];
      }

      // Store as JSON string
      updateQuery.gameType = JSON.stringify(gameTypes);
    }

    try {
      const updatedGame = await Game.query().findById(id).patch(updateQuery);
      if (!updatedGame) {
        return res.status(404).json({ error: "Game not found" });
      }

      await addAdditionalInfoOnGame(updatedGame)
      // Parse gameType before sending response
      updatedGame.gameType = parseGameType(updatedGame.gameType);
      res.json(updatedGame);
    } catch (error) {
      next(error);
    }
  },

  deleteGame: async (req, res, next) => {
    const { gameId } = req.params;
    try {
      const deletedCount = await Game.query().deleteById(gameId);
      if (deletedCount === 0) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  drawNumberForGame: async (req, res, next) => {
    const { gameId } = req.params;

    try {
      // Check if the game exists
      const game = await Game.query().findById(gameId);
      if (!game) {
        return res.status(404).json({ error: 'Game not found' });
      }
      if (game.status === 'done') {
        return res.status(404).json({ error: 'Game is closed!' });
      }
      if (game.status === 'canceled' || game.status === 'error') {
        return res.status(404).json({ error: 'Game is canceled!' });
      }
      if (game.status === 'pending') {
        return res.status(404).json({ error: "Game hasn't started!" });
      }

      // Fetch already drawn numbers for the game
      const drawnNumbers = await DrawnNumber.query().where('gameId', gameId);
      // console.log('length', drawnNumbers.length);
      if (drawnNumbers.length >= 75) {
        return res.status(400).json({ error: "Maximun numbers are already drawn!" });
      }
      // Get the already drawn numbers array
      const drawnNumbersArray = drawnNumbers.map(number => number.number);

      let drawnNumber;
      do {
        // Generate a random number from 1 to 75
        drawnNumber = Math.floor(Math.random() * 75) + 1;
      } while (drawnNumbersArray.includes(drawnNumber)); // Check if the number is already drawn

      // Insert the drawn number into the drawn_numbers table
      await DrawnNumber.query().insert({
        gameId: gameId,
        number: drawnNumber
      });

      res.status(200).json(drawnNumber);
    } catch (error) {
      next(error);
    }
  },

  getCartelas: async (req, res, next) => {
    try {
      const cards = cardData.map((card, index) => ({ no: (index + 1), card }));
      res.status(200).json(cards)
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  getCurrentGame: async (req, res) => {
    let { shopId } = req.params;

    try {
      const lastGame = await getLastGamePlayed(shopId);

      if (!lastGame || lastGame.status === 'done' || lastGame.status === 'error' || lastGame.status === 'canceled') {
        // Create a new game
        let newGameNumber;
        if (!lastGame) {
          newGameNumber = 100;
        } else {
          newGameNumber = (lastGame.gameNumber + 1);
        }
        const shop = await Shop.query().findById(shopId);

        // First get shop's gameType as clean array
        let gameTypesArray = [];
        console.log(shop.gameType);
        try {
          // If it's a string representation, parse it
          if (typeof shop.gameType === 'string') {
            // Try to parse, but handle corrupted JSON
            try {
              let parsed = JSON.parse(shop.gameType);
              gameTypesArray = Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
              // If parsing fails, use string directly
              gameTypesArray = [shop.gameType];
            }
          } else if (Array.isArray(shop.gameType)) {
            gameTypesArray = shop.gameType;
          } else {
            gameTypesArray = [shop.gameType || ''];
          }
        } catch (e) {
          // Fallback to default
          gameTypesArray = [];
        }

        // Clean the array to ensure valid strings only
        gameTypesArray = gameTypesArray
          .filter(item => item !== null && item !== undefined)
          .map(item => {
            if (typeof item === 'string') {
              // Remove any invalid characters that might cause JSON issues
              return item.replace(/["\\]/g, '');
            }
            return String(item);
          });

        if (gameTypesArray.length === 0) {
          gameTypesArray = [''];
        }

        // Create the new game with clean JSON
        const newGame = await Game.query().insert({
          gameNumber: newGameNumber,
          shopId,
          stake: shop.stake,
          rtp: shop.rtp,
          gameType: JSON.stringify(gameTypesArray) // Store as clean JSON string
        });

        // Create a clean response object
        const gameResponse = {
          ...newGame,
          gameType: gameTypesArray // Use the clean array directly
        };

        const cards = cardData.map((card, index) => ({ no: (index + 1), card }));
        return res.status(200).json({
          message: "active",
          game: gameResponse,
          stage: 'pending',
          cartela: cards
        });
      } else if (lastGame.status === 'playing' || lastGame.status === 'pending') {
        await addAdditionalInfoOnGame(lastGame);

        // Handle potentially corrupted gameType string
        let gameTypesArray = [];
        console.log(lastGame.gameType);
        if (typeof lastGame.gameType === 'string') {
          // For corrupted JSON, extract values using regex or simple string operations
          // Try normal parsing, with fallback
          try {
            let parsed = JSON.parse(lastGame.gameType);
            gameTypesArray = Array.isArray(parsed) ? parsed : [parsed];
          } catch (e) {
            // If parsing fails completely, use as is
            gameTypesArray = [lastGame.gameType.replace(/[\[\]"\\]/g, '')];
          }
        } else if (Array.isArray(lastGame.gameType)) {
          gameTypesArray = lastGame.gameType;
        } else {
          gameTypesArray = ['']; // Default
        }

        // Create a new response object with clean gameType
        const gameResponse = {
          ...lastGame,
          gameType: gameTypesArray
        };

        if (lastGame.status === 'playing') {
          return res.status(200).json({
            error: "Last game didn't finish",
            stage: 'playing',
            game: gameResponse
          });
        } else {
          const cards = cardData.map((card, index) => ({ no: (index + 1), card }));
          return res.status(200).json({
            message: "active",
            game: gameResponse,
            stage: 'pending',
            cartela: cards
          });
        }
      }
      return res.status(400).json({ error: "Unknown stage!" });
    } catch (error) {
      console.log(error);
      logger.error(`Error getting current game result: ${error}`);
      return res.status(500).json({ error: error?.message || "Internal server error." });
    }
  },

  searchGame: async (req, res) => {
    try {
      const { date, eventId, shopId } = req.query;
      let result = [];
      if (!shopId) {
        return res.status(404).json({ error: "Missing Shop Id" });
      }
      if (eventId) {
        result = await Game.query().where("gameNumber", eventId).andWhere("shopId", shopId);
      } else {
        let query = Game.query();
        if (date) {
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);

          query = query
            .where("created_at", ">=", startOfDay)
            .where("created_at", "<=", endOfDay);
        }
        result = (await query.where('shopId', shopId).orderBy('gameNumber', 'desc').limit(30));
      }
      await Promise.all(result.map(async (game) => {
        await addAdditionalInfoOnGame(game);
        // Clean parse the gameType
        game.gameType = parseGameType(game.gameType);
      }));

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getGameRusult: async (req, res) => {
    const { gameNumber, shop } = req.params;
    try {
      const reportDate = getCurrentDate();
      const timezoneOffset = 0; // Set the time zone offset to 0 for UTC

      const startOfDay = new Date(`${reportDate}T00:00:00.000Z`);
      startOfDay.setMinutes(startOfDay.getMinutes() - timezoneOffset);

      const endOfDay = new Date(`${reportDate}T23:59:59.999Z`);
      endOfDay.setMinutes(endOfDay.getMinutes() - timezoneOffset);
      // Update the current game with the drawn number
      const currentGame = await Game.query()
        .where("gameNumber", gameNumber)
        .andWhere("shopId", shop)
        .andWhere("status", "done")
        .where("created_at", ">=", startOfDay)
        .where("created_at", "<=", endOfDay)
        .first();

      if (!currentGame) {
        return res.status(404).json({ error: "Game not found." });
      }

      const drawnNumber = JSON.parse(currentGame?.pickedNumbers)?.selection;
      // console.log('dd', drawnNumber);
      if (!drawnNumber || !(drawnNumber)) {
        return res.status(500).json({ error: "Invalid drawn numbers." });
      }

      let drawn = [];
      if (!Array.isArray(drawnNumber)) {
        drawn.push(drawnNumber)
      } else {
        drawn = null
      }


      let resultObject = null;
      if (!Array.isArray(drawn)) {
        // Parse gameType cleanly to get first item
        let gameType = currentGame.gameType;
        const parsedTypes = parseGameType(gameType);
        gameType = parsedTypes.length > 0 ? parsedTypes[0] : '';

        resultObject = {
          err: "false",
          0: gameType,
          ...drawnNumber?.reduce((acc, number, index) => {
            acc[index + 1] = number;
            return acc;
          }, {}) || drawnNumber,
          21: currentGame.gameNumber,
          22: currentGame.gameNumber,
        };
      } else {
        // console.log("draw", drawnNumber);
        const winc = determineAllWinners(drawnNumber);
        // Same clean parsing for gameType
        let gameType = currentGame.gameType;
        const parsedTypes = parseGameType(gameType);
        gameType = parsedTypes.length > 0 ? parsedTypes[0] : '';

        resultObject = {
          err: 'false',
          1: drawnNumber,
          2: (winc.color),
          3: (winc.oddEven),
          21: currentGame.gameNumber,
          22: currentGame.gameNumber,
          0: gameType,
        }
      }
      res.status(200).send(resultObject);
    } catch (error) {
      console.error("Error getting current game result:", error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },
};

function getStartAndEndOfDay(timezoneOffset) {
  const reportDate = new Date().toISOString().substr(0, 10);
  const startOfDay = new Date(`${reportDate}T00:00:00.000Z`);
  startOfDay.setMinutes(startOfDay.getMinutes() - timezoneOffset);
  const endOfDay = new Date(`${reportDate}T23:59:59.999Z`);
  endOfDay.setMinutes(endOfDay.getMinutes() - timezoneOffset);

  return {
    startOfDay: startOfDay,
    endOfDay: endOfDay
  };
}

function getStartAndEndOfDayByDay(timezoneOffset, reportDate) {
  const startOfDay = new Date(`${reportDate}T00:00:00.000Z`);
  startOfDay.setMinutes(startOfDay.getMinutes() - timezoneOffset);
  const endOfDay = new Date(`${reportDate}T23:59:59.999Z`);
  endOfDay.setMinutes(endOfDay.getMinutes() - timezoneOffset);

  return {
    startOfDay: startOfDay,
    endOfDay: endOfDay
  };
}

const checkRepeatNumber = async (trx, shopId, newGameNumber, dblock) => {
  await trx.raw(`CREATE TABLE IF NOT EXISTS ${dblock} (game_number VARCHAR(255) PRIMARY KEY); `);
  const lockAcquired = await trx.raw(`
    INSERT INTO ${dblock} (game_number) VALUES ('${getTodayDate() + '_' + shopId.toString() + '_' + (newGameNumber).toString()}');
  `).catch(error => {
    console.log(error);
    return []; // Return an empty array to indicate failure
  });

  if (lockAcquired.length === 0) {
    logger.error(`${dblock} Failed to acquire lock for game: ${newGameNumber} in SHop: ${shopId}`);
    throw new Error("Conflict detected. Please try again."); // Throw an error to stop execution
  } else {
    return true;
  }
}

const getLastGamePlayed = async (shopId) => {
  const { startOfDay, endOfDay } = getStartAndEndOfDay(0);
  return await Game.query()
    .andWhere("created_at", ">=", startOfDay)
    .andWhere("created_at", "<=", endOfDay)
    .andWhere("shopId", shopId)
    .orderBy("id", "desc")
    .limit(1)
    .first().withGraphFetched('shop');
}

const finalResult = async (currentGame, numbers) => {
  return {
    "id": currentGame.id,
    "gameNumber": currentGame.gameNumber,
    "status": "done",
    "results": numbers.map((item) => ({ value: item }))
  }
}
const formatSpinFinalResult = async (currentGame, results) => {
  return { id: currentGame.id, gameNumber: currentGame.gameNumber, status: 'done', gameResult: results };
}

const acquireLockWithTimeout = async (mutex, timeout) => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      mutex.release();
      reject(new Error('Timeout while acquiring lock'));
    }, timeout);

    mutex.acquire().then((release) => {
      clearTimeout(timer);
      resolve(release);
    }).catch((error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
};

const getTodayDate = () => {
  var currentDate = new Date();

  // Format the date into YYYYMMDD format
  return currentDate.getFullYear() +
    ('0' + (currentDate.getMonth() + 1)).slice(-2) +
    ('0' + currentDate.getDate()).slice(-2);
}

// Add this helper function at the module level, outside any controller method
const parseGameType = (gameType) => {
  if (!gameType) return [];

  try {
    // Handle cases where gameType might be double-encoded or already an array
    if (typeof gameType === 'string') {
      // Try to parse the string as JSON
      const parsed = JSON.parse(gameType);

      // Check if the parsed result is another string that looks like JSON
      if (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('{'))) {
        try {
          // Try to parse again (handles double encoding)
          return JSON.parse(parsed);
        } catch (e) {
          return [parsed];
        }
      }
      // If parsed result is an array, return it
      else if (Array.isArray(parsed)) {
        return parsed;
      }
      // If parsed result is not an array, wrap it in an array
      else {
        return [parsed];
      }
    }
    // If gameType is already an array, return it
    else if (Array.isArray(gameType)) {
      return gameType;
    }

    // Default case - if nothing else worked
    return [gameType];
  } catch (e) {
    // If parsing fails, return original as a single-item array
    return [gameType];
  }
};

module.exports = GameController;

// ticket, stake, payout, unclamed, revoked, ggr, net balance
