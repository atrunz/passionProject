import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { CheckinsModule } from "./checkins/checkins.module";
import { EmailModule } from "./email/email.module";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";
import { OrganizerModule } from "./organizer/organizer.module";
import { OrganizersModule } from "./organizers/organizers.module";
import { OrdersModule } from "./orders/orders.module";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AiModule,
    AuthModule,
    EmailModule,
    HealthModule,
    UsersModule,
    EventsModule,
    OrganizersModule,
    OrganizerModule,
    OrdersModule,
    CheckinsModule
  ]
})
export class AppModule {}
