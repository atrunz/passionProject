import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
  constructor(
    private readonly authService: AuthService,
    private readonly ordersService: OrdersService
  ) {}

  @Post("orders/mock")
  async createMockOrder(@Req() request: RequestLike, @Body() dto: CreateOrderDto) {
    const user = await this.authService.resolveUser(request, "FAN");
    return this.ordersService.createMockOrder(user, dto);
  }

  @Get("me/tickets")
  async listMyTickets(@Req() request: RequestLike) {
    const user = await this.authService.resolveUser(request, "FAN");
    return this.ordersService.listMyTickets(user);
  }
}
