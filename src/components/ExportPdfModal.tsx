import React from 'react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { CATEGORIES } from '../data/sampleExpenses';
import { FileTextIcon, XIcon, DownloadIcon } from './Icons';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  monthlyBudget: number;
  selectedMonth: string;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  expenses,
  monthlyBudget,
  selectedMonth,
}) => {
  if (!isOpen) return null;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = monthlyBudget - totalSpent;
  const isOverBudget = remaining < 0;

  // Category breakdown
  const categorySummary = CATEGORIES.map((cat) => {
    const items = expenses.filter((e) => e.category === cat);
    const amount = items.reduce((sum, e) => sum + e.amount, 0);
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
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
    } catch {
      return selectedMonth;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-statement-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50/80 no-print">
          <div className="flex items-center gap-2 text-indigo-700 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
              <FileTextIcon className="w-4 h-4 text-indigo-700" />
            </div>
            <div className="min-w-0">
              <h2 id="pdf-statement-title" className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                PDF Financial Statement
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                Preview statement and save or print to PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[36px]"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Save as </span>
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              aria-label="Close modal"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 text-slate-900 print-container font-sans">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 uppercase">
                  Personal Expense Tracker
                </span>
                <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-300 shrink-0">
                  Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official Monthly Financial Ledger & Expenditure Report
              </p>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5">
              <div className="font-semibold text-slate-900">
                Period: <span className="text-indigo-600 font-bold">{getPeriodLabel()}</span>
              </div>
              <div className="text-slate-500">
                Generated: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                Total Spent
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 truncate block">
                {formatCurrency(totalSpent)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                Budget Goal
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 truncate block">
                {formatCurrency(monthlyBudget)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                Budget Variance
              </span>
              <span
                className={`text-base sm:text-lg font-bold font-mono tabular-nums truncate block ${
                  isOverBudget ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {isOverBudget ? `-${formatCurrency(Math.abs(remaining))}` : `+${formatCurrency(remaining)}`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block truncate">
                Recorded Items
              </span>
              <span className="text-base sm:text-lg font-bold font-mono tabular-nums text-slate-900 truncate block">
                {expenses.length} txns
              </span>
            </div>
          </div>

          {/* Category Expenditure Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Category Breakdown
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Transactions</th>
                    <th className="py-2 px-3 text-right">Share</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categorySummary.map((c) => (
                    <tr key={c.category}>
                      <td className="py-2 px-3 font-medium text-slate-900">{c.category}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{c.count}</td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600">{c.percentage.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                        {formatCurrency(c.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Itemized Transactions Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Itemized Transactions Ledger
            </h3>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No transactions recorded for this period.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs min-w-[400px]">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Expense Title</th>
                      <th className="py-2 px-3">Category</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {expenses.map((exp) => (
                      <tr key={exp.id}>
                        <td className="py-2 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatDate(exp.date)}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900">{exp.title}</td>
                        <td className="py-2 px-3 text-slate-600">{exp.category}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                          {formatCurrency(exp.amount)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td colSpan={3} className="py-2.5 px-3 text-slate-900 uppercase">
                        Total Expenditure
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-900 text-sm whitespace-nowrap">
                        {formatCurrency(totalSpent)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Statement Signoff / Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Personal Expense Tracker · Confidential financial record</span>
            <span className="font-mono">Verification: PET-REPORT</span>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50 no-print">
          <span className="text-[11px] sm:text-xs text-slate-500 font-mono">
            {expenses.length} records
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[36px]"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[36px]"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
