import { IsEmail, IsOptional, IsString, MaxLength } from "class-validator";

export class TransferTicketDto {
  @IsEmail()
  @MaxLength(255)
  recipientEmail!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  recipientName?: string;
}
