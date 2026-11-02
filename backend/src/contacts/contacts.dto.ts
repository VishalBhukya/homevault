import { IsBoolean, IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CONTACT_CATEGORIES } from '../common/categories';

export class CreateContactDto {
  @IsString() @IsNotEmpty() @MaxLength(120)
  name!: string;

  @IsOptional() @IsIn(CONTACT_CATEGORIES)
  category?: string;

  @IsOptional() @IsString() @MaxLength(80)
  relationship?: string;

  @IsOptional() @IsString() @MaxLength(40)
  phone?: string;

  @IsOptional() @ValidateIf((_, v) => v !== '' && v !== null) @IsEmail()
  email?: string;

  @IsOptional() @IsString() @MaxLength(300)
  address?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;

  @IsOptional() @IsBoolean()
  isEmergency?: boolean;
}

export class UpdateContactDto extends PartialType(CreateContactDto) {}
