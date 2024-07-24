const Slip = require('../models/tickets');

const generateShopDateReport = async (shop, reportDate) => {

  try {
    // Fetch shop details
    // const shop = await Shop.query().findById(shopId);

    if (!shop) {
      throw new Error('Shop not found');
    }

    // Fetch tickets sold by the shop on the specified date
    const tickets = await Slip.query()
      .where('shopId', shop.id)
      .whereNot('status', 'canceled')
      .whereRaw('DATE(created_at) = ?', [reportDate])
      .withGraphFetched('game');
    // Calculate report data
    let totalTickets = tickets.length;
    let revokedCount = 0;
    let payoutCount = 0;
    let totalStake = 0;
    let totalPayout = 0;
    let totalRevoked = 0;

    tickets.forEach(ticket => {
      totalStake += parseInt(ticket.game.stake); // Assuming netWinning represents stake
      if (ticket.status === 'redeemed') {
        payoutCount++;
        totalPayout += parseInt(ticket.netWinning);
      } else if (ticket.status === 'canceled') {
        revokedCount++;
        totalRevoked += parseInt(ticket.game.stake);
      }
    });

    // Construct the report object
    const report = {
      date: reportDate,
      totalTickets: totalTickets,
      totalStake: totalStake,
      revokedCount: revokedCount,
      payoutCount: payoutCount,
      totalPayout: totalPayout,
      totalRevoked: totalRevoked,
      totalNetBalance: totalStake - totalPayout - totalRevoked
    };

    return report;
  } catch (error) {
    throw error;
  }
}

module.exports = { generateShopDateReport };