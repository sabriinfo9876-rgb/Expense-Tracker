import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES, CATEGORY_COLORS } from '../data/sampleExpenses';
import { CategoryIcon, ArrowTrendingUpIcon } from './Icons';

interface SpendingTrendsChartProps {
  expenses: Expense[];
}

export const SpendingTrendsChart: React.FC<SpendingTrendsChartProps> = ({ expenses }) => {
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

    // Sort chronologically
    const sorted = [...expenses].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sorted.forEach((exp) => {
      const existing = map.get(exp.date);
      if (existing) {
        existing.amount += exp.amount;
        existing.count += 1;
      } else {
        map.set(exp.date, { date: exp.date, amount: exp.amount, count: 1 });
      }
    });

    return Array.from(map.values());
  }, [expenses]);

  // 2. Group expenses by category
  const categoryData = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    return CATEGORIES.map((cat) => {
      const catExpenses = expenses.filter((e) => e.category === cat);
      const amount = catExpenses.reduce((sum, e) => sum + e.amount, 0);
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
      <div className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs text-center">
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
          <ArrowTrendingUpIcon className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-800">Spending Trends</h3>
        <p className="text-xs text-slate-500 mt-1">
          Add your first expenses to visualize spending trends over time.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
      {/* Header and View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ArrowTrendingUpIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Spending Trends & Analytics
              </h2>
              <p className="text-xs text-slate-500">
                {viewMode === 'timeline'
                  ? 'Daily expenditure distribution across logged dates'
                  : 'Spending breakdown ranked by category volume'}
              </p>
            </div>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            type="button"
            onClick={() => {
              setViewMode('timeline');
              setHoveredItem(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
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
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'category'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            By Category
          </button>
        </div>
      </div>

      {/* Key Insight Pill Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3 text-xs text-slate-600 border-b border-slate-100">
        {peakDay && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Peak Spending Day:</span>
            <span className="text-indigo-600 font-medium">{formatDate(peakDay.date)}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatCurrency(peakDay.amount)}
            </span>
          </div>
        )}

        {categoryData[0] && categoryData[0].amount > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Top Category:</span>
            <span className="text-emerald-700 font-medium">{categoryData[0].category}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {formatCurrency(categoryData[0].amount)} ({categoryData[0].percentage.toFixed(0)}%)
            </span>
          </div>
        )}
      </div>

      {/* Active Hover Tooltip Box */}
      <div className="min-h-7 py-1 flex items-center justify-between text-xs">
        {hoveredItem ? (
          <div className="flex items-center gap-2 text-indigo-900 bg-indigo-50/80 px-2.5 py-1 rounded-md border border-indigo-100">
            <span className="font-semibold">{hoveredItem.label}</span>
            <span className="text-slate-400">·</span>
            <span className="font-mono font-bold tabular-nums text-indigo-700">
              {formatCurrency(hoveredItem.amount)}
            </span>
            <span className="text-slate-500">({hoveredItem.count} {hoveredItem.count === 1 ? 'item' : 'items'})</span>
          </div>
        ) : (
          <span className="text-slate-400 text-[11px] italic">
            Hover over any bar to view exact transaction details
          </span>
        )}
      </div>

      {/* View 1: Timeline Bar Chart */}
      {viewMode === 'timeline' && (
        <div className="pt-3">
          <div className="h-48 w-full flex items-end gap-2 sm:gap-3 px-2 pb-6 border-b border-slate-200 relative">
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 pointer-events-none flex flex-col justify-between pb-6 text-[10px] text-slate-300">
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
              <div className="border-b border-dashed border-slate-200 w-full" />
            </div>

            {timelineData.map((d) => {
              const heightPercent = Math.max((d.amount / maxTimelineAmount) * 100, 6);
              const isHovered = hoveredItem?.label === formatDate(d.date);

              return (
                <div
                  key={d.date}
                  className="flex-1 h-full flex flex-col justify-end items-center group relative cursor-pointer z-10"
                  onMouseEnter={() =>
                    setHoveredItem({
                      label: formatDate(d.date),
                      amount: d.amount,
                      count: d.count,
                    })
                  }
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Amount label on hover */}
                  <div
                    className={`w-full max-w-[48px] rounded-t-md transition-all duration-200 ${
                      isHovered
                        ? 'bg-indigo-600 shadow-md scale-y-105 origin-bottom'
                        : 'bg-indigo-400/85 hover:bg-indigo-500'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />

                  {/* X Axis Label */}
                  <div className="absolute -bottom-6 text-[10px] sm:text-xs text-slate-500 font-mono whitespace-nowrap truncate max-w-full text-center">
                    {d.date.slice(5)} {/* MM-DD */}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-7">
            <span>Earliest Date</span>
            <span className="font-mono">Daily Spending (PKR)</span>
            <span>Latest Date</span>
          </div>
        </div>
      )}

      {/* View 2: By Category Comparison */}
      {viewMode === 'category' && (
        <div className="pt-3 space-y-3">
          {categoryData.map((item) => {
            const widthPct = Math.max((item.amount / maxCategoryAmount) * 100, 2);
            const isHovered = hoveredItem?.label === item.category;

            return (
              <div
                key={item.category}
                className="space-y-1 cursor-pointer group"
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
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <CategoryIcon category={item.category as ExpenseCategory} className="w-3.5 h-3.5 text-slate-500" />
                    <span>{item.category}</span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      ({item.count} items)
                    </span>
                  </div>

                  <div className="font-mono tabular-nums text-slate-900 font-semibold text-xs flex items-center gap-2">
                    <span>{formatCurrency(item.amount)}</span>
                    <span className="text-slate-400 font-normal w-10 text-right">
                      {item.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
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
