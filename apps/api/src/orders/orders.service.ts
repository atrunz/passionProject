import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { TicketStatus, User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { CreateOrderDto } from "./dto/create-order.dto";

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createMockOrder(fan: User, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
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

      if (available < dto.quantity) {
        throw new BadRequestException("Not enough tickets available");
      }

      const totalCents = ticketType.priceCents * dto.quantity;

      const order = await tx.order.create({
        data: {
          userId: fan.id,
          eventId: ticketType.eventId,
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
        tickets
      };
    });
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

  private createTicketCode() {
    const random = Math.random().toString(36).slice(2, 10).toUpperCase();
    return `LS-TK-${random}`;
  }
}
