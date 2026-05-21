import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';

const html = renderToStaticMarkup(createElement(Home));

function extractCards(): string[] {
  const listMatch = html.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/);
  if (!listMatch) return [];
  return listMatch[1].match(/<li\b[\s\S]*?<\/li>/g) ?? [];
}

describe('Habit card (ac-2: cada hábito tiene un check clickeable)', () => {
  it('renders a toggle button inside every habit card', () => {
    const cards = extractCards();
    expect(cards.length).toBeGreaterThanOrEqual(3);
    for (const card of cards) {
      expect(card).toMatch(
        /<button[^>]*\bname="toggle-completion"[^>]*>[\s\S]*?<\/button>/,
      );
    }
  });

  it('uses type="button" so the toggle never submits a form by accident', () => {
    const cards = extractCards();
    for (const card of cards) {
      const btn = card.match(
        /<button[^>]*\bname="toggle-completion"[\s\S]*?<\/button>/,
      );
      expect(btn).not.toBeNull();
      expect(btn![0]).toMatch(/type="button"/);
    }
  });

  it('exposes an accessible label that describes the action', () => {
    const cards = extractCards();
    for (const card of cards) {
      const btn = card.match(
        /<button[^>]*\bname="toggle-completion"[\s\S]*?<\/button>/,
      );
      expect(btn).not.toBeNull();
      expect(btn![0]).toMatch(/aria-label="[^"]+"/);
    }
  });
});

describe('Habit card (ac-6: al cargar la página todos arrancan sin marcar en SSR)', () => {
  it('initial server-rendered cards are all aria-pressed="false"', () => {
    const cards = extractCards();
    for (const card of cards) {
      const btn = card.match(
        /<button[^>]*\bname="toggle-completion"[\s\S]*?<\/button>/,
      );
      expect(btn).not.toBeNull();
      expect(btn![0]).toMatch(/aria-pressed="false"/);
    }
  });

  it('initial cards carry data-completed="false"', () => {
    const cards = extractCards();
    for (const card of cards) {
      expect(card).toMatch(/data-completed="false"/);
    }
  });
});
