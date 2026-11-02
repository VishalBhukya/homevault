'use client';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { label, money, monthLabel } from '@/lib/format';

/** Single-series monthly spend. One hue; the card title names the series, so no legend. */
export function MonthlySpendChart({ data, height = 220 }: { data: { month: string; total: number }[]; height?: number }) {
  const rows = data.map((d) => ({ ...d, name: monthLabel(d.month) }));
  return (
    <div style={{ height }} role="img" aria-label={`Monthly spending: ${rows.map((r) => `${r.name} ${money(r.total)}`).join(', ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 8, right: 4, left: -12, bottom: 0 }} barCategoryGap="30%">
          <CartesianGrid vertical={false} stroke="#e9e5d8" strokeDasharray="0" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#17241f99', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#17241f80', fontSize: 11 }} tickFormatter={(v) => `$${v}`} width={56} />
          <Tooltip
            cursor={{ fill: '#f5f3ec' }}
            contentStyle={{ borderRadius: 10, border: '1px solid #e9e5d8', fontSize: 12, color: '#17241f' }}
            formatter={(v: number) => [money(v), 'Spent']}
          />
          <Bar dataKey="total" fill="#187d65" radius={[4, 4, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Ranked magnitude by category as labeled horizontal bars (labels carry identity, not color). */
export function CategoryBars({ data, limit = 6 }: { data: { category: string; total: number }[]; limit?: number }) {
  const rows = data.slice(0, limit);
  const max = Math.max(...rows.map((r) => r.total), 1);
  if (!rows.length) return <p className="text-sm text-ink/50">No spending recorded yet.</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.category} title={`${label(r.category)}: ${money(r.total)}`}>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-ink/75">{label(r.category)}</span>
            <span className="font-medium tabular-nums">{money(r.total)}</span>
          </div>
          <div className="h-2 rounded-full bg-sand-100">
            <div className="h-2 rounded-full bg-brand-600" style={{ width: `${(r.total / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
