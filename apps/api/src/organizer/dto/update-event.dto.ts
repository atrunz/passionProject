import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from "class-validator";
import { EventGenre, EventStatus } from "@prisma/client";

export class UpdateTicketTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000000)
  priceCents!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100000)
  quantityTotal!: number;

  @IsOptional()
  @IsISO8601()
  salesStartAt?: string;

  @IsOptional()
  @IsISO8601()
  salesEndAt?: string;
}

export class UpdateEventPerformerDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateEventDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(EventGenre)
  genre!: EventGenre;

  @IsString()
  @IsNotEmpty()
  venueId!: string;

  @IsISO8601()
  startsAt!: string;

  @IsOptional()
  @IsISO8601()
  endsAt?: string;

  @IsEnum(EventStatus)
  status!: EventStatus;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  @Type(() => UpdateTicketTypeDto)
  ticketTypes!: UpdateTicketTypeDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => UpdateEventPerformerDto)
  performers?: UpdateEventPerformerDto[];
}
