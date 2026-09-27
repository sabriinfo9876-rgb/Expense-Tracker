import React, { useMemo } from 'react';
import { Expense, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './Icons';

interface MonthlyViewBarProps {
  expenses: Expense[];
  selectedMonth: string; // 'YYYY-MM' or 'all'
  onSelectMonth: (month: string) => void;
  onExportMonthlyCSV?: () => void;
  selectedCurrency?: CurrencyCode;
}

export const MonthlyViewBar: React.FC<MonthlyViewBarProps> = ({
  expenses,
  selectedMonth,
  onSelectMonth,
  onExportMonthlyCSV,
  selectedCurrency,
}) => {
  // Extract all distinct months (YYYY-MM) present in expenses, plus current month
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();

    // Current month
    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentMonthStr);

    expenses.forEach((e) => {
      if (e.date && e.date.length >= 7) {
        monthSet.add(e.date.slice(0, 7));
      }
    });

    // Sort descending (newest first)
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [expenses]);

  // Format YYYY-MM to readable label like "September 2026"
  const formatMonthLabel = (m: string) => {
    if (m === 'all') return 'All Time';
    try {
      const [year, month] = m.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    } catch {
      return m;
    }
  };

  // Selected Month metrics
  const monthMetrics = useMemo(() => {
    if (selectedMonth === 'all') {
      const total = expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
      return {
        total,
        count: expenses.length,
        dailyAverage: null,
        momChange: null,
      };
    }

    const currentMonthExpenses = expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
    const total = currentMonthExpenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);

    // Calculate days in selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = (year && month) ? new Date(year, month, 0).getDate() : 30;
    const dailyAverage = total / daysInMonth;

    // Previous month comparison
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthExpenses = expenses.filter((e) => e.date && e.date.startsWith(prevMonthStr));
    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);

    let momChange: { percent: number; label: string; isIncrease: boolean } | null = null;
    if (prevTotal > 0) {
      const diff = total - prevTotal;
      const pct = (diff / prevTotal) * 100;
      momChange = {
        percent: Math.abs(pct),
        label: `${pct >= 0 ? '+' : '-'}${Math.abs(pct).toFixed(1)}% vs ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(prevMonthDate)}`,
        isIncrease: pct > 0,
      };
    }

    return {
      total,
      count: currentMonthExpenses.length,
      dailyAverage,
      momChange,
    };
  }, [expenses, selectedMonth]);

  // Navigate to previous or next month
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      onSelectMonth(availableMonths[0] || '2026-09');
      return;
    }
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx !== -1 && idx < availableMonths.length - 1) {
      onSelectMonth(availableMonths[idx + 1]);
    } else {
      const [year, month] = selectedMonth.split('-').map(Number);
      const prevDate = new Date(year, month - 2, 1);
      const prevStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      onSelectMonth(prevStr);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'all') return;
    const idx = availableMonths.indexOf(selectedMonth);
    if (idx > 0) {
      onSelectMonth(availableMonths[idx - 1]);
    } else {
      const [year, month] = selectedMonth.split('-').map(Number);
      const nextDate = new Date(year, month, 1);
      const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      onSelectMonth(nextStr);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs w-full overflow-hidden transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Month Navigator & Title */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              aria-label="Previous Month"
              className="p-2 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              aria-label="Select month view"
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg outline-none cursor-pointer focus:border-indigo-600 dark:focus:border-indigo-500 max-w-[145px] xs:max-w-[200px] sm:max-w-none truncate min-h-[38px] sm:min-h-[36px]"
            >
              <option value="all">📅 All Months (Lifetime)</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthLabel(m)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              title="Next Month"
              aria-label="Next Month"
              className="p-2 sm:p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer min-h-[38px] min-w-[38px] sm:min-h-[36px] sm:min-w-[36px] flex items-center justify-center"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedMonth !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectMonth('all')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer min-h-[36px] inline-flex items-center"
            >
              View All
            </button>
          )}

          {onExportMonthlyCSV && (
            <button
              type="button"
              onClick={onExportMonthlyCSV}
              title={`Download structured CSV report for ${formatMonthLabel(selectedMonth)}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-md shadow-2xs transition-colors cursor-pointer min-h-[36px]"
            >
              <DownloadIcon className="w-3 h-3 text-slate-500 dark:text-slate-400" />
              <span>Monthly CSV</span>
            </button>
          )}
        </div>

        {/* Right: Quick Month Statistics Banner */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3 text-xs w-full md:w-auto">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold truncate">
              {selectedMonth === 'all' ? 'Lifetime Total' : `${formatMonthLabel(selectedMonth)} Total`}
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-900 dark:text-white truncate block">
              {formatCurrency(monthMetrics.total, selectedCurrency)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold truncate">
              Logged Items
            </span>
            <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 truncate block">
              {monthMetrics.count} entries
            </span>
          </div>

          {monthMetrics.dailyAverage !== null && (
            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hidden sm:block">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                Daily Average
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200">
                {formatCurrency(monthMetrics.dailyAverage, selectedCurrency)}
              </span>
            </div>
          )}

          {monthMetrics.momChange && (
            <div className="bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 hidden md:block">
              <span className="text-slate-400 dark:text-slate-500 block text-[10px] uppercase font-semibold">
                MoM Variance
              </span>
              <span
                className={`text-xs font-semibold font-mono tabular-nums ${
                  monthMetrics.momChange.isIncrease ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {monthMetrics.momChange.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
