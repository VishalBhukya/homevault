import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyDto, UpdateEmergencyDto } from './emergency.dto';

@UseGuards(JwtAuthGuard)
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly service: EmergencyService) {}

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.service.findAll(user.householdId);
  }

  @Get('binder')
  binder(@CurrentUser() user: AuthUser) {
    return this.service.binder(user.householdId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.findOne(user.householdId, id);
  }

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateEmergencyDto) {
    return this.service.create(user.householdId, dto);
  }

  @Patch(':id')
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: UpdateEmergencyDto) {
    return this.service.update(user.householdId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.remove(user.householdId, id);
  }
}
