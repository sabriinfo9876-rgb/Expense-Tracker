import React, { useState } from 'react';
import { formatCurrency } from '../utils/formatters';
import { AlertTriangleIcon, BellIcon, XIcon, CheckIcon } from './Icons';

interface BudgetAlertsBannerProps {
  totalSpent: number;
  monthlyBudget: number;
  selectedMonth: string;
  onOpenEditBudget: () => void;
}

export const BudgetAlertsBanner: React.FC<BudgetAlertsBannerProps> = ({
  totalSpent,
  monthlyBudget,
  selectedMonth,
  onOpenEditBudget,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [warningThreshold, setWarningThreshold] = useState<number>(80); // 80% default
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  if (monthlyBudget <= 0) return null;

  const percentUsed = (totalSpent / monthlyBudget) * 100;
  const remaining = monthlyBudget - totalSpent;
  const isOverBudget = percentUsed >= 100;
  const isApproaching = percentUsed >= warningThreshold && !isOverBudget;

  // If spending is below threshold and user hasn't opened config, don't show intrusive banner
  if (!isOverBudget && !isApproaching && !isConfigOpen) {
    return null;
  }

  if (isDismissed && !isConfigOpen) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100/90 rounded-lg text-xs text-slate-600 border border-slate-200">
        <div className="flex items-center gap-2">
          <BellIcon className={`w-3.5 h-3.5 ${isOverBudget ? 'text-rose-600' : 'text-amber-600'}`} />
          <span className="font-medium">
            Budget Alert Snoozed: {percentUsed.toFixed(1)}% of {formatCurrency(monthlyBudget)} utilized
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissed(false)}
          className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold cursor-pointer underline"
        >
          View Alert
        </button>
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 shadow-xs transition-all ${
        isOverBudget
          ? 'bg-rose-50/90 border-rose-200 text-rose-950'
          : isApproaching
          ? 'bg-amber-50/90 border-amber-200 text-amber-950'
          : 'bg-indigo-50/80 border-indigo-200 text-indigo-950'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              isOverBudget
                ? 'bg-rose-100 text-rose-600'
                : isApproaching
                ? 'bg-amber-100 text-amber-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            <AlertTriangleIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">
                {isOverBudget
                  ? 'Critical Alert: Monthly Budget Exceeded!'
                  : isApproaching
                  ? `Budget Warning: ${percentUsed.toFixed(1)}% Reached`
                  : 'Budget Alert Settings'}
              </h3>
              <span
                className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-md ${
                  isOverBudget
                    ? 'bg-rose-200 text-rose-800'
                    : 'bg-amber-200 text-amber-800'
                }`}
              >
                {percentUsed.toFixed(1)}% Spent
              </span>
            </div>

            <p className="text-xs mt-0.5 opacity-90">
              {isOverBudget ? (
                <>
                  You have exceeded your monthly budget by{' '}
                  <strong className="font-mono font-bold">{formatCurrency(Math.abs(remaining))}</strong>.
                  Consider curtailing discretionary spending this month.
                </>
              ) : isApproaching ? (
                <>
                  You have only{' '}
                  <strong className="font-mono font-bold">{formatCurrency(remaining)}</strong> remaining of your{' '}
                  <strong className="font-mono">{formatCurrency(monthlyBudget)}</strong> target limit.
                </>
              ) : (
                'Configure when alerts are triggered based on your spending threshold.'
              )}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={onOpenEditBudget}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs ${
              isOverBudget
                ? 'bg-rose-600 text-white hover:bg-rose-700'
                : 'bg-amber-700 text-white hover:bg-amber-800'
            }`}
          >
            Adjust Budget Goal
          </button>

          <button
            type="button"
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="px-2.5 py-1.5 text-xs font-medium bg-white/80 hover:bg-white text-slate-700 rounded-lg border border-slate-300 transition-colors cursor-pointer"
            title="Configure alert threshold"
          >
            ⚙️ Threshold ({warningThreshold}%)
          </button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
            title="Dismiss alert banner"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threshold Config Dropdown / Drawer */}
      {isConfigOpen && (
        <div className="mt-3 pt-3 border-t border-black/10 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold">Trigger Warning Alert when spending reaches:</span>
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
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {th}%
              </button>
            ))}
          </div>
          <span className="text-[11px] opacity-75">
            (Critical alert fires automatically at 100%)
          </span>
        </div>
      )}
    </div>
  );
};
