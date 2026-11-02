'use client';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarDays, CheckSquare, Clock, FileText, Info, LifeBuoy, Package, Receipt, Users } from 'lucide-react';
import { Badge, Card, ErrorBox, Spinner } from '@/components/ui';
import { CategoryBars, MonthlySpendChart } from '@/components/charts';
import { useAuth } from '@/lib/auth';
import { useFetch } from '@/lib/use-fetch';
import { daysUntil, fmtDate, fmtDateTime, money } from '@/lib/format';
import type { Dashboard } from '@/lib/types';

const ALERT_STYLE = {
  danger: { cls: 'border-red-200 bg-red-50 text-red-800', icon: AlertTriangle },
  warning: { cls: 'border-amber-200 bg-amber-50 text-amber-900', icon: Clock },
  info: { cls: 'border-sky-200 bg-sky-50 text-sky-900', icon: Info },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading } = useFetch<Dashboard>('/dashboard');

  if (loading && !data) return <Spinner />;
  if (error) return <ErrorBox message={error} />;
  if (!data) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const trialDays = data.household.trialEndsAt ? daysUntil(data.household.trialEndsAt) : null;

  const stats = [
    { label: 'Open tasks', value: data.counts.openTasks, href: '/app/tasks', icon: CheckSquare },
    { label: 'Documents', value: data.counts.documents, href: '/app/documents', icon: FileText },
    { label: 'Assets', value: data.counts.assets, href: '/app/assets', icon: Package },
    { label: 'Contacts', value: data.counts.contacts, href: '/app/contacts', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink/55">{greeting}, {user?.name.split(' ')[0]}</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight">{data.household.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge color="green">{data.household.plan} plan</Badge>
          {trialDays !== null && trialDays > 0 && <Badge color="amber">Trial: {trialDays} days left</Badge>}
        </div>
      </div>

      {data.alerts.length > 0 && (
        <div className="grid gap-2 md:grid-cols-2">
          {data.alerts.map((a, i) => {
            const { cls, icon: Icon } = ALERT_STYLE[a.level];
            return (
              <Link key={i} href={a.href} className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm transition hover:shadow-sm ${cls}`}>
                <Icon className="size-4 shrink-0" />
                <span className="flex-1">{a.message}</span>
                <ArrowRight className="size-4 opacity-50" />
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="transition hover:border-brand-300">
              <div className="flex items-center justify-between text-ink/50">
                <span className="text-sm">{label}</span>
                <Icon className="size-4" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{value}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-semibold">Monthly spending</h2>
              <p className="text-sm text-ink/55">
                {money(data.spending.thisMonth)} this month
                {data.spending.changePct !== null && (
                  <span className={data.spending.changePct > 0 ? 'text-red-600' : 'text-brand-700'}>
                    {' '}({data.spending.changePct > 0 ? '+' : ''}{data.spending.changePct}% vs last month)
                  </span>
                )}
              </p>
            </div>
            <Link href="/app/receipts" className="text-sm font-medium text-brand-700 hover:underline">View receipts</Link>
          </div>
          <MonthlySpendChart data={data.spending.byMonth} />
        </Card>
        <Card>
          <h2 className="mb-4 font-semibold">Top categories (6 months)</h2>
          <CategoryBars data={data.spending.topCategories} limit={5} />
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Needs attention</h2>
            <Link href="/app/tasks" className="text-sm text-brand-700 hover:underline">All tasks</Link>
          </div>
          {[...data.overdueTasks, ...data.upcomingTasks].length === 0 ? (
            <p className="text-sm text-ink/50">Nothing due in the next 7 days. 🎉</p>
          ) : (
            <ul className="divide-y divide-sand-200">
              {[...data.overdueTasks, ...data.upcomingTasks].slice(0, 6).map((t) => {
                const overdue = t.dueDate && new Date(t.dueDate) < new Date();
                return (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-ink/50">{t.assignee ? `${t.assignee.name} · ` : ''}due {fmtDate(t.dueDate)}</p>
                    </div>
                    {overdue ? <Badge color="red">Overdue</Badge> : <Badge color="amber">Soon</Badge>}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Coming up</h2>
            <Link href="/app/calendar" className="text-sm text-brand-700 hover:underline">Calendar</Link>
          </div>
          {data.upcomingEvents.length === 0 ? (
            <p className="text-sm text-ink/50">No events in the next two weeks.</p>
          ) : (
            <ul className="space-y-3">
              {data.upcomingEvents.map((e) => (
                <li key={e.id} className="flex gap-3">
                  <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                    <span className="text-[10px] uppercase">{new Date(e.startsAt).toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-sm font-semibold leading-none">{new Date(e.startsAt).getDate()}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{e.title}</p>
                    <p className="truncate text-xs text-ink/50">{e.allDay ? 'All day' : fmtDateTime(e.startsAt)}{e.location ? ` · ${e.location}` : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Emergency readiness</h2>
              <LifeBuoy className="size-4 text-ink/40" />
            </div>
            <p className="mt-2 text-3xl font-semibold tabular-nums">{data.readiness}%</p>
            <div className="mt-2 h-2 rounded-full bg-sand-100">
              <div className="h-2 rounded-full bg-brand-600" style={{ width: `${data.readiness}%` }} />
            </div>
            <Link href="/app/emergency" className="mt-3 inline-block text-sm text-brand-700 hover:underline">Complete your binder →</Link>
          </Card>
          <Card>
            <h2 className="font-semibold">Expiring soon</h2>
            {data.expiring.length === 0 ? (
              <p className="mt-2 text-sm text-ink/50">Nothing expiring in the next 60 days.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {data.expiring.slice(0, 4).map((e) => (
                  <li key={e.kind + e.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate">{e.kind === 'WARRANTY' ? `${e.name} warranty` : e.name}</span>
                    <Badge color={e.daysLeft < 0 ? 'red' : e.daysLeft <= 14 ? 'amber' : 'gray'}>
                      {e.daysLeft < 0 ? 'Expired' : `${e.daysLeft}d`}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: '/app/documents', icon: FileText, t: 'Add a document', d: `${data.counts.documents} documents in the vault` },
          { href: '/app/receipts', icon: Receipt, t: 'Add a receipt', d: `${data.counts.receipts} receipts on file` },
          { href: '/app/calendar', icon: CalendarDays, t: 'Plan the week', d: 'Shared family calendar' },
        ].map(({ href, icon: Icon, t, d }) => (
          <Link key={href} href={href} className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4 transition hover:border-brand-300">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-700"><Icon className="size-5" /></div>
            <div>
              <p className="text-sm font-semibold">{t}</p>
              <p className="text-xs text-ink/55">{d}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
