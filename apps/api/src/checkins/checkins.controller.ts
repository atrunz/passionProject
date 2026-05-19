import { Body, Controller, Post } from "@nestjs/common";
import { CheckinsService } from "./checkins.service";
import { CheckInTicketDto } from "./dto/check-in-ticket.dto";

@Controller("organizer/check-ins")
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Post()
  checkInTicket(@Body() dto: CheckInTicketDto) {
    return this.checkinsService.checkInTicket(dto.ticketCode);
  }
}
