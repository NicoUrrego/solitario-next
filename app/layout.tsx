import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import SWRegistration from "./SWRegistration";

export const metadata: Metadata = {
  title: "Solitaire Collection",
  description: "Klondike y Spider Solitaire en Next.js PWA",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-slate-950 text-white antialiased">
        <div className="min-h-screen">
          <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-900/95 backdrop-blur">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  Solitaire Collection
                </h1>
                <p className="text-sm text-slate-400">
                  PWA creada con Next.js + TailwindCSS
                </p>
              </div>

              <nav className="flex flex-wrap gap-3">
                <Link
                  href="/"
                  className="rounded-2xl bg-emerald-500 px-5 py-2 font-semibold text-black transition hover:scale-105 hover:bg-emerald-400"
                >
                  Klondike Solitaire
                </Link>

                <Link
                  href="/spider"
                  className="rounded-2xl bg-indigo-500 px-5 py-2 font-semibold text-white transition hover:scale-105 hover:bg-indigo-400"
                >
                  Spider Solitaire
                </Link>
              </nav>
            </div>
          </header>

          <main>{children}</main>

          <footer className="border-t border-white/10 bg-slate-900">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
              <p>Solitaire Collection © 2026</p>

              <p>
                Desarrollado con Next.js, TailwindCSS y desplegable en Vercel
              </p>
            </div>
          </footer>
        </div>
        <SWRegistration />
      </body>
    </html>
  );
}
