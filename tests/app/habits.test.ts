import {
  INITIAL_HABITS,
  addHabit,
  clearCompletionsForHabit,
  removeHabit,
  validateHabitName,
  type CompletionMap,
  type Habit,
} from '../../app/lib/habits';

describe('validateHabitName (ac-3: no se puede guardar con el nombre vacío)', () => {
  it('rejects an empty string', () => {
    const result = validateHabitName('');
    expect(result.ok).toBe(false);
    if (result.ok === false) {
      expect(result.error).toMatch(/vac/i);
    }
  });

  it('rejects whitespace-only names', () => {
    const result = validateHabitName('     ');
    expect(result.ok).toBe(false);
  });

  it('accepts a non-empty trimmed name', () => {
    const result = validateHabitName('  Leer 20 minutos  ');
    expect(result.ok).toBe(true);
    if (result.ok === true) {
      expect(result.name).toBe('Leer 20 minutos');
    }
  });
});

describe('addHabit (ac-4: el nuevo hábito aparece en la lista)', () => {
  const baseHabits: Habit[] = [
    { id: 'h1', name: 'Leer 20 minutos', frequency: 'diario' },
    { id: 'h2', name: 'Salir a correr', frequency: 'semanal' },
    { id: 'h3', name: 'Meditar', frequency: 'diario' },
  ];

  it('returns a new list one longer than the input', () => {
    const next = addHabit(baseHabits, { name: 'Tomar agua', frequency: 'diario' });
    expect(next).toHaveLength(baseHabits.length + 1);
  });

  it('does not mutate the original list', () => {
    const snapshot = [...baseHabits];
    addHabit(baseHabits, { name: 'Tomar agua', frequency: 'diario' });
    expect(baseHabits).toEqual(snapshot);
  });

  it('appends the new habit at the end with the provided name and frequency', () => {
    const next = addHabit(baseHabits, { name: 'Tomar agua', frequency: 'semanal' });
    const last = next[next.length - 1];
    expect(last.name).toBe('Tomar agua');
    expect(last.frequency).toBe('semanal');
    expect(typeof last.id).toBe('string');
    expect(last.id.length).toBeGreaterThan(0);
  });

  it('assigns a unique id to each new habit', () => {
    const a = addHabit(baseHabits, { name: 'A', frequency: 'diario' });
    const b = addHabit(a, { name: 'B', frequency: 'diario' });
    const ids = b.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('removeHabit (T5 ac-5: al confirmar, el hábito desaparece de la lista)', () => {
  const baseHabits: Habit[] = [
    { id: 'h1', name: 'Leer 20 minutos', frequency: 'diario' },
    { id: 'h2', name: 'Salir a correr', frequency: 'semanal' },
    { id: 'h3', name: 'Meditar', frequency: 'diario' },
  ];

  it('returns a new list without the targeted habit', () => {
    const next = removeHabit(baseHabits, 'h2');
    expect(next.map((h) => h.id)).toEqual(['h1', 'h3']);
  });

  it('does not mutate the input list', () => {
    const snapshot = [...baseHabits];
    removeHabit(baseHabits, 'h1');
    expect(baseHabits).toEqual(snapshot);
  });

  it('is a no-op (in terms of contents) when the id is not present', () => {
    const next = removeHabit(baseHabits, 'does-not-exist');
    expect(next.map((h) => h.id)).toEqual(['h1', 'h2', 'h3']);
  });
});

describe('removeHabit + INITIAL_HABITS (T5 ac-7: si borro todos, vuelve el empty state)', () => {
  it('removing every habit one by one yields an empty list (which the page renders as the empty state)', () => {
    let habits: Habit[] = [...INITIAL_HABITS];
    expect(habits.length).toBeGreaterThan(0);
    for (const h of INITIAL_HABITS) {
      habits = removeHabit(habits, h.id);
    }
    expect(habits).toEqual([]);
  });
});

describe('clearCompletionsForHabit (T5 ac-6: las completions de ese hábito ya no aparecen al recargar)', () => {
  const today = '2026-05-21';

  it('drops the completion entry for the deleted habit', () => {
    const state: CompletionMap = { h1: today, h2: today };
    const next = clearCompletionsForHabit(state, 'h1');
    expect(next).toEqual({ h2: today });
    expect(next['h1']).toBeUndefined();
  });

  it('does not mutate the input state', () => {
    const state: CompletionMap = { h1: today, h2: today };
    const snapshot = { ...state };
    clearCompletionsForHabit(state, 'h1');
    expect(state).toEqual(snapshot);
  });

  it('is a no-op (returns same reference) when the habit has no stored completion', () => {
    const state: CompletionMap = { h2: today };
    const next = clearCompletionsForHabit(state, 'h1');
    expect(next).toBe(state);
  });

  it('clears the entry so that re-serialising to localStorage no longer contains it', () => {
    const state: CompletionMap = { h1: today, h2: today };
    const next = clearCompletionsForHabit(state, 'h1');
    const serialised = JSON.stringify(next);
    expect(serialised).not.toContain('"h1"');
    expect(serialised).toContain('"h2"');
  });
});
