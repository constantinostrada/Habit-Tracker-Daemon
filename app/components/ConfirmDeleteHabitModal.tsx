'use client';

type Props = {
  isOpen: boolean;
  habitName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDeleteHabitModal({
  isOpen,
  habitName,
  onCancel,
  onConfirm,
}: Props) {
  if (!isOpen) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h2
          id="confirm-delete-title"
          className="text-xl font-semibold text-zinc-100"
        >
          Borrar hábito
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          ¿Borrar <strong className="text-zinc-100">{habitName}</strong>? Esta
          acción no se puede deshacer.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            name="cancel-delete"
            onClick={onCancel}
            className="rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            name="confirm-delete"
            onClick={onConfirm}
            className="rounded-full bg-rose-500 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
