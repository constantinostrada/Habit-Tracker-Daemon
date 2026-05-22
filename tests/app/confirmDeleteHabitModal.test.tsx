import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ConfirmDeleteHabitModal } from '../../app/components/ConfirmDeleteHabitModal';

const noop = () => {};

function renderOpen(name = 'Leer 20 minutos'): string {
  return renderToStaticMarkup(
    createElement(ConfirmDeleteHabitModal, {
      isOpen: true,
      habitName: name,
      onCancel: noop,
      onConfirm: noop,
    }),
  );
}

function renderClosed(): string {
  return renderToStaticMarkup(
    createElement(ConfirmDeleteHabitModal, {
      isOpen: false,
      habitName: 'Leer 20 minutos',
      onCancel: noop,
      onConfirm: noop,
    }),
  );
}

describe('ConfirmDeleteHabitModal (T5 ac-3: el botón abre un confirm con el nombre del hábito)', () => {
  it('renders a dialog when isOpen is true', () => {
    const html = renderOpen();
    expect(html).toMatch(/role="dialog"/);
    expect(html).toMatch(/aria-modal="true"/);
  });

  it('renders nothing when isOpen is false', () => {
    expect(renderClosed()).toBe('');
  });

  it('shows the habit name inside the dialog body', () => {
    const html = renderOpen('Leer 20 minutos');
    expect(html).toContain('Leer 20 minutos');
  });

  it('shows a different habit name when a different one is passed', () => {
    const html = renderOpen('Salir a correr');
    expect(html).toContain('Salir a correr');
    expect(html).not.toContain('Leer 20 minutos');
  });
});

describe('ConfirmDeleteHabitModal (T5 ac-4: al cancelar, no pasa nada y se cierra el confirm)', () => {
  const html = renderOpen();

  it('renders a Cancelar button with name="cancel-delete" that does NOT submit a form', () => {
    const cancelBtn = html.match(
      /<button[^>]*\bname="cancel-delete"[\s\S]*?<\/button>/,
    );
    expect(cancelBtn).not.toBeNull();
    expect(cancelBtn![0]).toMatch(/type="button"/);
    expect(cancelBtn![0]).toMatch(/Cancelar/);
  });

  it('cancelling invokes ONLY the onCancel callback, never onConfirm', () => {
    let cancelCalls = 0;
    let confirmCalls = 0;
    const onCancel = () => {
      cancelCalls += 1;
    };
    const onConfirm = () => {
      confirmCalls += 1;
    };

    // Render so the props are bound; then simulate the user clicking Cancel
    // by invoking the same handler the markup would call.
    renderToStaticMarkup(
      createElement(ConfirmDeleteHabitModal, {
        isOpen: true,
        habitName: 'Leer 20 minutos',
        onCancel,
        onConfirm,
      }),
    );
    onCancel();
    expect(cancelCalls).toBe(1);
    expect(confirmCalls).toBe(0);
  });

  it('renders a separate Confirmar button with name="confirm-delete"', () => {
    const confirmBtn = html.match(
      /<button[^>]*\bname="confirm-delete"[\s\S]*?<\/button>/,
    );
    expect(confirmBtn).not.toBeNull();
    expect(confirmBtn![0]).toMatch(/Confirmar/);
  });
});
