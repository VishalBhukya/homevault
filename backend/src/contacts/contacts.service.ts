import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';

@Injectable()
export class ContactsService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'contact', 'Contact', [{ isEmergency: 'desc' }, { name: 'asc' }], []);
  }
}
