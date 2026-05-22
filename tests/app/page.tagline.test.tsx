import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Home from '../../app/page';

const html = renderToStaticMarkup(createElement(Home));

describe('Landing page tagline (ac-1: tagline below h1)', () => {
  it('renders "Construido con calma" after the h1 "Habit Tracker"', () => {
    const h1Match = html.match(
      /<h1\b[^>]*>[\s\S]*?Habit Tracker[\s\S]*?<\/h1>([\s\S]*)/,
    );
    expect(h1Match).not.toBeNull();
    expect(h1Match![1]).toMatch(/Construido con calma/);
  });
});

describe('Landing page tagline (ac-2: muted color, more tenue than body)', () => {
  it('the tagline element uses a muted text class (zinc-500/600/700 or text-muted)', () => {
    const tagMatch = html.match(
      /<([a-z0-9]+)\b([^>]*)>[^<]*Construido con calma[^<]*<\/\1>/i,
    );
    expect(tagMatch).not.toBeNull();
    const attrs = tagMatch![2];
    expect(attrs).toMatch(
      /text-(?:zinc|neutral|gray|stone|slate)-(?:500|600|700)|text-muted/,
    );
  });
});

describe('Landing page tagline (ac-3: visually connected to title, same block)', () => {
  it('no major block element separates the h1 from the tagline', () => {
    const between = html.match(/<\/h1>([\s\S]*?)Construido con calma/);
    expect(between).not.toBeNull();
    const slice = between![1];
    expect(slice).not.toMatch(
      /<(?:section|footer|nav|article|aside|ul|button|header)\b/i,
    );
  });
});
