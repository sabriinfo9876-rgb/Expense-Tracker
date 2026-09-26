export type ExpenseCategory = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  createdAt: number;
}

export type CategoryFilter = 'All' | ExpenseCategory;

export type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'amount-desc'
  | 'amount-asc'
  | 'title-asc';

export interface FormErrors {
  title?: string;
  amount?: string;
  category?: string;
}

export interface BudgetSettings {
  monthlyBudget: number;
  isEnabled: boolean;
}

export type CurrencyCode = 'PKR' | 'USD' | 'EUR' | 'GBP' | 'AED' | 'SAR' | 'INR';

export interface CurrencyFormat {
  code: CurrencyCode;
  symbol: string;
  label: string;
  locale: string;
  decimals: number;
  symbolPosition: 'prefix' | 'suffix';
}

export type RecurringFrequency = 'Monthly' | 'Weekly' | 'Yearly';

export interface RecurringExpense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  frequency: RecurringFrequency;
  billingDay: number; // Day of month 1-31 (or day of week)
  isActive: boolean;
  createdAt: number;
  lastLoggedDate?: string;
}


