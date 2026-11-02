import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';
import { addDays } from '../common/dates';

function nextOccurrence(from: Date, recurrence: string) {
  if (recurrence === 'WEEKLY') return addDays(from, 7);
  if (recurrence === 'MONTHLY') return new Date(from.getFullYear(), from.getMonth() + 1, from.getDate(), from.getHours(), from.getMinutes());
  if (recurrence === 'YEARLY') return new Date(from.getFullYear() + 1, from.getMonth(), from.getDate(), from.getHours(), from.getMinutes());
  return null;
}

@Injectable()
export class TasksService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'task', 'Task', [{ status: 'asc' }, { dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }], ['dueDate']);
  }

  override findAll(householdId: string) {
    return this.prisma.task.findMany({
      where: { householdId },
      orderBy: [{ status: 'asc' }, { dueDate: { sort: 'asc', nulls: 'last' } }, { createdAt: 'desc' }],
      include: { assignee: { select: { id: true, name: true } } },
    });
  }

  override async create(householdId: string, data: Record<string, any>) {
    await this.assertAssignee(householdId, data.assigneeId);
    return super.create(householdId, data);
  }

  /** Completing a recurring task schedules its next occurrence automatically. */
  override async update(householdId: string, id: string, data: Record<string, any>) {
    const existing = await this.findOne(householdId, id);
    await this.assertAssignee(householdId, data.assigneeId);
    const patch = { ...data };
    if (data.status === 'DONE' && existing.status !== 'DONE') {
      patch.completedAt = new Date();
      const next = existing.dueDate ? nextOccurrence(existing.dueDate, existing.recurrence) : null;
      if (next) {
        await this.prisma.task.create({
          data: {
            householdId,
            title: existing.title,
            description: existing.description,
            priority: existing.priority,
            category: existing.category,
            recurrence: existing.recurrence,
            assigneeId: existing.assigneeId,
            dueDate: next,
          },
        });
      }
    } else if (data.status && data.status !== 'DONE') {
      patch.completedAt = null;
    }
    return super.update(householdId, id, patch);
  }

  private async assertAssignee(householdId: string, assigneeId?: string | null) {
    if (!assigneeId) return;
    const member = await this.prisma.user.findFirst({ where: { id: assigneeId, householdId } });
    if (!member) throw new BadRequestException('Assignee is not a member of this household');
  }
}
