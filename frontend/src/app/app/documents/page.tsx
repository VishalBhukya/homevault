'use client';
import { useState } from 'react';
import { BookMarked, ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, EmptyState, EntityForm, ErrorBox, Input, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useCrud } from '@/lib/use-crud';
import { daysUntil, DOCUMENT_CATEGORIES, fmtDate, label } from '@/lib/format';
import type { Doc } from '@/lib/types';

const FIELDS: FieldDef[] = [
  { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Homeowners insurance policy' },
  { name: 'category', label: 'Category', type: 'select', options: DOCUMENT_CATEGORIES, half: true },
  { name: 'expiresAt', label: 'Expires / renews', type: 'date', half: true },
  { name: 'notes', label: 'Key details', type: 'textarea', placeholder: 'Policy numbers, where the original is kept, who to call…' },
  { name: 'file', label: 'File', type: 'file', hint: 'PDF, image or Word document up to 10 MB' },
  { name: 'includeInBinder', label: 'Include in the emergency binder', type: 'checkbox' },
];

function expiryBadge(iso: string | null) {
  if (!iso) return null;
  const d = daysUntil(iso);
  if (d < 0) return <Badge color="red">Expired</Badge>;
  if (d <= 30) return <Badge color="amber">Expires in {d}d</Badge>;
  return <Badge>Expires {fmtDate(iso)}</Badge>;
}

export default function DocumentsPage() {
  const crud = useCrud<Doc>('/documents', 'Document');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const docs = (crud.data ?? []).filter((d) => (cat === 'ALL' || d.category === cat) && `${d.title} ${d.notes ?? ''}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader title="Document vault" description="Insurance, legal, medical and financial documents, with expiry tracking." action={<Button onClick={() => crud.setEditing('new')}><Plus className="size-4" /> Add document</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <div className="flex flex-wrap gap-1.5">
          {['ALL', ...DOCUMENT_CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-xs ${cat === c ? 'bg-ink text-white' : 'bg-white text-ink/70 ring-1 ring-sand-200 hover:bg-sand-100'}`}>
              {c === 'ALL' ? 'All' : label(c)}
            </button>
          ))}
        </div>
      </div>
      {crud.error && <ErrorBox message={crud.error} />}
      {crud.loading && !crud.data ? <Spinner /> : docs.length === 0 ? (
        <EmptyState icon={<FileText className="size-6" />} title="No documents yet" text="Upload policies, IDs, wills and statements so the whole household can find them." action={<Button onClick={() => crud.setEditing('new')}>Add document</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {docs.map((d) => (
            <div key={d.id} className="flex gap-4 rounded-2xl border border-sand-200 bg-white p-5">
              <div className="h-fit rounded-xl bg-brand-50 p-3 text-brand-700"><FileText className="size-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">{d.title}</p>
                  <div className="flex shrink-0 gap-1">
                    <button onClick={() => crud.setEditing(d)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-100" aria-label="Edit"><Pencil className="size-4" /></button>
                    <button onClick={() => crud.remove(d, d.title)} className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge color="blue">{label(d.category)}</Badge>
                  {expiryBadge(d.expiresAt)}
                  {d.includeInBinder && <Badge color="green"><BookMarked className="mr-1 size-3" />In binder</Badge>}
                </div>
                {d.notes && <p className="mt-2 whitespace-pre-line text-sm text-ink/65">{d.notes}</p>}
                {d.fileUrl && (
                  <a href={d.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:underline">
                    <ExternalLink className="size-3.5" /> {d.fileName ?? 'Open file'}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={crud.editing !== null} onClose={() => crud.setEditing(null)} title={crud.editing === 'new' ? 'Add document' : 'Edit document'}>
        {crud.editing !== null && <EntityForm fields={FIELDS} record={crud.editing === 'new' ? null : crud.editing} onSubmit={crud.save} onCancel={() => crud.setEditing(null)} />}
      </Modal>
    </>
  );
}
