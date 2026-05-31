import { Controller, Get, Param } from "@nestjs/common";
import { OrganizersService } from "./organizers.service";

@Controller("organizers")
export class OrganizersController {
  constructor(private readonly organizersService: OrganizersService) {}

  @Get(":slug")
  getOrganizerBySlug(@Param("slug") slug: string) {
    return this.organizersService.getPublicOrganizerBySlug(slug);
  }
}
