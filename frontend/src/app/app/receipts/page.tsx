'use client';
import { useState } from 'react';
import { ChevronDown, ExternalLink, HeartPulse, Lightbulb, Loader2, Paperclip, Plus, Receipt as ReceiptIcon, Repeat, Trash2 } from 'lucide-react';
import { Badge, Button, Card, EmptyState, ErrorBox, Field, Input, inputClass, Modal, PageHeader, Spinner } from '@/components/ui';
import { CategoryBars, MonthlySpendChart } from '@/components/charts';
import { useToast } from '@/components/toast';
import { api } from '@/lib/api';
import { useFetch } from '@/lib/use-fetch';
import { fmtDate, fromDateInput, label, money, SPEND_CATEGORIES, toDateInput } from '@/lib/format';
import type { Analytics, Receipt, ReceiptDraft, ReceiptItem } from '@/lib/types';

const emptyDraft = (): ReceiptDraft => ({
  merchant: '', purchaseDate: toDateInput(new Date().toISOString()), total: 0, tax: null, category: 'OTHER', paymentMethod: null, items: [],
});

function ReceiptForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [d, setD] = useState<ReceiptDraft>(emptyDraft);
  const [file, setFile] = useState<{ url: string; fileName: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createAssets, setCreateAssets] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const setItem = (idx: number, patch: Partial<ReceiptItem>) => setD({ ...d, items: d.items.map((it, i) => (i === idx ? { ...it, ...patch } : it)) });
  const itemsSum = d.items.reduce((s, i) => s + (Number(i.price) || 0), 0);

  const attach = async (f: File | undefined) => {
    if (!f) return;
    setUploading(true);
    setError(null);
    try {
      setFile(await api.upload(f));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api.post('/receipts', {
        merchant: d.merchant.trim(),
        purchaseDate: fromDateInput(d.purchaseDate ?? ''),
        total: Number(d.total) || 0,
        tax: d.tax === null || (d.tax as unknown) === '' ? null : Number(d.tax),
        category: d.category,
        paymentMethod: d.paymentMethod || undefined,
        fileUrl: file?.url,
        source: file ? 'UPLOAD' : 'MANUAL',
        items: d.items.filter((i) => i.name.trim()).map((i) => ({
          name: i.name.trim(), quantity: Number(i.quantity) || 1, price: Number(i.price) || 0, category: i.category,
          hsaEligible: i.hsaEligible, warrantyMonths: i.warrantyMonths ? Number(i.warrantyMonths) : null,
        })),
        createAssets,
      });
      toast('Receipt saved');
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorBox message={error} />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="col-span-2"><Field label="Merchant *"><Input value={d.merchant} onChange={(e) => setD({ ...d, merchant: e.target.value })} /></Field></div>
        <Field label="Date *"><Input type="date" value={d.purchaseDate ?? ''} onChange={(e) => setD({ ...d, purchaseDate: e.target.value })} /></Field>
        <Field label="Category">
          <select className={inputClass} value={d.category} onChange={(e) => setD({ ...d, category: e.target.value })}>
            {SPEND_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
          </select>
        </Field>
        <Field label="Total *"><Input type="number" step="0.01" value={d.total} onChange={(e) => setD({ ...d, total: e.target.value as unknown as number })} /></Field>
        <Field label="Tax"><Input type="number" step="0.01" value={d.tax ?? ''} onChange={(e) => setD({ ...d, tax: e.target.value as unknown as number })} /></Field>
        <div className="col-span-2"><Field label="Payment method"><Input value={d.paymentMethod ?? ''} onChange={(e) => setD({ ...d, paymentMethod: e.target.value })} /></Field></div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Line items <span className="text-ink/45">({money(itemsSum)})</span></p>
          <Button size="sm" variant="secondary" onClick={() => setD({ ...d, items: [...d.items, { name: '', quantity: 1, price: 0, category: d.category, hsaEligible: false, warrantyMonths: null }] })}>
            <Plus className="size-3.5" /> Add item
          </Button>
        </div>
        <div className="max-h-72 overflow-auto rounded-xl border border-sand-200">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="sticky top-0 bg-sand-50 text-left text-xs text-ink/50">
              <tr><th className="px-2 py-2">Item</th><th className="w-16 px-2">Qty</th><th className="w-24 px-2">Price</th><th className="w-36 px-2">Category</th><th className="w-12 px-2 text-center">HSA</th><th className="w-24 px-2">Warranty (mo)</th><th className="w-8" /></tr>
            </thead>
            <tbody>
              {d.items.map((it, i) => (
                <tr key={i} className="border-t border-sand-200">
                  <td className="p-1"><Input value={it.name} onChange={(e) => setItem(i, { name: e.target.value })} /></td>
                  <td className="p-1"><Input type="number" value={it.quantity} onChange={(e) => setItem(i, { quantity: e.target.value as unknown as number })} /></td>
                  <td className="p-1"><Input type="number" step="0.01" value={it.price} onChange={(e) => setItem(i, { price: e.target.value as unknown as number })} /></td>
                  <td className="p-1">
                    <select className={inputClass} value={it.category} onChange={(e) => setItem(i, { category: e.target.value })}>
                      {SPEND_CATEGORIES.map((c) => <option key={c} value={c}>{label(c)}</option>)}
                    </select>
                  </td>
                  <td className="p-1 text-center"><input type="checkbox" className="size-4 accent-brand-700" checked={it.hsaEligible} onChange={(e) => setItem(i, { hsaEligible: e.target.checked })} /></td>
                  <td className="p-1"><Input type="number" value={it.warrantyMonths ?? ''} onChange={(e) => setItem(i, { warrantyMonths: e.target.value ? Number(e.target.value) : null })} /></td>
                  <td className="p-1"><button onClick={() => setD({ ...d, items: d.items.filter((_, j) => j !== i) })} className="p-1 text-ink/40 hover:text-red-600" aria-label="Remove item"><Trash2 className="size-4" /></button></td>
                </tr>
              ))}
              {d.items.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-center text-xs text-ink/45">No line items. That’s fine for a quick expense.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm hover:bg-sand-100">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
          {file ? 'Replace photo / PDF' : 'Attach photo / PDF of the receipt'}
          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => attach(e.target.files?.[0])} />
        </label>
        {file && <a href={file.url} target="_blank" rel="noreferrer" className="truncate text-sm text-brand-700 underline">{file.fileName}</a>}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="size-4 accent-brand-700" checked={createAssets} onChange={(e) => setCreateAssets(e.target.checked)} />
        Add items with a warranty to my asset inventory
      </label>
      <div className="flex justify-between gap-2 pt-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={save} loading={saving} disabled={!d.merchant.trim() || !d.purchaseDate || uploading}>Save receipt</Button>
      </div>
    </div>
  );
}

export default function ReceiptsPage() {
  const receipts = useFetch<Receipt[]>('/receipts');
  const analytics = useFetch<Analytics>('/receipts/analytics?months=6');
  const toast = useToast();
  const [tab, setTab] = useState<'overview' | 'list'>('overview');
  const [adding, setAdding] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const a = analytics.data;

  const reloadAll = () => Promise.all([receipts.reload(), analytics.reload()]);
  const remove = async (r: Receipt) => {
    if (!window.confirm(`Delete the ${r.merchant} receipt?`)) return;
    await api.del(`/receipts/${r.id}`);
    toast('Receipt deleted');
    reloadAll();
  };

  return (
    <>
      <PageHeader title="Receipts & spending" description="Spending analytics, HSA tracking and subscription detection." action={<Button onClick={() => setAdding(true)}><Plus className="size-4" /> Add receipt</Button>} />
      <div className="mb-6 inline-flex rounded-lg bg-white p-1 ring-1 ring-sand-200">
        {(['overview', 'list'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-md px-4 py-1.5 text-sm ${tab === t ? 'bg-ink text-white' : 'text-ink/65'}`}>
            {t === 'overview' ? 'Insights' : `All receipts${receipts.data ? ` (${receipts.data.length})` : ''}`}
          </button>
        ))}
      </div>
      {(receipts.error || analytics.error) && <ErrorBox message={(receipts.error || analytics.error)!} />}

      {tab === 'overview' && (!a ? <Spinner /> : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card><p className="text-sm text-ink/55">This month</p><p className="mt-1 text-2xl font-semibold">{money(a.thisMonth)}</p>{a.changePct !== null && <p className={`text-xs ${a.changePct > 0 ? 'text-red-600' : 'text-brand-700'}`}>{a.changePct > 0 ? '+' : ''}{a.changePct}% vs last month</p>}</Card>
            <Card><p className="text-sm text-ink/55">Last month</p><p className="mt-1 text-2xl font-semibold">{money(a.lastMonth)}</p></Card>
            <Card><p className="flex items-center gap-1 text-sm text-ink/55"><HeartPulse className="size-3.5" />HSA-eligible</p><p className="mt-1 text-2xl font-semibold">{money(a.hsa.total)}</p><p className="text-xs text-ink/50">{a.hsa.items.length} items</p></Card>
            <Card><p className="flex items-center gap-1 text-sm text-ink/55"><Repeat className="size-3.5" />Recurring / year</p><p className="mt-1 text-2xl font-semibold">{money(a.subscriptions.reduce((s, x) => s + x.annualCost, 0))}</p><p className="text-xs text-ink/50">{a.subscriptions.length} subscriptions</p></Card>
          </div>
          {a.insights.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/50">
              <h2 className="mb-2 flex items-center gap-2 font-semibold"><Lightbulb className="size-4 text-amber-600" />Savings finder</h2>
              <ul className="space-y-1 text-sm text-ink/75">{a.insights.map((i) => <li key={i}>• {i}</li>)}</ul>
            </Card>
          )}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2"><h2 className="mb-4 font-semibold">Spending per month</h2><MonthlySpendChart data={a.byMonth} height={240} /></Card>
            <Card><h2 className="mb-4 font-semibold">By category</h2><CategoryBars data={a.byCategory} limit={7} /></Card>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <h2 className="mb-3 font-semibold">Top merchants</h2>
              <ul className="space-y-2 text-sm">{a.topMerchants.map((m) => <li key={m.merchant} className="flex justify-between"><span>{m.merchant} <span className="text-ink/45">· {m.visits}×</span></span><span className="tabular-nums">{money(m.total)}</span></li>)}</ul>
            </Card>
            <Card>
              <h2 className="mb-3 font-semibold">Subscriptions & recurring</h2>
              {a.subscriptions.length === 0 ? <p className="text-sm text-ink/50">None detected yet.</p> : (
                <ul className="space-y-2 text-sm">{a.subscriptions.map((s) => <li key={s.merchant} className="flex justify-between"><span>{s.merchant}</span><span className="tabular-nums">{money(s.monthlyAmount)}/mo</span></li>)}</ul>
              )}
            </Card>
            <Card>
              <h2 className="mb-3 font-semibold">HSA / FSA eligible items</h2>
              {a.hsa.items.length === 0 ? <p className="text-sm text-ink/50">None found yet.</p> : (
                <ul className="max-h-48 space-y-2 overflow-auto text-sm">{a.hsa.items.map((h, i) => <li key={i} className="flex justify-between gap-2"><span className="truncate">{h.name} <span className="text-ink/45">· {h.merchant}</span></span><span className="tabular-nums">{money(h.price)}</span></li>)}</ul>
              )}
            </Card>
          </div>
        </div>
      ))}

      {tab === 'list' && (!receipts.data ? <Spinner /> : receipts.data.length === 0 ? (
        <EmptyState icon={<ReceiptIcon className="size-6" />} title="No receipts yet" text="Add your first receipt to start tracking spending." action={<Button onClick={() => setAdding(true)}>Add receipt</Button>} />
      ) : (
        <ul className="divide-y divide-sand-200 overflow-hidden rounded-2xl border border-sand-200 bg-white">
          {receipts.data.map((r) => (
            <li key={r.id}>
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-sand-50">
                <div className="rounded-lg bg-sand-100 p-2"><ReceiptIcon className="size-4 text-ink/60" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{r.merchant}</p>
                  <p className="text-xs text-ink/50">{fmtDate(r.purchaseDate)} · {label(r.category)}{r.items.length ? ` · ${r.items.length} items` : ''}</p>
                </div>
                {r.items.some((i) => i.hsaEligible) && <Badge color="green">HSA</Badge>}
                <span className="font-semibold tabular-nums">{money(r.total)}</span>
                <ChevronDown className={`size-4 text-ink/40 transition ${expanded === r.id ? 'rotate-180' : ''}`} />
              </button>
              {expanded === r.id && (
                <div className="bg-sand-50 px-4 pb-4 pl-16 text-sm">
                  {r.items.length > 0 && (
                    <table className="mb-3 w-full max-w-xl">
                      <tbody>{r.items.map((i) => (
                        <tr key={i.id}><td className="py-0.5">{i.quantity > 1 ? `${i.quantity} × ` : ''}{i.name}{i.hsaEligible && <span className="ml-2 text-xs text-brand-700">HSA</span>}</td><td className="text-ink/50">{label(i.category)}</td><td className="text-right tabular-nums">{money(i.price)}</td></tr>
                      ))}</tbody>
                    </table>
                  )}
                  {r.tax != null && <p className="text-ink/60">Tax: {money(r.tax)}</p>}
                  {r.assets.length > 0 && <p className="text-ink/60">Linked assets: {r.assets.map((x) => x.name).join(', ')}</p>}
                  <div className="mt-2 flex gap-4">
                    {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline"><ExternalLink className="size-3.5" />View original</a>}
                    <button onClick={() => remove(r)} className="text-red-600 hover:underline">Delete</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ))}

      <Modal open={adding} onClose={() => setAdding(false)} title="Add receipt" wide>
        {adding && <ReceiptForm onCancel={() => setAdding(false)} onSaved={() => { setAdding(false); reloadAll(); }} />}
      </Modal>
    </>
  );
}
