'use client';

type Props = {
  onCreate: () => void;
};

export function EmptyHabitsState({ onCreate }: Props) {
  return (
    <div
      data-testid="empty-habits-state"
      className="flex flex-1 items-center justify-center"
    >
      <div className="w-full rounded-2xl border border-dashed border-zinc-700/70 bg-zinc-900/40 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-2xl">
          ✨
        </div>
        <h2 className="mt-6 text-xl font-medium text-zinc-100 sm:text-2xl">
          Todavía no tenés hábitos
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
          Creá el primero y empezá a registrar tu progreso día a día.
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:text-base"
        >
          Crear hábito
        </button>
      </div>
    </div>
  );
}
