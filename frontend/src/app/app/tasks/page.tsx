'use client';
import { useMemo, useState } from 'react';
import { CheckSquare, Pencil, Plus, Repeat, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyState, EntityForm, ErrorBox, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { api } from '@/lib/api';
import { useCrud } from '@/lib/use-crud';
import { useFetch } from '@/lib/use-fetch';
import { fmtDate, label } from '@/lib/format';
import type { Household, Task } from '@/lib/types';

const FILTERS = ['Open', 'Overdue', 'Done', 'All'] as const;
const PRIORITY_COLOR = { HIGH: 'red', MEDIUM: 'amber', LOW: 'gray' } as const;

export default function TasksPage() {
  const crud = useCrud<Task>('/tasks', 'Task');
  const { data: household } = useFetch<Household>('/household');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Open');

  const fields: FieldDef[] = useMemo(
    () => [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Notes', type: 'textarea' },
      { name: 'dueDate', label: 'Due date', type: 'date', half: true },
      { name: 'priority', label: 'Priority', type: 'select', options: ['MEDIUM', 'HIGH', 'LOW'], half: true },
      { name: 'recurrence', label: 'Repeats', type: 'select', options: ['NONE', 'WEEKLY', 'MONTHLY', 'YEARLY'], half: true, hint: 'Completing it schedules the next one' },
      {
        name: 'assigneeId', label: 'Assigned to', type: 'select', half: true,
        options: [{ value: '', label: 'Unassigned' }, ...(household?.users ?? []).map((u) => ({ value: u.id, label: u.name }))],
      },
      { name: 'category', label: 'Category', placeholder: 'e.g. Home, Finance, Health', half: true },
    ],
    [household],
  );

  const now = new Date();
  const tasks = (crud.data ?? []).filter((t) => {
    if (filter === 'Open') return t.status !== 'DONE';
    if (filter === 'Done') return t.status === 'DONE';
    if (filter === 'Overdue') return t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now;
    return true;
  });

  const toggle = async (t: Task) => {
    try {
      await api.patch(`/tasks/${t.id}`, { status: t.status === 'DONE' ? 'TODO' : 'DONE' });
      if (t.status !== 'DONE' && t.recurrence !== 'NONE' && t.dueDate) crud.toast(`Done! Next "${t.title}" scheduled.`);
      await crud.reload();
    } catch (e) {
      crud.toast((e as Error).message, 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Tasks"
        description="Household to-dos, renewals and recurring maintenance."
        action={<Button onClick={() => crud.setEditing('new')}><Plus className="size-4" /> New task</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-sm ${filter === f ? 'bg-ink text-white' : 'bg-white text-ink/70 ring-1 ring-sand-200 hover:bg-sand-100'}`}>
            {f}
          </button>
        ))}
      </div>
      {crud.error && <ErrorBox message={crud.error} />}
      {crud.loading && !crud.data ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <EmptyState icon={<CheckSquare className="size-6" />} title="No tasks here" text="Add a task, or add a whole checklist from Life-event guides." action={<Button onClick={() => crud.setEditing('new')}>Add task</Button>} />
      ) : (
        <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
          {tasks.map((t) => {
            const overdue = t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now;
            return (
              <li key={t.id} className="flex items-start gap-3 px-4 py-3">
                <input type="checkbox" checked={t.status === 'DONE'} onChange={() => toggle(t)} className="mt-1 size-4 shrink-0 accent-brand-700" aria-label={`Mark ${t.title} done`} />
                <div className="min-w-0 flex-1">
                  <p className={`font-medium ${t.status === 'DONE' ? 'text-ink/40 line-through' : ''}`}>{t.title}</p>
                  {t.description && <p className="mt-0.5 line-clamp-2 text-sm text-ink/55">{t.description}</p>}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-ink/55">
                    {t.dueDate && <span className={overdue ? 'font-medium text-red-600' : ''}>Due {fmtDate(t.dueDate)}</span>}
                    <Badge color={PRIORITY_COLOR[t.priority]}>{label(t.priority)}</Badge>
                    {t.recurrence !== 'NONE' && <span className="flex items-center gap-1"><Repeat className="size-3" />{label(t.recurrence)}</span>}
                    {t.category && <Badge>{t.category}</Badge>}
                    {t.assignee && <span>· {t.assignee.name}</span>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => crud.setEditing(t)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-100" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button onClick={() => crud.remove(t, t.title)} className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <Modal open={crud.editing !== null} onClose={() => crud.setEditing(null)} title={crud.editing === 'new' ? 'New task' : 'Edit task'}>
        {crud.editing !== null && (
          <EntityForm fields={fields} record={crud.editing === 'new' ? null : crud.editing} onSubmit={crud.save} onCancel={() => crud.setEditing(null)} />
        )}
      </Modal>
    </>
  );
}
