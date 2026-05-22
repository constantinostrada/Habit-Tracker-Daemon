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
        onRequestDelete: noop,
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
    const toggleBtnOff = offHtml.match(
      /<button[^>]*\bname="toggle-completion"[^>]*>/,
    );
    const toggleBtnOn = onHtml.match(
      /<button[^>]*\bname="toggle-completion"[^>]*>/,
    );
    expect(toggleBtnOff).not.toBeNull();
    expect(toggleBtnOn).not.toBeNull();
    const labelOff = toggleBtnOff![0].match(/aria-label="([^"]+)"/);
    const labelOn = toggleBtnOn![0].match(/aria-label="([^"]+)"/);
    expect(labelOff).not.toBeNull();
    expect(labelOn).not.toBeNull();
    expect(labelOff![1]).toMatch(/Marcar/);
    expect(labelOn![1]).toMatch(/Desmarcar/);
  });
});

describe('HabitCard (T5 ac-2: cada hábito muestra un botón de borrar)', () => {
  const html = renderCard(false);

  it('renders a delete button with name="delete-habit" and type="button"', () => {
    const btn = html.match(/<button\b[^>]*\bname="delete-habit"[^>]*>/);
    expect(btn).not.toBeNull();
    expect(btn![0]).toMatch(/\btype="button"/);
  });

  it('exposes an accessible aria-label that mentions "Borrar" and the habit name', () => {
    const btn = html.match(/<button\b[^>]*\bname="delete-habit"[^>]*>/);
    expect(btn).not.toBeNull();
    const label = btn![0].match(/aria-label="([^"]+)"/);
    expect(label).not.toBeNull();
    expect(label![1]).toMatch(/Borrar/);
    expect(label![1]).toContain(baseHabit.name);
  });

  it('keeps the delete button in the DOM but only revealed on hover/focus (group-hover)', () => {
    const btn = html.match(/<button\b[^>]*\bname="delete-habit"[\s\S]*?<\/button>/);
    expect(btn).not.toBeNull();
    expect(btn![0]).toMatch(/group-hover:opacity-100/);
    expect(btn![0]).toMatch(/opacity-0/);
  });
});
