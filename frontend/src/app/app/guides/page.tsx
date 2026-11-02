'use client';
import { useState } from 'react';
import { Baby, Check, HeartHandshake, Home, KeyRound, Plane, Plus, Truck } from 'lucide-react';
import { Button, Card, PageHeader } from '@/components/ui';
import { useToast } from '@/components/toast';
import { api } from '@/lib/api';

type Step = { title: string; inDays: number; priority?: 'LOW' | 'MEDIUM' | 'HIGH' };
const GUIDES: { key: string; title: string; icon: typeof Baby; intro: string; steps: Step[] }[] = [
  {
    key: 'baby', title: 'New baby', icon: Baby, intro: 'The paperwork and protection steps new parents most often miss.',
    steps: [
      { title: 'Add baby to health insurance (30-day window)', inDays: 7, priority: 'HIGH' },
      { title: 'Order birth certificate copies', inDays: 14 },
      { title: 'Apply for Social Security number', inDays: 14 },
      { title: 'Choose a pediatrician & add to contacts', inDays: 7 },
      { title: 'Update will and name a guardian', inDays: 60, priority: 'HIGH' },
      { title: 'Review life insurance coverage', inDays: 45 },
      { title: 'Open a 529 college savings plan', inDays: 90, priority: 'LOW' },
      { title: 'Register car seat for recall notices', inDays: 14 },
    ],
  },
  {
    key: 'home', title: 'Buying a home', icon: Home, intro: 'Get organized from closing day through the first year.',
    steps: [
      { title: 'Upload closing disclosure, deed and title policy', inDays: 3, priority: 'HIGH' },
      { title: 'Confirm homeowners insurance & add policy to vault', inDays: 3, priority: 'HIGH' },
      { title: 'Change the locks', inDays: 7 },
      { title: 'Locate water, gas and electrical shut-offs', inDays: 7 },
      { title: 'Log appliance models & warranties', inDays: 14 },
      { title: 'File homestead exemption (if eligible)', inDays: 60 },
      { title: 'Schedule HVAC service', inDays: 90, priority: 'LOW' },
    ],
  },
  {
    key: 'travel', title: 'Family travel', icon: Plane, intro: 'A pre-trip checklist so nothing ruins the vacation.',
    steps: [
      { title: 'Check passport expiration dates (6+ months validity)', inDays: 3, priority: 'HIGH' },
      { title: 'Review travel insurance and medical coverage abroad', inDays: 10 },
      { title: 'Share itinerary with an emergency contact', inDays: 14 },
      { title: 'Arrange pet care and house sitting', inDays: 14 },
      { title: 'Notify bank & card issuers of travel', inDays: 20, priority: 'LOW' },
      { title: 'Pause mail and deliveries', inDays: 20, priority: 'LOW' },
    ],
  },
  {
    key: 'parent', title: 'Caring for an aging parent', icon: HeartHandshake, intro: 'Coordinate care and paperwork with siblings.',
    steps: [
      { title: 'Collect list of medications and doctors', inDays: 7, priority: 'HIGH' },
      { title: 'Locate will, POA and healthcare directive', inDays: 14, priority: 'HIGH' },
      { title: 'Add parent’s insurance cards to the vault', inDays: 14 },
      { title: 'Set up shared calendar for appointments', inDays: 7 },
      { title: 'Review home safety (rails, lighting, alarms)', inDays: 30 },
    ],
  },
  {
    key: 'move', title: 'Moving house', icon: Truck, intro: 'Address changes and utilities, handled.',
    steps: [
      { title: 'Book movers', inDays: 7, priority: 'HIGH' },
      { title: 'Set up utilities at the new address', inDays: 14 },
      { title: 'Update address with USPS, banks and employer', inDays: 21 },
      { title: 'Transfer school records', inDays: 21 },
      { title: 'Update driver’s license and vehicle registration', inDays: 30 },
    ],
  },
  {
    key: 'rental', title: 'Renting out a property', icon: KeyRound, intro: 'The essentials for first-time landlords.',
    steps: [
      { title: 'Get landlord insurance', inDays: 7, priority: 'HIGH' },
      { title: 'Store signed lease in the vault', inDays: 3 },
      { title: 'Document move-in condition with photos', inDays: 3 },
      { title: 'Set rent collection reminder', inDays: 30 },
      { title: 'Schedule annual smoke detector check', inDays: 180, priority: 'LOW' },
    ],
  },
];

export default function GuidesPage() {
  const toast = useToast();
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const addAll = async (key: string, steps: Step[], category: string) => {
    setBusy(key);
    try {
      for (const s of steps) {
        const due = new Date();
        due.setDate(due.getDate() + s.inDays);
        due.setHours(12, 0, 0, 0);
        await api.post('/tasks', { title: s.title, dueDate: due.toISOString(), priority: s.priority ?? 'MEDIUM', category });
      }
      setAdded((a) => ({ ...a, [key]: true }));
      toast(`${steps.length} tasks added to your list`);
    } catch (e) {
      toast((e as Error).message, 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <PageHeader title="Life-event guides" description="Checklists for life’s big moments. Add a guide and its steps become tasks with sensible due dates." />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {GUIDES.map(({ key, title, icon: Icon, intro, steps }) => (
          <Card key={key} className="flex flex-col">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-100 p-2 text-amber-700"><Icon className="size-5" /></div>
              <h2 className="font-semibold">{title}</h2>
            </div>
            <p className="mt-2 text-sm text-ink/60">{intro}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm">
              {steps.map((s) => (
                <li key={s.title} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" /><span>{s.title} <span className="text-xs text-ink/40">· {s.inDays}d</span></span></li>
              ))}
            </ul>
            <Button className="mt-5" variant={added[key] ? 'secondary' : 'primary'} loading={busy === key} disabled={added[key]} onClick={() => addAll(key, steps, title)}>
              {added[key] ? <><Check className="size-4" />Added to tasks</> : <><Plus className="size-4" />Add {steps.length} tasks</>}
            </Button>
          </Card>
        ))}
      </div>
    </>
  );
}
