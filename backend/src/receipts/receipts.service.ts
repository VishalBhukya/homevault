import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { monthKey, startOfMonth } from '../common/dates';
import { CreateReceiptDto, UpdateReceiptDto } from './receipts.dto';

const round = (n: number) => Math.round(n * 100) / 100;
const usd = (n: number) => `$${n.toFixed(2)}`;
const VARIABLE_SPEND = new Set(['GROCERIES', 'DINING', 'TRANSPORT', 'HOUSEHOLD', 'HEALTH', 'CLOTHING', 'KIDS', 'PETS']);

@Injectable()
export class ReceiptsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(householdId: string) {
    return this.prisma.receipt.findMany({
      where: { householdId },
      orderBy: { purchaseDate: 'desc' },
      include: { items: true, assets: { select: { id: true, name: true } } },
    });
  }

  async findOne(householdId: string, id: string) {
    const receipt = await this.prisma.receipt.findFirst({
      where: { id, householdId },
      include: { items: true, assets: { select: { id: true, name: true, warrantyExpiresAt: true } } },
    });
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async create(householdId: string, dto: CreateReceiptDto) {
    const { items = [], createAssets, ...data } = dto;
    const purchaseDate = new Date(data.purchaseDate);
    const receipt = await this.prisma.receipt.create({
      data: {
        ...data,
        purchaseDate,
        householdId,
        items: { create: items.map((i) => ({ ...i, quantity: i.quantity ?? 1 })) },
      },
    });
    if (createAssets) {
      const durable = items.filter((i) => i.warrantyMonths && i.warrantyMonths > 0);
      for (const item of durable) {
        const expires = new Date(purchaseDate);
        expires.setMonth(expires.getMonth() + (item.warrantyMonths ?? 0));
        await this.prisma.asset.create({
          data: {
            householdId,
            name: item.name,
            category: item.category === 'ELECTRONICS' ? 'ELECTRONICS' : 'APPLIANCE',
            purchaseDate,
            purchasePrice: item.price,
            warrantyExpiresAt: expires,
            receiptId: receipt.id,
            notes: `Added from ${receipt.merchant} receipt`,
          },
        });
      }
    }
    return this.findOne(householdId, receipt.id);
  }

  async update(householdId: string, id: string, dto: UpdateReceiptDto) {
    await this.findOne(householdId, id);
    const { items, ...data } = dto;
    await this.prisma.$transaction(async (tx) => {
      await tx.receipt.update({
        where: { id },
        data: { ...data, ...(data.purchaseDate ? { purchaseDate: new Date(data.purchaseDate) } : {}) },
      });
      if (items) {
        await tx.receiptItem.deleteMany({ where: { receiptId: id } });
        await tx.receiptItem.createMany({ data: items.map((i) => ({ ...i, quantity: i.quantity ?? 1, receiptId: id })) });
      }
    });
    return this.findOne(householdId, id);
  }

  async remove(householdId: string, id: string) {
    await this.findOne(householdId, id);
    await this.prisma.receipt.delete({ where: { id } });
    return { success: true };
  }

  async analytics(householdId: string, months = 6) {
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
    const receipts = await this.prisma.receipt.findMany({
      where: { householdId, purchaseDate: { gte: since } },
      include: { items: true },
      orderBy: { purchaseDate: 'asc' },
    });

    const byMonth = new Map<string, number>();
    for (let i = 0; i < months; i++) byMonth.set(monthKey(new Date(since.getFullYear(), since.getMonth() + i, 1)), 0);
    const byCategory = new Map<string, number>();
    const merchants = new Map<string, { total: number; count: number; months: Map<string, number> }>();
    const hsaItems: { name: string; price: number; merchant: string; date: Date }[] = [];

    const thisMonthKey = monthKey(now);
    const lastMonthKey = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    const catThis = new Map<string, number>();
    const catLast = new Map<string, number>();

    for (const r of receipts) {
      const key = monthKey(r.purchaseDate);
      byMonth.set(key, (byMonth.get(key) ?? 0) + r.total);

      // Split by item category when items exist so mixed baskets are attributed correctly.
      const parts = r.items.length ? r.items.map((i) => ({ cat: i.category, amt: i.price })) : [{ cat: r.category, amt: r.total }];
      for (const p of parts) {
        byCategory.set(p.cat, (byCategory.get(p.cat) ?? 0) + p.amt);
        if (key === thisMonthKey) catThis.set(p.cat, (catThis.get(p.cat) ?? 0) + p.amt);
        if (key === lastMonthKey) catLast.set(p.cat, (catLast.get(p.cat) ?? 0) + p.amt);
      }

      const m = merchants.get(r.merchant) ?? { total: 0, count: 0, months: new Map() };
      m.total += r.total;
      m.count += 1;
      m.months.set(key, (m.months.get(key) ?? 0) + r.total);
      merchants.set(r.merchant, m);

      for (const i of r.items) if (i.hsaEligible) hsaItems.push({ name: i.name, price: i.price, merchant: r.merchant, date: r.purchaseDate });
    }

    // Recurring charges: subscription-category receipts, or a merchant that bills once a month for a
    // near-identical amount in 2+ months (excluding everyday spending like groceries or fuel).
    const subscriptions = [...merchants.entries()]
      .map(([merchant, m]) => {
        const amounts = [...m.months.values()];
        const avg = amounts.reduce((s, a) => s + a, 0) / amounts.length;
        const merchantReceipts = receipts.filter((r) => r.merchant === merchant);
        const everyday = merchantReceipts.some((r) => VARIABLE_SPEND.has(r.category));
        const steady = !everyday && amounts.length >= 2 && m.count === amounts.length && amounts.every((a) => Math.abs(a - avg) <= avg * 0.05);
        const isSubCategory = merchantReceipts.some((r) => r.category === 'SUBSCRIPTIONS');
        return { merchant, monthlyAmount: round(avg), annualCost: round(avg * 12), months: amounts.length, recurring: steady || isSubCategory };
      })
      .filter((s) => s.recurring)
      .map(({ recurring, ...s }) => s)
      .sort((a, b) => b.annualCost - a.annualCost);

    const thisMonth = byMonth.get(thisMonthKey) ?? 0;
    const lastMonth = byMonth.get(lastMonthKey) ?? 0;

    const insights: string[] = [];
    for (const [cat, amt] of catThis) {
      const prev = catLast.get(cat) ?? 0;
      if (prev > 20 && amt > prev * 1.25) {
        insights.push(`${label(cat)} spending is up ${Math.round(((amt - prev) / prev) * 100)}% vs last month (${usd(amt)} vs ${usd(prev)}).`);
      }
    }
    if (subscriptions.length) {
      const yearly = subscriptions.reduce((s, x) => s + x.annualCost, 0);
      insights.push(`You have ${subscriptions.length} recurring charge${subscriptions.length > 1 ? 's' : ''} costing about ${usd(yearly)}/year. Review any you no longer use.`);
    }
    const hsaTotal = hsaItems.reduce((s, i) => s + i.price, 0);
    if (hsaTotal > 0) insights.push(`${usd(hsaTotal)} of purchases look HSA/FSA eligible. Keep these receipts for reimbursement.`);

    return {
      months,
      thisMonth: round(thisMonth),
      lastMonth: round(lastMonth),
      changePct: lastMonth ? Math.round(((thisMonth - lastMonth) / lastMonth) * 100) : null,
      monthStart: startOfMonth(now).toISOString(),
      byMonth: [...byMonth.entries()].map(([month, total]) => ({ month, total: round(total) })),
      byCategory: [...byCategory.entries()].map(([category, total]) => ({ category, total: round(total) })).sort((a, b) => b.total - a.total),
      topMerchants: [...merchants.entries()]
        .map(([merchant, m]) => ({ merchant, total: round(m.total), visits: m.count }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
      hsa: { total: round(hsaTotal), items: hsaItems.reverse() },
      subscriptions,
      insights,
    };
  }
}

function label(cat: string) {
  return cat.charAt(0) + cat.slice(1).toLowerCase().replace('_', ' ');
}
