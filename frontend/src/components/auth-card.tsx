import type { ReactNode } from 'react';
import { Logo } from './logo';

export function AuthCard({ title, subtitle, children, footer }: { title: string; subtitle: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-sand-50 px-4 py-12">
      <Logo />
      <div className="mt-8 w-full max-w-md rounded-2xl border border-sand-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
      <div className="mt-6 text-sm text-ink/60">{footer}</div>
    </div>
  );
}
