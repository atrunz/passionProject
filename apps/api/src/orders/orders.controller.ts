import { Body, Controller, Get, Post } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrdersService } from "./orders.service";

@Controller()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post("orders/mock")
  createMockOrder(@Body() dto: CreateOrderDto) {
    return this.ordersService.createMockOrder(dto);
  }

  @Get("me/tickets")
  listMyTickets() {
    return this.ordersService.listMyTickets();
  }
}
