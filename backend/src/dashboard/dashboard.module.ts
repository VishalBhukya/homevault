import { Module } from '@nestjs/common';
import { ReceiptsModule } from '../receipts/receipts.module';
import { EmergencyModule } from '../emergency/emergency.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [ReceiptsModule, EmergencyModule],
  providers: [DashboardService],
  controllers: [DashboardController],
  exports: [DashboardService],
})
export class DashboardModule {}
