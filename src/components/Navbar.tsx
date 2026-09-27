import React from 'react';
import { CurrencyCode } from '../types';
import { getCurrencyConfig } from '../utils/formatters';
import { WalletIcon, DownloadIcon, RotateCcwIcon, FileTextIcon, SunIcon, MoonIcon } from './Icons';

interface NavbarProps {
  onExportCSV: () => void;
  onExportPDF: () => void;
  onResetData: () => void;
  hasExpenses: boolean;
  selectedCurrency: CurrencyCode;
  onOpenCurrencySelector: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onExportCSV,
  onExportPDF,
  onResetData,
  hasExpenses,
  selectedCurrency,
  onOpenCurrencySelector,
  isDark = false,
  onToggleTheme,
}) => {
  const currencyConfig = getCurrencyConfig(selectedCurrency);

  return (
    <header className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 sticky top-0 z-30 transition-colors no-print w-full">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand title with crisp wallet icon */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 shrink">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0 ring-1 ring-indigo-700/20">
            <WalletIcon className="w-5 h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white leading-none truncate">
                <span className="hidden xs:inline">Personal </span>Expense Tracker
              </h1>

              {/* Currency Selector Trigger Badge */}
              <button
                type="button"
                onClick={onOpenCurrencySelector}
                title="Change active currency format"
                aria-label={`Change currency: currently ${selectedCurrency}`}
                className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-mono font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-800/80 px-2 py-0.5 rounded-md transition-colors cursor-pointer shrink-0 min-h-[26px]"
              >
                <span>{selectedCurrency} ({currencyConfig.symbol.trim()})</span>
                <span className="text-[8px] text-emerald-600 dark:text-emerald-400">▼</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-1 font-normal">
              Spending, Budgets & Financial Analytics
            </p>
          </div>
        </div>

        {/* Zone 2 & 3: Consolidated controls with clear primary vs secondary hierarchy */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[38px] min-w-[38px]"
            >
              {isDark ? (
                <SunIcon className="w-4 h-4 text-amber-400" />
              ) : (
                <MoonIcon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Reset Sample Data - Secondary / Low-key ghost action */}
          <button
            type="button"
            onClick={onResetData}
            title="Reset to default sample expenses"
            aria-label="Reset Sample Data"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-100/90 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg transition-colors cursor-pointer min-h-[38px] sm:min-h-[36px]"
          >
            <RotateCcwIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Export PDF Button */}
          <button
            type="button"
            onClick={onExportPDF}
            disabled={!hasExpenses}
            title={hasExpenses ? 'Export statement to PDF' : 'No expenses to export'}
            aria-label="Export PDF Statement"
            className="inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-indigo-200 dark:border-indigo-800/80 shadow-2xs transition-colors cursor-pointer min-h-[38px] sm:min-h-[36px]"
          >
            <FileTextIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Export CSV Button - Primary Data Action */}
          <button
            type="button"
            onClick={onExportCSV}
            disabled={!hasExpenses}
            title={hasExpenses ? 'Export your expenses to CSV' : 'No expenses to export'}
            aria-label="Export CSV"
            className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px] sm:min-h-[36px]"
          >
            <DownloadIcon className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Export</span>
            <span>CSV</span>
          </button>
        </div>
      </div>
    </header>
  );
};
