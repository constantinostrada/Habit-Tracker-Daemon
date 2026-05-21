import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';

const html = renderToStaticMarkup(createElement(Home));

describe('Landing page (ac-1: structure)', () => {
  it('renders without throwing and produces non-empty HTML', () => {
    expect(typeof html).toBe('string');
    expect(html.length).toBeGreaterThan(0);
    expect(html).toMatch(/<main\b/);
  });
});

describe('Landing page (ac-2: title)', () => {
  it('shows the "Habit Tracker" title inside an <h1>', () => {
    expect(html).toMatch(/<h1[^>]*>[^<]*Habit Tracker[^<]*<\/h1>/);
  });
});

describe('Landing page (ac-3: greeting/intro)', () => {
  it('renders a short greeting/intro after the title', () => {
    const titleIdx = html.search(/<h1\b/);
    const afterTitle = html.slice(titleIdx);
    expect(titleIdx).toBeGreaterThanOrEqual(0);
    expect(afterTitle).toMatch(/<p\b/);
    expect(afterTitle).toMatch(/Hola/);
    expect(afterTitle).toMatch(/hábitos/);
  });
});

describe('Landing page (ac-4: empty state with CTA)', () => {
  it('shows an empty-state message and a "Crear hábito" button', () => {
    expect(html).toMatch(/Todavía no tenés hábitos/);
    expect(html).toMatch(/<button[^>]*>[\s\S]*?Crear hábito[\s\S]*?<\/button>/);
  });
});

describe('Landing page (ac-5: responsive, breathing layout)', () => {
  it('uses responsive Tailwind breakpoints and generous spacing utilities', () => {
    // responsive breakpoints prove it adapts to mobile and desktop
    expect(html).toMatch(/\bsm:/);
    // generous vertical rhythm proves the design breathes
    expect(html).toMatch(/\bpy-(?:1[6-9]|2\d|3\d)\b/);
    // a container that caps width on large screens
    expect(html).toMatch(/\bmax-w-/);
  });
});
