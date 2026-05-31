import { Injectable, NotFoundException } from "@nestjs/common";
import type { PublicEvent } from "@localshow/shared";
import { EventGenre, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { getTicketSalesStatus } from "./ticket-sales";

type PublicEventFilters = {
  query?: string;
  city?: string;
  genre?: string;
  when?: string;
};

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublicEvents(filters: PublicEventFilters = {}): Promise<PublicEvent[]> {
    const now = new Date();
    const where: Prisma.EventWhereInput = {
      status: "PUBLISHED",
      startsAt: {
        gte: now
      }
    };

    const query = filters.query?.trim();
    const city = filters.city?.trim();
    const genre = this.parseGenre(filters.genre);
    const dateWindow = this.getDateWindow(filters.when, now);

    if (query) {
      where.OR = [
        {
          title: {
            contains: query,
            mode: "insensitive"
          }
        },
        {
          description: {
            contains: query,
            mode: "insensitive"
          }
        },
        {
          venue: {
            is: {
              name: {
                contains: query,
                mode: "insensitive"
              }
            }
          }
        },
        {
          venue: {
            is: {
              city: {
                contains: query,
                mode: "insensitive"
              }
            }
          }
        }
      ];
    }

    if (city) {
      where.venue = {
        is: {
          city: {
            contains: city,
            mode: "insensitive"
          }
        }
      };
    }

    if (genre) {
      where.genre = genre;
    }

    if (dateWindow) {
      where.startsAt = {
        gte: dateWindow.start,
        lt: dateWindow.end
      };
    }

    const events = await this.prisma.event.findMany({
      where,
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

    return events.map((event) => ({
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
    }));
  }

  async getPublicEventBySlug(slug: string): Promise<PublicEvent> {
    const event = await this.prisma.event.findFirst({
      where: {
        slug,
        status: "PUBLISHED"
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

  private parseGenre(value?: string): EventGenre | null {
    if (!value) {
      return null;
    }

    const normalized = value.toUpperCase();
    return Object.values(EventGenre).includes(normalized as EventGenre)
      ? (normalized as EventGenre)
      : null;
  }

  private getDateWindow(value: string | undefined, now: Date) {
    if (!value || value === "any") {
      return null;
    }

    const start = new Date(now);

    if (value === "today") {
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start: now > start ? now : start, end };
    }

    if (value === "week") {
      const end = new Date(now);
      end.setDate(end.getDate() + 7);
      return { start: now, end };
    }

    if (value === "month") {
      const end = new Date(now);
      end.setMonth(end.getMonth() + 1);
      return { start: now, end };
    }

    return null;
  }
}
