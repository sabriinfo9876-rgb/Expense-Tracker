import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { BarChartIcon, CheckIcon } from './Icons';

interface MonthlyBudgetTrendCardProps {
  expenses: Expense[];
  monthlyBudget: number;
}

export const MonthlyBudgetTrendCard: React.FC<MonthlyBudgetTrendCardProps> = ({
  expenses,
  monthlyBudget,
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

    // Current month ensures current month is always visible
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(currentMonthKey, 0);

    // Also ensure previous month is visible if no data
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    monthMap.set(prevMonthKey, 0);

    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        const key = e.date.slice(0, 7);
        monthMap.set(key, (monthMap.get(key) || 0) + e.amount);
      }
    });

    // Sort chronologically ascending
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

  // Overall metrics
  const maxBarValue = useMemo(() => {
    const maxSpent = Math.max(...monthlyTrendData.map((d) => d.spent), 0);
    return Math.max(maxSpent, monthlyBudget * 1.15, 10000);
  }, [monthlyTrendData, monthlyBudget]);

  const underBudgetCount = monthlyTrendData.filter((d) => d.spent <= d.budget && d.spent > 0).length;
  const netTotalSavings = monthlyTrendData.reduce((acc, d) => acc + (d.budget - d.spent), 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BarChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
              Monthly Budget Trend
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Monthly spending vs target budget goal ({formatCurrency(monthlyBudget)}/mo)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs self-start sm:self-auto">
          <span className="inline-flex items-center gap-1 font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[11px]">
            <CheckIcon className="w-3 h-3" />
            {underBudgetCount} of {monthlyTrendData.length} On Budget
          </span>
        </div>
      </div>

      {/* Tooltip / Active Callout */}
      <div className="min-h-7 py-2 flex items-center justify-between text-xs">
        {hoveredMonth ? (
          <div className="flex flex-wrap items-center gap-2 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100 text-slate-800">
            <span className="font-semibold text-indigo-900">{hoveredMonth.label}:</span>
            <span>Spent: <strong className="font-mono">{formatCurrency(hoveredMonth.spent)}</strong></span>
            <span className="text-slate-400">·</span>
            <span className={hoveredMonth.savings >= 0 ? 'text-emerald-700 font-semibold font-mono' : 'text-rose-600 font-semibold font-mono'}>
              {hoveredMonth.savings >= 0
                ? `+${formatCurrency(hoveredMonth.savings)} Under Budget`
                : `${formatCurrency(Math.abs(hoveredMonth.savings))} Over Budget`}
            </span>
            <span className="text-slate-400">({hoveredMonth.percent.toFixed(1)}% of budget)</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">
            Hover over any monthly bar to see budget vs actual spending breakdown
          </span>
        )}
      </div>

      {/* Comparative Bar Chart */}
      <div className="pt-2 overflow-x-auto no-scrollbar">
        <div className="h-44 min-w-[260px] w-full flex items-end gap-2 sm:gap-6 px-2 sm:px-4 pb-6 border-b border-slate-200 relative">
          {/* Target Budget Reference Line */}
          <div
            className="absolute left-0 right-0 border-b-2 border-dashed border-indigo-300 pointer-events-none z-0"
            style={{
              bottom: `${(monthlyBudget / maxBarValue) * 100}%`,
            }}
          >
            <span className="absolute right-1 sm:right-2 -top-4 text-[9px] sm:text-[10px] font-mono text-indigo-600 bg-white/90 px-1 font-semibold rounded">
              Budget: {formatCurrency(monthlyBudget)}
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
                      ? 'bg-indigo-600 shadow-md scale-y-105 origin-bottom'
                      : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                >
                  <span className="text-[10px] text-white font-mono text-center font-bold pb-1 hidden sm:block truncate px-0.5">
                    {d.spent > 0 ? `${d.percent.toFixed(0)}%` : ''}
                  </span>
                </div>

                {/* X-Axis Label */}
                <div className="absolute -bottom-6 text-[11px] font-medium text-slate-600 whitespace-nowrap text-center">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend and Subtext */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-7">
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

          <div className="font-mono text-[11px]">
            Cumulative Budget Margin: {' '}
            <strong className={netTotalSavings >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
              {netTotalSavings >= 0 ? `+${formatCurrency(netTotalSavings)}` : formatCurrency(netTotalSavings)}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
};
