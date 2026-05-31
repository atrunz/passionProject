import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CheckInResult, TicketStatus, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class CheckinsService {
  constructor(private readonly prisma: PrismaService) {}

  async checkInTicket(checkedInBy: User, ticketCode: string, eventId: string) {
    const normalizedCode = ticketCode.trim().toUpperCase();
    const selectedEvent = await this.findCheckInEvent(checkedInBy, eventId);

    const ticket = await this.prisma.ticket.findUnique({
      where: {
        code: normalizedCode
      },
      include: {
        event: {
          include: {
            venue: true
          }
        },
        ticketType: true
      }
    });

    if (!ticket) {
      return {
        result: CheckInResult.INVALID,
        message: "Ticket code not found"
      };
    }

    if (ticket.eventId !== selectedEvent.id) {
      return {
        result: CheckInResult.INVALID,
        message: `Ticket is for ${ticket.event.title}, not ${selectedEvent.title}`,
        ticket
      };
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      await this.writeCheckInAudit(ticket.id, ticket.eventId, checkedInBy.id, CheckInResult.ALREADY_CHECKED_IN);

      return {
        result: CheckInResult.ALREADY_CHECKED_IN,
        message: "Ticket has already been checked in",
        ticket
      };
    }

    if (ticket.status === TicketStatus.VOID) {
      await this.writeCheckInAudit(ticket.id, ticket.eventId, checkedInBy.id, CheckInResult.VOID);

      return {
        result: CheckInResult.VOID,
        message: "Ticket is void",
        ticket
      };
    }

    const checkedInTicket = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.ticket.update({
        where: {
          id: ticket.id
        },
        data: {
          status: TicketStatus.CHECKED_IN,
          checkedInAt: new Date(),
          checkedInByUserId: checkedInBy.id
        },
        include: {
          event: {
            include: {
              venue: true
            }
          },
          ticketType: true
        }
      });

      await tx.checkIn.create({
        data: {
          ticketId: ticket.id,
          eventId: ticket.eventId,
          checkedInByUserId: checkedInBy.id,
          result: CheckInResult.SUCCESS
        }
      });

      return updated;
    });

    return {
      result: CheckInResult.SUCCESS,
      message: "Ticket checked in",
      ticket: checkedInTicket
    };
  }

  private async writeCheckInAudit(
    ticketId: string,
    eventId: string,
    checkedInByUserId: string,
    result: CheckInResult
  ) {
    await this.prisma.checkIn.create({
      data: {
        ticketId,
        eventId,
        checkedInByUserId,
        result
      }
    });
  }

  private async findCheckInEvent(checkedInBy: User, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        status: "PUBLISHED",
        ...(checkedInBy.role === "ADMIN"
          ? {}
          : {
              organizer: {
                ownerUserId: checkedInBy.id
              }
            })
      },
      select: {
        id: true,
        title: true
      }
    });

    if (!event) {
      if (checkedInBy.role === "ADMIN") {
        throw new NotFoundException("Check-in event not found");
      }

      throw new ForbiddenException("You can only check in tickets for your own events");
    }

    return event;
  }
}
