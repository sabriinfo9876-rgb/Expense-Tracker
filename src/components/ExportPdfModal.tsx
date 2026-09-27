import React, { useEffect } from 'react';
import { Expense, CurrencyCode } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES } from '../data/sampleExpenses';
import { FileTextIcon, XIcon, DownloadIcon } from './Icons';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  monthlyBudget: number;
  selectedMonth: string;
  selectedCurrency?: CurrencyCode;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  expenses,
  monthlyBudget,
  selectedMonth,
  selectedCurrency,
}) => {
  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
  const remaining = Math.round((monthlyBudget - totalSpent) * 100) / 100;
  const isOverBudget = remaining < -0.001;

  // Category breakdown
  const categorySummary = CATEGORIES.map((cat) => {
    const items = expenses.filter((e) => e.category === cat);
    const amount = items.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
    const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
    return {
      category: cat,
      amount,
      count: items.length,
      percentage,
    };
  }).filter((c) => c.amount > 0);

  const handlePrint = () => {
    window.print();
  };

  const getPeriodLabel = () => {
    if (selectedMonth === 'all') return 'All Time (Lifetime Statement)';
    try {
      const parts = selectedMonth.split('-');
      if (parts.length >= 2) {
        const [year, month] = parts.map(Number);
        if (year && month) {
          const date = new Date(year, month - 1, 1);
          return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
        }
      }
      return selectedMonth;
    } catch {
      return selectedMonth;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-statement-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 no-print">
          <div className="flex items-center gap-2.5 text-indigo-700 dark:text-indigo-400 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center shrink-0">
              <FileTextIcon className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h3 id="pdf-statement-title" className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                PDF Financial Statement
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Preview statement and save or print to PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[36px]"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 text-slate-900 dark:text-slate-100 print-container font-sans bg-white dark:bg-slate-900">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900 dark:border-slate-700">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                  Personal Expense Tracker
                </span>
                <span className="text-xs font-mono font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 shrink-0">
                  Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Official Financial Ledger & Expenditure Summary
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <div className="font-semibold text-slate-900 dark:text-white">
                Period: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{getPeriodLabel()}</span>
              </div>
              <div className="text-slate-500 dark:text-slate-400">
                Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                Total Spent
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white truncate block">
                {formatCurrency(totalSpent, selectedCurrency)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                Budget Goal
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white truncate block">
                {formatCurrency(monthlyBudget, selectedCurrency)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                Budget Variance
              </span>
              <span
                className={`text-base sm:text-lg font-bold font-mono tabular-nums truncate block ${
                  isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
                }`}
              >
                {isOverBudget
                  ? `-${formatCurrency(Math.abs(remaining), selectedCurrency)}`
                  : Math.abs(remaining) < 0.001
                  ? formatCurrency(0, selectedCurrency)
                  : `+${formatCurrency(remaining, selectedCurrency)}`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block truncate">
                Transaction Count
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white truncate block">
                {expenses.length} items
              </span>
            </div>
          </div>

          {/* Category Summary Table */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Expenditure by Category
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Transactions</th>
                    <th className="py-2 px-3 text-right">Share</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {categorySummary.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">{cat.category}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">{cat.count}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-500 dark:text-slate-400">{cat.percentage.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(cat.amount, selectedCurrency)}</td>
                    </tr>
                  ))}
                  {categorySummary.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-3 px-3 text-center text-slate-400">
                        No category transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Full Itemized Ledger */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
              Itemized Transactions Ledger
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(e.date)}</td>
                      <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{e.title}</td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{e.category}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(e.amount, selectedCurrency)}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-center text-slate-400">
                        No transactions recorded for this period.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Document Sign-off footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex justify-between">
            <span>Confidential Financial Statement</span>
            <span>Generated from Personal Expense Tracker</span>
          </div>
        </div>
      </div>
    </div>
  );
};
