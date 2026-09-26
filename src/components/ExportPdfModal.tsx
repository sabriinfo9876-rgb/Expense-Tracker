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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-statement-title"
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 no-print">
          <div className="flex items-center gap-2 text-indigo-700">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <FileTextIcon className="w-4 h-4 text-indigo-700" />
            </div>
            <div>
              <h2 id="pdf-statement-title" className="text-sm font-bold text-slate-900">
                PDF Financial Statement
              </h2>
              <p className="text-[11px] text-slate-500">
                Preview statement and save or print to PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Save as PDF / Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close modal"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Statement Document Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-900 print-container font-sans">
          {/* Statement Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">
                  Personal Expense Tracker
                </span>
                <span className="text-xs font-mono font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                  PKR Statement
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Official Monthly Financial Ledger & Expenditure Report
              </p>
            </div>

            <div className="text-right text-xs">
              <div className="font-semibold text-slate-900">
                Statement Period: <span className="text-indigo-600 font-bold">{getPeriodLabel()}</span>
              </div>
              <div className="text-slate-500 mt-0.5">
                Generated on: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-slate-500">
                Currency: <span className="font-mono font-bold text-slate-700">Pakistani Rupees (Rs)</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Metrics Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Expenditure
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(totalSpent)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Monthly Budget Goal
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(monthlyBudget)}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Budget Variance
              </span>
              <span
                className={`text-lg font-bold font-mono tabular-nums ${
                  isOverBudget ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {isOverBudget ? `-${formatCurrency(Math.abs(remaining))}` : `+${formatCurrency(remaining)}`}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Recorded Items
              </span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {expenses.length} transactions
              </span>
            </div>
          </div>

          {/* Category Expenditure Breakdown */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Category Breakdown
            </h3>
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Category</th>
                  <th className="py-2 px-3 text-right">Transactions</th>
                  <th className="py-2 px-3 text-right">Share</th>
                  <th className="py-2 px-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categorySummary.map((c) => (
                  <tr key={c.category}>
                    <td className="py-2 px-3 font-medium text-slate-900">{c.category}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{c.count}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">{c.percentage.toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(c.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Itemized Transactions Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Itemized Transactions Ledger
            </h3>
            {expenses.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">No transactions recorded for this period.</p>
            ) : (
              <table className="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">Date</th>
                    <th className="py-2 px-3">Expense Title</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3 text-right">Amount (PKR)</th>
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
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 text-sm">
                      {formatCurrency(totalSpent)}
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Statement Signoff / Footer */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
            <span>Generated from Personal Expense Tracker · Confidential financial record</span>
            <span className="font-mono">Verification: PET-PKR-{Date.now().toString(36).toUpperCase()}</span>
          </div>
        </div>

        {/* Bottom Actions Bar (Hidden during print) */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-200 bg-slate-50 no-print">
          <span className="text-xs text-slate-500 font-mono">
            {expenses.length} records ready for PDF export
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <DownloadIcon className="w-3.5 h-3.5" />
              <span>Download / Print PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
