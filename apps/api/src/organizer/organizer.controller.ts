import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { CreateVenueDto } from "./dto/create-venue.dto";
import { OrganizerService } from "./organizer.service";

@Controller("organizer")
export class OrganizerController {
  constructor(private readonly organizerService: OrganizerService) {}

  @Get("me")
  getOrganizer() {
    return this.organizerService.getDevOrganizer();
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

  @Post("events")
  createEvent(@Body() dto: CreateEventDto) {
    return this.organizerService.createEvent(dto);
  }
}
