import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GuapLogo } from "@/components/GuapLogo";
import { LoginSloganMarquee } from "@/components/LoginSloganMarquee";
import { LOGIN_SLOGANS } from "./slogans";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-charcoal-950">
      <LoginSloganMarquee slogans={LOGIN_SLOGANS} />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm rounded-2xl border border-charcoal-500 bg-charcoal-900 p-8 shadow-xl text-center text-[#DADADA]">
          <h1 className="mb-2 flex justify-center">
            <GuapLogo height={80} priority />
          </h1>
          <p className="mb-6 text-sm">
            Take Care of Your Chicken.
          </p>
          <form action="/auth/signin" method="get">
            <button
              type="submit"
              className="w-full rounded-lg bg-accent-violet-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-violet-400 focus:outline-none focus:ring-2 focus:ring-accent-violet-500 focus:ring-offset-2 focus:ring-offset-charcoal-900"
            >
              Sign in with Google
            </button>
          </form>
          <p className="mt-4 text-center text-xs text-charcoal-400">
            You will be redirected to Google to sign in securely.
          </p>
        </div>
        <p className="mt-6 text-sm text-charcoal-400">
          <Link href="/" className="btn-secondary inline-block">
            ← Back
          </Link>
        </p>
      </div>
    </div>
  );
}
