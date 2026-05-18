import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventsModule } from "./events/events.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    HealthModule,
    EventsModule
  ]
})
export class AppModule {}
