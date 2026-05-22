'use client';

import type { Frequency, Habit } from '../lib/habits';

const frequencyBadgeStyles: Record<Frequency, string> = {
  diario: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  semanal: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

type Props = {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onRequestDelete: () => void;
};

export function HabitCard({ habit, isCompleted, onToggle, onRequestDelete }: Props) {
  return (
    <li
      data-completed={isCompleted ? 'true' : 'false'}
      className={`group relative flex flex-col justify-between gap-4 rounded-2xl border p-6 transition ${
        isCompleted
          ? 'border-emerald-500/60 bg-emerald-500/10'
          : 'border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/40 hover:bg-zinc-900'
      }`}
    >
      <button
        type="button"
        name="delete-habit"
        aria-label={`Borrar ${habit.name}`}
        onClick={onRequestDelete}
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900/80 text-xs text-zinc-400 opacity-0 transition hover:border-rose-500/60 hover:text-rose-300 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 group-hover:opacity-100"
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="flex items-start justify-between gap-3 pr-8">
        <h3 className="text-lg font-medium text-zinc-100 sm:text-xl">
          {habit.name}
        </h3>
        <button
          type="button"
          name="toggle-completion"
          aria-pressed={isCompleted}
          aria-label={
            isCompleted
              ? `Desmarcar ${habit.name} como completado hoy`
              : `Marcar ${habit.name} como completado hoy`
          }
          onClick={onToggle}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
            isCompleted
              ? 'border-emerald-400 bg-emerald-500 text-zinc-950 hover:bg-emerald-400'
              : 'border-zinc-700 bg-zinc-950 text-zinc-500 hover:border-emerald-500/60 hover:text-emerald-300'
          }`}
        >
          <span aria-hidden="true">{isCompleted ? '✓' : ''}</span>
        </button>
      </div>
      <span
        className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] ${frequencyBadgeStyles[habit.frequency]}`}
      >
        {habit.frequency}
      </span>
    </li>
  );
}
