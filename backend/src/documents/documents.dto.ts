import { IsBoolean, IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { DOCUMENT_CATEGORIES } from '../common/categories';

export class CreateDocumentDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @IsOptional() @IsIn(DOCUMENT_CATEGORIES)
  category?: string;

  @IsOptional() @IsString() @MaxLength(5000)
  notes?: string;

  @IsOptional() @IsUrl({ require_tld: false })
  fileUrl?: string;

  @IsOptional() @IsString()
  fileName?: string;

  @IsOptional() @IsString()
  mimeType?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsDateString()
  expiresAt?: string | null;

  @IsOptional() @IsBoolean()
  includeInBinder?: boolean;
}

export class UpdateDocumentDto extends PartialType(CreateDocumentDto) {}
