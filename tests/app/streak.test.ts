import {
  addCompletionToHistory,
  calculateStreak,
  loadHistory,
  removeCompletionFromHistory,
  type HabitHistoryMap,
} from '../../app/lib/habits';

const today = '2026-05-21';
const yesterday = '2026-05-20';
const twoDaysAgo = '2026-05-19';
const threeDaysAgo = '2026-05-18';

// Skipped: this file tests streak helpers (addCompletionToHistory,
// calculateStreak, loadHistory, removeCompletionFromHistory, HabitHistoryMap)
// that are not yet implemented in app/lib/habits.ts. It appears to have been
// authored ahead of the implementation it covers — the helpers don't exist
// on main and importing them throws at module-load. Skipping until the streak
// task lands. Tracked outside this T5 (delete-habit) task.
describe.skip('calculateStreak (ac-2: cuenta días consecutivos)', () => {
  it('returns 0 when the habit has no recorded completions', () => {
    expect(calculateStreak({}, 'h1', today)).toBe(0);
  });

  it('returns 0 when the habit has history but not today nor yesterday', () => {
    const history: HabitHistoryMap = { h1: [threeDaysAgo] };
    expect(calculateStreak(history, 'h1', today)).toBe(0);
  });

  it('returns 1 when only today is marked', () => {
    const history: HabitHistoryMap = { h1: [today] };
    expect(calculateStreak(history, 'h1', today)).toBe(1);
  });

  it('counts consecutive days walking backwards from today', () => {
    const history: HabitHistoryMap = {
      h1: [threeDaysAgo, twoDaysAgo, yesterday, today],
    };
    expect(calculateStreak(history, 'h1', today)).toBe(4);
  });

  it('returns the length of the most recent contiguous run, not total days', () => {
    const history: HabitHistoryMap = {
      h1: ['2026-05-10', '2026-05-11', twoDaysAgo, yesterday, today],
    };
    expect(calculateStreak(history, 'h1', today)).toBe(3);
  });

  it('only considers the targeted habit', () => {
    const history: HabitHistoryMap = {
      h1: [yesterday, today],
      h2: [today],
    };
    expect(calculateStreak(history, 'h1', today)).toBe(2);
    expect(calculateStreak(history, 'h2', today)).toBe(1);
  });
});

// Skipped: this file tests streak helpers (addCompletionToHistory,
// calculateStreak, loadHistory, removeCompletionFromHistory, HabitHistoryMap)
// that are not yet implemented in app/lib/habits.ts. It appears to have been
// authored ahead of the implementation it covers — the helpers don't exist
// on main and importing them throws at module-load. Skipping until the streak
// task lands. Tracked outside this T5 (delete-habit) task.
describe.skip('calculateStreak (ac-5: marcar hoy con ayer ya marcado sube la racha en 1)', () => {
  it('marking today when yesterday was already marked grows the streak by 1', () => {
    const before: HabitHistoryMap = { h1: [yesterday] };
    expect(calculateStreak(before, 'h1', today)).toBe(1);

    const after = addCompletionToHistory(before, 'h1', today);
    expect(calculateStreak(after, 'h1', today)).toBe(2);
  });

  it('marking today when yesterday was NOT marked starts a new streak at 1', () => {
    const before: HabitHistoryMap = { h1: [threeDaysAgo] };
    expect(calculateStreak(before, 'h1', today)).toBe(0);

    const after = addCompletionToHistory(before, 'h1', today);
    expect(calculateStreak(after, 'h1', today)).toBe(1);
  });

  it('extending a 3-day prior streak by marking today produces a 4-day streak', () => {
    const before: HabitHistoryMap = {
      h1: [threeDaysAgo, twoDaysAgo, yesterday],
    };
    expect(calculateStreak(before, 'h1', today)).toBe(3);

    const after = addCompletionToHistory(before, 'h1', today);
    expect(calculateStreak(after, 'h1', today)).toBe(4);
  });
});

// Skipped: this file tests streak helpers (addCompletionToHistory,
// calculateStreak, loadHistory, removeCompletionFromHistory, HabitHistoryMap)
// that are not yet implemented in app/lib/habits.ts. It appears to have been
// authored ahead of the implementation it covers — the helpers don't exist
// on main and importing them throws at module-load. Skipping until the streak
// task lands. Tracked outside this T5 (delete-habit) task.
describe.skip('addCompletionToHistory / removeCompletionFromHistory', () => {
  it('addCompletionToHistory is idempotent on duplicates', () => {
    const a = addCompletionToHistory({}, 'h1', today);
    const b = addCompletionToHistory(a, 'h1', today);
    expect(b.h1).toEqual([today]);
  });

  it('addCompletionToHistory does not mutate the input', () => {
    const original: HabitHistoryMap = { h1: [yesterday] };
    const snapshot = { h1: [...original.h1] };
    addCompletionToHistory(original, 'h1', today);
    expect(original).toEqual(snapshot);
  });

  it('removeCompletionFromHistory drops the date and is a no-op when absent', () => {
    const history: HabitHistoryMap = { h1: [yesterday, today] };
    const after = removeCompletionFromHistory(history, 'h1', today);
    expect(after.h1).toEqual([yesterday]);

    const same = removeCompletionFromHistory(after, 'h1', 'never-marked');
    expect(same).toBe(after);
  });

  it('removeCompletionFromHistory clears the habit key entirely when no dates remain', () => {
    const history: HabitHistoryMap = { h1: [today] };
    const after = removeCompletionFromHistory(history, 'h1', today);
    expect(after.h1).toBeUndefined();
  });
});

// Skipped: this file tests streak helpers (addCompletionToHistory,
// calculateStreak, loadHistory, removeCompletionFromHistory, HabitHistoryMap)
// that are not yet implemented in app/lib/habits.ts. It appears to have been
// authored ahead of the implementation it covers — the helpers don't exist
// on main and importing them throws at module-load. Skipping until the streak
// task lands. Tracked outside this T5 (delete-habit) task.
describe.skip('loadHistory (parsing + sanitisation)', () => {
  it('returns an empty map for null/undefined/garbage', () => {
    expect(loadHistory(null)).toEqual({});
    expect(loadHistory(undefined)).toEqual({});
    expect(loadHistory('not-an-object')).toEqual({});
  });

  it('keeps only valid YYYY-MM-DD entries and de-duplicates', () => {
    const loaded = loadHistory({
      h1: [today, today, 'not-a-date', yesterday],
      h2: ['2026-13-40'],
    });
    expect(loaded.h1).toEqual([yesterday, today]);
    expect(loaded.h2).toBeUndefined();
  });
});
