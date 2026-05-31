import { Controller, ForbiddenException, Get, Query } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EmailService } from "./email.service";

@Controller("dev/email-outbox")
export class EmailController {
  constructor(
    private readonly config: ConfigService,
    private readonly emailService: EmailService
  ) {}

  @Get()
  listQueued(@Query("limit") limit?: string) {
    if (this.config.get<string>("NODE_ENV") === "production") {
      throw new ForbiddenException("Dev email outbox is disabled in production");
    }

    return this.emailService.listRecent(limit ? Number(limit) : 50);
  }
}
