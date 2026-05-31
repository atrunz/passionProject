import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, TicketStatus, User } from "@prisma/client";
import { EmailService } from "../email/email.service";
import { isTicketOnSale } from "../events/ticket-sales";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { TransferTicketDto } from "./dto/transfer-ticket.dto";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async createMockOrder(fan: User, dto: CreateOrderDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const ticketType = await tx.ticketType.findUnique({
        where: {
          id: dto.ticketTypeId
        },
        include: {
          event: true
        }
      });

      if (!ticketType || ticketType.event.status !== "PUBLISHED") {
        throw new NotFoundException("Ticket type not found");
      }

      const available = ticketType.quantityTotal - ticketType.quantitySold;

      if (!isTicketOnSale(ticketType)) {
        throw new BadRequestException("Ticket sales are not currently open");
      }

      if (available < dto.quantity) {
        throw new BadRequestException("Not enough tickets available");
      }

      const performerAttributionId = dto.performerAttributionId
        ? await this.validatePerformerAttribution(tx, ticketType.eventId, dto.performerAttributionId)
        : null;

      const totalCents = ticketType.priceCents * dto.quantity;

      const order = await tx.order.create({
        data: {
          userId: fan.id,
          eventId: ticketType.eventId,
          performerAttributionId,
          status: "PAID",
          totalCents,
          paymentProvider: "mock",
          paymentReference: `mock_${Date.now()}`,
          items: {
            create: {
              ticketTypeId: ticketType.id,
              quantity: dto.quantity,
              unitPriceCents: ticketType.priceCents
            }
          }
        }
      });

      await tx.ticketType.update({
        where: {
          id: ticketType.id
        },
        data: {
          quantitySold: {
            increment: dto.quantity
          }
        }
      });

      const tickets = await Promise.all(
        Array.from({ length: dto.quantity }).map(() =>
          tx.ticket.create({
            data: {
              orderId: order.id,
              ticketTypeId: ticketType.id,
              eventId: ticketType.eventId,
              ownerUserId: fan.id,
              performerAttributionId,
              code: this.createTicketCode(),
              status: TicketStatus.ACTIVE
            },
            include: {
              event: {
                include: {
                  venue: true
                }
              },
              ticketType: true
            }
          })
        )
      );

      return {
        order,
        tickets,
        eventTitle: ticketType.event.title,
        eventId: ticketType.eventId,
        performerAttributionId,
        quantity: dto.quantity,
        totalCents
      };
    });

    await this.emailService.enqueue({
      type: "ORDER_CONFIRMATION",
      toEmail: fan.email,
      subject: `Your tickets for ${result.eventTitle}`,
      bodyText: [
        `You're all set for ${result.eventTitle}.`,
        `Tickets: ${result.quantity}`,
        `Total: $${(result.totalCents / 100).toFixed(2)}`,
        "Open your LocalShow wallet to view QR tickets."
      ].join("\n"),
      metadata: {
        orderId: result.order.id,
        eventId: result.eventId,
        performerAttributionId: result.performerAttributionId,
        ticketIds: result.tickets.map((ticket) => ticket.id)
      }
    });

    return {
      order: result.order,
      tickets: result.tickets
    };
  }

  private async validatePerformerAttribution(
    tx: Prisma.TransactionClient,
    eventId: string,
    performerAttributionId: string
  ) {
    const performer = await tx.eventPerformer.findFirst({
      where: {
        id: performerAttributionId,
        eventId
      },
      select: {
        id: true
      }
    });

    if (!performer) {
      throw new BadRequestException("Performer attribution is not valid for this event");
    }

    return performer.id;
  }

  async listMyTickets(fan: User) {
    return this.prisma.ticket.findMany({
      where: {
        ownerUserId: fan.id
      },
      include: {
        event: {
          include: {
            venue: true
          }
        },
        ticketType: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async getMyTicket(fan: User, ticketId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        ownerUserId: fan.id
      },
      include: {
        event: {
          include: {
            venue: true
          }
        },
        ticketType: true,
        order: true
      }
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found");
    }

    return ticket;
  }

  async transferTicket(fan: User, ticketId: string, dto: TransferTicketDto) {
    const recipientEmail = dto.recipientEmail.trim().toLowerCase();

    if (recipientEmail === fan.email.toLowerCase()) {
      throw new BadRequestException("You already own this ticket");
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findFirst({
        where: {
          id: ticketId,
          ownerUserId: fan.id
        },
        include: {
          event: {
            include: {
              venue: true
            }
          },
          ticketType: true,
          order: true
        }
      });

      if (!ticket) {
        throw new NotFoundException("Ticket not found");
      }

      if (ticket.status !== TicketStatus.ACTIVE) {
        throw new BadRequestException("Only active tickets can be transferred");
      }

      const recipient = await tx.user.upsert({
        where: {
          email: recipientEmail
        },
        update: {
          name: dto.recipientName?.trim() || undefined
        },
        create: {
          clerkUserId: this.createPendingTransferClerkId(recipientEmail),
          email: recipientEmail,
          name: dto.recipientName?.trim() || null,
          role: "FAN"
        }
      });

      const updatedTicket = await tx.ticket.update({
        where: {
          id: ticket.id
        },
        data: {
          ownerUserId: recipient.id
        },
        include: {
          event: {
            include: {
              venue: true
            }
          },
          ticketType: true,
          order: true,
          owner: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      return {
        updatedTicket,
        recipient,
        originalTicket: ticket
      };
    });

    await this.emailService.enqueue({
      type: "TICKET_TRANSFER_SENT",
      toEmail: fan.email,
      subject: `Ticket transferred for ${result.originalTicket.event.title}`,
      bodyText: [
        `You transferred ${result.originalTicket.ticketType.name} for ${result.originalTicket.event.title}.`,
        `Recipient: ${result.recipient.email}`,
        `Ticket code: ${result.originalTicket.code}`
      ].join("\n"),
      metadata: {
        ticketId: result.originalTicket.id,
        eventId: result.originalTicket.eventId,
        recipientUserId: result.recipient.id
      }
    });

    await this.emailService.enqueue({
      type: "TICKET_TRANSFER_RECEIVED",
      toEmail: result.recipient.email,
      subject: `You received a ticket for ${result.originalTicket.event.title}`,
      bodyText: [
        `${fan.name ?? fan.email} sent you ${result.originalTicket.ticketType.name} for ${result.originalTicket.event.title}.`,
        `Location: ${result.originalTicket.event.venue.name}, ${result.originalTicket.event.venue.city}, ${result.originalTicket.event.venue.state}`,
        `Ticket code: ${result.originalTicket.code}`,
        "Create or sign into your LocalShow account with this email to claim the ticket."
      ].join("\n"),
      metadata: {
        ticketId: result.originalTicket.id,
        eventId: result.originalTicket.eventId,
        senderUserId: fan.id
      }
    });

    return result.updatedTicket;
  }

  private createTicketCode() {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `LS-TK-${random}`;
  }

  private createPendingTransferClerkId(email: string) {
    const normalized = email.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    return `pending_transfer_${normalized}`;
  }
}
