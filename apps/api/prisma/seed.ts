import { PrismaClient, EventGenre, EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

type VenueSeed = {
  name: string;
  address: string;
  city: string;
  state: string;
  capacity: number;
};

async function main() {
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
      ]
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
      ticketTypes: [{ name: "All Ages GA", priceCents: 1000, quantityTotal: 140 }]
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
      ticketTypes: [{ name: "General Admission", priceCents: 1500, quantityTotal: 90 }]
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
  }

  console.log(`Seeded ${events.length} events`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
