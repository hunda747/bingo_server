const DailyReport = require("../models/dailyReport");
const Cashier = require("../models/cashier");
const Slip = require("../models/tickets");
const Shop = require("../models/shop");
const { generateShopDateReport } = require('../utill/reportUtill');

const moment = require("moment");

const createDailyReport = async (req, res) => {
  try {
    const { reportDate } = req.body;
    // Use the report generation logic here
    const generatedReport = await generateDailyReport(reportDate, res);

    if (generatedReport) {
      res
        .status(201)
        .json({ message: `Report for ${reportDate} is generated!` });
    } else {
      res.status(400).send("error");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function getStartAndEndOfDay(timezoneOffset = 0) {
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
const generateDailyReport = async (reportDate, res) => {
  try {
    // Fetch all cashiers
    const shops = await Shop.query()
      .select("id", "shopOwnerId")
      .withGraphFetched("owner");

    const { startOfDay, endOfDay } = getStartAndEndOfDay(0);

    // Loop through each cashier and generate a report
    const dailyReports = await Promise.all(
      shops.map(async (shop) => {
        const existingReport = await DailyReport.query()
          .where({
            reportDate,
            shopId: shop.id,
          })
          .first();

        let { totalTickets, totalStake, totalPayout, payoutCount, revokedCount, totalRevoked, totalNetBalance
        } = await generateShopDateReport(shop, reportDate)

        if (existingReport) {
          const updateDailyReport = await DailyReport.query().patchAndFetchById(
            existingReport.id,
            {
              reportDate,
              shopId: shop.id,
              shopOwnerId: shop.owner.id,
              totalTickets: totalTickets - revokedCount,
              active: parseInt(totalTickets) > 0,
              totalStake: parseInt(totalStake) - parseInt(totalRevoked),
              totalPayout: totalPayout,
              totalPayoutCount: payoutCount,
              totalRevoked: totalRevoked,
              totalRevokedCount: revokedCount,
              totalNetBalance: totalNetBalance,
            }
          );

          return updateDailyReport;
          // return res.status(400).json({ error: "The report for this date is already generated! " })
        } else {
          // Create an entry in the 'daily_reports' table
          const newDailyReport = await DailyReport.query().insert({
            reportDate,
            shopId: shop.id,
            shopOwnerId: shop.owner.id,
            totalTickets: totalTickets - revokedCount,
            active: parseInt(totalTickets) > 0,
            totalStake: parseInt(totalStake) - parseInt(totalRevoked),
            totalPayout: totalPayout,
            totalPayoutCount: payoutCount,
            totalRevoked: totalRevoked,
            totalRevokedCount: revokedCount,
            totalNetBalance: totalNetBalance,
          });
          return newDailyReport;
        }
      })
    );

    return dailyReports;
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};


const getQueryRedeemed = async (id, startOfDay, endOfDay) => {
  return await Slip.query()
    .where("redeemCashierId", id)
    // .where("cashierId", id)
    .andWhere("redeemDate", ">=", startOfDay)
    .andWhere("redeemDate", "<", endOfDay)
    .andWhere("status", 'redeemed')
    .select(
      Slip.raw("COALESCE(SUM(netWinning), 0) as amount"),
      Slip.raw("COALESCE(COUNT(*), 0) as number")
    )
    // .sum('totalStake as amount')
    // .count('id as number')
    .first();
};

const generateDailyReportForShop = async (reportDate, shopId, gameType) => {
  try {
    // Fetch all cashiers
    const cashiers = await Cashier.query().where("shopId", shopId)
      .select("id", "shopId")
      .withGraphFetched("shop");
    const timezoneOffset = 0; // Set the time zone offset to 0 for UTC

    const startOfDay = new Date(`${reportDate}T00:00:00.000Z`);
    startOfDay.setMinutes(startOfDay.getMinutes() - timezoneOffset);

    const endOfDay = new Date(`${reportDate}T23:59:59.999Z`);
    endOfDay.setMinutes(endOfDay.getMinutes() - timezoneOffset);

    // Loop through each cashier and generate a report
    const dailyReports = await Promise.all(
      cashiers.map(async (cashier) => {
        const cashierReport = await Cashier.query()
          .findById(cashier.id)
          .withGraphFetched("[tickets]")
          .modifyGraph("tickets", (builder) => {
            builder.where("created_at", ">=", startOfDay);
            builder.where("created_at", "<=", endOfDay);
            builder.where("gameType", gameType);
            builder.select(
              Slip.raw("SUM(totalStake) as stake"),
              Slip.raw(
                'SUM(CASE WHEN status = "active" THEN totalStake ELSE 0 END) as active'
              ),
              Slip.raw(
                'SUM(CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END) as payout'
              ),
              Slip.raw(
                'SUM(CASE WHEN status = "redeem" AND netWinning > 0 THEN netWinning ELSE 0 END) as unclaimed'
              ),
              Slip.raw(
                'SUM(CASE WHEN status = "canceled" THEN totalStake ELSE 0 END) as revoked'
              ),
            );
          });


        // Extract the relevant data from the cashier report
        // console.log('report: ', cashierReport.slips[0]);
        const {
          stake = 0,
          active = 0,
          revoked = 0,
          payout = 0,
          unclaimed = 0,
        } = cashierReport.tickets[0] || {}; // Assuming there is always one slip entry
        // console.log(payout, unclaimed, redeem);
        const updateDailyReport = {
          totalStake: parseInt(stake) - parseInt(revoked) - parseInt(active),
          totalGGR: parseInt(stake) - parseInt(active) - parseInt(payout) - parseInt(unclaimed) - parseInt(revoked),
          totalActive: parseInt(active)
        }

        return updateDailyReport;
      })
    );
    // console.log(dailyReports);

    return dailyReports;
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

const findActiveTickets = async (gameId, shopId) => {
  try {
    const result = await Slip.query()
      .select([
        'slips.totalStake',
      ])
      .sum('slips.totalStake as total')
      .where('slips.gameId', gameId)
      .andWhere('slips.shopId', shopId)
      .andWhere('slips.gameType', 'spin')
      .andWhere('slips.status', 'active')
      .first();

    return result.total;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

const reportForCashier = async (cashier, reportDate) => {
  const startOfDay = new Date(reportDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(reportDate);
  endOfDay.setHours(23, 59, 59, 999);

  const cashierReport = await Cashier.query()
    .findById(cashier.id)
    .withGraphFetched("[tickets]")
    .modifyGraph("tickets", (builder) => {
      builder.where("created_at", ">=", startOfDay);
      builder.where("created_at", "<=", endOfDay);
      builder.select(
        Slip.raw("COUNT(*) as tickets"),
        Slip.raw("SUM(totalStake) as stake"),
        Slip.raw(
          'SUM(CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END) as payout'
        ),
        Slip.raw(
          'COUNT(CASE WHEN status = "redeemed" THEN netWinning ELSE 0 END) as payoutCount'
        ),
        Slip.raw(
          'SUM(CASE WHEN status = "redeem" THEN netWinning ELSE 0 END) as unclaimed'
        ),
        Slip.raw(
          'COUNT(CASE WHEN status = "redeem" AND netWinning > 0 THEN 1 ELSE NULL END) as unclaimedCount'
        ),
        Slip.raw(
          'SUM(CASE WHEN status = "canceled" THEN totalStake ELSE 0 END) as revoked'
        ),
        Slip.raw(
          'COUNT(CASE WHEN status = "canceled" THEN 1 END) as revokedCount'
        )
      );
    });

  // Extract the relevant data from the cashier report
  // console.log(cashierReport.slips[0]);
  return cashierReport.tickets[0];
};

const getDailyReports = async (req, res) => {
  try {
    const dailyReports = await DailyReport.query();

    res.status(200).json(dailyReports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getDailyReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const dailyReport = await DailyReport.query().findById(id);

    if (dailyReport) {
      res.status(200).json(dailyReport);
    } else {
      res.status(404).json({ error: "Daily Report not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteDailyReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCount = await DailyReport.query().deleteById(id);

    if (deletedCount > 0) {
      res.status(204).end();
    } else {
      res.status(404).json({ error: "Daily Report not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

function getCurrentDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
}

const generateShopCount = async (req, res) => {
  const currentDate = new Date();
  const shops = await Shop.query().count("id as count").first();

  const startOfDayTime = moment(currentDate).startOf("day").toDate();
  const endOfDayTime = moment(currentDate).endOf("day").toDate();
  // console.log(startOfDayTime.toLocaleString());
  // console.log(endOfDayTime.toLocaleString());
  const activeshops = await Slip.query()
    .where("created_at", ">=", startOfDayTime)
    .andWhere("created_at", "<", endOfDayTime)
    // .groupBy("shopId") // Group by shopId to get distinct counts
    .countDistinct("shopId as count")
    // .count("shopId as count")
    .first();

  return res
    .status(200)
    .json({ totalShop: shops.count, activeshops: activeshops.count });
};

function formatDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}`;
}

const generateCashierReport = async (req, res) => {
  const { startDate, endDate, shopId, shopOwnerId } = req.body;
  // Check if the current date should be included
  const currentDate = new Date();
  const currentDayIncluded =
    startDate &&
    endDate &&
    currentDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
    currentDate <= new Date(endDate).setHours(23, 59, 59, 999);
  // console.log("uinc: ", currentDayIncluded);
  // If the current date should be included, generate the daily report for today
  if (currentDayIncluded) {
    const todayData = await generateDailyReport(getCurrentDate());
    // console.log('included', todayData);
    // query = query.union(todayData);
  }

  try {
    // let query = DailyReport.query();
    let query = DailyReport.query().select(
      "shopId",
      "shopOwnerId",
      "active",
      DailyReport.raw("SUM(totalTickets) as totalTickets"),
      DailyReport.raw("SUM(totalStake) as totalStake"),
      DailyReport.raw("SUM(totalPayout) as totalPayout"),
      DailyReport.raw("SUM(totalPayoutCount) as totalPayoutCount"),
      DailyReport.raw("SUM(totalUnclaimed) as totalUnclaimed"),
      DailyReport.raw("SUM(totalUnclaimedCount) as totalUnclaimedCount"),
      DailyReport.raw("SUM(totalRevoked) as totalRevoked"),
      DailyReport.raw("SUM(totalRevokedCount) as totalRevokedCount"),
      DailyReport.raw("SUM(totalGGR) as totalGGR"),
      DailyReport.raw("SUM(totalNetBalance) as totalNetBalance")
    );

    // Add conditions based on optional parameters
    if (startDate) {
      const startOfDayTime = new Date(startDate);
      startOfDayTime.setHours(0, 0, 0, 0);
      query = query.where("reportDate", ">=", startOfDayTime);
    }

    if (endDate) {
      const endOfDayTime = new Date(endDate);
      endOfDayTime.setHours(23, 59, 59, 999);
      query = query.where("reportDate", "<=", endOfDayTime);
    }

    if (shopId && shopId.length) {
      query = query.whereIn("shopId", shopId);
    }

    if (shopOwnerId && shopOwnerId.length) {
      query = query.whereIn("shopOwnerId", shopOwnerId);
    }

    const shopReports = await query
      .groupBy("cashierId")
      .withGraphFetched("cashier")
      .withGraphFetched("shop")
      .withGraphFetched("shopOwner");

    return res.status(200).json(shopReports);
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

const generateSubAgentCashierReport = async (req, res) => {
  const { startDate, endDate, shopId, subAgentId } = req.body;
  // Check if the current date should be included
  const currentDate = new Date();
  const currentDayIncluded =
    startDate &&
    endDate &&
    currentDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
    currentDate <= new Date(endDate).setHours(23, 59, 59, 999);
  // console.log("uinc: ", currentDayIncluded);
  // If the current date should be included, generate the daily report for today
  if (currentDayIncluded) {
    const todayData = await generateDailyReport(getCurrentDate());
    // console.log('included', todayData);
    // query = query.union(todayData);
  }

  try {
    // let query = DailyReport.query();
    let query = DailyReport.query().join(
      "sub_agent_shops",
      "daily_reports.shopId",
      "=",
      "sub_agent_shops.shopId"
    )
      .where("sub_agent_shops.subAgentId", subAgentId).select(
        "daily_reports.shopId",
        "daily_reports.shopOwnerId",
        "active",
        DailyReport.raw("SUM(totalTickets) as totalTickets"),
        DailyReport.raw("SUM(totalStake) as totalStake"),
        DailyReport.raw("SUM(totalPayout) as totalPayout"),
        DailyReport.raw("SUM(totalPayoutCount) as totalPayoutCount"),
        DailyReport.raw("SUM(totalUnclaimed) as totalUnclaimed"),
        DailyReport.raw("SUM(totalUnclaimedCount) as totalUnclaimedCount"),
        DailyReport.raw("SUM(totalRevoked) as totalRevoked"),
        DailyReport.raw("SUM(totalRevokedCount) as totalRevokedCount"),
        DailyReport.raw("SUM(totalGGR) as totalGGR"),
        DailyReport.raw("SUM(totalNetBalance) as totalNetBalance")
      );

    // Add conditions based on optional parameters
    if (startDate) {
      const startOfDayTime = new Date(startDate);
      startOfDayTime.setHours(0, 0, 0, 0);
      query = query.where("reportDate", ">=", startOfDayTime);
    }

    if (endDate) {
      const endOfDayTime = new Date(endDate);
      endOfDayTime.setHours(23, 59, 59, 999);
      query = query.where("reportDate", "<=", endOfDayTime);
    }

    if (shopId && shopId.length) {
      query = query.whereIn("daily_reports.shopId", shopId);
    }

    const shopReports = await query
      .groupBy("cashierId")
      .withGraphFetched("cashier")
      .withGraphFetched("shop")
      .withGraphFetched("shopOwner");

    return res.status(200).json(shopReports);
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

const generateShopReport = async (req, res) => {
  const { startDate, endDate, shopId, shopOwnerId } = req.body;
  // Check if the current date should be included
  const currentDate = new Date();
  const currentDayIncluded =
    startDate &&
    endDate &&
    currentDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
    currentDate <= new Date(endDate).setHours(23, 59, 59, 999);
  // console.log("uinc: ", currentDayIncluded);
  // If the current date should be included, generate the daily report for today
  if (currentDayIncluded) {
    const todayData = await generateDailyReport(getCurrentDate());
    // console.log('included', todayData);
    // query = query.union(todayData);
  }

  try {
    let query = DailyReport.query().select(
      "shopId",
      "shopOwnerId",
      DailyReport.raw("SUM(totalTickets) as totalTickets"),
      DailyReport.raw("SUM(totalStake) as totalStake"),
      DailyReport.raw("COUNT(DISTINCT CASE WHEN active THEN shopId END) as activeShops"),
      DailyReport.raw("SUM(totalPayout) as totalPayout"),
      DailyReport.raw("SUM(totalPayoutCount) as totalPayoutCount"),
      DailyReport.raw("SUM(totalRevoked) as totalRevoked"),
      DailyReport.raw("SUM(totalRevokedCount) as totalRevokedCount"),
      DailyReport.raw("SUM(totalNetBalance) as totalNetBalance")
    );

    // Add conditions based on optional parameters
    if (startDate) {
      const startOfDayTime = new Date(startDate);
      startOfDayTime.setHours(0, 0, 0, 0);
      query = query.where("reportDate", ">=", startOfDayTime);
    }

    if (endDate) {
      const endOfDayTime = new Date(endDate);
      endOfDayTime.setHours(23, 59, 59, 999);
      query = query.where("reportDate", "<=", endOfDayTime);
    }

    if (shopId && shopId.length) {
      // Assuming there is a relationship between DailyReport and Shop
      query = query.whereIn("shopId", shopId);
    }

    if (shopOwnerId && shopOwnerId.length) {
      // Assuming there is a relationship between DailyReport, Shop, and ShopOwner
      query = query.whereIn("shopOwnerId", shopOwnerId);
    }

    const shopReports = await query
      .groupBy("shopId")
      .withGraphFetched("shop")
      .withGraphFetched("shopOwner");

    return res.status(200).json(shopReports);
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

const getTodayShopReport = async (startDate, endDate, shopId, gameType) => {
  // Check if the current date should be included
  if (!shopId) {
    return res.status(400).json({ error: 'shop id is missing.' })
  }
  try {
    // console.log(startDate, endDate, shopId);
    const todayData = await generateDailyReportForShop(getCurrentDate(), shopId, gameType);
    // console.log(todayData);
    const totalStake =
      todayData.reduce((sum, slip) => sum + parseInt(slip.totalStake), 0)
    const totalGGR =
      todayData.reduce((sum, slip) => sum + parseInt(slip.totalGGR), 0)
    const totalActive =
      todayData.reduce((sum, slip) => sum + parseInt(slip.totalActive), 0)

    // let query = DailyReport.query().select(
    //   "shopId",
    //   "shopOwnerId",
    //   DailyReport.raw("SUM(totalTickets) as totalTickets"),
    //   DailyReport.raw("SUM(totalStake) as totalStake"),
    //   DailyReport.raw("COUNT(DISTINCT CASE WHEN active THEN cashierId END) as activeShops"),
    //   DailyReport.raw("SUM(totalPayout) as totalPayout"),
    //   DailyReport.raw("SUM(totalPayoutCount) as totalPayoutCount"),
    //   DailyReport.raw("SUM(totalUnclaimed) as totalUnclaimed"),
    //   DailyReport.raw("SUM(totalUnclaimedCount) as totalUnclaimedCount"),
    //   DailyReport.raw("SUM(totalRevoked) as totalRevoked"),
    //   DailyReport.raw("SUM(totalRevokedCount) as totalRevokedCount"),
    //   DailyReport.raw("SUM(totalGGR) as totalGGR"),
    //   DailyReport.raw("SUM(totalNetBalance) as totalNetBalance")
    // );

    // // Add conditions based on optional parameters
    // if (startDate) {
    //   const startOfDayTime = new Date(startDate);
    //   startOfDayTime.setHours(0, 0, 0, 0);
    //   query = query.where("reportDate", ">=", startOfDayTime);
    // }

    // if (endDate) {
    //   const endOfDayTime = new Date(endDate);
    //   endOfDayTime.setHours(23, 59, 59, 999);
    //   query = query.where("reportDate", "<=", endOfDayTime);
    // }

    // if (shopId && shopId.length) {
    //   // Assuming there is a relationship between DailyReport and Shop
    //   query = query.where("shopId", shopId);
    // }

    // const shopReports = await query
    //   .groupBy("shopId").where("shopId", shopId)
    //   .withGraphFetched("shop")
    //   .withGraphFetched("shopOwner").first();
    // console.log(shopReports);
    return ({ ggr: totalGGR, stake: totalStake, active: totalActive });
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

const generateShopAgentReport = async (req, res) => {
  const { startDate, endDate, shopId, subAgentId } = req.body;
  // Check if the current date should be included
  const currentDate = new Date();
  const currentDayIncluded =
    startDate &&
    endDate &&
    currentDate >= new Date(startDate).setHours(0, 0, 0, 0) &&
    currentDate <= new Date(endDate).setHours(23, 59, 59, 999);
  // console.log("uinc: ", currentDayIncluded);
  // If the current date should be included, generate the daily report for today
  if (currentDayIncluded) {
    const todayData = await generateDailyReport(getCurrentDate());
    // console.log('included', todayData);
    // query = query.union(todayData);
  }

  try {
    let query = DailyReport.query()
      .join(
        "sub_agent_shops",
        "daily_reports.shopId",
        "=",
        "sub_agent_shops.shopId"
      )
      .where("sub_agent_shops.subAgentId", subAgentId)
      .select(
        "daily_reports.shopId",
        "daily_reports.shopOwnerId",
        "active",
        DailyReport.raw("SUM(totalTickets) as totalTickets"),
        DailyReport.raw("SUM(totalStake) as totalStake"),
        DailyReport.raw("SUM(totalPayout) as totalPayout"),
        DailyReport.raw("SUM(totalPayoutCount) as totalPayoutCount"),
        DailyReport.raw("SUM(totalUnclaimed) as totalUnclaimed"),
        DailyReport.raw("SUM(totalUnclaimedCount) as totalUnclaimedCount"),
        DailyReport.raw("SUM(totalRevoked) as totalRevoked"),
        DailyReport.raw("SUM(totalRevokedCount) as totalRevokedCount"),
        DailyReport.raw("SUM(totalGGR) as totalGGR"),
        DailyReport.raw("SUM(totalNetBalance) as totalNetBalance")
      );

    // Add conditions based on optional parameters
    if (startDate) {
      const startOfDayTime = new Date(startDate);
      startOfDayTime.setHours(0, 0, 0, 0);
      query = query.where("reportDate", ">=", startOfDayTime);
    }

    if (endDate) {
      const endOfDayTime = new Date(endDate);
      endOfDayTime.setHours(23, 59, 59, 999);
      query = query.where("reportDate", "<=", endOfDayTime);
    }

    if (shopId && shopId.length) {
      // Assuming there is a relationship between DailyReport and Shop
      query = query.whereIn("daily_reports.shopId", shopId);
    }

    const shopReports = await query
      .groupBy("shopId")
      .withGraphFetched("shop")
      .withGraphFetched("shopOwner");

    return res.status(200).json(shopReports);
  } catch (error) {
    console.error(error);
    throw error; // Rethrow the error for handling at a higher level
  }
};

module.exports = {
  deleteDailyReport,
  generateShopCount,
  getCurrentDate,
  getDailyReports,
  createDailyReport,
  getDailyReportById,
  generateShopReport,
  getTodayShopReport,
  generateDailyReport,
  findActiveTickets,
  generateCashierReport,
  generateSubAgentCashierReport,
  generateShopAgentReport,
};
