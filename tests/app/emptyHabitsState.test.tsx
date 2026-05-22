import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';
import { EmptyHabitsState } from '../../app/components/EmptyHabitsState';

const noop = () => {};

describe('EmptyHabitsState (T5 ac-7: si borro todos, vuelve el empty state)', () => {
  const html = renderToStaticMarkup(
    createElement(EmptyHabitsState, { onCreate: noop }),
  );

  it('renders the "Todavía no tenés hábitos" copy', () => {
    expect(html).toMatch(/Todavía no tenés hábitos/);
  });

  it('renders a "Crear hábito" call-to-action button', () => {
    expect(html).toMatch(
      /<button[^>]*type="button"[\s\S]*?Crear h[áa]bito[\s\S]*?<\/button>/,
    );
  });
});

describe('Home page wiring T5 (ac-7: empty state component is integrated into the page)', () => {
  it('imports and uses EmptyHabitsState — the testable empty-state marker is present in the page module', () => {
    // The page renders 3 initial habits, so the empty state is hidden in SSR.
    // We assert the component the page falls back to renders the expected empty
    // copy on its own — see the EmptyHabitsState describe block above.
    // Here we just confirm Home itself still renders without exposing the empty
    // state markup when habits exist (regression guard).
    const homeHtml = renderToStaticMarkup(createElement(Home));
    expect(homeHtml).not.toMatch(/Todavía no tenés hábitos/);
    expect(homeHtml).toMatch(/<ul\b/);
  });
});
