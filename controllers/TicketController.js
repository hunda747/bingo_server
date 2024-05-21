// controllers/slipController.js

const Slip = require("../models/tickets");
const Game = require("../models/game");
const Cashier = require("../models/cashier");
// Fetching cardData from your card.js file
const { cardData } = require('../card/cards');

const logger = require("../logger");
const { transaction } = require('objection');

const { subDays, format, startOfDay, endOfDay } = require("date-fns");
const DrawnNumber = require("../models/drawnNumbers");
const { isWinner } = require("../middleware/checkBingoCard");
const { error } = require("winston");
const GameWinner = require("../models/gameWinner");
const { addAdditionalInfoOnGame } = require("../utill/gameUtill");
const Shop = require("../models/shop");
const { generateShopDateReport } = require("../utill/reportUtill");

const SLIPLOCK = 'sliplock';

const ticketController = {
  getAllSlips: async (req, res, next) => {
    const { shopId, shopOwnerId, status, startDate, endDate } =
      req.body;
    try {
      let query = Slip.query();

      if (startDate) {
        const startOfDayTime = new Date(startDate);
        startOfDayTime.setHours(0, 0, 0, 0);
        query = query.where("created_at", ">=", startOfDayTime);
      }

      if (endDate) {
        const endOfDayTime = new Date(endDate);
        endOfDayTime.setHours(23, 59, 59, 999);
        query = query.where("created_at", "<=", endOfDayTime);
      }

      if (status && status.length > 0) {
        query = query.whereIn("status", status);
      }

      if (shopId) {
        query = query.where("shopId", shopId);
      }

      if (shopOwnerId) {
        query = query.where("shopOwnerId", shopOwnerId);
      }

      const slips = await query
        .withGraphFetched("shop")
        .withGraphFetched("game")
        .orderBy("created_at", "desc")
        .limit(100);

      slips.forEach((slip) => {
        slip.card = getBingoCard(slip.pickedNumber);
      })

      res.json(slips);
    } catch (error) {
      next(error);
    }
  },

  getSlipById: async (req, res, next) => {
    const { id } = req.params;

    try {
      const slip = await Slip.query().findById(id).withGraphFetched("game");
      if (!slip) {
        return res.status(404).json({ error: 'Ticket Not found' })
      }
      slip.card = getBingoCard(slip.pickedNumber);

      if (slip) {
        res.json(slip);
      } else {
        res.status(404).json({ error: "Slip not found!" });
      }
    } catch (error) {
      next(error);
    }
  },

  getSlipByGamenumber: async (req, res, next) => {
    const { code } = req.query;
    // console.log("code", code);
    try {
      const slip = await Slip.query()
        .where("id", code)
        .first()
        .withGraphFetched("game")
        .withGraphFetched("shop");
      if (slip) {
        res.json(slip);
      } else {
        res.status(404).json({ error: "Slip not found yet" });
      }
    } catch (error) {
      next(error);
    }
  },

  createSlip: async (req, res, next) => {
    const param = req.body;

    try {
      await transaction(Game.knex(), async (trx) => {
        // Update the current game with the drawn number
        const currentGame = await Game.query()
          .where("status", "pending")
          .andWhere("shopId", param.shop)
          .orderBy("id", "desc")
          .first();

        if (!currentGame) {
          return res.status(404).json({ message: "Game Closed." });
        }

        await checkRepeatNumber(trx, currentGame.id, param.pickedNumber, SLIPLOCK)

        const slip = await Slip.query().insert({
          gameId: currentGame.id,
          pickedNumber: param.pickedNumber,
          shopOwnerId: param.shopOwner,
          shopId: param.shop,
        });
        const ticket = await Slip.query().where({ gameId: currentGame.id });
        currentGame.selectedNumbers = ticket.map((tic) => tic.pickedNumber);
        return res.status(201).json(currentGame);
      })
    } catch (error) {
      next(error);
    }
  },

  checkSlip: async (req, res, next) => {
    const { gameId, cartela } = req.body;

    try {
      // Find the game
      const currentGame = await Game.query().findById(gameId);
      if (!currentGame) {
        return res.status(404).json({ message: 'Game not found' });
      }

      const ticket = await Slip.query().where({ gameId: gameId }).andWhere({ "pickedNumber": cartela.toString() }).andWhereNot({ status: 'canceled' }).first();
      if (!ticket) {
        return res.status(404).json({ message: `Cartela #${cartela} was not selected for this game` });
      }
      if (ticket.status === 'blocked') {
        return res.status(404).json({ message: `Cartela #${cartela} is blocked!` });
      }
      if (ticket.status === 'canceled') {
        return res.status(404).json({ message: 'Cartela is canceled!' });
      }

      const card = getBingoCard(cartela);
      // Fetch already drawn numbers for the game
      const drawnNumbers = await DrawnNumber.query().where('gameId', gameId);
      // Get the already drawn numbers array
      const drawnNumbersArray = drawnNumbers.map(number => number.number);
      if (ticket.status === 'redeemed') {
        return res.status(200).json({ message: 'This is a win!', win: true, card: card, cartelaNo: cartela, drawnNumbers: drawnNumbersArray });
      }
      // console.log('ticket', ticket.id);


      const iswin = isWinner(card, drawnNumbersArray);
      if (iswin) {
        await addAdditionalInfoOnGame(currentGame);
        const netwin = (currentGame.totalStake - currentGame.net) / ((currentGame?.winner.length || 0) + 1);
        const can = await Slip.query().patchAndFetchById(ticket.id, { status: "redeemed" });

        const tickets = await Slip.query()
          .where('status', "redeemed")
          .andWhere('gameId', currentGame.id)
          .patch({ status: 'redeemed', netWinning: netwin });

        const game = await Game.query().patchAndFetchById(gameId, { status: 'done' });
        const gameWinner = await GameWinner.query().insert({
          gameId: gameId,
          number: cartela,
          ticketId: ticket.id
        })
        return res.status(200).json({ message: 'This is a win!', win: true, card: card, cartelaNo: cartela, drawnNumbers: drawnNumbersArray })
      } else {
        const can = await Slip.query().patchAndFetchById(ticket.id, { status: "blocked", netWinning: 0 });
        return res.status(200).json({ message: 'This cartela is not a winner', win: false, card: card, cartelaNo: cartela, drawnNumbers: drawnNumbersArray })
      }

    } catch (error) {
      console.log(error);
      next();
    }
  },

  updateSlip: async (req, res, next) => {
    const { id } = req.params;
    const { body } = req;

    try {
      const updatedSlip = await Slip.query().patchAndFetchById(id, body);
      if (updatedSlip) {
        res.json(updatedSlip);
      } else {
        res.status(404).json({ error: "Slip not found 2" });
      }
    } catch (error) {
      next(error);
    }
  },

  redeemSlip: async (req, res, next) => {
    const { id, shop, cashId } = req.params;

    if (!id || !shop || !cashId) {
      return res.status(404).json({ error: 'please provide all the info!' })
    }

    try {
      // const currentGame = await Game.query().where("id", gameNumber).where("status", 'done').first();

      // if (!currentGame) {
      //   return res.status(404).json({ message: "Game not found." });
      // }

      const updatedSlip = await Slip.query().findById(id).where('shopId', shop);
      // console.log("slip", updatedSlip);
      // if (updatedSlip) {
      if (updatedSlip.status == "active") {
        res.status(404).json({ err: "false", error: "Game not Done" });
      } else if (updatedSlip.status == "canceled") {
        res.status(404).json({ err: "false", error: "Ticket is canceled" });
      } else if (updatedSlip.status == "redeem") {
        const updateSlip = await Slip.query().patchAndFetchById(id, {
          status: "redeemed",
          redeemCashierId: cashId,
          redeemDate: new Date()
        });
        const game = await Game.query().findById(updatedSlip.gameId);
        const ticketPicks = JSON.parse(updateSlip.numberPick);
        // Initialize variables for each ticket
        let ticketWin = 0;
        let winnerPick = [];
        if (updateSlip.gameType === "spin") {
          const winningNumbers = JSON.parse(game.pickedNumbers).selection;
          const winner = determineAllWinners(winningNumbers)
          for (const pick of ticketPicks) {
            if (pick.market === "OddEven") {
              if (pick?.val[0] === winner?.oddEven) {
                winnerPick.push(pick);
              }
            } else if (pick.market === "Color") {
              if (pick?.val[0] === winner?.color) {
                winnerPick.push(pick);
              }
            } else {
              // console.log("numbers", winningNumbers);
              if (pick.val.map(Number).includes(winningNumbers)) {
                winnerPick.push(pick);
              }
            }
          }
        } else {
          for (const pick of ticketPicks) {
            const winningNumbers = JSON.parse(game.pickedNumbers).selection;
            const numberOfSelections = pick.selection.length;

            if (typeof pick?.selection[0] === "string") {
              if (game.winner === "evens" && pick?.selection[0] === game.winner) {
                winnerPick.push(pick);
              } else if (pick?.selection[0] === game.winner) {
                winnerPick.push(pick);
              }
            } else {
              const oddsEntry = oddsTable[updateSlip.oddType][numberOfSelections];

              const actualWinnings = countCorrectGuesses(
                pick.selection,
                winningNumbers
              );

              if (oddsEntry && actualWinnings) {

                const modd = oddsEntry[actualWinnings - 1];
                if (pick.stake * Object.values(modd)[0]) {
                  winnerPick.push(pick);
                }
              }
            }
          }
        }

        res.status(200).json({ err: "false", data: winnerPick });
      } else {
        res.status(404).json({ error: "Slip not found" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  },

  cancelSlip: async (req, res, next) => {
    const { id } = req.params;
    // const { gameId, cartela } = req.params;

    try {
      await transaction(Game.knex(), async (trx) => {
        try {

          const slipCurrent = await Slip.query()
            .where("id", id)
            .where("status", "active")
            .first();
          if (!slipCurrent) {
            return res.status(404).json({ message: "Slip not found." });
          }
          let gameId = slipCurrent.gameId;
          const currentGame = await Game.query()
            .where("id", gameId)
            .where("status", "pending")
            .first();
          if (!currentGame) {
            return res.status(404).json({ message: "Game not found." });
          }

          const updatedSlip = await Slip.query().patchAndFetchById(id, {
            status: "canceled",
          });

          if (updatedSlip) {
            await deleteSlipLock(trx, gameId, slipCurrent.pickedNumber, SLIPLOCK);
            res.json({ message: "Slip canced!" });
          } else {
            res.status(404).json({ err: "false", error: "Slip not found 4" });
          }
        } catch (error) {
          console.log('rollbakc', error);
          trx.rollback();
          throw Error(error)
        }
      })
    } catch (error) {
      next(error);
    }
  },

  generateCashierReport: async (req, res) => {
    const { shopId } = req.params;
    const { date } = req.query;
    const shop = await Shop.query().findById(shopId).withGraphFetched('owner');

    if (!shop) {
      return res.status(404).json({ message: "Cashier not found." });
    }

    const today = date ? new Date(date) : new Date();
    const yesterday = subDays(today, 1);

    const formatDate = (date) => format(date, "yyyy-MM-dd HH:mm:ss");

    let todayReport = await generateShopDateReport(shop, new Date(today).toISOString().substring(0, 10));
    let yesterdayReport = await generateShopDateReport(shop, new Date(yesterday).toISOString().substring(0, 10));

    res.status(200).json([todayReport, yesterdayReport]);
  },

  generateDetailCashierReport: async (req, res) => {
    const { cashierId } = req.query;
    // console.log(cashierId);
    try {
      // .findById(cashierId)
      const cashierReport = await Cashier.query()
        .withGraphFetched("shop")
        .withGraphFetched("[slips]")
        .modifyGraph("slips", (builder) => {
          builder.select(
            Slip.raw("COUNT(*) as tickets"),
            Slip.raw("SUM(totalStake) as stake"),
            Slip.raw(
              'SUM(CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END) as payout'
            ),
            Slip.raw(
              'SUM(CASE WHEN status = "redeem" THEN netWinning ELSE 0 END) as unclaimed'
            ),
            Slip.raw(
              'COUNT(CASE WHEN status = "canceled" THEN 1 END) as revoked'
            ),
            Slip.raw(
              'SUM(netWinning - CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END - CASE WHEN status = "canceled" THEN 0 ELSE CASE WHEN status = "redeem" THEN netWinning ELSE 0 END END) as ggr'
            ),
            Slip.raw(
              'SUM(netWinning - CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END) as netBalance'
            )
          );
        });

      res.status(200).json(cashierReport);
    } catch (error) {
      console.error(error);
      res.status(400).json({ error: true });
    }
  },

  recallBetsReport: async (req, res) => {
    const { cashierId } = req.params;
    const currentGame = await Cashier.query().findById(cashierId);
    if (!currentGame) {
      return res.status(404).json({ message: "Cashier not found." });
    }

    const date = new Date();
    // const yesterday = subDays(today, 1);

    const formatDate = (date) => format(date, "yyyy-MM-dd HH:mm:ss");
    const formattedStartDate = formatDate(startOfDay(date));
    // Set to the end of the day (23:59:59)
    const formattedEndDate = formatDate(endOfDay(date));
    // console.log(formattedStartDate);
    // console.log(formattedEndDate);

    const result = await Slip.query()
      .where("cashierId", cashierId)
      .andWhere("created_at", ">=", formattedStartDate)
      .andWhere("created_at", "<", formattedEndDate)
      .withGraphFetched("game")
      .orderBy("created_at", "desc")
      .limit(50);

    const rebalancedBets = result.map((slip) =>
      convertToRebalancedFormat(slip)
    );

    // .andWhere('created_at', '>=', formattedEndDate)
    // .andWhere('created_at', '<', formattedStartDate)
    // .andWhere('status', 'redeem')
    // .andWhere('netWinning', '>', 0)
    // .sum('totalStake as amount')
    // .count('id as number')
    // .first();

    res.status(200).json(rebalancedBets);
  },

  deleteSlip: async (req, res, next) => {
    const { id } = req.params;

    try {
      const deletedSlip = await Slip.query().deleteById(id);
      if (deletedSlip) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: "Slip not found 5" });
      }
    } catch (error) {
      next(error);
    }
  },
};

const getDrawnNumberByGameId = async (gameId) => {
  // Fetch the drawn numbers associated with the game
  const drawnNumbers = await DrawnNumber.query()
    .where('gameId', gameId)
    .orderBy('drawTime'); // Optional: Order by drawTime if needed

  return drawnNumbers.map(obj => obj.number)
}

const checkRepeatNumber = async (trx, gameId, cartela, dblock) => {
  await trx.raw(`CREATE TABLE IF NOT EXISTS ${dblock} (game_number VARCHAR(255) PRIMARY KEY); `);
  const lockAcquired = await trx.raw(`
    INSERT INTO ${dblock} (game_number) VALUES ('${gameId.toString() + '_' + cartela.toString()}');
  `).catch(error => {
    console.log(error);
    return []; // Return an empty array to indicate failure
  });

  if (lockAcquired.length === 0) {
    logger.error(`${dblock} Failed to acquire lock cartela: ${cartela} for game: ${gameId}.`);
    throw new Error("Conflict detected. Cartela Already select for this game."); // Throw an error to stop execution
  } else {
    return true;
  }
}

const deleteSlipLock = async (trx, gameId, cartela, dblock) => {
  console.log(gameId, cartela, dblock);
  const lockAcquired = await trx.raw(`DELETE FROM ${dblock} WHERE game_number = '${gameId.toString() + '_' + cartela.toString()}';`).catch(error => {
    console.log(error);
    return []; // Return an empty array to indicate failure
  });

  if (lockAcquired.length === 0) {
    logger.error(`${dblock} Failed to delete lock for cartela: ${cartela} for game: ${gameId}.`);
    throw new Error("Failed to delete lock for cartela."); // Throw an error to stop execution
  } else {
    return true;
  }
}

function getBingoCard(num) {
  return cardData[num - 1]
}

function countCorrectGuesses(userSelection, winningNumbers) {
  // Implement logic to count the number of correct guesses between userSelection and winningNumbers
  const correctGuesses = userSelection.filter((num) =>
    winningNumbers.includes(num)
  ).length;
  return correctGuesses;
}

function convertToRebalancedFormat(slip) {
  const numberPick = JSON.parse(slip.numberPick);
  // console.log(slip);

  return {
    err: "false",
    game: slip.gameType,
    errText: "bet placed.",
    gameStartsOn: `${slip.gameType} # ${slip?.game?.gameNumber}`,
    id: String(slip?.game?.gameNumber),
    on: format(new Date(slip.created_at), "yyyy/MM/dd HH:mm:ss"),
    by: `cashier`,
    agent: "agent",
    TotalStake: slip.totalStake,
    stake: slip.totalStake,
    toWinMax: slip.toWinMax,
    toWinMin: slip.toWinMin,
    code: slip.id, // Generate a unique code or use an existing one
    company: slip.company || "chessbet", // Use 'chessbet' if company is null
    user: numberPick.map((selection) => ({
      odd: selection.odd,
      stake: selection.stake,
      selection: selection.selection || selection.val,
    })),
  };
}

function determineWinningColors(drawnNumber) {
  return numberToColorMap[drawnNumber];
}

// Function to determine winners for all groups based on the drawn number
function determineAllWinners(drawnNumber) {
  const allWinners = {};

  // Check win option
  allWinners.win = drawnNumber;

  // Check color option
  const drawnColors = determineWinningColors(drawnNumber);
  allWinners.color = drawnColors[0];

  // Check oddEven option
  allWinners.oddEven = drawnNumber % 2 === 0 ? "EVN" : "ODD";

  return allWinners;
}

const numberToColorMap = {
  0: ["-", "-"],
  1: ["RED", "purple"],
  2: ["BLK", "orange"],
  3: ["RED", "white"],
  4: ["BLK", "orange"],
  5: ["RED", "purple"],
  6: ["BLK", "blue"],
  7: ["RED", "white"],
  8: ["BLK", "pink"],
  9: ["RED", "yellow"],
  10: ["BLK", "pink"],
  11: ["BLK", "pink"],
  12: ["RED", "white"],
  13: ["RLK", "blue"],
  14: ["RED", "yellow"],
  15: ["RLK", "orange"],
  16: ["RED", "purple"],
  17: ["RLK", "blue"],
  18: ["RED", "yellow"],
  19: ["RED", "orange"],
  20: ["BLK", "purple"],
  21: ["RED", "orange"],
  22: ["BLK", "yellow"],
  23: ["RED", "pink"],
  24: ["BLK", "purple"],
  25: ["RED", "blue"],
  26: ["BLK", "orange"],
  27: ["RED", "blue"],
  28: ["BLK", "white"],
  29: ["BLK", "yellow"],
  30: ["RED", "pink"],
  31: ["RLK", "yellow"],
  32: ["RED", "orange"],
  33: ["BLK", "purple"],
  34: ["RED", "blue"],
  35: ["BLK", "white"],
  36: ["RED", "pink"],
};

module.exports = ticketController;
