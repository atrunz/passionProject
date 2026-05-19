import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsIn(["FAN", "ORGANIZER"])
  role?: "FAN" | "ORGANIZER";
}
