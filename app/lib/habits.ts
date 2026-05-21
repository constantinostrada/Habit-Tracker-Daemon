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
