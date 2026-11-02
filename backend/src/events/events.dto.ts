import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEventDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsDateString()
  endsAt?: string | null;

  @IsOptional() @IsBoolean()
  allDay?: boolean;

  @IsOptional() @IsString() @MaxLength(200)
  location?: string;

  @IsOptional() @IsString() @MaxLength(50)
  category?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}
