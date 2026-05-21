import { addHabit, validateHabitName, type Habit } from '../../app/lib/habits';

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
