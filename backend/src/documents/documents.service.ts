import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';

@Injectable()
export class DocumentsService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'document', 'Document', [{ expiresAt: 'asc' }, { createdAt: 'desc' }], ['expiresAt']);
  }
}
