'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AuthCard } from '@/components/auth-card';
import { Button, ErrorBox, Field, Input } from '@/components/ui';
import { useAuth } from '@/lib/auth';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', householdName: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register({ ...form, householdName: form.householdName || undefined });
      router.replace('/app');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Start your free trial"
      subtitle="30 days of the Family plan. No credit card needed."
      footer={<>Already have an account? <Link href="/login" className="font-medium text-brand-700 hover:underline">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBox message={error} />}
        <Field label="Your name">
          <Input required value={form.name} onChange={set('name')} autoComplete="name" />
        </Field>
        <Field label="Household name" hint="Optional, e.g. “The Rivera Family”">
          <Input value={form.householdName} onChange={set('householdName')} />
        </Field>
        <Field label="Email">
          <Input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
        </Field>
        <Field label="Password" hint="At least 8 characters">
          <Input type="password" required minLength={8} value={form.password} onChange={set('password')} autoComplete="new-password" />
        </Field>
        <Button type="submit" loading={loading} className="w-full">Create my household</Button>
      </form>
    </AuthCard>
  );
}
