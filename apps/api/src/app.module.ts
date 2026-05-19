import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { CheckinsModule } from "./checkins/checkins.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { OrganizerModule } from "./organizer/organizer.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    HealthModule,
    UsersModule,
    EventsModule,
    OrganizerModule,
    OrdersModule,
    CheckinsModule
  ]
})
export class AppModule {}
