'use client';

import { useEffect, useState } from 'react';
import { ConfirmDeleteHabitModal } from './components/ConfirmDeleteHabitModal';
import { CreateHabitModal } from './components/CreateHabitModal';
import { EmptyHabitsState } from './components/EmptyHabitsState';
import { HabitCard } from './components/HabitCard';
import {
  INITIAL_HABITS,
  addHabit,
  clearCompletionsForHabit,
  isCompletedToday,
  loadCompletionsForToday,
  removeHabit,
  todayKey,
  toggleCompletion,
  type CompletionMap,
  type Habit,
} from './lib/habits';

const COMPLETIONS_STORAGE_KEY = 'habit-tracker:completions';

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>(INITIAL_HABITS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [today, setToday] = useState<string>(() => todayKey());
  const [completions, setCompletions] = useState<CompletionMap>({});
  const [pendingDelete, setPendingDelete] = useState<Habit | null>(null);
  const hasHabits = habits.length > 0;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentDay = todayKey();
    setToday(currentDay);
    try {
      const raw = window.localStorage.getItem(COMPLETIONS_STORAGE_KEY);
      const parsed = raw ? (JSON.parse(raw) as CompletionMap) : null;
      setCompletions(loadCompletionsForToday(parsed, currentDay));
    } catch {
      setCompletions({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        COMPLETIONS_STORAGE_KEY,
        JSON.stringify(completions),
      );
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [completions]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleToggleCompletion = (habitId: string) => {
    setCompletions((current) => toggleCompletion(current, habitId, today));
  };

  const requestDelete = (habit: Habit) => setPendingDelete(habit);
  const cancelDelete = () => setPendingDelete(null);
  const confirmDelete = () => {
    if (!pendingDelete) return;
    const targetId = pendingDelete.id;
    setHabits((current) => removeHabit(current, targetId));
    setCompletions((current) => clearCompletionsForHabit(current, targetId));
    setPendingDelete(null);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10 sm:py-24 lg:py-32">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v0 · landing
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Habit Tracker
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Hola 👋 Llevá tus hábitos diarios con calma. Sumá uno, marcá el día,
            y mirá cómo crecen las rachas con el tiempo.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={openModal}
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              Crear hábito
            </button>
          </div>
        </header>

        <section
          aria-label="Lista de hábitos"
          className="mt-16 flex flex-1 flex-col sm:mt-24"
        >
          {hasHabits ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isCompleted={isCompletedToday(completions, habit.id, today)}
                  onToggle={() => handleToggleCompletion(habit.id)}
                  onRequestDelete={() => requestDelete(habit)}
                />
              ))}
            </ul>
          ) : (
            <EmptyHabitsState onCreate={openModal} />
          )}
        </section>

        <footer className="mt-16 text-center text-xs text-zinc-500 sm:mt-24">
          Construido con calma · Habit Tracker
        </footer>
      </div>

      <CreateHabitModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onCreate={(draft) => setHabits((current) => addHabit(current, draft))}
      />
      <ConfirmDeleteHabitModal
        isOpen={pendingDelete !== null}
        habitName={pendingDelete?.name ?? ''}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
    </main>
  );
}
