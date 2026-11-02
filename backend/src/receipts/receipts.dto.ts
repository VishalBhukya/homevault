import { Type } from 'class-transformer';
import {
  ArrayMaxSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString,
  IsUrl, MaxLength, Min, ValidateIf, ValidateNested,
} from 'class-validator';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { SPEND_CATEGORIES } from '../common/categories';

export class ReceiptItemDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  name!: string;

  @IsOptional() @IsNumber() @Min(0)
  quantity?: number;

  @IsNumber()
  price!: number;

  @IsOptional() @IsIn(SPEND_CATEGORIES)
  category?: string;

  @IsOptional() @IsBoolean()
  hsaEligible?: boolean;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  warrantyMonths?: number | null;
}

export class CreateReceiptDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  merchant!: string;

  @IsDateString()
  purchaseDate!: string;

  @IsNumber() @Min(0)
  total!: number;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsNumber() @Min(0)
  tax?: number | null;

  @IsOptional() @IsIn(SPEND_CATEGORIES)
  category?: string;

  @IsOptional() @IsString() @MaxLength(50)
  paymentMethod?: string;

  @IsOptional() @IsUrl({ require_tld: false })
  fileUrl?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;

  @IsOptional() @IsIn(['UPLOAD', 'MANUAL'])
  source?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(200) @ValidateNested({ each: true }) @Type(() => ReceiptItemDto)
  items?: ReceiptItemDto[];

  /** Create inventory assets (with warranty dates) for items that have a warranty. */
  @IsOptional() @IsBoolean()
  createAssets?: boolean;
}

export class UpdateReceiptDto extends PartialType(OmitType(CreateReceiptDto, ['createAssets'] as const)) {}
