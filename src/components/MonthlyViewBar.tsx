import React, { useMemo } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from './Icons';

interface MonthlyViewBarProps {
  expenses: Expense[];
  selectedMonth: string; // 'YYYY-MM' or 'all'
  onSelectMonth: (month: string) => void;
  onExportMonthlyCSV?: () => void;
}

export const MonthlyViewBar: React.FC<MonthlyViewBarProps> = ({
  expenses,
  selectedMonth,
  onSelectMonth,
  onExportMonthlyCSV,
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
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);
      return {
        total,
        count: expenses.length,
        dailyAverage: null,
        momChange: null,
      };
    }

    const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));
    const total = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Calculate days in selected month
    const [year, month] = selectedMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyAverage = total / daysInMonth;

    // Previous month comparison
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthStr = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;
    const prevMonthExpenses = expenses.filter((e) => e.date.startsWith(prevMonthStr));
    const prevTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

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
      // Step 1 month back mathematically
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
      // Step 1 month forward mathematically
      const [year, month] = selectedMonth.split('-').map(Number);
      const nextDate = new Date(year, month, 1);
      const nextStr = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
      onSelectMonth(nextStr);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month Navigator & Title */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="Previous Month"
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronLeftIcon className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="px-3 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-pointer focus:border-indigo-600"
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
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            >
              <ChevronRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {selectedMonth !== 'all' && (
            <button
              type="button"
              onClick={() => onSelectMonth('all')}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors cursor-pointer"
            >
              View All Months
            </button>
          )}

          {onExportMonthlyCSV && (
            <button
              type="button"
              onClick={onExportMonthlyCSV}
              title={`Download structured CSV report for ${formatMonthLabel(selectedMonth)}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-2xs transition-colors cursor-pointer"
            >
              <DownloadIcon className="w-3 h-3 text-slate-500" />
              <span>Monthly CSV</span>
            </button>
          )}
        </div>

        {/* Right: Quick Month Statistics Banner */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              {selectedMonth === 'all' ? 'Lifetime Total' : `${formatMonthLabel(selectedMonth)} Total`}
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-slate-900">
              {formatCurrency(monthMetrics.total)}
            </span>
          </div>

          <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Logged Items
            </span>
            <span className="text-sm font-bold font-mono tabular-nums text-slate-800">
              {monthMetrics.count} transactions
            </span>
          </div>

          {monthMetrics.dailyAverage !== null && (
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 hidden sm:block">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                Daily Average
              </span>
              <span className="text-sm font-bold font-mono tabular-nums text-slate-800">
                {formatCurrency(monthMetrics.dailyAverage)}
              </span>
            </div>
          )}

          {monthMetrics.momChange && (
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/80 hidden md:block">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">
                MoM Comparison
              </span>
              <span
                className={`text-xs font-semibold font-mono tabular-nums ${
                  monthMetrics.momChange.isIncrease ? 'text-amber-700' : 'text-emerald-700'
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
