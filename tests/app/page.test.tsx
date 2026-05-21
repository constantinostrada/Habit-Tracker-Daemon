import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';

const html = renderToStaticMarkup(createElement(Home));

describe('Landing page (ac-1: page renders)', () => {
  it('renders without throwing and produces non-empty HTML with a <main>', () => {
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
    expect(html).toMatch(/<main\b/);
  });
});

describe('Landing page (ac-2: at least 3 habit cards)', () => {
  it('renders a list with at least 3 habit items', () => {
    const listMatch = html.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/);
    expect(listMatch).not.toBeNull();
    const listInner = listMatch![1];
    const items = listInner.match(/<li\b/g) ?? [];
    expect(items.length).toBeGreaterThanOrEqual(3);
  });
});

describe('Landing page (ac-3: each card shows name + frequency badge)', () => {
  it('each habit card contains a heading (name) and a badge with diario/semanal', () => {
    const listMatch = html.match(/<ul\b[^>]*>([\s\S]*?)<\/ul>/);
    expect(listMatch).not.toBeNull();
    const cards = listMatch![1].match(/<li\b[\s\S]*?<\/li>/g) ?? [];
    expect(cards.length).toBeGreaterThanOrEqual(3);

    for (const card of cards) {
      // Name rendered inside an h2/h3
      expect(card).toMatch(/<h[23]\b[^>]*>[\s\S]*?\S[\s\S]*?<\/h[23]>/);
      // Frequency badge — a span containing diario or semanal
      expect(card).toMatch(/<span\b[^>]*>[\s\S]*?\b(?:diario|semanal)\b[\s\S]*?<\/span>/);
    }
  });
});

describe('Landing page (ac-4: responsive grid 1/2-3 columns)', () => {
  it('uses a Tailwind grid with 1 column on mobile and 2-3 columns on larger viewports', () => {
    const listMatch = html.match(/<ul\b[^>]*>/);
    expect(listMatch).not.toBeNull();
    const openTag = listMatch![0];
    expect(openTag).toMatch(/\bgrid\b/);
    expect(openTag).toMatch(/\bgrid-cols-1\b/);
    expect(openTag).toMatch(/\b(?:sm|md|lg|xl):grid-cols-[23]\b/);
  });
});

describe('Landing page (ac-5: empty state hidden when habits exist)', () => {
  it('does not render the "Todavía no tenés hábitos" empty-state copy when habits are present', () => {
    expect(html).not.toMatch(/Todavía no tenés hábitos/);
  });
});

describe('Landing page T3 (page renders the habit list view)', () => {
  it('renders the landing page so the user can reach the create-habit flow', () => {
    expect(html).toMatch(/<main\b/);
    expect(html).toMatch(/<ul\b[^>]*>/);
  });
});

describe('Landing page T3 (modal trigger button exists)', () => {
  it('renders a "Crear hábito" button that the user can click to open the modal', () => {
    expect(html).toMatch(/<button[^>]*type="button"[\s\S]*?Crear h[áa]bito[\s\S]*?<\/button>/);
  });

  it('does not render the modal markup on initial load (modal starts closed)', () => {
    expect(html).not.toMatch(/role="dialog"/);
  });
});
