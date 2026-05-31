import { PrismaClient, EventGenre, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();
const shouldResetDemoData = process.argv.includes("--reset");

type VenueSeed = {
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
};

async function main() {
  if (shouldResetDemoData) {
    await resetDemoData();
  }

  const organizer = await prisma.organizer.upsert({
    where: { slug: "localshow-demo" },
    update: {},
    create: {
      name: "LocalShow Demo Collective",
      slug: "localshow-demo",
      description: "Seed organizer for local venue and DIY show demos.",
      owner: {
        create: {
          clerkUserId: "seed_clerk_organizer",
          email: "organizer@localshow.test",
          name: "Demo Organizer",
          role: "ORGANIZER"
        }
      }
    }
  });

  const existingVenues = await prisma.venue.findMany({
    where: {
      organizerId: organizer.id
    }
  });

  const findVenue = async (name: string, data: VenueSeed) => {
    const existing = existingVenues.find((venue) => venue.name === name);

    if (existing) {
      return existing;
    }

    return prisma.venue.create({
      data: {
        ...data,
        organizerId: organizer.id
      }
    });
  };

  const harborRoom = await findVenue("The Harbor Room", {
    name: "The Harbor Room",
    address: "100 Boardwalk Ave",
    city: "Asbury Park",
    state: "NJ",
    capacity: 220
  });

  const warehouse39 = await findVenue("Warehouse 39", {
    name: "Warehouse 39",
    address: "39 Front St",
    city: "Philadelphia",
    state: "PA",
    capacity: 180
  });

  const backbarSocial = await findVenue("Backbar Social", {
    name: "Backbar Social",
    address: "22 Franklin Ave",
    city: "Brooklyn",
    state: "NY",
    capacity: 120
  });

  const events = [
    {
      venueId: harborRoom.id,
      title: "Needle Drop Night",
      slug: "needle-drop-night",
      description:
        "A three-band indie bill with local openers, early doors, and a late DJ set after the last act.",
      genre: EventGenre.INDIE,
      startsAt: new Date("2026-06-12T23:00:00.000Z"),
      endsAt: new Date("2026-06-13T03:00:00.000Z"),
      ticketTypes: [
        { name: "General Admission", priceCents: 1200, quantityTotal: 160 },
        { name: "Door Hold", priceCents: 1500, quantityTotal: 40 }
      ],
      performers: ["Static Lights", "Soft Arcade", "The Coastline"]
    },
    {
      venueId: warehouse39.id,
      title: "Basement Signal",
      slug: "basement-signal",
      description:
        "DIY punk and noise rock showcase with four regional bands and a strict all-ages door policy.",
      genre: EventGenre.PUNK,
      startsAt: new Date("2026-06-20T00:00:00.000Z"),
      endsAt: new Date("2026-06-20T04:00:00.000Z"),
      ticketTypes: [{ name: "All Ages GA", priceCents: 1000, quantityTotal: 140 }],
      performers: ["Rust Belt Choir", "Cheap Heat", "Basement Signal"]
    },
    {
      venueId: backbarSocial.id,
      title: "Late Set Laughs",
      slug: "late-set-laughs",
      description:
        "A tight local comedy lineup built for small rooms, quick sets, and a casual Friday crowd.",
      genre: EventGenre.COMEDY,
      startsAt: new Date("2026-06-27T01:30:00.000Z"),
      endsAt: new Date("2026-06-27T03:30:00.000Z"),
      ticketTypes: [{ name: "General Admission", priceCents: 1500, quantityTotal: 90 }],
      performers: ["Maya Torres", "Jules Park", "Late Set Laughs"]
    }
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: {
        slug: event.slug
      },
      update: {
        organizerId: organizer.id,
        venueId: event.venueId,
        title: event.title,
        description: event.description,
        genre: event.genre,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        status: EventStatus.PUBLISHED
      },
      create: {
        organizerId: organizer.id,
        venueId: event.venueId,
        title: event.title,
        slug: event.slug,
        description: event.description,
        genre: event.genre,
        startsAt: event.startsAt,
        endsAt: event.endsAt,
        status: EventStatus.PUBLISHED,
        ticketTypes: {
          create: event.ticketTypes
        }
      }
    });

    const seededEvent = await prisma.event.findUniqueOrThrow({
      where: {
        slug: event.slug
      }
    });

    for (const [index, performerName] of event.performers.entries()) {
      const slug = performerName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      await prisma.eventPerformer.upsert({
        where: {
          eventId_slug: {
            eventId: seededEvent.id,
            slug
          }
        },
        update: {
          name: performerName,
          sortOrder: index
        },
        create: {
          eventId: seededEvent.id,
          name: performerName,
          slug,
          sortOrder: index
        }
      });
    }
  }

  console.log(`Seeded ${events.length} events`);
}

async function resetDemoData() {
  const demoOrganizer = await prisma.organizer.findUnique({
    where: {
      slug: "localshow-demo"
    },
    select: {
      id: true,
      ownerUserId: true
    }
  });

  if (!demoOrganizer) {
    return;
  }

  const demoEventWhere = {
    organizerId: demoOrganizer.id
  };

  await prisma.checkIn.deleteMany({
    where: {
      event: demoEventWhere
    }
  });

  await prisma.emailNotification.deleteMany({
    where: {
      toEmail: {
        endsWith: "@localshow.test"
      }
    }
  });

  await prisma.ticket.deleteMany({
    where: {
      event: demoEventWhere
    }
  });

  await prisma.orderItem.deleteMany({
    where: {
      order: {
        event: demoEventWhere
      }
    }
  });

  await prisma.order.deleteMany({
    where: {
      event: demoEventWhere
    }
  });

  await prisma.ticketType.deleteMany({
    where: {
      event: demoEventWhere
    }
  });

  await prisma.eventPerformer.deleteMany({
    where: {
      event: demoEventWhere
    }
  });

  await prisma.event.deleteMany({
    where: demoEventWhere
  });

  await prisma.venue.deleteMany({
    where: {
      organizerId: demoOrganizer.id
    }
  });

  await prisma.organizer.delete({
    where: {
      id: demoOrganizer.id
    }
  });

  await prisma.user.deleteMany({
    where: {
      OR: [
        {
          id: demoOrganizer.ownerUserId
        },
        {
          clerkUserId: "seed_clerk_fan"
        }
      ]
    }
  });

  console.log("Reset LocalShow demo data");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
