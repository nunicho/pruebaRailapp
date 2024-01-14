const ticketRepository = require("../dao/repository/tickets.repository.js");

function generateTicketCode() {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();
  const randomPart = Math.random().toString(36).substring(2, 8);
  const ticketCode = `${timestamp}${randomPart}`;
  return ticketCode;
}

async function createTicket(amount, purchaserEmail) {
  const ticketCode = generateTicketCode();
  const purchaseDatetime = new Date();

  const ticketData = {
    code: ticketCode,
    purchase_datetime: purchaseDatetime,
    amount,
    purchaser: purchaserEmail,
  };

  const ticketInsertado = await ticketRepository.createTicket(ticketData);
  return ticketInsertado;
}

module.exports = {
  generateTicketCode,
  createTicket,
};

