import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ASSET_CATEGORIES } from '../common/categories';

export class CreateAssetDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @IsOptional() @IsIn(ASSET_CATEGORIES)
  category?: string;

  @IsOptional() @IsString() @MaxLength(100)
  brand?: string;

  @IsOptional() @IsString() @MaxLength(100)
  model?: string;

  @IsOptional() @IsString() @MaxLength(100)
  serialNumber?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsDateString()
  purchaseDate?: string | null;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsNumber() @Min(0)
  purchasePrice?: number | null;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsDateString()
  warrantyExpiresAt?: string | null;

  @IsOptional() @IsString() @MaxLength(100)
  location?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsString()
  receiptId?: string | null;
}

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
