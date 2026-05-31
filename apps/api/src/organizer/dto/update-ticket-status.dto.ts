import { IsIn } from "class-validator";

export class UpdateTicketStatusDto {
  @IsIn(["ACTIVE", "VOID"])
  status!: "ACTIVE" | "VOID";
}
