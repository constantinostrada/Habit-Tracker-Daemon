import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Llevá tus hábitos diarios con calma. Sumá uno, marcá el día y mirá crecer las rachas.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-900 text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
