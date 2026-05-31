import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus, TicketStatus, User, Venue } from "@prisma/client";
import { uniqueSlug } from "../common/slug";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { UpdateOrganizerDto } from "./dto/update-organizer.dto";

@Injectable()
export class OrganizerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

  async getOrganizerForUser(owner: User) {
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
        name: owner.name ? `${owner.name}'s Organizer Account` : "New LocalShow Organizer",
        slug: await this.createOrganizerSlug(owner),
        description: null
      }
    });
  }

  async updateOrganizer(owner: User, dto: UpdateOrganizerDto) {
    const organizer = await this.getOrganizerForUser(owner);

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

  async listVenues(owner: User) {
    const organizer = await this.getOrganizerForUser(owner);

    return this.prisma.venue.findMany({
      where: {
        organizerId: organizer.id
      },
      orderBy: {
        name: "asc"
      }
    });
  }

  async createVenue(owner: User, dto: CreateVenueDto) {
    const organizer = await this.getOrganizerForUser(owner);

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

  async listEvents(owner: User) {
    const organizer = await this.getOrganizerForUser(owner);

    return this.prisma.event.findMany({
      where: {
        organizerId: organizer.id
      },
      include: {
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

  async getEvent(owner: User, eventId: string) {
    const organizer = await this.getOrganizerForUser(owner);
    return this.findOrganizerEvent(organizer.id, eventId);
  }

  async listOrders(owner: User) {
    const organizer = await this.getOrganizerForUser(owner);

    return this.prisma.order.findMany({
      where: {
        event: {
          organizerId: organizer.id
        }
      },
      select: {
        id: true,
        status: true,
        totalCents: true,
        paymentProvider: true,
        paymentReference: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startsAt: true
          }
        },
        performerAttribution: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        items: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tickets: {
          select: {
            id: true,
            code: true,
            status: true,
            checkedInAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 100
    });
  }

  async getOrder(owner: User, orderId: string) {
    const organizer = await this.getOrganizerForUser(owner);
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        event: {
          organizerId: organizer.id
        }
      },
      select: {
        id: true,
        status: true,
        totalCents: true,
        paymentProvider: true,
        paymentReference: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startsAt: true
          }
        },
        performerAttribution: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        items: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        tickets: {
          select: {
            id: true,
            code: true,
            status: true,
            checkedInAt: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }
      }
    });

    if (!order) {
      throw new NotFoundException("Order not found for organizer");
    }

    return order;
  }

  async resendOrderConfirmation(owner: User, orderId: string) {
    const order = await this.getOrder(owner, orderId);

    if (order.status !== "PAID") {
      throw new BadRequestException("Only paid orders can receive confirmation emails");
    }

    const ticketCodes = order.tickets.map((ticket) => ticket.code);
    const email = await this.emailService.enqueue({
      type: "ORDER_CONFIRMATION",
      toEmail: order.user.email,
      subject: `Your tickets for ${order.event.title}`,
      bodyText: [
        `You're all set for ${order.event.title}.`,
        `Tickets: ${order.tickets.length}`,
        `Total: $${(order.totalCents / 100).toFixed(2)}`,
        ticketCodes.length > 0 ? `Ticket codes: ${ticketCodes.join(", ")}` : "",
        "Open your LocalShow wallet to view QR tickets."
      ]
        .filter(Boolean)
        .join("\n"),
      metadata: {
        orderId: order.id,
        eventId: order.event.id,
        ticketIds: order.tickets.map((ticket) => ticket.id),
        resend: true
      }
    });

    return {
      queued: true,
      emailId: email.id,
      toEmail: email.toEmail
    };
  }

  async listEventTickets(owner: User, eventId: string) {
    const organizer = await this.getOrganizerForUser(owner);
    const event = await this.findOrganizerEvent(organizer.id, eventId);

    return this.prisma.ticket.findMany({
      where: {
        eventId: event.id
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ticketType: true,
        performerAttribution: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        order: {
          select: {
            id: true,
            totalCents: true,
            status: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async updateTicketStatus(owner: User, eventId: string, ticketId: string, status: TicketStatus) {
    const organizer = await this.getOrganizerForUser(owner);
    const event = await this.findOrganizerEvent(organizer.id, eventId);
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        id: ticketId,
        eventId: event.id
      }
    });

    if (!ticket) {
      throw new NotFoundException("Ticket not found for event");
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new BadRequestException("Checked-in tickets cannot be changed from the attendee list");
    }

    if (status === TicketStatus.CHECKED_IN) {
      throw new BadRequestException("Use the check-in workflow to check in tickets");
    }

    return this.prisma.ticket.update({
      where: {
        id: ticket.id
      },
      data: {
        status
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        ticketType: true,
        performerAttribution: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        order: {
          select: {
            id: true,
            totalCents: true,
            status: true,
            createdAt: true
          }
        }
      }
    });
  }

  async getSummary(owner: User) {
    const organizer = await this.getOrganizerForUser(owner);

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

  async createEvent(owner: User, dto: CreateEventDto) {
    const organizer = await this.getOrganizerForUser(owner);

    const venue = await this.prisma.venue.findFirst({
      where: {
        id: dto.venueId,
        organizerId: organizer.id
      }
    });

    if (!venue) {
      throw new NotFoundException("Venue not found for organizer");
    }

    const { startsAt, endsAt } = this.validateEventTiming(dto.startsAt, dto.endsAt, {
      allowPastStart: false
    });
    this.validateTicketCapacity(venue, dto.ticketTypes);
    this.validateTicketSalesWindows(dto.ticketTypes);

    if (dto.status === EventStatus.CANCELED) {
      throw new BadRequestException("New events cannot be created as canceled");
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
            quantityTotal: ticketType.quantityTotal,
            salesStartAt: ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null,
            salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null
          }))
        },
        performers: {
          create: this.buildPerformerCreates(dto.performers)
        }
      },
      include: {
        venue: true,
        performers: {
          orderBy: {
            sortOrder: "asc"
          }
        },
        ticketTypes: true
      }
    });

    return event;
  }

  async updateEvent(owner: User, eventId: string, dto: UpdateEventDto) {
    const organizer = await this.getOrganizerForUser(owner);
    const event = await this.findOrganizerEvent(organizer.id, eventId);
    const venue = await this.prisma.venue.findFirst({
      where: {
        id: dto.venueId,
        organizerId: organizer.id
      }
    });

    if (!venue) {
      throw new NotFoundException("Venue not found for organizer");
    }

    const { startsAt, endsAt } = this.validateEventTiming(dto.startsAt, dto.endsAt, {
      allowPastStart: event.startsAt < new Date()
    });
    this.validateTicketCapacity(venue, dto.ticketTypes);
    this.validateTicketSalesWindows(dto.ticketTypes);

    const submittedIds = dto.ticketTypes
      .map((ticketType) => ticketType.id)
      .filter((id): id is string => Boolean(id));
    const duplicateId = submittedIds.find((id, index) => submittedIds.indexOf(id) !== index);

    if (duplicateId) {
      throw new BadRequestException("Ticket type was submitted more than once");
    }

    const existingTicketTypesById = new Map(event.ticketTypes.map((ticketType) => [ticketType.id, ticketType]));

    for (const ticketType of dto.ticketTypes) {
      if (!ticketType.id) {
        continue;
      }

      const existing = existingTicketTypesById.get(ticketType.id);

      if (!existing) {
        throw new BadRequestException("Ticket type does not belong to this event");
      }

      if (ticketType.quantityTotal < existing.quantitySold) {
        throw new BadRequestException(
          `${existing.name} cannot be reduced below ${existing.quantitySold} sold tickets`
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: {
          id: event.id
        },
        data: {
          title: dto.title,
          description: dto.description,
          genre: dto.genre,
          venueId: venue.id,
          startsAt,
          endsAt,
          status: dto.status
        }
      });

      for (const ticketType of dto.ticketTypes) {
        if (ticketType.id) {
          await tx.ticketType.update({
            where: {
              id: ticketType.id
            },
            data: {
              name: ticketType.name,
              priceCents: ticketType.priceCents,
              quantityTotal: ticketType.quantityTotal,
              salesStartAt: ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null,
              salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null
            }
          });
        } else {
          await tx.ticketType.create({
            data: {
              eventId: event.id,
              name: ticketType.name,
              priceCents: ticketType.priceCents,
              quantityTotal: ticketType.quantityTotal,
              salesStartAt: ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null,
              salesEndAt: ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null
            }
          });
        }
      }

      await tx.eventPerformer.deleteMany({
        where: {
          eventId: event.id
        }
      });

      const performers = this.buildPerformerCreates(dto.performers);

      if (performers.length > 0) {
        await tx.eventPerformer.createMany({
          data: performers.map((performer) => ({
            ...performer,
            eventId: event.id
          }))
        });
      }

      return tx.event.findUniqueOrThrow({
        where: {
          id: event.id
        },
        include: {
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
    });
  }

  async updateEventStatus(owner: User, eventId: string, status: EventStatus) {
    const organizer = await this.getOrganizerForUser(owner);
    const event = await this.findOrganizerEvent(organizer.id, eventId);

    return this.prisma.event.update({
      where: {
        id: event.id
      },
      data: {
        status
      },
      include: {
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
  }

  async updateEventPoster(owner: User, eventId: string, posterUrl: string) {
    const organizer = await this.getOrganizerForUser(owner);
    const event = await this.findOrganizerEvent(organizer.id, eventId);

    return this.prisma.event.update({
      where: {
        id: event.id
      },
      data: {
        posterUrl
      },
      include: {
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
  }

  private async findOrganizerEvent(organizerId: string, eventId: string) {
    const event = await this.prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId
      },
      include: {
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
      throw new NotFoundException("Event not found for organizer");
    }

    return event;
  }

  private async createOrganizerSlug(owner: User) {
    const base = owner.name || owner.email.split("@")[0] || "organizer";
    let slug = uniqueSlug(base);
    let suffix = 1;

    while (await this.prisma.organizer.findUnique({ where: { slug } })) {
      slug = `${uniqueSlug(base)}-${suffix}`;
      suffix += 1;
    }

    return slug;
  }

  private validateEventTiming(
    startsAtValue: string,
    endsAtValue: string | undefined,
    options: { allowPastStart: boolean }
  ) {
    const startsAt = new Date(startsAtValue);
    const endsAt = endsAtValue ? new Date(endsAtValue) : null;

    if (!options.allowPastStart && startsAt <= new Date()) {
      throw new BadRequestException("Event start time must be in the future");
    }

    if (endsAt && endsAt <= startsAt) {
      throw new BadRequestException("Event end time must be after start time");
    }

    return { startsAt, endsAt };
  }

  private validateTicketCapacity(
    venue: Venue,
    ticketTypes: Array<{ quantityTotal: number }>
  ) {
    const totalCapacity = ticketTypes.reduce((total, ticketType) => total + ticketType.quantityTotal, 0);

    if (totalCapacity > venue.capacity) {
      throw new BadRequestException(
        `Ticket capacity (${totalCapacity}) cannot exceed location capacity (${venue.capacity})`
      );
    }
  }

  private validateTicketSalesWindows(
    ticketTypes: Array<{ name: string; salesStartAt?: string; salesEndAt?: string }>
  ) {
    for (const ticketType of ticketTypes) {
      const salesStartAt = ticketType.salesStartAt ? new Date(ticketType.salesStartAt) : null;
      const salesEndAt = ticketType.salesEndAt ? new Date(ticketType.salesEndAt) : null;

      if (salesStartAt && salesEndAt && salesEndAt <= salesStartAt) {
        throw new BadRequestException(`${ticketType.name} sales end time must be after sales start time`);
      }
    }
  }

  private buildPerformerCreates(performers: Array<{ name: string }> | undefined) {
    const seenSlugs = new Set<string>();

    return (performers ?? [])
      .map((performer) => performer.name.trim())
      .filter(Boolean)
      .map((name, index) => {
        const baseSlug = uniqueSlug(name);
        let slug = baseSlug;
        let suffix = 1;

        while (seenSlugs.has(slug)) {
          slug = `${baseSlug}-${suffix}`;
          suffix += 1;
        }

        seenSlugs.add(slug);

        return {
          name,
          slug,
          sortOrder: index
        };
      });
  }
}
