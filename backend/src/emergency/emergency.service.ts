import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HouseholdScopedService } from '../common/household-scoped.service';
import { EMERGENCY_SECTIONS } from '../common/categories';

@Injectable()
export class EmergencyService extends HouseholdScopedService {
  constructor(prisma: PrismaService) {
    super(prisma, 'emergencyEntry', 'Emergency entry', [{ section: 'asc' }, { createdAt: 'asc' }]);
  }

  /** Everything someone would need if the household organizer were unavailable. */
  async binder(householdId: string) {
    const [household, entries, contacts, documents, insurance] = await Promise.all([
      this.prisma.household.findUniqueOrThrow({
        where: { id: householdId },
        include: { users: { select: { id: true, name: true, email: true, role: true } } },
      }),
      this.findAll(householdId),
      this.prisma.contact.findMany({ where: { householdId, isEmergency: true }, orderBy: { name: 'asc' } }),
      this.prisma.document.findMany({ where: { householdId, includeInBinder: true }, orderBy: { category: 'asc' } }),
      this.prisma.document.count({ where: { householdId, category: 'INSURANCE' } }),
    ]);

    const sections = EMERGENCY_SECTIONS.map((section) => ({
      section,
      entries: entries.filter((e: { section: string }) => e.section === section),
    }));

    // Readiness: share of binder sections filled in, plus emergency contacts, binder docs and insurance on file.
    const checks = [
      ...sections.map((s) => ({ label: `${s.section.replace('_', ' ').toLowerCase()} section`, done: s.entries.length > 0 })),
      { label: 'at least 2 emergency contacts', done: contacts.length >= 2 },
      { label: 'key documents added to binder', done: documents.length > 0 },
      { label: 'insurance policy on file', done: insurance > 0 },
    ];
    const readiness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100);

    return {
      household: { id: household.id, name: household.name, members: household.users },
      sections,
      emergencyContacts: contacts,
      documents,
      readiness,
      checklist: checks,
      generatedAt: new Date().toISOString(),
    };
  }
}
