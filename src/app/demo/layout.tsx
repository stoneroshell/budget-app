import Link from "next/link";
import { GuapLogo } from "@/components/GuapLogo";
import { DemoProvider } from "@/contexts/DemoContext";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <div className="min-h-screen bg-charcoal-950">
        <header className="border-b border-charcoal-500 bg-charcoal-900/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link
              href="/demo"
              className="transition-opacity hover:opacity-90"
              aria-label="Guap demo home"
            >
              <GuapLogo height={53} />
            </Link>
            <div className="flex items-center gap-4">
              <span className="rounded bg-accent-violet-500/20 px-2 py-0.5 text-xs font-medium text-accent-violet-400">
                Demo
              </span>
              <Link
                href="/login"
                className="text-sm text-charcoal-400 transition-colors hover:text-white"
              >
                Get Started with Guap
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </div>
    </DemoProvider>
  );
}
