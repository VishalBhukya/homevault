'use client';
import { useState } from 'react';
import { Mail, MapPin, Pencil, Phone, Plus, Siren, Trash2, Users } from 'lucide-react';
import { Badge, Button, EmptyState, EntityForm, ErrorBox, Input, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useCrud } from '@/lib/use-crud';
import { CONTACT_CATEGORIES, label } from '@/lib/format';
import type { Contact } from '@/lib/types';

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Name', required: true },
  { name: 'category', label: 'Category', type: 'select', options: CONTACT_CATEGORIES, half: true },
  { name: 'relationship', label: 'Relationship / role', placeholder: 'e.g. Pediatrician, Neighbor', half: true },
  { name: 'phone', label: 'Phone', type: 'tel', half: true },
  { name: 'email', label: 'Email', type: 'email', half: true },
  { name: 'address', label: 'Address' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
  { name: 'isEmergency', label: 'Emergency contact (appears in the emergency binder)', type: 'checkbox' },
];

export default function ContactsPage() {
  const crud = useCrud<Contact>('/contacts', 'Contact');
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('ALL');
  const contacts = (crud.data ?? []).filter(
    (c) => (cat === 'ALL' || c.category === cat) && `${c.name} ${c.relationship ?? ''} ${c.phone ?? ''}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageHeader title="Contacts" description="Family, doctors, service pros and everyone your household relies on." action={<Button onClick={() => crud.setEditing('new')}><Plus className="size-4" /> New contact</Button>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <Input placeholder="Search contacts…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-lg border border-sand-200 bg-white px-3 text-sm">
          <option value="ALL">All categories</option>
          {CONTACT_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
        </select>
      </div>
      {crud.error && <ErrorBox message={crud.error} />}
      {crud.loading && !crud.data ? <Spinner /> : contacts.length === 0 ? (
        <EmptyState icon={<Users className="size-6" />} title="No contacts found" text="Add the people and businesses your household depends on." action={<Button onClick={() => crud.setEditing('new')}>Add contact</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contacts.map((c) => (
            <div key={c.id} className="rounded-2xl border border-sand-200 bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{c.name}</p>
                  {c.relationship && <p className="truncate text-sm text-ink/55">{c.relationship}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button onClick={() => crud.setEditing(c)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-100" aria-label="Edit"><Pencil className="size-4" /></button>
                  <button onClick={() => crud.remove(c, c.name)} className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge>{label(c.category)}</Badge>
                {c.isEmergency && <Badge color="red"><Siren className="mr-1 size-3" />Emergency</Badge>}
              </div>
              <div className="mt-3 space-y-1.5 text-sm">
                {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-brand-700 hover:underline"><Phone className="size-3.5" />{c.phone}</a>}
                {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-2 truncate text-brand-700 hover:underline"><Mail className="size-3.5" />{c.email}</a>}
                {c.address && <p className="flex items-center gap-2 text-ink/60"><MapPin className="size-3.5 shrink-0" />{c.address}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={crud.editing !== null} onClose={() => crud.setEditing(null)} title={crud.editing === 'new' ? 'New contact' : 'Edit contact'}>
        {crud.editing !== null && <EntityForm fields={FIELDS} record={crud.editing === 'new' ? null : crud.editing} onSubmit={crud.save} onCancel={() => crud.setEditing(null)} />}
      </Modal>
    </>
  );
}
