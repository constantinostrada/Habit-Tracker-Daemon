import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';
import HabitsPage from '../../app/habits/page';

const homeHtml = renderToStaticMarkup(createElement(Home));
const habitsHtml = renderToStaticMarkup(createElement(HabitsPage));

const PRIMARY_BUTTON_CLASS =
  'inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950';

function findVerHabitosAnchor(html: string): string | null {
  const matches = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
  for (const a of matches) {
    if (/Ver\s+h[áa]bitos/.test(a)) return a;
  }
  return null;
}

describe('Home (ac-1: button "Ver hábitos" exists on home)', () => {
  it('renders an element with text "Ver hábitos" on the landing page', () => {
    expect(homeHtml).toMatch(/Ver\s+h[áa]bitos/);
  });
});

describe('Home (ac-2: click navigates to /habits via client-side routing)', () => {
  it('"Ver hábitos" is rendered as an anchor with href="/habits" (Next.js <Link> client-side routing)', () => {
    const anchor = findVerHabitosAnchor(homeHtml);
    expect(anchor).not.toBeNull();
    expect(anchor!).toMatch(/\bhref="\/habits"/);
  });
});

describe('Habits route (ac-3: /habits renders h1 "Mis hábitos")', () => {
  it('renders an <h1> containing "Mis hábitos"', () => {
    expect(habitsHtml).toMatch(/<h1\b[^>]*>[\s\S]*?Mis\s+h[áa]bitos[\s\S]*?<\/h1>/);
  });
});

describe('Home (ac-4: "Ver hábitos" uses the primary button style, no inline styles)', () => {
  it('uses the same emerald primary classes as the existing "Crear hábito" button', () => {
    const anchor = findVerHabitosAnchor(homeHtml);
    expect(anchor).not.toBeNull();
    // shares the core primary-style class signatures with the existing "Crear hábito" button
    expect(anchor!).toMatch(/\bbg-emerald-500\b/);
    expect(anchor!).toMatch(/\brounded-full\b/);
    expect(anchor!).toMatch(/\bhover:bg-emerald-400\b/);
    expect(anchor!).toMatch(/\btext-zinc-950\b/);
  });

  it('does not use the inline style attribute', () => {
    const anchor = findVerHabitosAnchor(homeHtml);
    expect(anchor).not.toBeNull();
    expect(anchor!).not.toMatch(/\sstyle=/);
  });

  it('matches the existing primary button class string in full', () => {
    // The primary class string used by "Crear hábito" must also appear on "Ver hábitos"
    const anchor = findVerHabitosAnchor(homeHtml);
    expect(anchor).not.toBeNull();
    const classMatch = anchor!.match(/class="([^"]+)"/);
    expect(classMatch).not.toBeNull();
    const classes = classMatch![1];
    for (const token of PRIMARY_BUTTON_CLASS.split(/\s+/)) {
      expect(classes.split(/\s+/)).toContain(token);
    }
  });
});
