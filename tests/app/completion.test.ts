import {
  isCompletedToday,
  loadCompletionsForToday,
  toggleCompletion,
  todayKey,
  type CompletionMap,
} from '../../app/lib/habits';

describe('todayKey', () => {
  it('formats the local date as YYYY-MM-DD', () => {
    const fixed = new Date(2026, 4, 21); // May 21 2026 (local)
    expect(todayKey(fixed)).toBe('2026-05-21');
  });

  it('zero-pads months and days < 10', () => {
    const fixed = new Date(2026, 0, 3);
    expect(todayKey(fixed)).toBe('2026-01-03');
  });
});

describe('toggleCompletion (ac-4: re-click vuelve al estado anterior)', () => {
  const today = '2026-05-21';

  it('marks a habit as completed when it is not yet completed today', () => {
    const next = toggleCompletion({}, 'h1', today);
    expect(isCompletedToday(next, 'h1', today)).toBe(true);
    expect(next['h1']).toBe(today);
  });

  it('un-marks the habit when called a second time on the same day', () => {
    const after1 = toggleCompletion({}, 'h1', today);
    const after2 = toggleCompletion(after1, 'h1', today);
    expect(isCompletedToday(after2, 'h1', today)).toBe(false);
    expect(after2['h1']).toBeUndefined();
  });

  it('does not mutate the input state object', () => {
    const original: CompletionMap = { h1: today };
    const snapshot = { ...original };
    toggleCompletion(original, 'h1', today);
    expect(original).toEqual(snapshot);
  });

  it('only affects the targeted habit', () => {
    const initial: CompletionMap = { h1: today, h2: today };
    const next = toggleCompletion(initial, 'h1', today);
    expect(isCompletedToday(next, 'h1', today)).toBe(false);
    expect(isCompletedToday(next, 'h2', today)).toBe(true);
  });
});

describe('loadCompletionsForToday (ac-5: estado se mantiene si recargo el mismo día / ac-6: al día siguiente arrancan sin marcar)', () => {
  const today = '2026-05-21';
  const yesterday = '2026-05-20';

  it('keeps entries whose stored day matches today (ac-5: persisted reload)', () => {
    const stored: CompletionMap = { h1: today, h2: today };
    const loaded = loadCompletionsForToday(stored, today);
    expect(loaded).toEqual({ h1: today, h2: today });
    expect(isCompletedToday(loaded, 'h1', today)).toBe(true);
  });

  it('drops entries from a previous day so a fresh morning starts unmarked (ac-6)', () => {
    const stored: CompletionMap = { h1: yesterday, h2: yesterday };
    const loaded = loadCompletionsForToday(stored, today);
    expect(loaded).toEqual({});
    expect(isCompletedToday(loaded, 'h1', today)).toBe(false);
    expect(isCompletedToday(loaded, 'h2', today)).toBe(false);
  });

  it('keeps only today entries when storage mixes today + yesterday', () => {
    const stored: CompletionMap = { h1: today, h2: yesterday };
    const loaded = loadCompletionsForToday(stored, today);
    expect(loaded).toEqual({ h1: today });
  });

  it('returns an empty map when there is nothing stored', () => {
    expect(loadCompletionsForToday(null, today)).toEqual({});
    expect(loadCompletionsForToday(undefined, today)).toEqual({});
  });
});
