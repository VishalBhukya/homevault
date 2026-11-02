import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { ReceiptsService } from './receipts.service';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';

@UseGuards(JwtAuthGuard)
@Controller('receipts')
export class ReceiptsController {
  constructor(private readonly service: ReceiptsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.householdId);
  }

  @Get('analytics')
  analytics(@CurrentUser() user: AuthUser, @Query('months', new DefaultValuePipe(6), ParseIntPipe) months: number) {
    return this.service.analytics(user.householdId, Math.min(Math.max(months, 1), 24));
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.householdId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateReceiptDto) {
    return this.service.create(user.householdId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateReceiptDto) {
    return this.service.update(user.householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.householdId, id);
  }
}
