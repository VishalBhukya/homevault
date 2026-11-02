import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateHouseholdDto {
  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(80)
  name?: string;

  @IsOptional() @IsIn(['FREE', 'ESSENTIAL', 'FAMILY', 'PRO'])
  plan?: 'FREE' | 'ESSENTIAL' | 'FAMILY' | 'PRO';
}

export class AddMemberDto {
  @IsString() @IsNotEmpty() @MaxLength(80)
  name!: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail()
  email!: string;

  @IsString() @MinLength(8, { message: 'Password must be at least 8 characters' })
  password!: string;

  @IsOptional() @IsIn(['ADMIN', 'MEMBER'])
  role?: 'ADMIN' | 'MEMBER';
}
