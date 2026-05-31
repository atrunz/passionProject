import { Module } from "@nestjs/common";
import { EmailModule } from "../email/email.module";
import { OrganizerController } from "./organizer.controller";
import { OrganizerService } from "./organizer.service";

@Module({
  imports: [EmailModule],
  controllers: [OrganizerController],
  providers: [OrganizerService]
})
export class OrganizerModule {}
