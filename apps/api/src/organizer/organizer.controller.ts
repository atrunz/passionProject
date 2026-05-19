import { Body, Controller, Get, Patch, Post } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { UpdateOrganizerDto } from "./dto/update-organizer.dto";
import { OrganizerService } from "./organizer.service";

@Controller("organizer")
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Get("me")
  getOrganizer() {
    return this.organizerService.getDevOrganizer();
  }

  @Patch("me")
  updateOrganizer(@Body() dto: UpdateOrganizerDto) {
    return this.organizerService.updateOrganizer(dto);
  }

  @Get("venues")
  listVenues() {
    return this.organizerService.listVenues();
  }

  @Post("venues")
  createVenue(@Body() dto: CreateVenueDto) {
    return this.organizerService.createVenue(dto);
  }

  @Get("events")
  listEvents() {
    return this.organizerService.listEvents();
  }

  @Get("summary")
  getSummary() {
    return this.organizerService.getSummary();
  }

  @Post("events")
  createEvent(@Body() dto: CreateEventDto) {
    return this.organizerService.createEvent(dto);
  }
}
