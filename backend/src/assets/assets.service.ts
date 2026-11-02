import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';

@Injectable()
export class AssetsService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'asset', 'Asset', { createdAt: 'desc' }, ['purchaseDate', 'warrantyExpiresAt']);
  }
}
