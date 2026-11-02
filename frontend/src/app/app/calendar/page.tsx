'use client';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Plus, Trash2 } from 'lucide-react';
import { Button, EntityForm, ErrorBox, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useCrud } from '@/lib/use-crud';
import { useFetch } from '@/lib/use-fetch';
import { fmtDate, fmtDateTime, toDateInput } from '@/lib/format';
import type { CalendarEvent, Task } from '@/lib/types';

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true },
  { name: 'startsAt', label: 'Starts', type: 'datetime', required: true, half: true },
  { name: 'endsAt', label: 'Ends', type: 'datetime', half: true },
  { name: 'allDay', label: 'All-day event', type: 'checkbox' },
  { name: 'location', label: 'Location', half: true },
  { name: 'category', label: 'Category', placeholder: 'e.g. Health, School', half: true },
  { name: 'description', label: 'Notes', type: 'textarea' },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const crud = useCrud<CalendarEvent>('/events', 'Event');
  const { data: tasks } = useFetch<Task[]>('/tasks');
  const [cursor, setCursor] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [draft, setDraft] = useState<Partial<CalendarEvent> | null>(null);

  const days = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(1 - start.getDay());
    return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }, [cursor]);

  const byDay = useMemo(() => {
    const map = new Map<string, { events: CalendarEvent[]; tasks: Task[] }>();
    const get = (k: string) => map.get(k) ?? (map.set(k, { events: [], tasks: [] }), map.get(k)!);
    for (const e of crud.data ?? []) get(toDateInput(e.startsAt)).events.push(e);
    for (const t of tasks ?? []) if (t.dueDate && t.status !== 'DONE') get(toDateInput(t.dueDate)).tasks.push(t);
    return map;
  }, [crud.data, tasks]);

  const todayKey = toDateInput(new Date().toISOString());
  const upcoming = (crud.data ?? []).filter((e) => new Date(e.startsAt) >= new Date(new Date().setHours(0, 0, 0, 0))).slice(0, 8);

  const openNew = (day?: Date) => {
    const d = day ? new Date(day) : new Date();
    d.setHours(9, 0, 0, 0);
    setDraft({ startsAt: d.toISOString() });
    crud.setEditing('new');
  };
  const close = () => {
    crud.setEditing(null);
    setDraft(null);
  };

  return (
    <>
      <PageHeader title="Calendar" description="Appointments, visits and due dates for the whole household." action={<Button onClick={() => openNew()}><Plus className="size-4" /> New event</Button>} />
      {crud.error && <ErrorBox message={crud.error} />}
      {crud.loading && !crud.data ? <Spinner /> : (
        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <div className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
            <div className="flex items-center justify-between border-b border-sand-200 px-4 py-3">
              <h2 className="font-display text-lg font-semibold">{cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="rounded-lg p-1.5 hover:bg-sand-100" aria-label="Previous month"><ChevronLeft className="size-5" /></button>
                <button onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))} className="rounded-lg px-2 py-1 text-sm hover:bg-sand-100">Today</button>
                <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="rounded-lg p-1.5 hover:bg-sand-100" aria-label="Next month"><ChevronRight className="size-5" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-sand-200 bg-sand-50 text-center text-xs font-medium text-ink/50">
              {WEEKDAYS.map((d) => <div key={d} className="py-2">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {days.map((day) => {
                const key = toDateInput(day.toISOString());
                const items = byDay.get(key);
                const inMonth = day.getMonth() === cursor.getMonth();
                return (
                  <div
                    key={key}
                    onClick={() => openNew(day)}
                    className={`min-h-24 cursor-pointer border-b border-r border-sand-200 p-1.5 text-xs transition hover:bg-brand-50/40 ${inMonth ? '' : 'bg-sand-50/60 text-ink/35'}`}
                  >
                    <span className={`inline-flex size-6 items-center justify-center rounded-full ${key === todayKey ? 'bg-brand-700 font-semibold text-white' : ''}`}>{day.getDate()}</span>
                    <div className="mt-0.5 space-y-0.5">
                      {items?.events.slice(0, 3).map((e) => (
                        <button
                          key={e.id}
                          onClick={(ev) => { ev.stopPropagation(); crud.setEditing(e); }}
                          className="block w-full truncate rounded bg-brand-100 px-1 py-0.5 text-left text-brand-900 hover:bg-brand-200"
                        >
                          {e.allDay ? '' : `${new Date(e.startsAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} `}{e.title}
                        </button>
                      ))}
                      {items?.tasks.slice(0, 2).map((t) => (
                        <div key={t.id} className="truncate rounded bg-amber-100 px-1 py-0.5 text-amber-900" title="Task due">☐ {t.title}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Upcoming</h2>
            {upcoming.length === 0 && <p className="text-sm text-ink/50">No upcoming events.</p>}
            {upcoming.map((e) => (
              <div key={e.id} className="rounded-xl border border-sand-200 bg-white p-3">
                <div className="flex items-start justify-between gap-2">
                  <button onClick={() => crud.setEditing(e)} className="text-left text-sm font-medium hover:text-brand-700">{e.title}</button>
                  <button onClick={() => crud.remove(e, e.title)} className="rounded p-1 text-ink/40 hover:text-red-600" aria-label="Delete"><Trash2 className="size-3.5" /></button>
                </div>
                <p className="text-xs text-ink/55">{e.allDay ? `${fmtDate(e.startsAt)} · All day` : fmtDateTime(e.startsAt)}</p>
                {e.location && <p className="mt-1 flex items-center gap-1 text-xs text-ink/55"><MapPin className="size-3" />{e.location}</p>}
              </div>
            ))}
            <p className="pt-2 text-xs text-ink/45"><span className="mr-1 inline-block size-2 rounded-sm bg-brand-200" />Events <span className="ml-3 mr-1 inline-block size-2 rounded-sm bg-amber-200" />Task due dates</p>
          </div>
        </div>
      )}
      <Modal open={crud.editing !== null} onClose={close} title={crud.editing === 'new' ? 'New event' : 'Edit event'}>
        {crud.editing !== null && (
          <>
            <EntityForm
              fields={FIELDS}
              record={crud.editing === 'new' ? draft : crud.editing}
              onSubmit={async (p) => { await crud.save(p); setDraft(null); }}
              onCancel={close}
            />
            {crud.editing !== 'new' && (
              <button
                onClick={async () => { const e = crud.editing as CalendarEvent; close(); await crud.remove(e, e.title); }}
                className="mt-3 text-sm text-red-600 hover:underline"
              >
                Delete event
              </button>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
