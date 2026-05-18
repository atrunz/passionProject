import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicEvent } from "@localshow/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicEvents(): Promise<PublicEvent[]> {
    const events = await this.prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        startsAt: {
          gte: new Date()
        }
      },
      include: {
        venue: true,
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

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      genre: event.genre,
      city: event.venue.city,
      state: event.venue.state,
      venueName: event.venue.name,
      startsAt: event.startsAt.toISOString(),
      minPriceCents: event.ticketTypes[0]?.priceCents ?? 0,
      ticketTypes: event.ticketTypes.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        priceCents: ticketType.priceCents,
        quantityTotal: ticketType.quantityTotal,
        quantitySold: ticketType.quantitySold,
        quantityAvailable: Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0)
      }))
    }));
  }

  async getPublicEventBySlug(slug: string): Promise<PublicEvent> {
    const event = await this.prisma.event.findFirst({
      where: {
        slug,
        status: "PUBLISHED"
      },
      include: {
        venue: true,
        ticketTypes: {
          orderBy: {
            priceCents: "asc"
          }
        }
      }
    });

    if (!event) {
      throw new NotFoundException("Event not found");
    }

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      genre: event.genre,
      city: event.venue.city,
      state: event.venue.state,
      venueName: event.venue.name,
      startsAt: event.startsAt.toISOString(),
      minPriceCents: event.ticketTypes[0]?.priceCents ?? 0,
      ticketTypes: event.ticketTypes.map((ticketType) => ({
        id: ticketType.id,
        name: ticketType.name,
        priceCents: ticketType.priceCents,
        quantityTotal: ticketType.quantityTotal,
        quantitySold: ticketType.quantitySold,
        quantityAvailable: Math.max(ticketType.quantityTotal - ticketType.quantitySold, 0)
      }))
    };
  }
}
