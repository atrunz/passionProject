import { Body, Controller, Get, Patch, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { UpdateMeDto } from "./dto/update-me.dto";
import { UsersService } from "./users.service";

@Controller("me")
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  async getMe(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    return this.usersService.getProfile(user);
  }

  @Patch()
  async updateMe(@Req() request: RequestLike, @Body() dto: UpdateMeDto) {
    const user = await this.authService.resolveUser(request, dto.role ?? "FAN");
    return this.usersService.updateProfile(user, dto);
  }
}
