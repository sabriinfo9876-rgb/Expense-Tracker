import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, CategoryFilter, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CATEGORIES, CATEGORY_COLORS } from '../data/sampleExpenses';
import { CategoryIcon, PieChartIcon } from './Icons';

interface CategoryDistributionCardProps {
  expenses: Expense[];
  activeCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  selectedCurrency?: CurrencyCode;
}

export const CategoryDistributionCard: React.FC<CategoryDistributionCardProps> = ({
  expenses,
  activeCategory,
  onSelectCategory,
  selectedCurrency,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<ExpenseCategory | null>(null);

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
  }, [expenses]);

  // Aggregate by category
  const categoryStats = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = expenses.filter((e) => e.category === cat);
      const amount = items.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
      const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
      const count = items.length;
      const validItems = items.filter((i) => Number.isFinite(i.amount));
      const highest = validItems.length > 0 ? validItems.reduce((max, i) => (i.amount > max.amount ? i : max), validItems[0]) : null;

      return {
        category: cat,
        amount,
        percentage,
        count,
        highest,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [expenses, totalSpent]);

  // SVG Donut calculation
  const donutSegments = useMemo(() => {
    if (totalSpent === 0) return [];

    let accumulatedAngle = 0;
    const radius = 42;
    const circumference = 2 * Math.PI * radius; // ~263.89

    return categoryStats
      .filter((c) => c.amount > 0)
      .map((c) => {
        const strokeLength = (c.amount / totalSpent) * circumference;
        const dashoffset = -accumulatedAngle;
        accumulatedAngle += strokeLength;

        return {
          category: c.category,
          amount: c.amount,
          percentage: c.percentage,
          strokeDasharray: `${strokeLength} ${circumference - strokeLength}`,
          strokeDashoffset: dashoffset,
          colorClass: CATEGORY_COLORS[c.category].bar,
        };
      });
  }, [categoryStats, totalSpent]);

  const activeStat = hoveredCategory
    ? categoryStats.find((c) => c.category === hoveredCategory)
    : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <PieChartIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Proportional expenditure breakdown across categories
            </p>
          </div>
        </div>

        {activeCategory !== 'All' && (
          <button
            type="button"
            onClick={() => onSelectCategory('All')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold px-2.5 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            Clear Filter ({activeCategory})
          </button>
        )}
      </div>

      {totalSpent === 0 ? (
        <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-xs">
          No expenses recorded for this period.
        </div>
      ) : (
        <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Chart View */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full -rotate-90 transform transition-transform duration-300"
              >
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="transparent"
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeWidth="12"
                />

                {/* Colored Segments */}
                {donutSegments.map((seg) => {
                  const isHovered = hoveredCategory === seg.category;
                  const isSelected = activeCategory === seg.category;

                  const strokeColors: Record<ExpenseCategory, string> = {
                    Food: '#10b981',
                    Transport: '#0ea5e9',
                    Shopping: '#a855f7',
                    Bills: '#f59e0b',
                    Other: '#64748b',
                  };

                  return (
                    <circle
                      key={seg.category}
                      cx="50"
                      cy="50"
                      r="42"
                      fill="transparent"
                      stroke={strokeColors[seg.category]}
                      strokeWidth={isHovered || isSelected ? 15 : 12}
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="cursor-pointer transition-all duration-200 hover:opacity-90"
                      onMouseEnter={() => setHoveredCategory(seg.category)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() =>
                        onSelectCategory(activeCategory === seg.category ? 'All' : seg.category)
                      }
                    />
                  );
                })}
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 truncate max-w-full">
                  {activeStat ? activeStat.category : 'Total Spent'}
                </span>
                <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white leading-tight">
                  {formatCurrency(activeStat ? activeStat.amount : totalSpent, selectedCurrency)}
                </span>
                <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400">
                  {activeStat ? `${activeStat.percentage.toFixed(1)}%` : `${expenses.length} entries`}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 text-center">
              Click slice to filter ledger
            </p>
          </div>

          {/* Interactive Breakdown List */}
          <div className="md:col-span-7 space-y-2">
            {categoryStats.map((item) => {
              if (item.amount === 0) return null;
              const isHovered = hoveredCategory === item.category;
              const isSelected = activeCategory === item.category;

              return (
                <div
                  key={item.category}
                  onClick={() =>
                    onSelectCategory(activeCategory === item.category ? 'All' : item.category)
                  }
                  onMouseEnter={() => setHoveredCategory(item.category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                      : isHovered
                      ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 shadow-2xs'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[item.category].bar}`} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <CategoryIcon category={item.category} className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        ({item.count})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold tabular-nums text-slate-900 dark:text-white text-xs">
                        {formatCurrency(item.amount, selectedCurrency)}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400 text-xs font-medium w-11 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${CATEGORY_COLORS[item.category].bar} rounded-full transition-all duration-300`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>

                  {item.highest && (
                    <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                      <span className="truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[200px]">Top: {item.highest.title}</span>
                      <span>{formatCurrency(item.highest.amount, selectedCurrency)}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
