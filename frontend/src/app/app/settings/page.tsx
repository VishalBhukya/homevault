'use client';
import { useEffect, useState } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { Badge, Button, Card, EntityForm, ErrorBox, Field, Input, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { useFetch } from '@/lib/use-fetch';
import { daysUntil, fmtDate, label } from '@/lib/format';
import type { Household, Plan } from '@/lib/types';

const PLANS: { key: Plan; price: string; blurb: string }[] = [
  { key: 'FREE', price: '$0', blurb: 'Vault, calendar, tasks, contacts, emergency binder' },
  { key: 'ESSENTIAL', price: '$8/mo', blurb: 'Adds receipts, spending analytics & more storage' },
  { key: 'FAMILY', price: '$16/mo', blurb: 'Adds spending & HSA insights, life-event guides' },
  { key: 'PRO', price: '$32/mo', blurb: 'Adds rental property tracking & priority support' },
];

const MEMBER_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Temporary password', required: true, hint: 'At least 8 characters. Share it with them so they can sign in.' },
  { name: 'role', label: 'Role', type: 'select', options: [{ value: 'MEMBER', label: 'Member' }, { value: 'ADMIN', label: 'Admin (can manage members)' }] },
];

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const toast = useToast();
  const household = useFetch<Household>('/household');
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const canManage = user?.role === 'OWNER' || user?.role === 'ADMIN';
  const h = household.data;

  useEffect(() => {
    if (h) setName(h.name);
  }, [h]);

  const update = async (patch: Partial<Household>) => {
    setSaving(true);
    try {
      await api.patch('/household', patch);
      toast('Household updated');
      await Promise.all([household.reload(), refresh()]);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeMember = async (id: string, memberName: string) => {
    if (!window.confirm(`Remove ${memberName} from the household? Their account will be deleted.`)) return;
    try {
      await api.del(`/household/members/${id}`);
      toast('Member removed');
      household.reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  if (household.error) return <ErrorBox message={household.error} />;
  if (!h) return <Spinner />;

  return (
    <>
      <PageHeader title="Household settings" description="Members, plan and household details." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-4 font-semibold">Household</h2>
          <form onSubmit={(e) => { e.preventDefault(); update({ name }); }} className="flex items-end gap-2">
            <div className="flex-1"><Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} disabled={!canManage} /></Field></div>
            {canManage && <Button type="submit" loading={saving} disabled={!name.trim() || name === h.name}>Save</Button>}
          </form>
          {h.trialEndsAt && daysUntil(h.trialEndsAt) > 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">Free trial of the Family plan ends {fmtDate(h.trialEndsAt)} ({daysUntil(h.trialEndsAt)} days left).</p>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Members</h2>
            {canManage && <Button size="sm" onClick={() => setAdding(true)}><UserPlus className="size-4" />Add member</Button>}
          </div>
          <ul className="divide-y divide-sand-200">
            {h.users?.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{m.name} {m.id === user?.id && <span className="text-ink/40">(you)</span>}</p>
                  <p className="truncate text-xs text-ink/50">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={m.role === 'OWNER' ? 'green' : m.role === 'ADMIN' ? 'blue' : 'gray'}>{label(m.role)}</Badge>
                  {canManage && m.role !== 'OWNER' && m.id !== user?.id && (
                    <button onClick={() => removeMember(m.id, m.name)} className="rounded p-1 text-ink/40 hover:text-red-600" aria-label="Remove member"><Trash2 className="size-4" /></button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">Plan</h2>
          <p className="mb-4 text-sm text-ink/55">Billing isn’t connected in this build, so switching plans is instant and free.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((p) => (
              <button
                key={p.key}
                disabled={!canManage || saving}
                onClick={() => p.key !== h.plan && update({ plan: p.key })}
                className={`rounded-xl border p-4 text-left transition ${p.key === h.plan ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-100' : 'border-sand-200 hover:border-brand-300'} disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between"><span className="font-semibold">{label(p.key)}</span>{p.key === h.plan && <Badge color="green">Current</Badge>}</div>
                <p className="mt-1 text-lg font-semibold">{p.price}</p>
                <p className="mt-1 text-xs text-ink/55">{p.blurb}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add household member">
        {adding && (
          <EntityForm
            fields={MEMBER_FIELDS}
            submitLabel="Add member"
            onCancel={() => setAdding(false)}
            onSubmit={async (p) => {
              await api.post('/household/members', p);
              toast(`${p.name} added`);
              setAdding(false);
              household.reload();
            }}
          />
        )}
      </Modal>
    </>
  );
}
