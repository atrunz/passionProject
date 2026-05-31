import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  ticketTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  quantity!: number;

  @IsOptional()
  @IsString()
  performerAttributionId?: string;
}
