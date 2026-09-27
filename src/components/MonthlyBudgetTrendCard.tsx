import React, { useState, useMemo } from 'react';
import { Expense, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BarChartIcon, CheckIcon } from './Icons';

interface MonthlyBudgetTrendCardProps {
  expenses: Expense[];
  monthlyBudget: number;
  selectedCurrency?: CurrencyCode;
}

export const MonthlyBudgetTrendCard: React.FC<MonthlyBudgetTrendCardProps> = ({
  expenses,
  monthlyBudget,
  selectedCurrency,
}) => {
  const [hoveredMonth, setHoveredMonth] = useState<{
    monthKey: string;
    label: string;
    spent: number;
    budget: number;
    savings: number;
    percent: number;
  } | null>(null);

  // Group expenses by YYYY-MM across history
  const monthlyTrendData = useMemo(() => {
    const monthMap = new Map<string, number>();

    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(currentMonthKey, 0);

    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(prevMonthKey, 0);

    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        const key = e.date.slice(0, 7);
        monthMap.set(key, (monthMap.get(key) || 0) + e.amount);
      }
    });

    const sortedKeys = Array.from(monthMap.keys()).sort();

    return sortedKeys.map((key) => {
      const [year, month] = key.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      const label = new Intl.DateTimeFormat('en-US', { month: 'short', year: '2-digit' }).format(date);
      const fullLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
      const spent = monthMap.get(key) || 0;
      const budget = monthlyBudget;
      const savings = budget - spent;
      const percent = budget > 0 ? (spent / budget) * 100 : 0;
      const isOver = spent > budget;

      return {
        monthKey: key,
        label,
        fullLabel,
        spent,
        budget,
        savings,
        percent,
        isOver,
      };
    });
  }, [expenses, monthlyBudget]);

  const maxBarValue = useMemo(() => {
    const maxSpent = Math.max(...monthlyTrendData.map((d) => d.spent), 0);
    return Math.max(maxSpent, monthlyBudget * 1.15, 10000);
  }, [monthlyTrendData, monthlyBudget]);

  const underBudgetCount = monthlyTrendData.filter((d) => d.spent <= d.budget && d.spent > 0).length;
  const netTotalSavings = monthlyTrendData.reduce((acc, d) => acc + (d.budget - d.spent), 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <BarChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Monthly Budget Trends
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spending vs {formatCurrency(monthlyBudget, selectedCurrency)} target cap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-md text-xs font-semibold">
            <CheckIcon className="w-3.5 h-3.5" />
            {underBudgetCount} of {monthlyTrendData.length} On Budget
          </span>
        </div>
      </div>

      {/* Tooltip / Active Callout */}
      <div className="min-h-8 py-2 flex items-center justify-between text-xs">
        {hoveredMonth ? (
          <div className="flex flex-wrap items-center gap-2 bg-indigo-50/90 dark:bg-indigo-950/60 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/80 text-slate-800 dark:text-slate-200">
            <span className="font-semibold text-indigo-900 dark:text-indigo-300">{hoveredMonth.label}:</span>
            <span>Spent: <strong className="font-mono text-slate-900 dark:text-white">{formatCurrency(hoveredMonth.spent, selectedCurrency)}</strong></span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className={hoveredMonth.savings >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-semibold font-mono' : 'text-rose-600 dark:text-rose-400 font-semibold font-mono'}>
              {hoveredMonth.savings >= 0
                ? `+${formatCurrency(hoveredMonth.savings, selectedCurrency)} Under Budget`
                : `${formatCurrency(Math.abs(hoveredMonth.savings), selectedCurrency)} Over Budget`}
            </span>
            <span className="text-slate-400 dark:text-slate-500">({hoveredMonth.percent.toFixed(1)}% of goal)</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs italic">
            Hover over any monthly bar to inspect budget variance
          </span>
        )}
      </div>

      {/* Comparative Bar Chart */}
      <div className="pt-2 overflow-x-auto no-scrollbar">
        <div className="h-44 min-w-[260px] w-full flex items-end gap-2 sm:gap-6 px-2 sm:px-4 pb-6 border-b border-slate-200 dark:border-slate-800 relative">
          {/* Target Budget Reference Line */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-300 dark:border-indigo-700/80 pointer-events-none z-0"
            style={{
              bottom: `${(monthlyBudget / maxBarValue) * 100}%`,
            }}
          >
            <span className="absolute right-1 sm:right-2 -top-4 text-[9px] sm:text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.5 font-bold rounded">
              Budget: {formatCurrency(monthlyBudget, selectedCurrency)}
            </span>
          </div>

          {monthlyTrendData.map((d) => {
            const heightPercent = Math.max((d.spent / maxBarValue) * 100, 4);
            const isHovered = hoveredMonth?.monthKey === d.monthKey;

            return (
              <div
                key={d.monthKey}
                className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer z-10"
                onMouseEnter={() =>
                  setHoveredMonth({
                    monthKey: d.monthKey,
                    label: d.fullLabel,
                    spent: d.spent,
                    budget: d.budget,
                    savings: d.savings,
                    percent: d.percent,
                  })
                }
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Bar */}
                <div
                  className={`w-full max-w-[56px] rounded-t-lg transition-all duration-200 flex flex-col justify-end ${
                    d.isOver
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : isHovered
                      ? 'bg-indigo-600 dark:bg-indigo-500 shadow-md scale-y-105 origin-bottom'
                      : 'bg-indigo-500 dark:bg-indigo-600 hover:bg-indigo-600 dark:hover:bg-indigo-500'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className="text-[10px] text-white font-mono text-center font-bold pb-1 hidden sm:block truncate px-0.5">
                    {d.spent > 0 ? `${d.percent.toFixed(0)}%` : ''}
                  </span>
                </div>

                {/* X-Axis Label */}
                <div className="absolute -bottom-6 text-xs font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap text-center">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend and Subtext */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 mt-7">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-indigo-500 inline-block" />
              <span>Within Budget</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
              <span>Exceeded Budget</span>
            </div>
          </div>

          <div className="font-mono text-xs">
            Cumulative Savings:{' '}
            <strong className={netTotalSavings >= 0 ? 'text-emerald-700 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {netTotalSavings >= 0 ? `+${formatCurrency(netTotalSavings, selectedCurrency)}` : formatCurrency(netTotalSavings, selectedCurrency)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
