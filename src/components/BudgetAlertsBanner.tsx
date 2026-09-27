import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { AlertTriangleIcon, BellIcon, XIcon } from './Icons';

interface BudgetAlertsBannerProps {
  totalSpent: number;
  monthlyBudget: number;
  selectedMonth: string;
  onOpenEditBudget: () => void;
  selectedCurrency?: CurrencyCode;
}

export const BudgetAlertsBanner: React.FC<BudgetAlertsBannerProps> = ({
  totalSpent,
  monthlyBudget,
  onOpenEditBudget,
  selectedCurrency,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (monthlyBudget <= 0) return null;

  const percentUsed = (totalSpent / monthlyBudget) * 100;
  const remaining = monthlyBudget - totalSpent;
  const isOverBudget = percentUsed >= 100;
  const isApproaching = percentUsed >= warningThreshold && !isOverBudget;

  if (!isOverBudget && !isApproaching && !isConfigOpen) {
    return null;
  }

  if (isDismissed && !isConfigOpen) {
    return (
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-100/90 dark:bg-slate-800/80 rounded-lg text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <BellIcon className={`w-3.5 h-3.5 ${isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`} />
          <span className="font-medium">
            Budget Alert Snoozed: {percentUsed.toFixed(1)}% of {formatCurrency(monthlyBudget, selectedCurrency)} utilized
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-xs font-semibold cursor-pointer underline"
        >
          View Alert
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 shadow-xs transition-colors w-full overflow-hidden ${
        isOverBudget
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200'
          : isApproaching
          ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200'
          : 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isOverBudget
                ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
                : isApproaching
                ? 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-400'
                : 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400'
            }`}
          >
            <AlertTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold truncate">
                {isOverBudget
                  ? 'Budget Limit Exceeded'
                  : isApproaching
                  ? `Budget Warning: ${percentUsed.toFixed(1)}% Reached`
                  : 'Budget Alert Threshold'}
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0 ${
                  isOverBudget
                    ? 'bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200'
                    : 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                }`}
              >
                {percentUsed.toFixed(1)}% Spent
              </span>
            </div>

            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              {isOverBudget ? (
                <>
                  You have exceeded your monthly budget by{' '}
                  <strong className="font-mono font-bold">{formatCurrency(Math.abs(remaining), selectedCurrency)}</strong>.
                </>
              ) : isApproaching ? (
                <>
                  You have{' '}
                  <strong className="font-mono font-bold">{formatCurrency(remaining, selectedCurrency)}</strong> remaining of your{' '}
                  <strong className="font-mono">{formatCurrency(monthlyBudget, selectedCurrency)}</strong> target cap.
                </>
              ) : (
                'Configure when notifications appear based on monthly spending.'
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
          <button
            type="button"
            onClick={onOpenEditBudget}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs min-h-[36px] ${
              isOverBudget
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-700 dark:bg-amber-600 text-white hover:bg-amber-800'
            }`}
          >
            Adjust Budget
          </button>

          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white/80 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer min-h-[36px]"
            title="Configure alert threshold"
          >
            Threshold: {warningThreshold}%
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="Dismiss alert banner"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threshold Config Dropdown */}
      {isConfigOpen && (
        <div className="mt-3 pt-3 border-t border-black/10 dark:border-white/10 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold">Trigger warning when spending reaches:</span>
          <div className="flex items-center gap-1.5">
            {[70, 75, 80, 85, 90].map((th) => (
              <button
                key={th}
                type="button"
                onClick={() => {
                  setWarningThreshold(th);
                  setIsConfigOpen(false);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer ${
                  warningThreshold === th
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {th}%
              </button>
            ))}
          </div>
          <span className="text-[11px] opacity-75">
            (Critical alert triggers at 100%)
          </span>
        </div>
      )}
    </div>
  );
};
