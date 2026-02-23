import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-lg bg-charcoal-900 border border-charcoal-500 p-8 shadow-xl text-center">
        <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
          Guap
        </h1>
        <p className="text-charcoal-300 text-sm mb-6">
          Sign in to manage your monthly budgets.
        </p>
        <form action="/auth/signin" method="get">
          <button
            type="submit"
            className="w-full rounded-md bg-accent-violet-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-violet-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
          >
            Sign in with Google
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-charcoal-300">
          You will be redirected to Google to sign in securely.
        </p>
      </div>
      <p className="mt-6 text-sm text-charcoal-300">
        <Link href="/" className="text-charcoal-200 hover:text-white transition-colors duration-200">
          ← Back
        </Link>
      </p>
    </div>
  );
}
