import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';

@Injectable()
export class EventsService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'event', 'Event', { startsAt: 'asc' }, ['startsAt', 'endsAt']);
  }
}
