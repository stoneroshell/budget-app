import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-charcoal-950">
      <header className="border-b border-charcoal-500 bg-charcoal-900/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="font-display text-lg font-semibold text-white tracking-tight transition-colors hover:text-accent-violet-400"
          >
            Guap
          </Link>
          <div className="flex items-center gap-4">
            <span className="max-w-[180px] truncate text-sm text-charcoal-400">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-charcoal-400 transition-colors hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
