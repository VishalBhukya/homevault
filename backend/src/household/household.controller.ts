import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../common/roles.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { HouseholdService } from './household.service';
import { AddMemberDto, UpdateHouseholdDto } from './household.dto';

@UseGuards(JwtAuthGuard)
@Controller('household')
export class HouseholdController {
  constructor(private readonly service: HouseholdService) {}

  @Get()
  get(@CurrentUser() user: AuthUser) {
    return this.service.get(user.householdId);
  }

  @UseGuards(AdminGuard)
  @Patch()
  update(@CurrentUser() user: AuthUser, @Body() dto: UpdateHouseholdDto) {
    return this.service.update(user.householdId, dto);
  }

  @UseGuards(AdminGuard)
  @Post('members')
  addMember(@CurrentUser() user: AuthUser, @Body() dto: AddMemberDto) {
    return this.service.addMember(user.householdId, dto);
  }

  @UseGuards(AdminGuard)
  @Delete('members/:id')
  removeMember(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.removeMember(user.householdId, id, user.userId);
  }
}
