import React, { useState } from 'react';
import { Expense, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CheckIcon, EditIcon, XIcon, TargetIcon } from './Icons';

interface BudgetGoalCardProps {
  expenses: Expense[];
  monthlyBudget: number;
  isBudgetGoalEnabled: boolean;
  onToggleBudgetGoal: () => void;
  onUpdateBudget: (newBudget: number) => void;
  selectedCurrency?: CurrencyCode;
}

export const BudgetGoalCard: React.FC<BudgetGoalCardProps> = ({
  expenses,
  monthlyBudget,
  isBudgetGoalEnabled,
  onToggleBudgetGoal,
  onUpdateBudget,
  selectedCurrency,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString());
  const [error, setError] = useState<string | null>(null);

  // Total spent calculation with finite numbers guard
  const totalSpent = expenses.reduce((sum, exp) => sum + (Number.isFinite(exp.amount) ? exp.amount : 0), 0);
  const percentUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const clampedPercent = Math.min(Math.max(percentUsed, 0), 100);
  const remaining = Math.round((monthlyBudget - totalSpent) * 100) / 100;
  const isOverBudget = remaining < -0.001;

  // Days in current month calculations
  const now = new Date();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayString = now.toISOString().split('T')[0];
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = Math.max(0, totalDaysInMonth - currentDay);

  // Feature: Daily Spending Goal & Pacing Calculations
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
  const baselineDailyGoal = monthlyBudget > 0 ? monthlyBudget / totalDaysInMonth : 0;
  const suggestedDailyAllowance = remaining > 0 ? remaining / daysRemaining : 0;
  const spentToday = expenses
    .filter((e) => e.date === todayString)
    .reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
  const monthElapsedPct = (currentDay / totalDaysInMonth) * 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetValue);
    if (isNaN(val) || !Number.isFinite(val) || val <= 0) {
      setError('Please enter a valid budget amount greater than 0.');
      return;
    }
    if (val > 1000000000) {
      setError('Budget cannot exceed 1,000,000,000.');
      return;
    }
    onUpdateBudget(Math.round(val * 100) / 100);
    setIsEditing(false);
    setError(null);
  };

  const handleQuickPreset = (preset: number) => {
    setBudgetValue(preset.toString());
    onUpdateBudget(preset);
    setIsEditing(false);
    setError(null);
  };

  // Status badge styling
  let statusBadge = {
    label: 'On Track',
    badgeClass: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800/80',
    barClass: 'bg-emerald-500',
  };

  if (percentUsed >= 100) {
    statusBadge = {
      label: 'Over Budget',
      badgeClass: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800/80',
      barClass: 'bg-rose-500',
    };
  } else if (percentUsed >= 80) {
    statusBadge = {
      label: 'Approaching Limit',
      badgeClass: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800/80',
      barClass: 'bg-amber-500',
    };
  }

  // Daily Pacing Status
  let pacingStatus = {
    badge: 'On Pace',
    badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: `Spending is well-paced against your monthly allowance.`,
  };

  if (isOverBudget) {
    pacingStatus = {
      badge: 'Budget Depleted',
      badgeClass: 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      description: `Monthly budget exceeded. Limit spending to stay balanced.`,
    };
  } else if (suggestedDailyAllowance < baselineDailyGoal * 0.7) {
    pacingStatus = {
      badge: 'Pacing Fast',
      badgeClass: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      description: `Higher spending early this month. Suggested: ${formatCurrency(suggestedDailyAllowance, selectedCurrency)}/day remaining.`,
    };
  } else if (suggestedDailyAllowance > baselineDailyGoal * 1.1) {
    pacingStatus = {
      badge: 'Under Budget',
      badgeClass: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      description: `Healthy headroom! You can spend up to ${formatCurrency(suggestedDailyAllowance, selectedCurrency)}/day remaining.`,
    };
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full overflow-hidden transition-colors">
      {/* Header and Budget Goal Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <TargetIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              Monthly Budget Goal ({currentMonthName})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {isBudgetGoalEnabled
                ? 'Target cap vs actual monthly expenditure'
                : 'Budget tracking is disabled'}
            </p>
          </div>
        </div>

        {/* Feature: Budget Goal Toggle Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            type="button"
            onClick={onToggleBudgetGoal}
            className="flex items-center gap-2 cursor-pointer select-none"
            title="Toggle Budget Goal on/off"
            aria-label={`Toggle budget goal. Currently ${isBudgetGoalEnabled ? 'Enabled' : 'Disabled'}`}
          >
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {isBudgetGoalEnabled ? 'Active' : 'Off'}
            </span>
            <div
              className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                isBudgetGoalEnabled ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                  isBudgetGoalEnabled ? 'left-4.5' : 'left-0.75'
                }`}
              />
            </div>
          </button>

          {isBudgetGoalEnabled && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setBudgetValue(monthlyBudget.toString());
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer min-h-[36px]"
            >
              <EditIcon className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {!isBudgetGoalEnabled ? (
        /* Disabled State */
        <div className="py-8 text-center space-y-2">
          <div className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Monthly Budget Goal is currently disabled. Toggle to set spending limits, tracking bars, and over-budget warnings.
          </div>
          <button
            type="button"
            onClick={onToggleBudgetGoal}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Enable Budget Goal
          </button>
        </div>
      ) : isEditing ? (
        /* Editing Form */
        <form onSubmit={handleSave} className="py-4 space-y-3.5">
          <div>
            <label htmlFor="budget-goal-input" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Set Target Monthly Budget
            </label>
            <input
              id="budget-goal-input"
              type="number"
              min="1"
              max="1000000000"
              step="any"
              value={budgetValue}
              onChange={(e) => {
                setBudgetValue(e.target.value);
                setError(null);
              }}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tabular-nums focus:border-indigo-600 outline-none"
              placeholder="e.g. 75000"
              autoFocus
            />
            {error && <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">{error}</p>}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400 dark:text-slate-500">Presets:</span>
            {[25000, 50000, 75000, 100000, 150000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className="text-xs font-mono px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
              >
                {formatCurrency(preset, selectedCurrency)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              Save Goal
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <XIcon className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Visual Progress Section */
        <div className="pt-4 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span className="text-xs text-slate-500 dark:text-slate-400">Spent: </span>
              <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(totalSpent, selectedCurrency)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                {' '}of {formatCurrency(monthlyBudget, selectedCurrency)}
              </span>
            </div>

            <div className="text-right">
              {isOverBudget ? (
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                  Over budget by {formatCurrency(Math.abs(remaining), selectedCurrency)}
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 font-mono tabular-nums">
                  {formatCurrency(remaining, selectedCurrency)} remaining ({daysLeft} days left)
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full ${statusBadge.barClass} transition-all duration-500 rounded-full`}
              style={{ width: `${clampedPercent}%` }}
              role="progressbar"
              aria-valuenow={percentUsed}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
            <span>0%</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {percentUsed.toFixed(1)}% utilized ({statusBadge.label})
            </span>
            <span>100%</span>
          </div>

          {/* Daily Spending Goal & Pacing */}
          <div className="mt-3 pt-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3.5 border border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <TargetIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                  Daily Spending Goal & Pacing
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pacingStatus.badgeClass}`}>
                {pacingStatus.badge}
              </span>
            </div>

            {/* Daily Pacing Stat Breakdown */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2.5 text-center mb-3">
              {/* Suggested Remainder Allowance */}
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate">
                  Suggested Remainder
                </span>
                <span
                  className={`text-sm font-bold font-mono tabular-nums block truncate ${
                    isOverBudget ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  {formatCurrency(suggestedDailyAllowance, selectedCurrency)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  Next {daysRemaining} days
                </span>
              </div>

              {/* Baseline Daily Goal */}
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate">
                  Baseline Cap
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 block truncate">
                  {formatCurrency(baselineDailyGoal, selectedCurrency)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  1/{totalDaysInMonth}th / day
                </span>
              </div>

              {/* Spent Today */}
              <div className="bg-white dark:bg-slate-800/80 p-2.5 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium block truncate">
                  Spent Today
                </span>
                <span className="text-sm font-bold font-mono tabular-nums text-slate-800 dark:text-slate-200 block truncate">
                  {formatCurrency(spentToday, selectedCurrency)}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate">
                  Day {currentDay} of {totalDaysInMonth}
                </span>
              </div>
            </div>

            {/* Pacing Timeline Gauge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                <span>Month elapsed: {monthElapsedPct.toFixed(0)}% (Day {currentDay})</span>
                <span>Budget spent: {percentUsed.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(Math.max(percentUsed, 0), 100)}%` }}
                  title={`Budget used: ${percentUsed.toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Smart Pacing Advisory */}
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
              <span className="font-medium">{pacingStatus.description}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
