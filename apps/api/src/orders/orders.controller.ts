import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
import { AuthService, type RequestLike } from "../auth/auth.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { TransferTicketDto } from "./dto/transfer-ticket.dto";
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

  @Get("me/tickets/:ticketId")
  async getMyTicket(@Req() request: RequestLike, @Param("ticketId") ticketId: string) {
    const user = await this.authService.resolveUser(request, "FAN");
    return this.ordersService.getMyTicket(user, ticketId);
  }

  @Post("me/tickets/:ticketId/transfer")
  async transferMyTicket(
    @Req() request: RequestLike,
    @Param("ticketId") ticketId: string,
    @Body() dto: TransferTicketDto
  ) {
    const user = await this.authService.resolveUser(request, "FAN");
    return this.ordersService.transferTicket(user, ticketId, dto);
  }
}
