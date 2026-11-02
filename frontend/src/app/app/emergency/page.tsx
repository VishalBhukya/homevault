'use client';
import { useState } from 'react';
import { CheckCircle2, Circle, FileText, Pencil, Phone, Plus, Printer, Trash2 } from 'lucide-react';
import { Button, Card, EntityForm, ErrorBox, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
import { EMERGENCY_SECTIONS, fmtDate, fmtDateTime, label } from '@/lib/format';
import type { Binder, EmergencyEntry } from '@/lib/types';

const FIELDS: FieldDef[] = [
  { name: 'section', label: 'Section', type: 'select', options: EMERGENCY_SECTIONS.map((s) => ({ value: s.key, label: s.label })) },
  { name: 'title', label: 'Title', required: true },
  { name: 'content', label: 'Details', type: 'textarea', required: true, hint: 'Avoid writing actual passwords. Say where they are kept instead.' },
];

export default function EmergencyPage() {
  const binder = useFetch<Binder>('/emergency/binder');
  const toast = useToast();
  const [editing, setEditing] = useState<Partial<EmergencyEntry> | null>(null);
  const b = binder.data;

  const save = async (payload: Record<string, unknown>) => {
    if (editing?.id) await api.patch(`/emergency/${editing.id}`, payload);
    else await api.post('/emergency', payload);
    toast('Binder updated');
    setEditing(null);
    binder.reload();
  };
  const remove = async (e: EmergencyEntry) => {
    if (!window.confirm(`Delete "${e.title}"?`)) return;
    await api.del(`/emergency/${e.id}`);
    binder.reload();
  };

  if (binder.error) return <ErrorBox message={binder.error} />;
  if (!b) return <Spinner />;

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="Emergency binder"
          description="Everything your family would need if you were suddenly unavailable."
          action={
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => window.print()}><Printer className="size-4" />Print / PDF</Button>
              <Button onClick={() => setEditing({ section: 'MEDICAL' })}><Plus className="size-4" />Add entry</Button>
            </div>
          }
        />
        <Card className="mb-6">
          <div className="flex flex-wrap items-center gap-6">
            <div className="relative size-24 shrink-0">
              <svg viewBox="0 0 36 36" className="size-24 -rotate-90">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f5f3ec" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="#187d65" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${b.readiness} 100`} />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xl font-semibold">{b.readiness}%</span>
            </div>
            <div className="flex-1">
              <h2 className="font-semibold">Readiness score</h2>
              <div className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {b.checklist.map((c) => (
                  <span key={c.label} className={`flex items-center gap-1.5 ${c.done ? 'text-ink/60' : 'text-ink'}`}>
                    {c.done ? <CheckCircle2 className="size-4 text-brand-600" /> : <Circle className="size-4 text-ink/30" />}
                    {c.label.charAt(0).toUpperCase() + c.label.slice(1)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Printable binder */}
      <div className="space-y-6">
        <div className="hidden print:block">
          <h1 className="font-display text-3xl font-semibold">{b.household.name}: Emergency Binder</h1>
          <p className="text-sm text-ink/60">Generated {fmtDateTime(b.generatedAt)} · Members: {b.household.members.map((m) => m.name).join(', ')}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="print-break">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Phone className="size-4" />Emergency contacts</h2>
            {b.emergencyContacts.length === 0 ? <p className="text-sm text-ink/50">Mark contacts as “emergency” on the Contacts page.</p> : (
              <ul className="space-y-2 text-sm">
                {b.emergencyContacts.map((c) => (
                  <li key={c.id}><span className="font-medium">{c.name}</span>{c.relationship && <span className="text-ink/55"> · {c.relationship}</span>}<br /><span className="text-ink/70">{[c.phone, c.email].filter(Boolean).join(' · ')}</span></li>
                ))}
              </ul>
            )}
          </Card>
          <Card className="print-break">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><FileText className="size-4" />Key documents</h2>
            {b.documents.length === 0 ? <p className="text-sm text-ink/50">Tick “Include in the emergency binder” on important documents.</p> : (
              <ul className="space-y-2 text-sm">
                {b.documents.map((d) => (
                  <li key={d.id}><span className="font-medium">{d.title}</span> <span className="text-ink/50">({label(d.category)}{d.expiresAt ? `, expires ${fmtDate(d.expiresAt)}` : ''})</span>{d.notes && <p className="text-ink/65">{d.notes}</p>}</li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {EMERGENCY_SECTIONS.map((s) => {
            const entries = b.sections.find((x) => x.section === s.key)?.entries ?? [];
            return (
              <Card key={s.key} className={`print-break ${entries.length === 0 ? 'print:hidden border-dashed' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold">{s.label}</h3>
                    <p className="no-print text-xs text-ink/50">{s.hint}</p>
                  </div>
                  <button onClick={() => setEditing({ section: s.key })} className="no-print rounded-lg p-1.5 text-ink/50 hover:bg-sand-100" aria-label={`Add to ${s.label}`}><Plus className="size-4" /></button>
                </div>
                <div className="mt-3 space-y-3">
                  {entries.map((e) => (
                    <div key={e.id} className="group rounded-lg bg-sand-50 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium">{e.title}</p>
                        <div className="no-print flex gap-1 opacity-60 group-hover:opacity-100">
                          <button onClick={() => setEditing(e)} aria-label="Edit"><Pencil className="size-3.5" /></button>
                          <button onClick={() => remove(e)} aria-label="Delete" className="hover:text-red-600"><Trash2 className="size-3.5" /></button>
                        </div>
                      </div>
                      <p className="mt-1 whitespace-pre-line text-sm text-ink/70">{e.content}</p>
                    </div>
                  ))}
                  {entries.length === 0 && <p className="text-sm text-ink/40">Nothing here yet.</p>}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing?.id ? 'Edit entry' : 'Add binder entry'}>
        {editing && <EntityForm fields={FIELDS} record={editing} onSubmit={save} onCancel={() => setEditing(null)} />}
      </Modal>
    </>
  );
}
