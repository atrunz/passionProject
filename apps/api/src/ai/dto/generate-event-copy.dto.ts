import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { EventGenre } from "@prisma/client";

export class GenerateEventCopyDto {
  @IsString()
  @MaxLength(240)
  idea!: string;

  @IsOptional()
  @IsEnum(EventGenre)
  genre?: EventGenre;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  locationName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;
}
