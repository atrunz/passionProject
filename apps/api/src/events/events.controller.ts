import { Controller, Get, Param } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listEvents() {
    return this.eventsService.listPublicEvents();
  }

  @Get(":slug")
  getEventBySlug(@Param("slug") slug: string) {
    return this.eventsService.getPublicEventBySlug(slug);
  }
}
