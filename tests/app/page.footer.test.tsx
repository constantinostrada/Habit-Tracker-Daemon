import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';

const html = renderToStaticMarkup(createElement(Home));
const currentYear = new Date().getFullYear();

function extractFooter(markup: string): string {
  const match = markup.match(/<footer\b[\s\S]*?<\/footer>/);
  expect(match).not.toBeNull();
  return match![0];
}

describe('Landing page footer (ac-1: copyright text)', () => {
  it('renders a footer at the end of the home with the exact copy "© {year} Habit Tracker — Built with calma"', () => {
    const footer = extractFooter(html);
    const expectedText = `© ${currentYear} Habit Tracker — Built with calma`;
    // textContent-like check: strip tags and collapse whitespace before comparing
    const footerText = footer.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    expect(footerText).toBe(expectedText);
  });
});

describe('Landing page footer (ac-2: year is computed dynamically)', () => {
  it('contains the value returned by new Date().getFullYear() (not a hardcoded string)', () => {
    const footer = extractFooter(html);
    expect(footer).toContain(String(currentYear));
  });

  it('does not embed a hardcoded year literal in the source of app/page.tsx', () => {
    // The source must reference new Date().getFullYear() and not bake the year in as a numeric literal.
    // We read the source file and assert the dynamic API is used near the footer copy.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('fs') as typeof import('fs');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require('path') as typeof import('path');
    const source = fs.readFileSync(
      path.join(__dirname, '..', '..', 'app', 'page.tsx'),
      'utf8',
    );
    // The footer copy must rely on the dynamic API
    expect(source).toMatch(/new Date\(\)\.getFullYear\(\)/);
    // And it must not hardcode the current year right next to "Habit Tracker" in the footer copy
    expect(source).not.toMatch(new RegExp(`©\\s*${currentYear}\\s+Habit Tracker`));
  });
});

describe('Landing page footer (ac-3: visual separation from main content)', () => {
  it('has either a top border or a clear top margin separating it from the content above', () => {
    const footer = extractFooter(html);
    const openTag = footer.match(/<footer\b[^>]*>/);
    expect(openTag).not.toBeNull();
    const classes = openTag![0];
    // Accept either a border-top utility or a generous top margin (mt-N where N >= 8)
    const hasBorderTop = /\bborder-t\b/.test(classes);
    const marginMatch = classes.match(/\bmt-(\d+)\b/);
    const hasClearMargin = marginMatch !== null && Number(marginMatch[1]) >= 8;
    expect(hasBorderTop || hasClearMargin).toBe(true);
  });
});

describe('Landing page footer (ac-4: muted/secondary text color)', () => {
  it('uses a muted text color (more tenue than the body text-zinc-100)', () => {
    const footer = extractFooter(html);
    const openTag = footer.match(/<footer\b[^>]*>/);
    expect(openTag).not.toBeNull();
    const classes = openTag![0];
    // "muted" is satisfied by zinc-400/500/600 (any of the lower-contrast shades against bg-zinc-950)
    // or by an explicit text-muted-*/text-secondary utility. We accept zinc-400+ as muted.
    const mutedZinc = classes.match(/\btext-(zinc|slate|gray|neutral|stone)-(\d{3})\b/);
    expect(mutedZinc).not.toBeNull();
    const shade = Number(mutedZinc![2]);
    // Body uses 100; muted means a significantly higher (lighter-contrast) shade number
    expect(shade).toBeGreaterThanOrEqual(400);
  });
});
