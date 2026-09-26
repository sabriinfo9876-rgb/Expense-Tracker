import React from 'react';
import { CurrencyCode } from '../types';
import { getCurrencyConfig } from '../utils/formatters';
import { WalletIcon, DownloadIcon, RotateCcwIcon, FileTextIcon } from './Icons';

interface NavbarProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  onResetData: () => void;
  hasExpenses: boolean;
  selectedCurrency: CurrencyCode;
  onOpenCurrencySelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportCSV,
  onExportPDF,
  onResetData,
  hasExpenses,
  selectedCurrency,
  onOpenCurrencySelector,
}) => {
  const currencyConfig = getCurrencyConfig(selectedCurrency);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title with inline SVG icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 leading-tight">
                Personal Expense Tracker
              </h1>

              {/* Currency Selector Trigger Badge */}
              <button
                type="button"
                onClick={onOpenCurrencySelector}
                title="Change currency format"
                className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
              >
                <span>{selectedCurrency} ({currencyConfig.symbol.trim()})</span>
                <span className="text-[9px] text-emerald-600">▼</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Budget & Expenditure Dashboard
            </p>
          </div>
        </div>

        {/* Zone 2: Nav / Status indicators */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
          <span className="text-indigo-600 font-bold border-b-2 border-indigo-600 pb-1">
            Overview
          </span>
          <button
            type="button"
            onClick={onOpenCurrencySelector}
            className="text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Currency: {currencyConfig.code}
          </button>
        </nav>

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetData}
            title="Reset to default sample expenses"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200/80 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Sample</span>
          </button>

          <button
            type="button"
            onClick={onExportPDF}
            disabled={!hasExpenses}
            title={hasExpenses ? 'Export statement to PDF' : 'No expenses to export'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-indigo-200 shadow-2xs transition-colors cursor-pointer"
          >
            <FileTextIcon className="w-3.5 h-3.5 text-indigo-600" />
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            onClick={onExportCSV}
            disabled={!hasExpenses}
            title={hasExpenses ? 'Export your expenses to CSV' : 'No expenses to export'}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
