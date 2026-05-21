import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { CreateHabitModal } from '../../app/components/CreateHabitModal';

const noop = () => {};

function renderOpen(): string {
  return renderToStaticMarkup(
    createElement(CreateHabitModal, { isOpen: true, onClose: noop, onCreate: noop }),
  );
}

function renderClosed(): string {
  return renderToStaticMarkup(
    createElement(CreateHabitModal, { isOpen: false, onClose: noop, onCreate: noop }),
  );
}

describe('CreateHabitModal (ac-2: campos para nombre y frecuencia)', () => {
  const html = renderOpen();

  it('renders a dialog when isOpen is true', () => {
    expect(html).toMatch(/role="dialog"/);
    expect(html).toMatch(/aria-modal="true"/);
  });

  it('renders an input field for the habit name', () => {
    expect(html).toMatch(/<input[^>]*\bname="name"[^>]*>/);
  });

  it('renders a frequency control with the diario and semanal options', () => {
    expect(html).toMatch(/<select[^>]*\bname="frequency"[\s\S]*?<\/select>/);
    const selectMatch = html.match(/<select[^>]*\bname="frequency"[\s\S]*?<\/select>/);
    expect(selectMatch).not.toBeNull();
    const selectInner = selectMatch![0];
    expect(selectInner).toMatch(/<option[^>]*value="diario"/);
    expect(selectInner).toMatch(/<option[^>]*value="semanal"/);
  });

  it('renders a submit button to save the habit', () => {
    expect(html).toMatch(/<button[^>]*type="submit"[\s\S]*?Guardar[\s\S]*?<\/button>/);
  });
});

describe('CreateHabitModal (ac-5: al abrirlo, el form arranca vacío)', () => {
  it('renders the name input with an empty initial value when freshly opened', () => {
    const html = renderOpen();
    const nameInputMatch = html.match(/<input[^>]*\bname="name"[^>]*>/);
    expect(nameInputMatch).not.toBeNull();
    const tag = nameInputMatch![0];
    expect(tag).toMatch(/value=""/);
    expect(tag).not.toMatch(/value="[^"]+"/);
  });

  it('defaults the frequency control to "diario" on fresh open', () => {
    const html = renderOpen();
    const diarioOption = html.match(/<option[^>]*value="diario"[^>]*>/);
    expect(diarioOption).not.toBeNull();
    expect(diarioOption![0]).toMatch(/\bselected\b/);
  });

  it('does not render any error message on fresh open', () => {
    const html = renderOpen();
    expect(html).not.toMatch(/role="alert"/);
  });

  it('renders nothing when isOpen is false (so closing fully unmounts the form)', () => {
    const html = renderClosed();
    expect(html).toBe('');
  });
});
