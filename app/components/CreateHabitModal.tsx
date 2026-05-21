'use client';

import { useEffect, useState } from 'react';
import { validateHabitName, type Frequency, type HabitDraft } from '../lib/habits';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (draft: HabitDraft) => void;
};

export function CreateHabitModal({ isOpen, onClose, onCreate }: Props) {
  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('diario');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setFrequency('diario');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = validateHabitName(name);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onCreate({ name: result.name, frequency });
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-habit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2 id="create-habit-title" className="text-xl font-semibold text-zinc-100">
          Crear hábito
        </h2>
        <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium text-zinc-300">
              Nombre
            </label>
            <input
              id="habit-name"
              name="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Ej: Leer 20 minutos"
              autoFocus
              className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none"
            />
            {error ? (
              <p role="alert" className="mt-2 text-xs text-rose-400">
                {error}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor="habit-frequency" className="block text-sm font-medium text-zinc-300">
              Frecuencia
            </label>
            <select
              id="habit-frequency"
              name="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none"
            >
              <option value="diario">diario</option>
              <option value="semanal">semanal</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
