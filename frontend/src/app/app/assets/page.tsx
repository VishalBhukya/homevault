'use client';
import { Package, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, EntityForm, ErrorBox, Modal, PageHeader, Spinner, type FieldDef } from '@/components/ui';
import { useCrud } from '@/lib/use-crud';
import { ASSET_CATEGORIES, daysUntil, fmtDate, label, money } from '@/lib/format';
import type { Asset } from '@/lib/types';

const FIELDS: FieldDef[] = [
  { name: 'name', label: 'Item', required: true, placeholder: 'e.g. LG Refrigerator' },
  { name: 'category', label: 'Category', type: 'select', options: ASSET_CATEGORIES, half: true },
  { name: 'location', label: 'Location', placeholder: 'e.g. Kitchen', half: true },
  { name: 'brand', label: 'Brand', half: true },
  { name: 'model', label: 'Model', half: true },
  { name: 'serialNumber', label: 'Serial number / VIN' },
  { name: 'purchaseDate', label: 'Purchase date', type: 'date', half: true },
  { name: 'purchasePrice', label: 'Purchase price ($)', type: 'number', half: true },
  { name: 'warrantyExpiresAt', label: 'Warranty expires', type: 'date', half: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

function warranty(iso: string | null) {
  if (!iso) return <Badge>No warranty</Badge>;
  const d = daysUntil(iso);
  if (d < 0) return <Badge color="red">Warranty expired</Badge>;
  if (d <= 30) return <Badge color="amber">Warranty ends in {d}d</Badge>;
  return <Badge color="green"><ShieldCheck className="mr-1 size-3" />Until {fmtDate(iso)}</Badge>;
}

export default function AssetsPage() {
  const crud = useCrud<Asset>('/assets', 'Asset');
  const assets = crud.data ?? [];
  const totalValue = assets.reduce((s, a) => s + (a.purchasePrice ?? 0), 0);
  const active = assets.filter((a) => a.warrantyExpiresAt && daysUntil(a.warrantyExpiresAt) >= 0).length;

  return (
    <>
      <PageHeader title="Assets & warranties" description="A home inventory for insurance claims, warranties and resale." action={<Button onClick={() => crud.setEditing('new')}><Plus className="size-4" /> Add asset</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card><p className="text-sm text-ink/55">Items tracked</p><p className="mt-1 text-2xl font-semibold">{assets.length}</p></Card>
        <Card><p className="text-sm text-ink/55">Total purchase value</p><p className="mt-1 text-2xl font-semibold">{money(totalValue)}</p></Card>
        <Card><p className="text-sm text-ink/55">Active warranties</p><p className="mt-1 text-2xl font-semibold">{active}</p></Card>
      </div>
      {crud.error && <ErrorBox message={crud.error} />}
      {crud.loading && !crud.data ? <Spinner /> : assets.length === 0 ? (
        <EmptyState icon={<Package className="size-6" />} title="No assets yet" text="Add valuables and appliances, or save a receipt with “create assets” turned on." action={<Button onClick={() => crud.setEditing('new')}>Add asset</Button>} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-sand-50 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr><th className="px-4 py-3">Item</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Location</th><th className="px-4 py-3">Purchased</th><th className="px-4 py-3 text-right">Price</th><th className="px-4 py-3">Warranty</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-sand-200">
              {assets.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-ink/50">{[a.brand, a.model, a.serialNumber].filter(Boolean).join(' · ')}</p>
                  </td>
                  <td className="px-4 py-3">{label(a.category)}</td>
                  <td className="px-4 py-3 text-ink/65">{a.location ?? '—'}</td>
                  <td className="px-4 py-3 text-ink/65">{fmtDate(a.purchaseDate)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{money(a.purchasePrice)}</td>
                  <td className="px-4 py-3">{warranty(a.warrantyExpiresAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => crud.setEditing(a)} className="rounded-lg p-1.5 text-ink/50 hover:bg-sand-100" aria-label="Edit"><Pencil className="size-4" /></button>
                      <button onClick={() => crud.remove(a, a.name)} className="rounded-lg p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="size-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={crud.editing !== null} onClose={() => crud.setEditing(null)} title={crud.editing === 'new' ? 'Add asset' : 'Edit asset'}>
        {crud.editing !== null && <EntityForm fields={FIELDS} record={crud.editing === 'new' ? null : crud.editing} onSubmit={crud.save} onCancel={() => crud.setEditing(null)} />}
      </Modal>
    </>
  );
}
