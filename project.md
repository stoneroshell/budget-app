Guap – Project Overview

Project Vision

    Build a modern, clean budgeting web application that:

        Tracks monthly income

        Tracks individual expenses

        Automatically categorizes expenses

        Organizes spending into Needs, Wants, and Misc

        Provides vivid, interactive data visualization

        Generates smart monthly insights

        Supports CSV imports

        Is multi-user and production-ready

    This app should be:

        A personal regular-use tool

        Polished enough to serve as a portfolio piece

        Architected properly to handle real external users

Core Principles

    Multi-user from day one

    Clean separation of concerns

    Scalable database schema

    Secure by default

    Minimal but polished UI

    No over-engineering in v1

    Visual style: dark charcoal theme with vivid, saturated color highlights for data

Tech Stack
    Frontend

        Next.js (App Router)

        React

        Tailwind CSS

    Backend / Database / Auth

        Supabase

        PostgreSQL database

        Google OAuth authentication

        Row Level Security (RLS)

        No persistent CSV file storage; parse uploads in memory and persist only resulting expenses plus a small import log

    Charts

        Recharts (charting library)

    Deployment

        Vercel

Core Features
1. Authentication

    Sign in with Google

    Persistent sessions

    Each user can only access their own data

    Implement Row Level Security policies

2. Monthly Budget Creation

    One budget per user per month/year (enforce via unique constraint in DB and in UI).

    Each user can:

        Create a monthly budget (Month + Year)

        Input total monthly income

        View all past budgets

3. Expense Input

    Users can:

        Add expense description (free text)

        Add dollar amount

        Optionally add payment source label (e.g. “Chase Freedom”, “Debit Card”)

        Auto-assign category based on description (or Misc when no rule matches)

        Manually override category when adding or when editing an existing expense (e.g. small dropdown or icon per row)

4. Categories System

    Single categories table: seed categories plus user-created custom categories. The app presents one unified list to the user (no distinction between “global” vs “custom” in the UI).

    Each category has a supercategory: Needs, Wants, or Misc. The exact seed list (category names and their Needs/Wants/Misc mapping) is defined in Phase 2.

    The rule-based categorizer assigns each expense to a category (or to the system “Misc” category when no rule matches); categories roll up into Needs / Wants / Misc for insights and charts.

5. Auto-Categorization Strategy (v1)

    Use rule-based keyword matching:

        Example:

            If description contains "uber" → Transportation

            If description contains "chipotle" → Restaurants

            If description contains "shell" → Gas

    Create a dedicated function in a separate module (e.g. lib/categorization):

        categorizeExpense(description: string): Category (or category_id)

    Rules live in code (keyword → category) for a minimal, swappable interface; keep the surface small so it can later be replaced with AI without changing the app structure.

6. Dashboard & Data Visualization
Required Charts

    Donut Chart

        Spending breakdown by category

    Bar Chart

        Needs vs Wants comparison

    Line Chart

        Spending by month (compare across months; no day-level tracking in v1)

Dashboard Must Show:

    Total income

    Total expenses

    Remaining balance

    Percentage of income spent

    Needs vs Wants ratio

    Monthly Insights (Smart Feature)

        Add a "Monthly Insights" panel that generates dynamic insights such as:

            “You spent 18% more on Restaurants than last month.”

            “Wants made up 42% of your total spending.”

            “Your largest expense category was Rent.”

            “You spent $320 on subscriptions this month.”

            Insights should be generated using simple comparison logic between:

                Current month

                Previous month

                No AI required for this feature.

            This adds a premium, intelligent feel to the app.

CSV Import Feature

Users can:

Upload CSV file

Map columns (Amount, Description) — no transaction date tracking in v1; imported rows attach to the current budget/month

Preview parsed data

Auto-categorize entries

Batch insert into database

Persist only resulting expenses and a small import log (no raw CSV file storage).

Must include:

Error handling

Amount parsing

Duplicate prevention (optional enhancement)

Database Schema (High-Level)
Users

    id

    email

    created_at

Budgets

    id

    user_id

    month

    year

    income

    created_at

Categories

    id

    name

    supercategory (needs | wants | misc)

Expenses

    id

    budget_id

    description

    amount

    category_id

    payment_label (optional)

(No transaction date or created_at on expenses; all time-oriented insights are by month only.)

Project Phases
Phase 1 – Core Infrastructure

    Goal: Get basic system working

    Setup Next.js project

    Integrate Supabase

    Implement Google Auth

    Create database schema

    Setup Row Level Security

    Create monthly budget

    Add expense manually

    Display expense list as single uncategorized row

    Show total spent

    No charts yet.

Phase 1 – Concrete Plan (implementation order)

    1. Project setup

        Create Next.js app (App Router), install Tailwind, add Supabase client.

        Add env vars for Supabase URL and anon key.

    2. Supabase & auth

        Enable Google OAuth in Supabase Dashboard; configure redirect URLs.

        Implement sign-in / sign-out (e.g. server actions or route handlers + middleware for session).

        Protect app routes so unauthenticated users are redirected to sign-in.

    3. Database schema (Phase 1 subset)

        users: id (uuid, PK), email (text), created_at (timestamptz). Can align with Supabase auth.users or a public.profiles table keyed by auth.uid().

        budgets: id (uuid, PK), user_id (uuid, FK → users or auth.uid()), month (smallint 1–12), year (smallint), income (numeric), created_at (timestamptz). Unique constraint on (user_id, month, year).

        expenses: id (uuid, PK), budget_id (uuid, FK → budgets), description (text), amount (numeric), category_id (nullable for Phase 1, FK → categories in Phase 2), payment_label (text, optional). No date/created_at on expenses.

        Do not create categories table in Phase 1; expenses can have category_id NULL. Optionally add categories table in Phase 1 and leave it empty or with a single “Uncategorized” row so FK is valid—otherwise make category_id nullable and add categories in Phase 2.

    4. Row Level Security (RLS)

        budgets: SELECT/INSERT/UPDATE/DELETE only where user_id = auth.uid().

        expenses: SELECT/INSERT/UPDATE/DELETE only where budget_id belongs to a budget with user_id = auth.uid() (via JOIN or subquery in policy).

        Apply RLS and disable direct table access for anon/authenticated if desired; use service role only for migrations/admin.

    5. Budget UI & API

        Page (or section) to “Create monthly budget”: pick month + year, enter income. Validate unique (user_id, month, year) in DB and in UI (e.g. disable or show message if that month already has a budget).

        List past budgets (e.g. current and previous months); allow selecting one to view/edit.

        Use Supabase client (from server or client) to insert/select budgets; enforce user_id from session.

    6. Expense UI & API

        For a selected budget, show “Add expense” form: description, amount, optional payment_label. No category in Phase 1 (or single “Uncategorized” if categories table exists).

        Insert expense with budget_id; fetch expenses for current budget.

        Display expense list (single uncategorized row/section is fine); show total spent (sum of amount for that budget_id). Use a small helper for the total, not inline in the component.

    7. Polish & definition of done for Phase 1

        User can sign in with Google, create one budget per month/year, add expenses, see list and total spent. No charts. Data scoped per user via RLS. Ready to add categories in Phase 2.

Phase 2 – Categorization System

    Create categories table (single table; seed + user-created; supercategory: needs | wants | misc).

    Define exact seed list: category names and their Needs / Wants / Misc mapping (part of Phase 2 scope).

    Add system category “Misc” (supercategory misc) for expenses that don’t match any rule; categorizer assigns to Misc by default when no keyword matches.

    Implement rule-based auto-categorization in code (e.g. lib/categorization); rules in code, minimal interface.

    Manual category override: when adding an expense (suggest then allow override) and when editing an existing expense (minimal UI, e.g. small dropdown or icon to change category).

    No backfill of existing expenses with null category_id: show them as uncategorized until the user sets a category; allow manual edit to assign.

    Implement Needs / Wants / Misc grouping and display grouped totals on the budget detail page only (not dashboard).

Phase 3 – Dashboard & Visualizations

    Add donut chart (category breakdown)

    Add bar chart (Needs vs Wants)

    Add line chart (spending over time)

    Display income, expenses, remaining balance

    Clean UI layout

    Focus heavily on polish.

Phase 4 – Monthly Insights

Compare current month to previous month

Generate insights dynamically

Add insights panel to dashboard

Ensure insights handle edge cases: when user has no previous month data, show a friendly message (e.g. “Add another month to see month-over-month comparisons”) rather than empty or broken state

Phase 5 – CSV Import

    Implement CSV parsing

    Build column mapping UI

    Auto-categorize imported rows

    Batch insert into database

    Add error handling + preview mode

Stretch Goals (Post v1)

    Allow users to add custom rules-based categorization for custom rules

    Recurring expenses

    Light mode

    Export monthly report as PDF

    Optional AI categorization upgrade

    Spending forecast feature

Definition of Done (v1)

The app is complete when:

    Multiple users can sign in

    Each user sees only their data

    Monthly budgets function properly

    Expenses auto-categorize reliably

    Dashboard displays interactive charts

    Insights generate correctly

    CSV import works without breaking

    UI feels clean, modern, and intentional

Architectural Standards

    Separate business logic from UI

    Do not calculate aggregates directly in components



Use helper functions for:

    Totals

    Category grouping

    Insights generation

    Keep components small and focused

    Avoid tightly coupling categorization logic to UI



End Goal

A production-ready budgeting application that:

    Feels modern and polished

    Demonstrates full-stack competence

    Shows understanding of authentication and database security

    Includes intelligent insights

    Is scalable beyond personal use