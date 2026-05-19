import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus } from "@prisma/client";
import { uniqueSlug } from "../common/slug";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateOrganizerDto } from "./dto/update-organizer.dto";

const DEV_ORGANIZER_SLUG = "localshow-demo";
const DEV_ORGANIZER_EMAIL = "organizer@localshow.test";

@Injectable()
export class OrganizerService {
  constructor(private readonly prisma: PrismaService) {}

  async getDevOrganizer() {
    const owner = await this.prisma.user.upsert({
      where: {
        email: DEV_ORGANIZER_EMAIL
      },
      update: {},
      create: {
        clerkUserId: "seed_clerk_organizer",
        email: DEV_ORGANIZER_EMAIL,
        name: "Demo Organizer",
        role: "ORGANIZER"
      }
    });

    const organizer = await this.prisma.organizer.findUnique({
      where: {
        ownerUserId: owner.id
      }
    });

    if (organizer) {
      return organizer;
    }

    return this.prisma.organizer.create({
      data: {
        ownerUserId: owner.id,
        name: "LocalShow Demo Collective",
        slug: DEV_ORGANIZER_SLUG,
        description: "Development organizer used until Clerk auth is connected."
      }
    });
  }

  async updateOrganizer(dto: UpdateOrganizerDto) {
    const organizer = await this.getDevOrganizer();

    const slugOwner = await this.prisma.organizer.findUnique({
      where: {
        slug: dto.slug
      }
    });

    if (slugOwner && slugOwner.id !== organizer.id) {
      throw new BadRequestException("Organizer slug is already taken");
    }

    return this.prisma.organizer.update({
      where: {
        id: organizer.id
      },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description?.trim() || null
      }
    });
  }

  async listVenues() {
    const organizer = await this.getDevOrganizer();

    return this.prisma.venue.findMany({
      where: {
        organizerId: organizer.id
      },
      orderBy: {
        name: "asc"
      }
    });
  }

  async createVenue(dto: CreateVenueDto) {
    const organizer = await this.getDevOrganizer();

    return this.prisma.venue.create({
      data: {
        organizerId: organizer.id,
        name: dto.name,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        capacity: dto.capacity
      }
    });
  }

  async listEvents() {
    const organizer = await this.getDevOrganizer();

    return this.prisma.event.findMany({
      where: {
        organizerId: organizer.id
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
  }

  async getSummary() {
    const organizer = await this.getDevOrganizer();

    const [venueCount, eventCount, publishedEventCount, orders, ticketCount, checkedInTicketCount] =
      await Promise.all([
        this.prisma.venue.count({
          where: {
            organizerId: organizer.id
          }
        }),
        this.prisma.event.count({
          where: {
            organizerId: organizer.id
          }
        }),
        this.prisma.event.count({
          where: {
            organizerId: organizer.id,
            status: "PUBLISHED"
          }
        }),
        this.prisma.order.findMany({
          where: {
            event: {
              organizerId: organizer.id
            },
            status: "PAID"
          },
          select: {
            totalCents: true
          }
        }),
        this.prisma.ticket.count({
          where: {
            event: {
              organizerId: organizer.id
            }
          }
        }),
        this.prisma.ticket.count({
          where: {
            event: {
              organizerId: organizer.id
            },
            status: "CHECKED_IN"
          }
        })
      ]);

    const grossRevenueCents = orders.reduce((total, order) => total + order.totalCents, 0);

    return {
      organizerId: organizer.id,
      venueCount,
      eventCount,
      publishedEventCount,
      paidOrderCount: orders.length,
      ticketCount,
      checkedInTicketCount,
      grossRevenueCents
    };
  }

  async createEvent(dto: CreateEventDto) {
    const organizer = await this.getDevOrganizer();

    const venue = await this.prisma.venue.findFirst({
      where: {
        id: dto.venueId,
        organizerId: organizer.id
      }
    });

    if (!venue) {
      throw new NotFoundException("Venue not found for organizer");
    }

    const startsAt = new Date(dto.startsAt);
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : null;

    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException("Event end time must be after start time");
    }

    const event = await this.prisma.event.create({
      data: {
        organizerId: organizer.id,
        venueId: venue.id,
        title: dto.title,
        slug: uniqueSlug(dto.title),
        description: dto.description,
        genre: dto.genre,
        startsAt,
        endsAt,
        status: dto.status ?? EventStatus.PUBLISHED,
        ticketTypes: {
          create: dto.ticketTypes.map((ticketType) => ({
            name: ticketType.name,
            priceCents: ticketType.priceCents,
            quantityTotal: ticketType.quantityTotal
          }))
        }
      },
      include: {
        venue: true,
        ticketTypes: true
      }
    });

    return event;
  }
}
