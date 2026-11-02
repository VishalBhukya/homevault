'use client';
import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { Loader2, Paperclip, X } from 'lucide-react';
import { api } from '@/lib/api';
import { fromDateInput, fromDateTimeInput, label as toLabel, toDateInput, toDateTimeInput } from '@/lib/format';

const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ');

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-700 text-white hover:bg-brand-800 shadow-sm',
  secondary: 'bg-white text-ink border border-sand-200 hover:bg-sand-100',
  ghost: 'text-ink/70 hover:bg-sand-100 hover:text-ink',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md'; loading?: boolean }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={cx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-sm',
        VARIANTS[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export const inputClass =
  'w-full rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm outline-none transition placeholder:text-ink/40 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputClass, props.className)} />;
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink/80">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx('rounded-2xl border border-sand-200 bg-white p-5 shadow-sm', className)}>{children}</div>;
}

const BADGE: Record<string, string> = {
  gray: 'bg-sand-100 text-ink/70',
  green: 'bg-brand-100 text-brand-800',
  amber: 'bg-amber-100 text-amber-800',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-sky-100 text-sky-800',
  purple: 'bg-violet-100 text-violet-800',
};

export function Badge({ color = 'gray', children }: { color?: keyof typeof BADGE; children: ReactNode }) {
  return <span className={cx('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', BADGE[color])}>{children}</span>;
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink/60">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-sand-200 bg-white px-6 py-14 text-center">
      <div className="mb-3 rounded-full bg-brand-50 p-3 text-brand-700">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/60">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cx('flex justify-center py-16 text-brand-700', className)}>
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="no-print fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 sm:items-center" onMouseDown={onClose}>
      <div
        className={cx('my-8 w-full rounded-2xl bg-white shadow-xl', wide ? 'max-w-3xl' : 'max-w-lg')}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between border-b border-sand-200 px-5 py-4">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-ink/50 hover:bg-sand-100" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ---------- Config-driven form used by the CRUD pages ----------

export type FieldDef = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'datetime' | 'number' | 'checkbox' | 'file';
  options?: string[] | { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  hint?: string;
  half?: boolean;
};

type Values = Record<string, any>;

function initialValues(fields: FieldDef[], record?: Values | null): Values {
  const v: Values = {};
  for (const f of fields) {
    const raw = record?.[f.name];
    if (f.type === 'date') v[f.name] = toDateInput(raw);
    else if (f.type === 'datetime') v[f.name] = toDateTimeInput(raw);
    else if (f.type === 'checkbox') v[f.name] = Boolean(raw);
    else if (f.type === 'file') {
      v.fileUrl = record?.fileUrl ?? '';
      v.fileName = record?.fileName ?? '';
      v.mimeType = record?.mimeType ?? '';
    } else if (f.type === 'select') {
      const first = f.options?.[0];
      v[f.name] = raw ?? (typeof first === 'string' ? first : (first?.value ?? ''));
    } else v[f.name] = raw ?? '';
  }
  return v;
}

function toPayload(fields: FieldDef[], v: Values): Values {
  const out: Values = {};
  for (const f of fields) {
    const val = v[f.name];
    if (f.type === 'date') out[f.name] = fromDateInput(val);
    else if (f.type === 'datetime') out[f.name] = fromDateTimeInput(val);
    else if (f.type === 'number') out[f.name] = val === '' || val == null ? null : Number(val);
    else if (f.type === 'checkbox') out[f.name] = Boolean(val);
    else if (f.type === 'file') {
      if (v.fileUrl) Object.assign(out, { fileUrl: v.fileUrl, fileName: v.fileName, mimeType: v.mimeType });
    } else if (f.type === 'select' && val === '') out[f.name] = null;
    else out[f.name] = typeof val === 'string' ? val.trim() : val;
  }
  return out;
}

export function EntityForm({
  fields,
  record,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: {
  fields: FieldDef[];
  record?: Values | null;
  onSubmit: (payload: Values) => Promise<void>;
  onCancel: () => void;
  submitLabel?: string;
}) {
  const [values, setValues] = useState<Values>(() => initialValues(fields, record));
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(toPayload(fields, values));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.upload(file);
      setValues((v) => ({ ...v, fileUrl: res.url, fileName: res.fileName, mimeType: res.mimeType }));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && <ErrorBox message={error} />}
      <div className="grid grid-cols-2 gap-4">
        {fields.map((f) => {
          const span = f.half ? 'col-span-2 sm:col-span-1' : 'col-span-2';
          const common = { id: f.name, required: f.required, placeholder: f.placeholder };
          if (f.type === 'checkbox') {
            return (
              <label key={f.name} className={cx(span, 'flex items-center gap-2 text-sm')}>
                <input type="checkbox" className="size-4 accent-brand-700" checked={values[f.name]} onChange={(e) => set(f.name, e.target.checked)} />
                {f.label}
              </label>
            );
          }
          let control: ReactNode;
          if (f.type === 'textarea') {
            control = <textarea {...common} rows={4} className={inputClass} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />;
          } else if (f.type === 'select') {
            control = (
              <select {...common} className={inputClass} value={values[f.name] ?? ''} onChange={(e) => set(f.name, e.target.value)}>
                {f.options?.map((o) =>
                  typeof o === 'string' ? (
                    <option key={o} value={o}>{toLabel(o)}</option>
                  ) : (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ),
                )}
              </select>
            );
          } else if (f.type === 'file') {
            control = (
              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-sand-200 bg-white px-3 py-2 text-sm hover:bg-sand-100">
                  {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
                  {values.fileUrl ? 'Replace file' : 'Attach file'}
                  <input type="file" className="hidden" accept="image/*,application/pdf,.doc,.docx,.txt" onChange={(e) => upload(e.target.files?.[0])} />
                </label>
                {values.fileName && (
                  <a href={values.fileUrl} target="_blank" rel="noreferrer" className="truncate text-sm text-brand-700 underline">
                    {values.fileName}
                  </a>
                )}
              </div>
            );
          } else {
            const type = f.type === 'datetime' ? 'datetime-local' : (f.type ?? 'text');
            control = <Input {...common} type={type} step={f.type === 'number' ? 'any' : undefined} value={values[f.name]} onChange={(e) => set(f.name, e.target.value)} />;
          }
          return (
            <div key={f.name} className={span}>
              <Field label={f.label + (f.required ? ' *' : '')} hint={f.hint}>
                {control}
              </Field>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={saving} disabled={uploading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
