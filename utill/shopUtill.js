const logger = require("../logger");
const Shop = require("../models/shop");

const resetShopLimit = async () => {
  try {
    await Shop.query().update({
      currentLimit: Shop.raw('??', 'defaultLimit')
    });
    logger.info("Shop limit reset! ")
  } catch (e) {
    console.log("error", e);

    logger.error("Failed to reset limit! ")
  }
}

module.exports = { resetShopLimit }