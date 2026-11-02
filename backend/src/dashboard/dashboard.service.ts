import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReceiptsService } from '../receipts/receipts.service';
import { EmergencyService } from '../emergency/emergency.service';
import { addDays, DAY_MS } from '../common/dates';

export interface Alert {
  level: 'danger' | 'warning' | 'info';
  message: string;
  href: string;
}

const daysUntil = (d: Date) => Math.ceil((d.getTime() - Date.now()) / DAY_MS);

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly receipts: ReceiptsService,
    private readonly emergency: EmergencyService,
  ) {}

  async summary(householdId: string) {
    const now = new Date();
    const in7 = addDays(now, 7);
    const in60 = addDays(now, 60);
    const ago30 = addDays(now, -30);

    const [household, openTasks, events, expiringDocs, expiringWarranties, counts, analytics, binder] =
      await Promise.all([
        this.prisma.household.findUniqueOrThrow({ where: { id: householdId } }),
        this.prisma.task.findMany({
          where: { householdId, status: { not: 'DONE' } },
          orderBy: { dueDate: { sort: 'asc', nulls: 'last' } },
          include: { assignee: { select: { id: true, name: true } } },
        }),
        this.prisma.event.findMany({
          where: { householdId, startsAt: { gte: addDays(now, -1), lte: addDays(now, 14) } },
          orderBy: { startsAt: 'asc' },
          take: 6,
        }),
        this.prisma.document.findMany({ where: { householdId, expiresAt: { gte: ago30, lte: in60 } }, orderBy: { expiresAt: 'asc' } }),
        this.prisma.asset.findMany({ where: { householdId, warrantyExpiresAt: { gte: ago30, lte: in60 } }, orderBy: { warrantyExpiresAt: 'asc' } }),
        Promise.all([
          this.prisma.document.count({ where: { householdId } }),
          this.prisma.contact.count({ where: { householdId } }),
          this.prisma.asset.count({ where: { householdId } }),
          this.prisma.receipt.count({ where: { householdId } }),
        ]),
        this.receipts.analytics(householdId, 6),
        this.emergency.binder(householdId),
      ]);

    const overdueTasks = openTasks.filter((t) => t.dueDate && t.dueDate < now);
    const upcomingTasks = openTasks.filter((t) => t.dueDate && t.dueDate >= now && t.dueDate <= in7);

    const expiring = [
      ...expiringDocs.map((d) => ({ kind: 'DOCUMENT' as const, id: d.id, name: d.title, date: d.expiresAt!, daysLeft: daysUntil(d.expiresAt!) })),
      ...expiringWarranties.map((a) => ({ kind: 'WARRANTY' as const, id: a.id, name: a.name, date: a.warrantyExpiresAt!, daysLeft: daysUntil(a.warrantyExpiresAt!) })),
    ].sort((a, b) => a.date.getTime() - b.date.getTime());

    const alerts: Alert[] = [];
    if (overdueTasks.length) alerts.push({ level: 'danger', message: `${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}`, href: '/app/tasks' });
    for (const e of expiring) {
      const what = e.kind === 'DOCUMENT' ? e.name : `${e.name} warranty`;
      alerts.push(
        e.daysLeft < 0
          ? { level: 'danger', message: `${what} expired ${-e.daysLeft} day(s) ago`, href: e.kind === 'DOCUMENT' ? '/app/documents' : '/app/assets' }
          : { level: e.daysLeft <= 14 ? 'warning' : 'info', message: `${what} expires in ${e.daysLeft} day(s)`, href: e.kind === 'DOCUMENT' ? '/app/documents' : '/app/assets' },
      );
    }
    if (binder.readiness < 60) alerts.push({ level: 'warning', message: `Emergency binder is only ${binder.readiness}% complete`, href: '/app/emergency' });
    for (const insight of analytics.insights.slice(0, 2)) alerts.push({ level: 'info', message: insight, href: '/app/receipts' });
    if (household.trialEndsAt && household.trialEndsAt > now && daysUntil(household.trialEndsAt) <= 7) {
      alerts.push({ level: 'warning', message: `Your free trial ends in ${daysUntil(household.trialEndsAt)} day(s)`, href: '/app/settings' });
    }

    return {
      household: { id: household.id, name: household.name, plan: household.plan, trialEndsAt: household.trialEndsAt },
      counts: {
        documents: counts[0],
        contacts: counts[1],
        assets: counts[2],
        receipts: counts[3],
        openTasks: openTasks.length,
      },
      overdueTasks,
      upcomingTasks,
      upcomingEvents: events,
      expiring,
      spending: {
        thisMonth: analytics.thisMonth,
        lastMonth: analytics.lastMonth,
        changePct: analytics.changePct,
        byMonth: analytics.byMonth,
        topCategories: analytics.byCategory.slice(0, 5),
      },
      readiness: binder.readiness,
      alerts,
    };
  }
}
