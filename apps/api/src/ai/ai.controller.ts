import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { AiService } from "./ai.service";
import { GenerateEventCopyDto } from "./dto/generate-event-copy.dto";

@Controller("organizer/ai")
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly authService: AuthService
  ) {}

  @Post("event-copy")
  async generateEventCopy(@Req() request: RequestLike, @Body() dto: GenerateEventCopyDto) {
    const user = await this.authService.resolveUser(request, "FAN");
    this.authService.ensureRole(user, ["ORGANIZER", "ADMIN"]);
    return this.aiService.generateEventCopy(dto);
  }
}
