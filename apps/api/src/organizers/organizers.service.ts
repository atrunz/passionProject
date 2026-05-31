import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicEvent, PublicOrganizer } from "@localshow/shared";
import { getTicketSalesStatus } from "../events/ticket-sales";
import { PrismaService } from "../prisma/prisma.service";

type OrganizerEvent = Awaited<ReturnType<OrganizersService["getOrganizerEvents"]>>[number];

@Injectable()
export class OrganizersService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicOrganizerBySlug(slug: string): Promise<PublicOrganizer> {
    const organizer = await this.prisma.organizer.findUnique({
      where: {
        slug
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true
      }
    });

    if (!organizer) {
      throw new NotFoundException("Organizer not found");
    }

    const events = await this.getOrganizerEvents(organizer.id);

    return {
      ...organizer,
      eventCount: events.length,
      upcomingEvents: events.map((event) => this.toPublicEvent(event))
    };
  }

  private getOrganizerEvents(organizerId: string) {
    return this.prisma.event.findMany({
      where: {
        organizerId,
        status: "PUBLISHED",
        startsAt: {
          gte: new Date()
        }
      },
      include: {
        organizer: true,
        venue: true,
        performers: {
          orderBy: {
            sortOrder: "asc"
          }
        },
        ticketTypes: {
          orderBy: {
            priceCents: "asc"
          }
        }
      },
      orderBy: {
        startsAt: "asc"
      }
    });
  }

  private toPublicEvent(event: OrganizerEvent): PublicEvent {
    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      genre: event.genre,
      posterUrl: event.posterUrl,
      organizerName: event.organizer.name,
      organizerSlug: event.organizer.slug,
      city: event.venue.city,
      state: event.venue.state,
      venueName: event.venue.name,
      startsAt: event.startsAt.toISOString(),
      minPriceCents: event.ticketTypes[0]?.priceCents ?? 0,
      performers: event.performers.map((performer) => ({
        id: performer.id,
        name: performer.name,
        slug: performer.slug
      })),
      ticketTypes: event.ticketTypes.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        priceCents: ticketType.priceCents,
        quantityTotal: ticketType.quantityTotal,
        quantitySold: ticketType.quantitySold,
        quantityAvailable: Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0),
        salesStartAt: ticketType.salesStartAt?.toISOString() ?? null,
        salesEndAt: ticketType.salesEndAt?.toISOString() ?? null,
        salesStatus: getTicketSalesStatus(ticketType)
      }))
    };
  }
}
