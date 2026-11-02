import { IsDateString, IsIn, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export const RECURRENCES = ['NONE', 'WEEKLY', 'MONTHLY', 'YEARLY'] as const;

export class CreateTaskDto {
  @IsString() @IsNotEmpty() @MaxLength(200)
  title!: string;

  @IsOptional() @IsString() @MaxLength(5000)
  description?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsDateString()
  dueDate?: string | null;

  @IsOptional() @IsIn(['TODO', 'IN_PROGRESS', 'DONE'])
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';

  @IsOptional() @IsIn(['LOW', 'MEDIUM', 'HIGH'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional() @IsString() @MaxLength(50)
  category?: string;

  @IsOptional() @IsIn(RECURRENCES)
  recurrence?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsString()
  assigneeId?: string | null;
}

export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
