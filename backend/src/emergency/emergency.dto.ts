import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { EMERGENCY_SECTIONS } from '../common/categories';

export class CreateEmergencyDto {
  @IsIn(EMERGENCY_SECTIONS)
  section!: string;

  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @IsString() @IsNotEmpty() @MaxLength(10000)
  content!: string;
}

export class UpdateEmergencyDto extends PartialType(CreateEmergencyDto) {}
