export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
      };
      budgets: {
        Row: {
          id: string;
          user_id: string;
          month: number;
          year: number;
          income: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          month: number;
          year: number;
          income: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          month?: number;
          year?: number;
          income?: number;
          created_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          budget_id: string;
          description: string;
          amount: number;
          category_id: string | null;
          payment_label: string | null;
        };
        Insert: {
          id?: string;
          budget_id: string;
          description: string;
          amount: number;
          category_id?: string | null;
          payment_label?: string | null;
        };
        Update: {
          id?: string;
          budget_id?: string;
          description?: string;
          amount?: number;
          category_id?: string | null;
          payment_label?: string | null;
        };
      };
      payment_sources: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          supercategory: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          supercategory: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          supercategory?: string;
          user_id?: string | null;
        };
      };
      user_hidden_categories: {
        Row: {
          user_id: string;
          category_id: string;
        };
        Insert: {
          user_id: string;
          category_id: string;
        };
        Update: {
          user_id?: string;
          category_id?: string;
        };
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Budget = Database["public"]["Tables"]["budgets"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type PaymentSource = Database["public"]["Tables"]["payment_sources"]["Row"];
export type BudgetInsert = Database["public"]["Tables"]["budgets"]["Insert"];
export type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
export type PaymentSourceInsert = Database["public"]["Tables"]["payment_sources"]["Insert"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
