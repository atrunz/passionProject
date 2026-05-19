import { Body, Controller, Get, Patch, Post, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateOrganizerDto } from "./dto/update-organizer.dto";
import { OrganizerService } from "./organizer.service";

@Controller("organizer")
export class OrganizerController {
  constructor(
    private readonly authService: AuthService,
    private readonly organizerService: OrganizerService
  ) {}

  @Get("me")
  async getOrganizer(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.getOrganizerForUser(user);
  }

  @Patch("me")
  async updateOrganizer(@Req() request: RequestLike, @Body() dto: UpdateOrganizerDto) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.updateOrganizer(user, dto);
  }

  @Get("venues")
  async listVenues(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.listVenues(user);
  }

  @Post("venues")
  async createVenue(@Req() request: RequestLike, @Body() dto: CreateVenueDto) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.createVenue(user, dto);
  }

  @Get("events")
  async listEvents(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.listEvents(user);
  }

  @Get("summary")
  async getSummary(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.getSummary(user);
  }

  @Post("events")
  async createEvent(@Req() request: RequestLike, @Body() dto: CreateEventDto) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.organizerService.createEvent(user, dto);
  }
}
