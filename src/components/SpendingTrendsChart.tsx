import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, CurrencyCode } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES, CATEGORY_COLORS } from '../data/sampleExpenses';
import { CategoryIcon, ArrowTrendingUpIcon } from './Icons';

interface SpendingTrendsChartProps {
  expenses: Expense[];
  selectedCurrency?: CurrencyCode;
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ expenses, selectedCurrency }) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'category'>('timeline');
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    amount: number;
    count: number;
    sublabel?: string;
  } | null>(null);

  // 1. Group expenses by date for timeline view
  const timelineData = useMemo(() => {
    const map = new Map<string, { date: string; amount: number; count: number }>();

    const sorted = [...expenses].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

    sorted.forEach((exp) => {
      const amt = Number.isFinite(exp.amount) ? exp.amount : 0;
      const existing = map.get(exp.date);
      if (existing) {
        existing.amount += amt;
        existing.count += 1;
      } else {
        map.set(exp.date, { date: exp.date, amount: amt, count: 1 });
      }
    });

    return Array.from(map.values());
  }, [expenses]);

  // 2. Group expenses by category
  const categoryData = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);

    return CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat);
      const amount = catExpenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        category: cat,
        amount,
        count: catExpenses.length,
        percentage,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  // Peak spending calculation
  const peakDay = useMemo(() => {
    if (timelineData.length === 0) return null;
    return timelineData.reduce((max, d) => (d.amount > max.amount ? d : max), timelineData[0]);
  }, [timelineData]);

  const maxTimelineAmount = useMemo(() => {
    if (timelineData.length === 0) return 1;
    return Math.max(...timelineData.map((d) => d.amount), 1);
  }, [timelineData]);

  const maxCategoryAmount = useMemo(() => {
    if (categoryData.length === 0) return 1;
    return Math.max(...categoryData.map((d) => d.amount), 1);
  }, [categoryData]);

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs text-center transition-colors">
        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-2">
          <ArrowTrendingUpIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Spending Trends</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Add your first expenses to visualize spending trends over time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full overflow-hidden transition-colors">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <ArrowTrendingUpIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Spending Trends & Pacing
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {viewMode === 'timeline'
                ? 'Daily expenditure distribution across logged dates'
                : 'Spending breakdown ranked by category volume'}
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewMode('timeline');
              setHoveredItem(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Daily Timeline
          </button>
          <button
            type="button"
            onClick={() => {
              setViewMode('category');
              setHoveredItem(null);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'category'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Key Insight Pill Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
        {peakDay && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Peak Spending Day:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{formatDate(peakDay.date)}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
              {formatCurrency(peakDay.amount, selectedCurrency)}
            </span>
          </div>
        )}

        {categoryData[0] && categoryData[0].amount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Top Category:</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-medium">{categoryData[0].category}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
              {formatCurrency(categoryData[0].amount, selectedCurrency)} ({categoryData[0].percentage.toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      {/* Active Hover Tooltip Box */}
      <div className="min-h-8 py-1.5 flex items-center justify-between text-xs">
        {hoveredItem ? (
          <div className="flex items-center gap-2 text-indigo-950 dark:text-indigo-200 bg-indigo-50/90 dark:bg-indigo-950/60 px-3 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/80">
            <span className="font-semibold">{hoveredItem.label}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono font-bold tabular-nums text-indigo-700 dark:text-indigo-300">
              {formatCurrency(hoveredItem.amount, selectedCurrency)}
            </span>
            <span className="text-slate-500 dark:text-slate-400">({hoveredItem.count} {hoveredItem.count === 1 ? 'entry' : 'entries'})</span>
          </div>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 text-xs italic">
            Hover over any bar to view exact transaction details
          </span>
        )}
      </div>

      {/* View 1: Timeline Bar Chart */}
      {viewMode === 'timeline' && (
        <div className="pt-2 overflow-x-auto no-scrollbar">
          <div className="h-44 sm:h-48 min-w-[260px] w-full flex items-end gap-1.5 sm:gap-3 px-1 sm:px-2 pb-6 border-b border-slate-200 dark:border-slate-800 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-6 text-[10px] text-slate-300 dark:text-slate-800">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {timelineData.map((d) => {
              const heightPercent = Math.max((d.amount / maxTimelineAmount) * 100, 6);
              const isHovered = hoveredItem?.label === formatDate(d.date);

              return (
                <div
                  key={d.date}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer z-10 min-w-[14px]"
                  onClick={() =>
                    setHoveredItem({
                      label: formatDate(d.date),
                      amount: d.amount,
                      count: d.count,
                    })
                  }
                  onMouseEnter={() =>
                    setHoveredItem({
                      label: formatDate(d.date),
                      amount: d.amount,
                      count: d.count,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div
                    className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 ${
                      isHovered
                        ? 'bg-indigo-600 dark:bg-indigo-500 shadow-md scale-y-105 origin-bottom'
                        : 'bg-indigo-400/85 dark:bg-indigo-500/70 hover:bg-indigo-500 dark:hover:bg-indigo-400'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* X Axis Label */}
                  <div className="absolute -bottom-6 text-[10px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap truncate max-w-full text-center">
                    {d.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-7 min-w-[260px]">
            <span>Earliest Date</span>
            <span className="font-mono">Daily Timeline</span>
            <span>Latest Date</span>
          </div>
        </div>
      )}

      {/* View 2: By Category Comparison */}
      {viewMode === 'category' && (
        <div className="pt-3 space-y-3.5">
          {categoryData.map((item) => {
            const widthPct = Math.max((item.amount / maxCategoryAmount) * 100, 2);
            const isHovered = hoveredItem?.label === item.category;

            return (
              <div
                key={item.category}
                className="space-y-1.5 cursor-pointer group"
                onMouseEnter={() =>
                  setHoveredItem({
                    label: item.category,
                    amount: item.amount,
                    count: item.count,
                  })
                }
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                    <CategoryIcon category={item.category as ExpenseCategory} className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>{item.category}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                      ({item.count} items)
                    </span>
                  </div>

                  <div className="font-mono tabular-nums text-slate-900 dark:text-white font-semibold text-xs flex items-center gap-2">
                    <span>{formatCurrency(item.amount, selectedCurrency)}</span>
                    <span className="text-slate-400 dark:text-slate-500 font-normal w-10 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${CATEGORY_COLORS[item.category as ExpenseCategory].bar} rounded-full transition-all duration-300 ${
                      isHovered ? 'brightness-110' : ''
                    }`}
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
