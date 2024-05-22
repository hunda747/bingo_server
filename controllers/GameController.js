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

const KENOLOCK = 'game_lock_keno'
const SPINLOCK = 'game_lock_spin'
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
        const newGame = await Game.query().insert({ gameNumber: newGameNumber, shopId, stake: shop.stake });
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

      const tickets = await Slip.query().where({ gameId: game.id });
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

    try {
      const updatedGame = await Game.query().findById(id).patch(updateQuery);
      if (!updatedGame) {
        return res.status(404).json({ error: "Game not found" });
      }

      await addAdditionalInfoOnGame(updatedGame)
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

      // console.log(lastGame);
      let newGameNumber;
      if (!lastGame || lastGame.status === 'done' || lastGame.status === 'error') {
        // await transaction(Game.knex(), async (trx) => {
        let newGameNumber;
        if (!lastGame) {
          newGameNumber = 100;
        } else {
          newGameNumber = (lastGame.gameNumber + 1);
        }
        const shop = await Shop.query().findById(shopId);
        // await checkRepeatNumber(trx, shopId, newGameNumber, BINGOLOCK);
        const newGame = await Game.query().insert({ gameNumber: newGameNumber, shopId, stake: shop.stake });

        const cards = cardData.map((card, index) => ({ no: (index + 1), card }));
        return res.status(200).json({ message: "active", game: newGame, stage: 'pending', cartela: cards });
        // })
        // return res.status(200).json({ error: "No active game found!", stage: 'new', lastWinner: lastGame?.winner, lastCard: card, betAmount: lastGame?.shop?.stake });
      } else if (lastGame.status === 'playing') {
        await addAdditionalInfoOnGame(lastGame);

        return res.status(200).json({ error: "Last game didn't finish", stage: 'playing', game: lastGame });
      } else if (lastGame.status === 'pending') {
        await addAdditionalInfoOnGame(lastGame);
        const cards = cardData.map((card, index) => ({ no: (index + 1), card }));
        return res.status(200).json({ message: "active", game: lastGame, stage: 'pending', cartela: cards });
      }
      return res.status(400).json({ error: "Unknown stage!" });
    } catch (error) {
      console.log(error);
      logger.error(`Error getting current game result: ${error}`);
      return res.status(500).json({ error: error?.message || "Internal server error." });
    }
  },

  getCurrentGameResultFalse: async (req, res) => {
    let { gameNumber, shopId } = req.body;
    // console.log('game', gameNumber);
    try {
      // Validate input
      if (!gameNumber || !shopId) {
        return res.status(400).json({ error: "Invalid input data." });
      }

      // Acquire lock
      const release = await acquireLockWithTimeout(gameMutex, 5000);
      if (!release) {
        logger.error(`Failed to acquire lock. for shop: ${shopId} gameNumber: ${gameNumber}`)
        return res.status(500).json({ error: "Failed to acquire lock." });
      }

      // Start transaction
      await transaction(Game.knex(), async (trx) => {
        // Check shop existence
        const findShop = await Shop.query().findOne({ username: shopId });
        if (!findShop) {
          release();
          return res.status(404).json({ error: "Shop not found." });
        }

        shopId = findShop.id;

        // Retrieve current game
        const currentGame = await Game.query()
          .findOne({ id: gameNumber, gameType: 'keno', shopId, status: 'playing' })
          // .findOne({ gameType: 'keno', shopId, status: 'playing' })
          // .orderBy("id", "desc")
          .forUpdate();

        if (!currentGame) {
          logger.error(`current game not found keno for shop: ${findShop?.username}`);
          release();
          return res.status(404).json({ error: "Game not found." });
        }

        let response;
        if (!currentGame.pickedNumbers) {
          // Generate random numbers securely
          const numbers = await generateRandomNumbersKeno(gameNumber, findShop.rtp, shopId, res);

          // Update game with drawn numbers
          let headsCount = 0;
          let tailsCount = 0;

          for (const num of numbers) {
            if (num >= 1 && num <= 40) {
              headsCount++;
            } else if (num >= 41 && num <= 80) {
              tailsCount++;
            }
          }

          const winner = headsCount > tailsCount ? "heads" : tailsCount > headsCount ? "tails" : "tails";

          // Update game
          await currentGame.$query(trx).patch({
            pickedNumbers: JSON.stringify({ selection: numbers }),
            status: "done",
            winner: winner
          });

          const newGameNumber = currentGame.gameNumber + 1;
          // await trx.raw(`
          //   CREATE TABLE IF NOT EXISTS game_lock (
          //     game_number VARCHAR(255) PRIMARY KEY
          //   );
          // `);

          const lockAcquired = await trx.raw(`
            INSERT INTO game_lock (game_number) VALUES ('${getTodayDate() + '_' + currentGame.gameType + '_' + shopId.toString() + '_' + (newGameNumber).toString()}');
          `);

          if (lockAcquired.length === 0) {
            // Lock could not be acquired (handle conflict)
            release();
            logger.error(`Failed to acquire lock for game: ${gameNumber} in SHop: ${shopId}`);
            return res.status(409).json({ error: "Conflict detected. Please try again." }); // Or retry logic
          }
          // Create new game
          const newGame = await Game.query(trx).insert({
            gameType: "keno",
            gameNumber: newGameNumber,
            shopId
          }).returning("*");

          let finalgameobject = await finalResult(currentGame, numbers)
          const last10Result = await getLast10Games(shopId);
          last10Result.unshift(finalgameobject);

          // Calculate winning numbers
          calculateWiningNumbers(gameNumber, numbers, winner);

          response = {
            openGame: { id: newGame.id, gameNumber: newGame.gameNumber },
            game: { gameNumber: currentGame.gameNumber },
            result: numbers.map((item) => ({ value: item })),
            lastGame: currentGame.gameNumber,
            recent: last10Result
          };
        } else {
          release();
          logger.error(`Game with picked number on game id: ${gameNumber}, shop id: ${shopId}`)
          return res.status(404).json({ error: "Game not found." });
        }

        // Release lock and respond with data
        release();
        return res.status(200).json(response);
      });
    } catch (error) {
      logger.error(`Error getting current game result: ${error}`);
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  getCurrentGameResultOld: async (req, res) => {
    let { gameNumber, shopId } = req.body;
    // console.log(gameNumber);
    try {
      // const release = await gameMutex.acquire();
      const release = await acquireLockWithTimeout(gameMutex, 5000);
      try {
        if (!shopId) {
          return res.status(404).json({ error: "No active games currently." });
        }
        const findshop = await Shop.query().where("username", shopId).first();
        if (!findshop) {
          return res.status(404).json({ error: "No active games currently." });
        }
        shopId = findshop.id;
        let response;
        // Update the current game with the drawn number
        // Wrap critical operations within a transaction
        await transaction(Game.knex(), async (trx) => {
          // const currentGame = await Game.query().where("id", gameNumber).andWhere('gameType', 'keno').andWhere('shopId', shopId).first();
          const currentGame = await Game.query().where("status", "playing").andWhere('gameType', 'keno').andWhere('shopId', shopId).first();

          if (!currentGame) {
            return res.status(404).json({ error: "No active games currently." });
          }
          // console.log("result:", currentGame);
          let drawnNumber;
          if (!currentGame.pickedNumbers) {
            // Assume you have a function to draw the number and update the database
            const numbers = await generateRandomNumbersKeno(gameNumber, findshop.rtp, shopId, res);
            drawnNumber = numbers;

            let headsCount = 0;
            let tailsCount = 0;
            let evenCount = 0;

            for (const num of numbers) {
              if (num <= 40) {
                evenCount++;
                // Assuming heads for even numbers, tails for odd numbers
                headsCount++;
              } else {
                tailsCount++;
              }
            }
            // const drawnNumber = this.generateRandomNumbers();
            const winner =
              headsCount > tailsCount
                ? "heads"
                : tailsCount > headsCount
                  ? "tails"
                  : "evens";
            // Update the pickedNumbers field with the drawn number
            await currentGame.$query().patch({
              pickedNumbers: JSON.stringify({ selection: drawnNumber }),
              status: "done",
              winner: winner,
            });

            calculateWiningNumbers(gameNumber, drawnNumber, winner);
          } else {
            // console.log('resultPA:', );
            drawnNumber = JSON.parse(currentGame?.pickedNumbers)?.selection;
          }
          // calculateWiningNumbers(drawnNumber, gameNumber);

          // Retrieve the previous game
          const previousGame = await Game.query()
            .where("status", "done")
            .andWhere("gameType", "keno")
            .andWhere('shopId', shopId)
            .orderBy("id", "desc")
            .offset(1)
            .first();

          let openGame;
          // Update the current game with the drawn number
          const newGame = await Game.query()
            .where("status", "playing")
            .andWhere("gameType", "keno")
            .andWhere('shopId', shopId)
            .orderBy("id", "desc")
            .first();

          if (newGame) {
            openGame = newGame;
          } else {
            openGame = await Game.query()
              .insert({
                gameType: "keno",
                gameNumber: currentGame.gameNumber + 1,
                shopId: shopId
                // Add other fields as needed based on your table structure
                // Example: pickedNumbers, winner, time, status, etc.
              })
              .returning("*");
          }

          // Construct the response in the specified format
          response = {
            openGame: { id: openGame.id, gameNumber: openGame.gameNumber },
            game: { gameNumber: currentGame.gameNumber },
            result: drawnNumber.map((item) => ({ value: item })),
            lastGame: previousGame ? previousGame.gameNumber : null,
            recent: await getLast10Games(shopId),
          };
          release();
        })
        // Respond with the updated game data
        return res.status(200).json(response);
      } catch (error) {
        console.error("Error getting current game result:", error);
        return res.status(500).json({ error: "Internal server error." });
      } finally {
        // Release the lock when the critical section is done
        if (release) {
          release();
        } else {
          console.log('no time out keno');
        }
      }
    } catch (error) {
      // Handle timeout error
      if (error instanceof knex.KnexTimeoutError) {
        // throw new Error('Failed to acquire lock within the specified timeout');
        logger.error('Failed to acquire lock within the specified timeout');
        return res.status(500).json({ error: "Internal server error." });
      }
      // Handle other errors
      // throw error;
      logger.error(error);
      return res.status(500).json({ error: "Internal server error." });
    }
  },

  resetGameNumber: async () => {
    const shops = await Shop.query();

    shops.map(async (shop) => {
      const currentGame = await Game.query().where("status", "playing").andWhere('gameType', 'keno').andWhere('shopId', shop.id).orderBy("id", "desc").first();

      if (currentGame) {
        const numbers = await generateRandomNumbersKeno(currentGame.id, shop.rtp, shop.id);

        let headsCount = 0;
        let tailsCount = 0;
        let evenCount = 0;

        for (const num of numbers) {
          if (num <= 40) {
            evenCount++;
            // Assuming heads for even numbers, tails for odd numbers
            headsCount++;
          } else {
            tailsCount++;
          }
        }
        // const drawnNumber = this.generateRandomNumbers();
        const winner =
          headsCount > tailsCount
            ? "heads"
            : tailsCount > headsCount
              ? "tails"
              : "evens";
        // Update the pickedNumbers field with the drawn number
        await currentGame.$query().patch({
          pickedNumbers: JSON.stringify({ selection: numbers }),
          status: "done",
          winner: winner,
        });
        // console.log('keno', currentGame);

        calculateWiningNumbers(currentGame.id, numbers, winner);
      } else {
        console.log('No game');
      }

      const openGame = await Game.query()
        .insert({
          gameType: "keno",
          gameNumber: shop.kenoStartNumber,
          shopId: shop.id
          // Add other fields as needed based on your table structure
          // Example: pickedNumbers, winner, time, status, etc.
        })

      const currentGameSpin = await Game.query().where("status", "playing").andWhere('gameType', 'spin').andWhere('shopId', shop.id).orderBy("id", "desc").first();

      if (currentGameSpin) {
        const drawnNumber = await generateSpinRandomNumbers(currentGameSpin.id, shop.spinRtp, shop.id)
        // console.log('ddraw', drawnNumber);

        const winners = determineAllWinners(drawnNumber);
        // console.log(winners);
        // Update the pickedNumbers field with the drawn number
        await currentGameSpin.$query().patch({
          pickedNumbers: JSON.stringify({ selection: drawnNumber }),
          status: "done",
        });
        // console.log('spinres', cu);

        calculateSlipWiningNumbers(currentGame.id, drawnNumber, winners);
      } else {
        console.log(" no smin game");
      }

      const openGameSpin = await Game.query()
        .insert({
          gameType: "spin",
          gameNumber: shop.spinStartNumber,
          shopId: shop.id
          // Add other fields as needed based on your table structure
          // Example: pickedNumbers, winner, time, status, etc.
        })
    })

    return true;
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
        // console.log("draw", drawn);
        resultObject = {
          err: "false",
          0: currentGame.gameType,
          ...drawnNumber?.reduce((acc, number, index) => {
            acc[index + 1] = number;
            return acc;
          }, {}) || drawnNumber,
          21: currentGame.gameNumber,
          22: currentGame.gameNumber, // Assuming gameId is what you want for "21" and "22"
        };
      } else {
        // console.log("draw", drawnNumber);
        const winc = determineAllWinners(drawnNumber);
        resultObject = {
          err: 'false',
          1: drawnNumber,
          2: (winc.color),
          3: (winc.oddEven),
          21: currentGame.gameNumber,
          22: currentGame.gameNumber, // Assuming gameId is what you want for "21" and "22"
          0: currentGame.gameType,
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


module.exports = GameController;

// ticket, stake, payout, unclamed, revoked, ggr, net balance
