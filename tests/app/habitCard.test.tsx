import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { HabitCard } from '../../app/components/HabitCard';
import type { Habit } from '../../app/lib/habits';

const baseHabit: Habit = {
  id: 'h-test',
  name: 'Leer 20 minutos',
  frequency: 'diario',
};

const noop = () => {};

function renderCard(isCompleted: boolean): string {
  return renderToStaticMarkup(
    createElement(
      'ul',
      { role: 'list' },
      createElement(HabitCard, {
        habit: baseHabit,
        isCompleted,
        onToggle: noop,
      }),
    ),
  );
}

describe('HabitCard (ac-2: cada hábito tiene un check clickeable)', () => {
  const html = renderCard(false);

  it('renders a clickable toggle button with name="toggle-completion"', () => {
    const btn = html.match(/<button\b[^>]*\bname="toggle-completion"[^>]*>/);
    expect(btn).not.toBeNull();
    expect(btn![0]).toMatch(/\btype="button"/);
  });
});

describe('HabitCard (ac-3: al marcar muestra estado visual de completado)', () => {
  const offHtml = renderCard(false);
  const onHtml = renderCard(true);

  it('exposes the completed flag via data-completed on the card', () => {
    expect(offHtml).toMatch(/data-completed="false"/);
    expect(onHtml).toMatch(/data-completed="true"/);
  });

  it('toggles aria-pressed on the toggle button to reflect state', () => {
    expect(offHtml).toMatch(/aria-pressed="false"/);
    expect(onHtml).toMatch(/aria-pressed="true"/);
  });

  it('renders a visible check icon (✓) when completed and none when not', () => {
    expect(onHtml).toMatch(/✓/);
    expect(offHtml).not.toMatch(/✓/);
  });

  it('applies an emerald (completed) color class to the <li> card when completed', () => {
    const liOn = onHtml.match(/<li\b[^>]*>/);
    const liOff = offHtml.match(/<li\b[^>]*>/);
    expect(liOn).not.toBeNull();
    expect(liOff).not.toBeNull();
    expect(liOn![0]).toMatch(/border-emerald-500\/60/);
    expect(liOff![0]).not.toMatch(/border-emerald-500\/60/);
  });

  it('uses a different aria-label depending on completion state', () => {
    const labelOff = offHtml.match(/aria-label="([^"]+)"/);
    const labelOn = onHtml.match(/aria-label="([^"]+)"/);
    expect(labelOff).not.toBeNull();
    expect(labelOn).not.toBeNull();
    expect(labelOff![1]).toMatch(/Marcar/);
    expect(labelOn![1]).toMatch(/Desmarcar/);
  });
});
