import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { CheckinsService } from "./checkins.service";
import { CheckInTicketDto } from "./dto/check-in-ticket.dto";

@Controller("organizer/check-ins")
export class CheckinsController {
  constructor(
    private readonly authService: AuthService,
    private readonly checkinsService: CheckinsService
  ) {}

  @Post()
  async checkInTicket(@Req() request: RequestLike, @Body() dto: CheckInTicketDto) {
    const user = await this.authService.resolveUser(request, "ORGANIZER");
    return this.checkinsService.checkInTicket(user, dto.ticketCode);
  }
}
