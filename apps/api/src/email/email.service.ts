import { Injectable } from "@nestjs/common";
import { EmailNotificationType, Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

type EnqueueEmailInput = {
  type: EmailNotificationType;
  toEmail: string;
  subject: string;
  bodyText: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class EmailService {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(input: EnqueueEmailInput) {
    return this.prisma.emailNotification.create({
      data: {
        type: input.type,
        toEmail: input.toEmail.toLowerCase(),
        subject: input.subject,
        bodyText: input.bodyText,
        metadata: input.metadata ?? Prisma.JsonNull
      }
    });
  }

  listQueued(limit = 50) {
    return this.prisma.emailNotification.findMany({
      where: {
        status: "QUEUED"
      },
      orderBy: {
        createdAt: "asc"
      },
      take: limit
    });
  }

  listRecent(limit = 50) {
    return this.prisma.emailNotification.findMany({
      orderBy: {
        createdAt: "desc"
      },
      take: Math.min(Math.max(limit, 1), 100)
    });
  }
}
