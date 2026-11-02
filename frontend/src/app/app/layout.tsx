'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BookOpen, CalendarDays, CheckSquare, FileText, LayoutDashboard, LifeBuoy, LogOut, Menu, Package, Receipt,
  Settings, Users, X,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { Spinner } from '@/components/ui';
import { useAuth } from '@/lib/auth';

const NAV = [
  { href: '/app', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/app/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/app/documents', label: 'Documents', icon: FileText },
  { href: '/app/receipts', label: 'Receipts', icon: Receipt },
  { href: '/app/assets', label: 'Assets & warranties', icon: Package },
  { href: '/app/contacts', label: 'Contacts', icon: Users },
  { href: '/app/emergency', label: 'Emergency binder', icon: LifeBuoy },
  { href: '/app/guides', label: 'Life-event guides', icon: BookOpen },
  { href: '/app/settings', label: 'Household settings', icon: Settings },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (loading || !user) return <Spinner className="min-h-screen items-center" />;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Logo href="/app" />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/app' ? pathname === '/app' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-brand-700 text-white' : 'text-ink/70 hover:bg-sand-100 hover:text-ink'}`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sand-200 p-4">
        <p className="truncate text-sm font-medium">{user.name}</p>
        <p className="truncate text-xs text-ink/50">{user.household?.name}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-sm text-ink/60 hover:text-ink">
          <LogOut className="size-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="no-print fixed inset-y-0 left-0 hidden w-64 border-r border-sand-200 bg-white lg:block">{sidebar}</aside>
      {open && (
        <div className="no-print fixed inset-0 z-40 bg-ink/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-64 bg-white" onClick={(e) => e.stopPropagation()}>{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="no-print sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sand-200 bg-white/90 px-4 backdrop-blur lg:hidden">
          <Logo href="/app" />
          <button onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-sand-100" aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
