import { Controller, Get, Param, Query } from "@nestjs/common";
import { EventsService } from "./events.service";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listEvents(
    @Query("q") query?: string,
    @Query("city") city?: string,
    @Query("genre") genre?: string,
    @Query("when") when?: string
  ) {
    return this.eventsService.listPublicEvents({ query, city, genre, when });
  }

  @Get(":slug")
  getEventBySlug(@Param("slug") slug: string) {
    return this.eventsService.getPublicEventBySlug(slug);
  }
}
