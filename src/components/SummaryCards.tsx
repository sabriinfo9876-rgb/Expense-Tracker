import React from 'react';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { WalletIcon, ReceiptIcon, ArrowTrendingUpIcon, CategoryIcon } from './Icons';
import { CATEGORIES, CATEGORY_COLORS } from '../data/sampleExpenses';

interface SummaryCardsProps {
  expenses: Expense[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ expenses }) => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalCount = expenses.length;

  const highestExpense = expenses.length > 0
    ? expenses.reduce((max, exp) => (exp.amount > max.amount ? exp : max), expenses[0])
    : null;

  const averageExpense = totalCount > 0 ? totalAmount / totalCount : 0;

  // Calculate category totals
  const categoryTotals = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  return (
    <div className="space-y-4">
      {/* 3 Primary Visual Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expenses Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <WalletIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(totalAmount)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {totalCount} {totalCount === 1 ? 'logged transaction' : 'logged transactions'}
          </p>
        </div>

        {/* Number of Expenses Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Number of Expenses
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <ReceiptIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {totalCount}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalCount > 0 ? `Avg: ${formatCurrency(averageExpense)} / item` : 'No items recorded yet'}
          </p>
        </div>

        {/* Highest Expense Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Highest Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {highestExpense ? formatCurrency(highestExpense.amount) : 'Rs 0'}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate" title={highestExpense ? highestExpense.title : 'None'}>
            {highestExpense ? `${highestExpense.title} (${highestExpense.category})` : 'No expenses recorded'}
          </p>
        </div>

        {/* Average Transaction Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Expense
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CategoryIcon category="Other" className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
            {formatCurrency(averageExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Per tracked expense item
          </p>
        </div>
      </div>

      {/* Visual Category Breakdown Distribution Bar */}
      {totalAmount > 0 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">Category Spending Distribution</span>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              100% of tracked funds
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
            {CATEGORIES.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              if (pct === 0) return null;
              return (
                <div
                  key={cat}
                  style={{ width: `${pct}%` }}
                  title={`${cat}: ${formatCurrency(amount)} (${pct.toFixed(1)}%)`}
                  className={`${CATEGORY_COLORS[cat].bar} transition-all duration-300`}
                />
              );
            })}
          </div>

          {/* Unboxed Metadata Legend adhering to Zero-Pill rule */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-600">
            {CATEGORIES.map((cat) => {
              const amount = categoryTotals[cat] || 0;
              const pct = totalAmount > 0 ? (amount / totalAmount) * 100 : 0;
              if (amount === 0) return null;
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-xs ${CATEGORY_COLORS[cat].bar} inline-block`} />
                  <span className="font-medium text-slate-700">{cat}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono tabular-nums text-slate-600 font-semibold">{formatCurrency(amount)}</span>
                  <span className="text-slate-400">({pct.toFixed(0)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
