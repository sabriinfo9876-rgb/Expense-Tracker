import { Expense, ExpenseCategory, RecurringExpense } from '../types';

export const SAMPLE_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Monthly Grocery & Supermarket',
    amount: 18500,
    category: 'Food',
    date: '2026-09-24',
    createdAt: 1727180000000,
  },
  {
    id: 'exp-2',
    title: 'Fuel & Metro Bus Transit',
    amount: 12000,
    category: 'Transport',
    date: '2026-09-20',
    createdAt: 1726830000000,
  },
  {
    id: 'exp-3',
    title: 'Electricity Bill (K-Electric / WAPDA)',
    amount: 24500,
    category: 'Bills',
    date: '2026-09-18',
    createdAt: 1726660000000,
  },
  {
    id: 'exp-4',
    title: 'Audio Headphones & Electronics',
    amount: 8500,
    category: 'Shopping',
    date: '2026-09-15',
    createdAt: 1726400000000,
  },
  {
    id: 'exp-5',
    title: 'PTCL Fiber Broadband Internet',
    amount: 3200,
    category: 'Other',
    date: '2026-09-12',
    createdAt: 1726140000000,
  },
  {
    id: 'exp-6',
    title: 'Family Dinner at Monal Restaurant',
    amount: 9800,
    category: 'Food',
    date: '2026-08-28',
    createdAt: 1724850000000,
  },
  {
    id: 'exp-7',
    title: 'Home Maintenance & Repair Services',
    amount: 6500,
    category: 'Bills',
    date: '2026-08-15',
    createdAt: 1723720000000,
  },
];

export const SAMPLE_RECURRING_EXPENSES: RecurringExpense[] = [
  {
    id: 'rec-1',
    title: 'House Rent & Society Maintenance',
    amount: 35000,
    category: 'Bills',
    frequency: 'Monthly',
    billingDay: 1,
    isActive: true,
    createdAt: 1725150000000,
  },
  {
    id: 'rec-2',
    title: 'PTCL Fiber Broadband Internet',
    amount: 3200,
    category: 'Other',
    frequency: 'Monthly',
    billingDay: 10,
    isActive: true,
    createdAt: 1725150000000,
  },
  {
    id: 'rec-3',
    title: 'Fitness Gym & Club Membership',
    amount: 4500,
    category: 'Other',
    frequency: 'Monthly',
    billingDay: 5,
    isActive: true,
    createdAt: 1725150000000,
  },
  {
    id: 'rec-4',
    title: 'Weekly Vehicle Fuel Top-Up',
    amount: 3500,
    category: 'Transport',
    frequency: 'Weekly',
    billingDay: 1,
    isActive: true,
    createdAt: 1725150000000,
  },
];

export const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

export const CATEGORY_COLORS: Record<ExpenseCategory, { bg: string; text: string; border: string; bar: string }> = {
  Food: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    bar: 'bg-emerald-500',
  },
  Transport: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-200',
    bar: 'bg-sky-500',
  },
  Shopping: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    bar: 'bg-purple-500',
  },
  Bills: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    bar: 'bg-amber-500',
  },
  Other: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    bar: 'bg-slate-500',
  },
};
