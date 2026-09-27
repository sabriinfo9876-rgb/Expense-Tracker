import React from 'react';
import { Expense, ExpenseCategory, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { WalletIcon, ReceiptIcon, ArrowTrendingUpIcon, CategoryIcon } from './Icons';
import { CATEGORIES, CATEGORY_COLORS } from '../data/sampleExpenses';

interface SummaryCardsProps {
  expenses: Expense[];
  selectedCurrency?: CurrencyCode;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses, selectedCurrency }) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + (Number.isFinite(exp.amount) ? exp.amount : 0), 0);
  const totalCount = expenses.length;

  const validExpenses = expenses.filter((exp) => Number.isFinite(exp.amount) && exp.amount >= 0);
  const highestExpense = validExpenses.length > 0
    ? validExpenses.reduce((max, exp) => (exp.amount > max.amount ? exp : max), validExpenses[0])
    : null;

  const averageExpense = totalCount > 0 ? totalAmount / totalCount : 0;

  // Calculate category totals
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return (
    <div className="space-y-4 w-full">
      {/* 4 Core Financial Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Total Expenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Expenses
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <WalletIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              {formatCurrency(totalAmount, selectedCurrency)}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {totalCount} {totalCount === 1 ? 'transaction recorded' : 'transactions recorded'}
          </p>
        </div>

        {/* 2. Number of Expenses Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Logged Expenses
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <ReceiptIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              {totalCount}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            {totalCount > 0 ? `Avg ${formatCurrency(averageExpense, selectedCurrency)} per entry` : 'No transactions logged'}
          </p>
        </div>

        {/* 3. Highest Expense Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Highest Expense
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ArrowTrendingUpIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              {highestExpense ? formatCurrency(highestExpense.amount, selectedCurrency) : formatCurrency(0, selectedCurrency)}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate" title={highestExpense ? `${highestExpense.title} (${highestExpense.category})` : 'None'}>
            {highestExpense ? `${highestExpense.title} · ${highestExpense.category}` : 'No recorded items'}
          </p>
        </div>

        {/* 4. Average Expense Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs transition-all hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Average Expense
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shrink-0">
                <CategoryIcon category="Other" className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-mono tabular-nums truncate">
              {formatCurrency(averageExpense, selectedCurrency)}
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 truncate">
            Across active tracked period
          </p>
        </div>
      </div>

      {/* Visual Category Breakdown Distribution Bar */}
      {totalAmount > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Category Distribution
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              100% of tracked spending
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            {CATEGORIES.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  title={`${cat}: ${formatCurrency(amount, selectedCurrency)} (${pct.toFixed(1)}%)`}
                  className={`${CATEGORY_COLORS[cat].bar} transition-all duration-300`}
                />
              );
            })}
          </div>

          {/* Clean Unboxed Metadata Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600 dark:text-slate-400">
            {CATEGORIES.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              if (amount === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-xs ${CATEGORY_COLORS[cat].bar} inline-block shrink-0`} />
                  <span className="font-medium text-slate-700 dark:text-slate-300">{cat}</span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(amount, selectedCurrency)}</span>
                  <span className="text-slate-400 dark:text-slate-500">({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
