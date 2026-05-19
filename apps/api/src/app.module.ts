import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CheckinsModule } from "./checkins/checkins.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { OrganizerModule } from "./organizer/organizer.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    HealthModule,
    EventsModule,
    OrganizerModule,
    OrdersModule,
    CheckinsModule
  ]
})
export class AppModule {}
