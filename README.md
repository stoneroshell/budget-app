# Guap

Monthly budgeting web app with Supabase auth and PostgreSQL. Phase 1: auth, one budget per month/year, expenses, and total spent.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Supabase project**

   - Create a project at [supabase.com](https://supabase.com).
   - In Authentication → Providers, enable **Google** and set your OAuth client ID/secret.
   - In Authentication → URL Configuration, set **Site URL** (e.g. `http://localhost:3000`) and add **Redirect URL** `http://localhost:3000/auth/callback`.

3. **Environment variables**

   Copy `.env.local.example` to `.env.local` and set:

   - `NEXT_PUBLIC_SUPABASE_URL` — Project URL from Supabase dashboard.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key from Supabase dashboard.

4. **Database**

   Run the migration in the Supabase SQL editor (Supabase Dashboard → SQL Editor), or with the Supabase CLI:

   ```bash
   supabase db push
   ```

   Migration file: `supabase/migrations/20250222000000_initial_schema.sql`

5. **Run the app**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). You’ll be sent to login; use “Sign in with Google” to continue.

## Demo data (portfolio / try-it-out)

The **Demo** at `/demo` uses a static seed so visitors can try the app without signing in. Data is stored in `sessionStorage` and resets when the tab is closed.

To update the demo seed:

1. Edit **`scripts/budgets.csv`** (headers: `month,year,income`) and **`scripts/expenses.csv`** (headers: `month,year,description,amount,category_name`). Use category names that match the app (e.g. Rent, Groceries, Restaurants, Misc).
2. Run: `node scripts/build-demo-seed.js`
3. Commit the updated **`public/demo-seed.json`**.

## Phase 1 scope

- Sign in with Google, sign out, protected dashboard.
- One budget per user per month/year (enforced in DB and UI).
- Create budget (month, year, income), list budgets, open a budget.
- Add expenses (description, amount, optional payment label); list expenses; total spent and remaining.
- Dark charcoal theme; no charts yet (Phase 2+).

## Tech stack

- Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript.
- Supabase (PostgreSQL, Auth with Google OAuth, Row Level Security).
- Deploy to Vercel when ready.
