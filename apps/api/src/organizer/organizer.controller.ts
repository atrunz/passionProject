import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { randomUUID } from "node:crypto";
import { mkdirSync, renameSync } from "node:fs";
import { extname, join } from "node:path";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { UpdateEventStatusDto } from "./dto/update-event-status.dto";
import { UpdateOrganizerDto } from "./dto/update-organizer.dto";
import { UpdateTicketStatusDto } from "./dto/update-ticket-status.dto";
import { OrganizerService } from "./organizer.service";

const uploadRoot = process.env.UPLOAD_DIR ?? join(process.cwd(), "uploads");
const eventPosterDir = join(uploadRoot, "event-posters");
const allowedPosterTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

mkdirSync(eventPosterDir, { recursive: true });

type UploadedPosterFile = {
  filename: string;
  originalname: string;
  mimetype: string;
  path: string;
  size: number;
};

@Controller("organizer")
export class OrganizerController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizerService: OrganizerService,
    private readonly config: ConfigService
  ) {}

  @Get("me")
  async getOrganizer(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.getOrganizerForUser(user);
  }

  @Patch("me")
  async updateOrganizer(@Req() request: RequestLike, @Body() dto: UpdateOrganizerDto) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.updateOrganizer(user, dto);
  }

  @Get("venues")
  async listVenues(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.listVenues(user);
  }

  @Post("venues")
  async createVenue(@Req() request: RequestLike, @Body() dto: CreateVenueDto) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.createVenue(user, dto);
  }

  @Get("events")
  async listEvents(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.listEvents(user);
  }

  @Get("orders")
  async listOrders(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.listOrders(user);
  }

  @Get("orders/:orderId")
  async getOrder(@Req() request: RequestLike, @Param("orderId") orderId: string) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.getOrder(user, orderId);
  }

  @Post("orders/:orderId/resend-confirmation")
  async resendOrderConfirmation(@Req() request: RequestLike, @Param("orderId") orderId: string) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.resendOrderConfirmation(user, orderId);
  }

  @Get("events/:eventId")
  async getEvent(@Req() request: RequestLike, @Param("eventId") eventId: string) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.getEvent(user, eventId);
  }

  @Get("events/:eventId/tickets")
  async listEventTickets(@Req() request: RequestLike, @Param("eventId") eventId: string) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.listEventTickets(user, eventId);
  }

  @Patch("events/:eventId/tickets/:ticketId/status")
  async updateTicketStatus(
    @Req() request: RequestLike,
    @Param("eventId") eventId: string,
    @Param("ticketId") ticketId: string,
    @Body() dto: UpdateTicketStatusDto
  ) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.updateTicketStatus(user, eventId, ticketId, dto.status);
  }

  @Get("summary")
  async getSummary(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.getSummary(user);
  }

  @Post("events")
  async createEvent(@Req() request: RequestLike, @Body() dto: CreateEventDto) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.createEvent(user, dto);
  }

  @Patch("events/:eventId")
  async updateEvent(
    @Req() request: RequestLike,
    @Param("eventId") eventId: string,
    @Body() dto: UpdateEventDto
  ) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.updateEvent(user, eventId, dto);
  }

  @Patch("events/:eventId/status")
  async updateEventStatus(
    @Req() request: RequestLike,
    @Param("eventId") eventId: string,
    @Body() dto: UpdateEventStatusDto
  ) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.organizerService.updateEventStatus(user, eventId, dto.status);
  }

  @Post("events/:eventId/poster")
  @UseInterceptors(
    FileInterceptor("poster", {
      dest: eventPosterDir,
      limits: {
        fileSize: 5 * 1024 * 1024
      },
      fileFilter: (
        _request: unknown,
        file: UploadedPosterFile,
        callback: (error: Error | null, acceptFile: boolean) => void
      ) => {
        callback(null, allowedPosterTypes.has(file.mimetype));
      }
    })
  )
  async uploadEventPoster(
    @Req() request: RequestLike,
    @Param("eventId") eventId: string,
    @UploadedFile() file?: UploadedPosterFile
  ) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);

    if (!file) {
      throw new BadRequestException("Poster image must be a JPG, PNG, or WebP file under 5MB");
    }

    const extension = extname(file.originalname).toLowerCase() || this.getExtensionFromMime(file.mimetype);
    const filename = `${randomUUID()}${extension}`;
    const finalPath = join(eventPosterDir, filename);
    renameSync(file.path, finalPath);

    const publicApiUrl = this.config.get<string>("API_PUBLIC_URL", "http://localhost:4000");
    const posterUrl = `${publicApiUrl}/uploads/event-posters/${filename}`;

    return this.organizerService.updateEventPoster(user, eventId, posterUrl);
  }

  private getExtensionFromMime(mimeType: string) {
    if (mimeType === "image/png") {
      return ".png";
    }

    if (mimeType === "image/webp") {
      return ".webp";
    }

    return ".jpg";
  }
}
