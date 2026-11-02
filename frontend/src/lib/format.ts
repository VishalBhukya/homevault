export const SPEND_CATEGORIES = [
  'GROCERIES', 'DINING', 'HOUSEHOLD', 'HEALTH', 'ELECTRONICS', 'CLOTHING', 'TRANSPORT', 'UTILITIES',
  'ENTERTAINMENT', 'SUBSCRIPTIONS', 'KIDS', 'PETS', 'HOME_IMPROVEMENT', 'TRAVEL', 'OTHER',
];
export const DOCUMENT_CATEGORIES = ['INSURANCE', 'LEGAL', 'MEDICAL', 'FINANCIAL', 'IDENTITY', 'PROPERTY', 'VEHICLE', 'TAX', 'EDUCATION', 'OTHER'];
export const CONTACT_CATEGORIES = ['FAMILY', 'MEDICAL', 'SERVICE', 'INSURANCE', 'LEGAL', 'FINANCIAL', 'SCHOOL', 'EMERGENCY', 'OTHER'];
export const ASSET_CATEGORIES = ['ELECTRONICS', 'APPLIANCE', 'VEHICLE', 'FURNITURE', 'JEWELRY', 'TOOLS', 'PROPERTY', 'OTHER'];
export const EMERGENCY_SECTIONS: { key: string; label: string; hint: string }[] = [
  { key: 'MEDICAL', label: 'Medical', hint: 'Allergies, medications, conditions, blood types, doctors' },
  { key: 'INSURANCE', label: 'Insurance', hint: 'Policies, agents, and how to file a claim' },
  { key: 'FINANCIAL', label: 'Financial', hint: 'Bank accounts, bills, retirement and investment accounts' },
  { key: 'LEGAL', label: 'Legal', hint: 'Will, power of attorney, guardianship, attorney contact' },
  { key: 'DIGITAL_ACCESS', label: 'Digital access', hint: 'Where to find passwords and how to access key accounts' },
  { key: 'UTILITIES', label: 'Utilities', hint: 'Shut-off locations, providers, account numbers' },
  { key: 'HOME', label: 'Home', hint: 'Spare keys, alarm codes location, service providers, maintenance' },
  { key: 'INSTRUCTIONS', label: 'Instructions', hint: 'What to do first: kids, pets, school pickups, routines' },
  { key: 'LEGACY', label: 'Legacy messages', hint: 'Letters and wishes for loved ones' },
];

export const label = (value: string | null | undefined) =>
  value ? value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, ' ') : '';

export const money = (n: number | null | undefined) =>
  n == null ? '—' : n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const fmtDate = (iso: string | null | undefined, opts: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
  iso ? new Date(iso).toLocaleDateString('en-US', opts) : '—';

export const fmtDateTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

export const daysUntil = (iso: string) => Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO string -> value for <input type="date"> in local time. */
export const toDateInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/** ISO string -> value for <input type="datetime-local">. */
export const toDateTimeInput = (iso: string | null | undefined) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${toDateInput(iso)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** <input type="date"> value -> ISO string (noon local time, so the date never shifts across time zones). */
export const fromDateInput = (v: string) => (v ? new Date(`${v}T12:00`).toISOString() : null);
export const fromDateTimeInput = (v: string) => (v ? new Date(v).toISOString() : null);

export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};
