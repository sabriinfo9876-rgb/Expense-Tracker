import React, { useState } from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { CheckIcon, EditIcon, XIcon, TargetIcon, CalendarIcon } from './Icons';

interface BudgetGoalCardProps {
  expenses: Expense[];
  monthlyBudget: number;
  isBudgetGoalEnabled: boolean;
  onToggleBudgetGoal: () => void;
  onUpdateBudget: (newBudget: number) => void;
}

export const BudgetGoalCard: React.FC<BudgetGoalCardProps> = ({
  expenses,
  monthlyBudget,
  isBudgetGoalEnabled,
  onToggleBudgetGoal,
  onUpdateBudget,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetValue, setBudgetValue] = useState(monthlyBudget.toString());
  const [error, setError] = useState<string | null>(null);

  // Total spent calculation
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const percentUsed = monthlyBudget > 0 ? (totalSpent / monthlyBudget) * 100 : 0;
  const clampedPercent = Math.min(percentUsed, 100);
  const remaining = monthlyBudget - totalSpent;
  const isOverBudget = remaining < 0;

  // Days in current month calculations
  const now = new Date();
  const currentMonthName = now.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayString = now.toISOString().split('T')[0];
  const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const daysLeft = Math.max(0, totalDaysInMonth - currentDay);
  
  // Feature: Daily Spending Goal & Pacing Calculations
  // Days remaining including today as an active spending day:
  const daysRemaining = Math.max(1, totalDaysInMonth - currentDay + 1);
  const baselineDailyGoal = monthlyBudget > 0 ? monthlyBudget / totalDaysInMonth : 0;
  const suggestedDailyAllowance = remaining > 0 ? remaining / daysRemaining : 0;
  const spentToday = expenses
    .filter((e) => e.date === todayString)
    .reduce((sum, e) => sum + e.amount, 0);
  const expectedSpendingToDate = baselineDailyGoal * currentDay;
  const pacingDiff = expectedSpendingToDate - totalSpent;
  const monthElapsedPct = (currentDay / totalDaysInMonth) * 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetValue);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid budget amount greater than 0.');
      return;
    }
    onUpdateBudget(val);
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
    textClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    barClass: 'bg-emerald-500',
  };

  if (percentUsed >= 100) {
    statusBadge = {
      label: 'Over Budget',
      textClass: 'text-rose-700 bg-rose-50 border-rose-200',
      barClass: 'bg-rose-500',
    };
  } else if (percentUsed >= 80) {
    statusBadge = {
      label: 'Approaching Limit',
      textClass: 'text-amber-700 bg-amber-50 border-amber-200',
      barClass: 'bg-amber-500',
    };
  }

  // Daily Pacing Status
  let pacingStatus = {
    badge: 'On Pace',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    description: `You are pacing well against your planned daily budget.`,
  };

  if (isOverBudget) {
    pacingStatus = {
      badge: 'Budget Depleted',
      badgeClass: 'bg-rose-100 text-rose-800',
      description: `Monthly budget exceeded. Suggested allowance is 0 for remaining days.`,
    };
  } else if (suggestedDailyAllowance < baselineDailyGoal * 0.7) {
    pacingStatus = {
      badge: 'Pacing Fast',
      badgeClass: 'bg-amber-100 text-amber-800',
      description: `Higher spending early in the month. Limit to ${formatCurrency(suggestedDailyAllowance)}/day to finish under budget.`,
    };
  } else if (suggestedDailyAllowance > baselineDailyGoal * 1.1) {
    pacingStatus = {
      badge: 'Ahead of Pace',
      badgeClass: 'bg-emerald-100 text-emerald-800',
      description: `Great discipline! You have extra headroom of ${formatCurrency(suggestedDailyAllowance)}/day for the rest of the month.`,
    };
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs w-full overflow-hidden">
      {/* Header and Budget Goal Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <path d="M12 2v20" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
              Monthly Budget Goal ({currentMonthName})
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 truncate">
              {isBudgetGoalEnabled
                ? 'Target cap vs actual monthly expenses'
                : 'Budget tracking is currently turned off'}
            </p>
          </div>
        </div>

        {/* Feature: Budget Goal Toggle Switch */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0">
          <label className="flex items-center gap-2 cursor-pointer select-none" title="Toggle Budget Goal on/off">
            <span className="text-xs font-medium text-slate-600">
              {isBudgetGoalEnabled ? 'Goal: On' : 'Goal: Off'}
            </span>
            <div
              onClick={onToggleBudgetGoal}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                isBudgetGoalEnabled ? 'bg-indigo-600' : 'bg-slate-300'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.75 transition-transform ${
                  isBudgetGoalEnabled ? 'left-4.5' : 'left-0.75'
                }`}
              />
            </div>
          </label>

          {isBudgetGoalEnabled && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setBudgetValue(monthlyBudget.toString());
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-indigo-600 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer min-h-[32px]"
            >
              <EditIcon className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
        </div>
      </div>

      {!isBudgetGoalEnabled ? (
        /* Disabled State with one-click enable */
        <div className="py-6 text-center space-y-2">
          <div className="text-xs text-slate-500 max-w-sm mx-auto">
            Monthly Budget Goal is currently disabled. Toggle to set spending limits, progress bars, and over-budget alerts.
          </div>
          <button
            type="button"
            onClick={onToggleBudgetGoal}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Enable Budget Goal
          </button>
        </div>
      ) : isEditing ? (
        /* Editing Form */
        <form onSubmit={handleSave} className="py-3 space-y-3">
          <div>
            <label htmlFor="budget-goal-input" className="block text-xs font-semibold text-slate-700 mb-1">
              Set Target Monthly Budget
            </label>
            <div className="relative">
              <input
                id="budget-goal-input"
                type="number"
                min="1000"
                step="500"
                value={budgetValue}
                onChange={(e) => {
                  setBudgetValue(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-300 font-mono tabular-nums focus:border-indigo-600 outline-none"
                placeholder="e.g. 75000"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400">Presets:</span>
            {[50000, 75000, 100000, 150000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleQuickPreset(preset)}
                className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors cursor-pointer"
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
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
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <XIcon className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        /* Visual Progress Section */
        <div className="pt-3 space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <span className="text-xs text-slate-500">Spent so far: </span>
              <span className="text-lg font-bold font-mono tabular-nums text-slate-900">
                {formatCurrency(totalSpent)}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {' '}of {formatCurrency(monthlyBudget)}
              </span>
            </div>

            <div className="text-right">
              {isOverBudget ? (
                <span className="text-xs font-bold text-rose-600 font-mono tabular-nums">
                  Over budget by {formatCurrency(Math.abs(remaining))}
                </span>
              ) : (
                <span className="text-xs font-medium text-emerald-700 font-mono tabular-nums">
                  {formatCurrency(remaining)} remaining ({daysLeft} days left)
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${statusBadge.barClass} transition-all duration-500 rounded-full`}
              style={{ width: `${clampedPercent}%` }}
              role="progressbar"
              aria-valuenow={percentUsed}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>0%</span>
            <span className="font-semibold text-slate-700">
              {percentUsed.toFixed(1)}% utilized ({statusBadge.label})
            </span>
            <span>100%</span>
          </div>

          {/* REQUESTED FEATURE: Daily Spending Goal & Pacing */}
          <div className="mt-3 pt-3 border-t border-slate-100 bg-slate-50/80 rounded-xl p-3 border">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <TargetIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Daily Spending Goal & Pacing
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${pacingStatus.badgeClass}`}>
                {pacingStatus.badge}
              </span>
            </div>

            {/* Daily Pacing Stat Breakdown - Responsive grid for 320px+ */}
            <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 text-center mb-2.5">
              {/* Suggested Remainder Allowance */}
              <div className="bg-white p-2.5 sm:p-2 rounded-lg border border-slate-200 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Suggested Remainder
                </span>
                <span
                  className={`text-xs sm:text-sm font-bold font-mono tabular-nums block truncate ${
                    isOverBudget ? 'text-rose-600' : 'text-indigo-600'
                  }`}
                >
                  {formatCurrency(suggestedDailyAllowance)}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Next {daysRemaining} days
                </span>
              </div>

              {/* Baseline Daily Goal */}
              <div className="bg-white p-2.5 sm:p-2 rounded-lg border border-slate-200 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Baseline Cap
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-800 block truncate">
                  {formatCurrency(baselineDailyGoal)}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  1/{totalDaysInMonth}th / day
                </span>
              </div>

              {/* Spent Today */}
              <div className="bg-white p-2.5 sm:p-2 rounded-lg border border-slate-200 shadow-2xs min-w-0">
                <span className="text-[10px] text-slate-400 font-medium block truncate">
                  Spent Today
                </span>
                <span className="text-xs sm:text-sm font-bold font-mono tabular-nums text-slate-800 block truncate">
                  {formatCurrency(spentToday)}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Day {currentDay} of {totalDaysInMonth}
                </span>
              </div>
            </div>

            {/* Pacing Timeline Gauge */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <span>Month elapsed: {monthElapsedPct.toFixed(0)}% (Day {currentDay})</span>
                <span>Budget spent: {percentUsed.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentUsed, 100)}%` }}
                  title={`Budget used: ${percentUsed.toFixed(1)}%`}
                />
              </div>
            </div>

            {/* Smart Pacing Advisory */}
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              💡 <span className="text-slate-700 font-medium">{pacingStatus.description}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
