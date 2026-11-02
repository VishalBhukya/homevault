import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StorageModule } from './storage/storage.module';
import { AuthModule } from './auth/auth.module';
import { HouseholdModule } from './household/household.module';
import { DocumentsModule } from './documents/documents.module';
import { TasksModule } from './tasks/tasks.module';
import { EventsModule } from './events/events.module';
import { ContactsModule } from './contacts/contacts.module';
import { AssetsModule } from './assets/assets.module';
import { ReceiptsModule } from './receipts/receipts.module';
import { EmergencyModule } from './emergency/emergency.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Controller()
class HealthController {
  @Get('health')
  health() {
    return { status: 'ok', time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StorageModule,
    AuthModule,
    HouseholdModule,
    DocumentsModule,
    TasksModule,
    EventsModule,
    ContactsModule,
    AssetsModule,
    ReceiptsModule,
    EmergencyModule,
    DashboardModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
