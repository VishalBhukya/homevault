'use client';
import { useState } from 'react';
import { api } from './api';
import { useFetch } from './use-fetch';
import { useToast } from '@/components/toast';

/** List + create/edit/delete state shared by the simple CRUD pages. */
export function useCrud<T extends { id: string }>(path: string, noun: string) {
  const list = useFetch<T[]>(path);
  const toast = useToast();
  const [editing, setEditing] = useState<T | 'new' | null>(null);

  const save = async (payload: Record<string, unknown>) => {
    if (editing === 'new') await api.post(path, payload);
    else if (editing) await api.patch(`${path}/${editing.id}`, payload);
    toast(`${noun} ${editing === 'new' ? 'added' : 'updated'}`);
    setEditing(null);
    await list.reload();
  };

  const remove = async (item: T, name: string) => {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    try {
      await api.del(`${path}/${item.id}`);
      toast(`${noun} deleted`);
      await list.reload();
    } catch (e) {
      toast((e as Error).message, 'error');
    }
  };

  return { ...list, editing, setEditing, save, remove, toast };
}
