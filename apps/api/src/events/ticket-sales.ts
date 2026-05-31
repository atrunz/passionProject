type TicketSalesWindow = {
  salesStartAt: Date | null;
  salesEndAt: Date | null;
};

export type TicketSalesStatus = "ON_SALE" | "NOT_STARTED" | "ENDED";

export function getTicketSalesStatus(
  ticketType: TicketSalesWindow,
  now = new Date()
): TicketSalesStatus {
  if (ticketType.salesStartAt && ticketType.salesStartAt > now) {
    return "NOT_STARTED";
  }

  if (ticketType.salesEndAt && ticketType.salesEndAt < now) {
    return "ENDED";
  }

  return "ON_SALE";
}

export function isTicketOnSale(ticketType: TicketSalesWindow, now = new Date()) {
  return getTicketSalesStatus(ticketType, now) === "ON_SALE";
}
