export type Frequency = 'diario' | 'semanal';

export type Habit = {
  id: string;
  name: string;
  frequency: Frequency;
};

export type HabitDraft = {
  name: string;
  frequency: Frequency;
};

export type NameValidationResult =
  | { ok: true; name: string }
  | { ok: false; error: string };

export function validateHabitName(raw: string): NameValidationResult {
  const name = raw.trim();
  if (name.length === 0) {
    return { ok: false, error: 'El nombre no puede estar vacío.' };
  }
  return { ok: true, name };
}

let counter = 0;

export function addHabit(habits: Habit[], draft: HabitDraft): Habit[] {
  counter += 1;
  const id = `h-${Date.now().toString(36)}-${counter.toString(36)}`;
  return [...habits, { id, name: draft.name, frequency: draft.frequency }];
}

export type CompletionMap = Record<string, string>;

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isCompletedToday(
  state: CompletionMap,
  habitId: string,
  today: string,
): boolean {
  return state[habitId] === today;
}

export function toggleCompletion(
  state: CompletionMap,
  habitId: string,
  today: string,
): CompletionMap {
  if (state[habitId] === today) {
    const next = { ...state };
    delete next[habitId];
    return next;
  }
  return { ...state, [habitId]: today };
}

export function loadCompletionsForToday(
  stored: CompletionMap | null | undefined,
  today: string,
): CompletionMap {
  if (!stored) return {};
  const next: CompletionMap = {};
  for (const [habitId, day] of Object.entries(stored)) {
    if (day === today) next[habitId] = day;
  }
  return next;
}
