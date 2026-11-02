import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Generic CRUD for models that belong to a household. Every query is filtered by
 * householdId so one household can never read or change another household's data.
 */
export abstract class HouseholdScopedService {
  protected constructor(
    protected readonly prisma: PrismaService,
    private readonly model: string,
    private readonly label: string,
    private readonly orderBy: Record<string, unknown> | Record<string, unknown>[] = { createdAt: 'desc' },
    private readonly dateFields: string[] = [],
  ) {}

  // Prisma delegates don't share a common type, so the generic layer works with `any`.
  protected get repo(): any {
    return (this.prisma as any)[this.model];
  }

  protected normalize(data: Record<string, any>) {
    const out: Record<string, any> = { ...data };
    for (const field of this.dateFields) {
      if (field in out) out[field] = out[field] ? new Date(out[field]) : null;
    }
    return out;
  }

  findAll(householdId: string, where: Record<string, unknown> = {}) {
    return this.repo.findMany({ where: { householdId, ...where }, orderBy: this.orderBy });
  }

  async findOne(householdId: string, id: string) {
    const record = await this.repo.findFirst({ where: { id, householdId } });
    if (!record) throw new NotFoundException(`${this.label} not found`);
    return record;
  }

  create(householdId: string, data: Record<string, any>) {
    return this.repo.create({ data: { ...this.normalize(data), householdId } });
  }

  async update(householdId: string, id: string, data: Record<string, any>) {
    await this.findOne(householdId, id);
    return this.repo.update({ where: { id }, data: this.normalize(data) });
  }

  async remove(householdId: string, id: string) {
    await this.findOne(householdId, id);
    await this.repo.delete({ where: { id } });
    return { success: true };
  }
}
