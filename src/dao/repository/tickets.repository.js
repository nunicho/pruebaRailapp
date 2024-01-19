const ticketMongoDao = require("../Mongo/ticketsMongoDao");

async function createTicket(ticketData) {
  return ticketMongoDao.createTicket(ticketData);
}

module.exports = {
  createTicket,
};
