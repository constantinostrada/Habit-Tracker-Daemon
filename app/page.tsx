type Frequency = 'diario' | 'semanal';

type Habit = {
  id: string;
  name: string;
  frequency: Frequency;
};

const habits: Habit[] = [
  { id: 'h1', name: 'Leer 20 minutos', frequency: 'diario' },
  { id: 'h2', name: 'Salir a correr', frequency: 'semanal' },
  { id: 'h3', name: 'Meditar', frequency: 'diario' },
];

const frequencyBadgeStyles: Record<Frequency, string> = {
  diario:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  semanal:
    'border-sky-500/30 bg-sky-500/10 text-sky-300',
};

export default function Home() {
  const hasHabits = habits.length > 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-16 sm:px-10 sm:py-24 lg:py-32">
        <header className="space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            v0 · landing
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Habit Tracker
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg">
            Hola 👋 Llevá tus hábitos diarios con calma. Sumá uno, marcá el día,
            y mirá cómo crecen las rachas con el tiempo.
          </p>
        </header>

        <section
          aria-label="Lista de hábitos"
          className="mt-16 flex flex-1 flex-col sm:mt-24"
        >
          {hasHabits ? (
            <ul
              role="list"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
            >
              {habits.map((habit) => (
                <li
                  key={habit.id}
                  className="group flex flex-col justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 transition hover:border-emerald-500/40 hover:bg-zinc-900"
                >
                  <h3 className="text-lg font-medium text-zinc-100 sm:text-xl">
                    {habit.name}
                  </h3>
                  <span
                    className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono uppercase tracking-[0.18em] ${frequencyBadgeStyles[habit.frequency]}`}
                  >
                    {habit.frequency}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 items-center justify-center">
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
                  className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-medium text-zinc-950 transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 sm:text-base"
                >
                  Crear hábito
                </button>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-16 text-center text-xs text-zinc-500 sm:mt-24">
          Construido con calma · Habit Tracker
        </footer>
      </div>
    </main>
  );
}
