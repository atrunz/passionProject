import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  ticketTypeId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(8)
  quantity!: number;
}
