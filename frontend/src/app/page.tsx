import Link from 'next/link';
import {
  AlarmClock, ArrowRight, Baby, Bell, BookHeart, Brain, Check, FileLock2, HeartHandshake, Home, KeyRound, Lock,
  PiggyBank, Plane, Receipt, ScanLine, Server, Shield, ShieldCheck, UsersRound,
  Wallet, Wrench, X,
} from 'lucide-react';
import { Logo } from '@/components/logo';

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#receipts', label: 'Receipt Intelligence' },
  { href: '#usecases', label: 'Use Cases' },
  { href: '#security', label: 'Security' },
  { href: '#pricing', label: 'Pricing' },
];

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {text && <p className="mt-4 text-ink/65">{text}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-sand-200/70 bg-sand-50/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Logo />
          <nav className="hidden items-center gap-6 text-sm text-ink/70 lg:flex">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} className="hover:text-ink">
                {n.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-ink/80 hover:bg-sand-100">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-800">
              Start free trial
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-x-0 top-0 -z-10 h-[520px] bg-gradient-to-b from-brand-50 to-transparent" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-medium text-brand-800">
              <ShieldCheck className="size-3.5" /> The household operating system
            </span>
            <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Everything your household knows, <span className="text-brand-700">in one safe place.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink/70">
              HomeVault is your family’s shared memory: documents, tasks, receipts, warranties and emergency plans,
              organized automatically so life keeps running even when the person who “knows everything” isn’t around.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-medium text-white shadow-sm hover:bg-brand-800">
                Start your 30-day free trial <ArrowRight className="size-4" />
              </Link>
              <a href="#how" className="rounded-xl border border-sand-200 bg-white px-5 py-3 font-medium hover:bg-sand-100">
                See how it works
              </a>
            </div>
            <p className="mt-3 text-sm text-ink/55">30 days free · No credit card · Cancel anytime</p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs">
              {['Document vault', 'Receipt Intelligence', 'Smart alerts', 'Emergency Binder', 'Works on any device'].map((b) => (
                <span key={b} className="rounded-full bg-white px-3 py-1 font-medium text-ink/70 ring-1 ring-sand-200">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Dashboard mockup */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-tr from-brand-200/50 via-amber-100/60 to-transparent blur-2xl" />
            <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-ink/50">Good morning</p>
                  <p className="font-display text-lg font-semibold">The Rivera Family</p>
                </div>
                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-800">Binder 82% ready</span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: 'Open tasks', v: '6', c: 'text-ink' },
                  { k: 'This month', v: '$1,284', c: 'text-ink' },
                  { k: 'Expiring soon', v: '3', c: 'text-amber-600' },
                ].map((s) => (
                  <div key={s.k} className="rounded-xl bg-sand-50 p-3">
                    <p className="text-[11px] text-ink/50">{s.k}</p>
                    <p className={`text-lg font-semibold ${s.c}`}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {[
                  { icon: <AlarmClock className="size-4 text-red-500" />, t: 'Renew car registration', s: 'Overdue by 3 days' },
                  { icon: <Shield className="size-4 text-amber-500" />, t: 'Homeowners policy renews', s: 'In 25 days · Safe Harbor Mutual' },
                  { icon: <Wrench className="size-4 text-brand-600" />, t: 'Fridge warranty ends', s: 'In 10 days · receipt on file' },
                  { icon: <Receipt className="size-4 text-sky-600" />, t: 'CVS receipt saved', s: '3 HSA-eligible items · $27.47' },
                ].map((r) => (
                  <div key={r.t} className="flex items-center gap-3 rounded-xl border border-sand-200 px-3 py-2.5">
                    {r.icon}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{r.t}</p>
                      <p className="truncate text-xs text-ink/50">{r.s}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-brand-900 p-3 text-sm text-brand-50">
                <p className="text-xs text-brand-200">Groceries this month</p>
                <p className="mt-1">$412, 8% less than last month</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle
          eyebrow="The problem"
          title="Most households run on one person’s memory"
          text="Where’s the insurance policy? When does the warranty end? Who do we call about the furnace? If that knowledge lives in one head, the whole family is one bad day away from chaos."
        />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-red-100 bg-red-50/60 p-6">
            <p className="font-semibold text-red-800">Without HomeVault</p>
            <ul className="mt-4 space-y-3 text-sm text-ink/75">
              {['Documents scattered across drawers, inboxes and phones', 'Renewals and warranties discovered after they expire', 'Receipts lost, so returns, claims and HSA money go unclaimed', 'No plan if the household organizer is suddenly unavailable'].map((t) => (
                <li key={t} className="flex gap-2"><X className="mt-0.5 size-4 shrink-0 text-red-500" />{t}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-brand-100 bg-brand-50/70 p-6">
            <p className="font-semibold text-brand-800">With HomeVault</p>
            <ul className="mt-4 space-y-3 text-sm text-ink/75">
              {['One shared vault every family member can reach', 'Alerts before anything expires or falls overdue', 'Receipts linked to warranties and spending', 'A living emergency binder anyone can follow'].map((t) => (
                <li key={t} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" />{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-ink/60">
          <span className="font-semibold text-ink">Our mission:</span> bring the kind of organization and foresight usually reserved
          for family offices to every household, regardless of income.
        </p>
      </section>

      {/* How it works */}
      <section id="how" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="How it works" title="Capture. Organize. Act." />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { n: '1', icon: <ScanLine className="size-6" />, t: 'Capture', d: 'Save a receipt, upload a policy, add a task or a contact. Everything lands in one place the whole household can reach.' },
              { n: '2', icon: <FileLock2 className="size-6" />, t: 'Organize', d: 'Everything is sorted into documents, tasks, contacts, assets and spending, linked together and shared with your household.' },
              { n: '3', icon: <Bell className="size-6" />, t: 'Act', d: 'Smart alerts and a household dashboard tell you what needs attention before it becomes a problem.' },
            ].map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-sand-200 bg-sand-50 p-6">
                <span className="absolute right-5 top-4 font-display text-5xl font-semibold text-sand-200">{s.n}</span>
                <div className="inline-flex rounded-xl bg-brand-700 p-2.5 text-white">{s.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-ink/65">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle eyebrow="What HomeVault does" title="Four pillars of a well-run home" />
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { icon: <Home className="size-5" />, t: 'Organize your household', d: 'A shared vault for documents, a family calendar, recurring tasks, contacts and a home inventory, all in one place.', items: ['Document vault with expiry tracking', 'Recurring tasks & assignments', 'Shared calendar & contacts'] },
            { icon: <ShieldCheck className="size-5" />, t: 'Protect what matters', d: 'Track insurance, warranties and legal documents, and build an emergency binder your family can actually use.', items: ['Warranty & renewal alerts', 'Emergency binder with print view', 'Legacy messages & instructions'] },
            { icon: <ScanLine className="size-5" />, t: 'Track spending & receipts', d: 'Save receipts with line items and photos, link purchases to warranties, and see exactly where the money goes.', items: ['Receipts with line items & photos', 'Automatic warranty tracking', 'HSA-eligible item flags'] },
            { icon: <Brain className="size-5" />, t: 'Household intelligence', d: 'Spending analytics, subscription detection, HSA tracking and life-event guides that turn data into decisions.', items: ['Spending by category & month', 'Subscription & savings finder', 'Smart dashboard alerts'] },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <div className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-700">{p.icon}</div>
              <h3 className="mt-3 text-lg font-semibold">{p.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{p.d}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 text-brand-600" />{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Receipt intelligence */}
      <section id="receipts" className="bg-brand-950 py-20 text-sand-50">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-300">Receipt Intelligence</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Every receipt, read and put to work</h2>
            <p className="mt-4 text-sand-200/80">Attach a photo, log the line items, and HomeVault turns a crumpled receipt into insight.</p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { icon: <Wallet className="size-5" />, t: 'Spending analytics', d: 'Line-item categories, monthly trends and top merchants.' },
                { icon: <HeartHandshake className="size-5" />, t: 'HSA & tax intelligence', d: 'Flags HSA/FSA-eligible purchases automatically.' },
                { icon: <Wrench className="size-5" />, t: 'Inventory & warranties', d: 'Durable goods become assets with warranty dates.' },
                { icon: <PiggyBank className="size-5" />, t: 'Savings finder', d: 'Detects recurring subscriptions and spending spikes.' },
              ].map((f) => (
                <div key={f.t} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                  <div className="text-brand-300">{f.icon}</div>
                  <p className="mt-2 font-semibold">{f.t}</p>
                  <p className="mt-1 text-sm text-sand-200/70">{f.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm rotate-1 rounded-xl bg-white p-6 font-mono text-sm text-ink shadow-2xl">
            <p className="text-center font-bold">FRESH MARKET #204</p>
            <p className="text-center text-xs text-ink/50">10/28/2026 · 6:42 PM</p>
            <div className="my-4 border-t border-dashed border-ink/20" />
            {[
              ['Organic milk', '6.49', 'Groceries'],
              ['Children’s ibuprofen', '9.49', 'HSA ✓'],
              ['Bananas', '2.19', 'Groceries'],
              ['Paper towels', '12.99', 'Household'],
              ['Bandages', '4.99', 'HSA ✓'],
            ].map(([n, p, tag]) => (
              <div key={n} className="flex items-center justify-between py-1">
                <span>{n}</span>
                <span className="flex items-center gap-2">
                  <span className={`rounded px-1.5 py-0.5 font-sans text-[10px] font-medium ${tag.includes('HSA') ? 'bg-brand-100 text-brand-800' : 'bg-sand-100 text-ink/60'}`}>{tag}</span>
                  {p}
                </span>
              </div>
            ))}
            <div className="my-3 border-t border-dashed border-ink/20" />
            <div className="flex justify-between"><span>Tax</span><span>2.31</span></div>
            <div className="flex justify-between font-bold"><span>TOTAL</span><span>$38.46</span></div>
            <div className="mt-4 rounded-lg bg-brand-50 p-3 font-sans text-xs text-brand-900">
              <PiggyBank className="mr-1 inline size-3.5" /> $14.48 HSA-eligible · Groceries up 12% this month
            </div>
          </div>
        </div>
      </section>

      {/* Life events */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle eyebrow="Household intelligence" title="Guidance for life’s big moments" text="Step-by-step checklists that drop straight into your task list, so nothing important slips through the cracks." />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: <Baby className="size-5" />, t: 'New baby', items: ['Add baby to health insurance within 30 days', 'Apply for birth certificate & SSN', 'Update will and name a guardian', 'Open a 529 college savings plan'] },
            { icon: <Home className="size-5" />, t: 'Buying a home', items: ['Store closing documents & deed', 'Set up homeowners insurance', 'Log appliance warranties', 'Schedule first-year maintenance'] },
            { icon: <Plane className="size-5" />, t: 'Family travel', items: ['Check passport expiration dates', 'Share itinerary with an emergency contact', 'Review travel insurance', 'Arrange pet & house sitting'] },
          ].map((g) => (
            <div key={g.t} className="rounded-2xl border border-sand-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-amber-100 p-2 text-amber-700">{g.icon}</div>
                <h3 className="font-semibold">{g.t}</h3>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-ink/70">
                {g.items.map((i) => (
                  <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" />{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section id="usecases" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Who uses HomeVault" title="Built for every kind of household" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Baby className="size-5" />, t: 'New parents', d: 'Keep pediatrician contacts, vaccination records, insurance changes and baby gear warranties in one place, even on three hours of sleep.' },
              { icon: <Home className="size-5" />, t: 'Homeowners', d: 'Track maintenance schedules, appliance warranties, contractor contacts and every receipt for insurance claims or resale.' },
              { icon: <HeartHandshake className="size-5" />, t: 'Caring for aging parents', d: 'Share medications, doctors, legal documents and account details with siblings so caregiving is coordinated, not chaotic.' },
              { icon: <KeyRound className="size-5" />, t: 'Rental property owners', d: 'Store leases, track repairs and expenses per property, and keep tenant and vendor contacts organized.' },
              { icon: <BookHeart className="size-5" />, t: 'Estate & continuity planning', d: 'Build an emergency binder, record where everything is and leave instructions and messages for the people you love.' },
              { icon: <UsersRound className="size-5" />, t: 'Busy families', d: 'Shared calendar, assigned chores, school contacts and one place where everyone can find what they need.' },
            ].map((u) => (
              <div key={u.t} className="rounded-2xl border border-sand-200 bg-sand-50 p-6">
                <div className="inline-flex rounded-lg bg-white p-2 text-brand-700 ring-1 ring-sand-200">{u.icon}</div>
                <h3 className="mt-3 font-semibold">{u.t}</h3>
                <p className="mt-2 text-sm text-ink/65">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Emergency readiness</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">If something happened tomorrow, would your family know what to do?</h2>
            <p className="mt-4 text-ink/65">HomeVault builds a living emergency binder from the information you already keep, with a readiness score that shows exactly what’s missing.</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 font-medium text-white hover:bg-brand-800">
              Start building your binder <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { t: 'Emergency binder', d: 'Medical, insurance, financial and legal essentials, printable in one click.' },
              { t: 'Digital access guide', d: 'Where passwords live and how to reach key accounts.' },
              { t: 'Legacy messages', d: 'Letters and wishes for the people you love.' },
              { t: 'Continuity plans', d: 'Who picks up the kids, pays the bills, feeds the dog.' },
              { t: 'Home handover guide', d: 'Shut-offs, service providers and maintenance know-how.' },
              { t: 'Readiness score', d: 'See exactly which sections still need attention.' },
            ].map((e) => (
              <div key={e.t} className="rounded-xl border border-sand-200 bg-white p-4">
                <p className="font-semibold">{e.t}</p>
                <p className="mt-1 text-sm text-ink/60">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="mx-auto max-w-6xl px-4 py-20">
        <SectionTitle eyebrow="Privacy & security" title="Your family’s data stays your family’s" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: <Lock className="size-5" />, t: 'Secure by design', d: 'Encrypted connections (HTTPS), hashed passwords and signed session tokens.' },
            { icon: <ShieldCheck className="size-5" />, t: 'Privacy first', d: 'We never sell your data. It is used only to run your household workspace.' },
            { icon: <UsersRound className="size-5" />, t: 'Access control', d: 'Owner, admin and member roles. Every record is scoped to your household.' },
            { icon: <Server className="size-5" />, t: 'Yours to keep', d: 'Built on PostgreSQL. Your data is always exportable.' },
          ].map((s) => (
            <div key={s.t} className="rounded-2xl border border-sand-200 bg-white p-6">
              <div className="inline-flex rounded-lg bg-brand-50 p-2 text-brand-700">{s.icon}</div>
              <h3 className="mt-3 font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-ink/65">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionTitle eyebrow="Pricing" title="Simple plans for every household" text="Every new account starts with a 30-day free trial of the Family plan." />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Free', price: '$0', note: 'forever', features: ['Document vault', 'Calendar, tasks & contacts', 'Emergency binder', '1 GB storage'] },
              { name: 'Essential', price: '$8', note: '/mo billed yearly', features: ['Everything in Free', 'Receipt Intelligence', 'Warranty tracking', '5 GB storage'] },
              { name: 'Family', price: '$16', note: '/mo billed yearly', popular: true, features: ['Everything in Essential', 'Unlimited household members', 'Spending & HSA insights', 'Life-event guides', '20 GB storage'] },
              { name: 'Pro', price: '$32', note: '/mo billed yearly', features: ['Everything in Family', 'Rental property tracking', 'Priority support', '100 GB storage'] },
            ].map((p) => (
              <div key={p.name} className={`relative flex flex-col rounded-2xl border p-6 ${p.popular ? 'border-brand-600 bg-brand-50/50 shadow-lg' : 'border-sand-200 bg-white'}`}>
                {p.popular && <span className="absolute -top-3 left-6 rounded-full bg-brand-700 px-3 py-1 text-xs font-semibold text-white">Most popular</span>}
                <p className="font-semibold">{p.name}</p>
                <p className="mt-3"><span className="font-display text-4xl font-semibold">{p.price}</span> <span className="text-sm text-ink/50">{p.note}</span></p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-brand-600" />{f}</li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-6 rounded-xl px-4 py-2.5 text-center text-sm font-medium ${p.popular ? 'bg-brand-700 text-white hover:bg-brand-800' : 'border border-sand-200 hover:bg-sand-100'}`}>
                  {p.name === 'Free' ? 'Get started free' : 'Try it free'}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="rounded-3xl bg-brand-900 px-6 py-14 text-center text-white sm:px-12">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Give your household a memory that never forgets</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100/80">Start free for 30 days. No credit card. Cancel any time, and your data is always exportable.</p>
          <Link href="/register" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-brand-900 hover:bg-brand-50">
            Start free trial <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-sand-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-ink/55 sm:flex-row">
          <Logo />
          <p>© {new Date().getFullYear()} HomeVault. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#security" className="hover:text-ink">Privacy</a>
            <a href="#pricing" className="hover:text-ink">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
