import React, { useState } from 'react';
import { ExpenseCategory, RecurringExpense, RecurringFrequency, CurrencyCode } from '../types';
import { CATEGORIES } from '../data/sampleExpenses';
import { formatCurrency } from '../utils/formatters';
import {
  RepeatIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  EditIcon,
  CategoryIcon,
} from './Icons';

interface RecurringExpensesCardProps {
  recurringExpenses: RecurringExpense[];
  onAddRecurring: (item: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onUpdateRecurring: (id: string, item: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string) => void;
  onLogExpenseNow: (item: RecurringExpense) => void;
  selectedCurrency?: CurrencyCode;
}

export const RecurringExpensesCard: React.FC<RecurringExpensesCardProps> = ({
  recurringExpenses,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleActive,
  onLogExpenseNow,
  selectedCurrency,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Bills');
  const [frequency, setFrequency] = useState<RecurringFrequency>('Monthly');
  const [billingDay, setBillingDay] = useState('1');
  const [error, setError] = useState<string | null>(null);

  // Calculate projected monthly recurring cost
  const totalMonthlyCommitment = recurringExpenses
    .filter((r) => r.isActive)
    .reduce((sum, r) => {
      const amt = Number.isFinite(r.amount) ? r.amount : 0;
      if (r.frequency === 'Monthly') return sum + amt;
      if (r.frequency === 'Weekly') return sum + amt * 4.33;
      if (r.frequency === 'Yearly') return sum + amt / 12;
      return sum + amt;
    }, 0);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Bills');
    setFrequency('Monthly');
    setBillingDay('1');
    setError(null);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleStartEdit = (item: RecurringExpense) => {
    setEditingId(item.id);
    setTitle(item.title);
    setAmount(item.amount.toString());
    setCategory(item.category);
    setFrequency(item.frequency);
    setBillingDay(item.billingDay.toString());
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Title cannot be empty.');
      return;
    }
    const trimmedAmount = amount.trim();
    const parsedAmount = Number(trimmedAmount);
    if (!trimmedAmount || isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (parsedAmount > 100000000) {
      setError('Amount cannot exceed 100,000,000.');
      return;
    }
    const day = parseInt(billingDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('Due day must be between 1 and 31.');
      return;
    }

    const payload = {
      title: trimmedTitle,
      amount: Math.round(parsedAmount * 100) / 100,
      category,
      frequency,
      billingDay: day,
      isActive: true,
    };

    if (editingId) {
      onUpdateRecurring(editingId, payload);
    } else {
      onAddRecurring(payload);
    }

    resetForm();
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full transition-colors">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <RepeatIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Recurring Subscriptions & Bills
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage fixed recurring commitments ({recurringExpenses.filter((r) => r.isActive).length} active)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 block">
              Projected Monthly Cost
            </span>
            <span className="text-sm sm:text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {formatCurrency(totalMonthlyCommitment, selectedCurrency)}
            </span>
          </div>

          {!isFormOpen && (
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[38px]"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Recurring</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="my-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/30 space-y-3.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
            {editingId ? 'Edit Recurring Item' : 'New Recurring Commitment'}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="rec-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Title
              </label>
              <input
                id="rec-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Apartment Rent, Netflix"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="rec-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Amount
              </label>
              <input
                id="rec-amount"
                type="number"
                step="any"
                min="1"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                placeholder="2500"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="rec-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                id="rec-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-600"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="rec-freq" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Frequency
                </label>
                <select
                  id="rec-freq"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-600"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="rec-day" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Due Day
                </label>
                <input
                  id="rec-day"
                  type="number"
                  min="1"
                  max="31"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:border-indigo-600 font-mono"
                  placeholder="Day 1"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Save Recurring Item'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of Recurring Expenses */}
      {recurringExpenses.length === 0 ? (
        <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
          No recurring expenses set up yet. Add rent, broadband, or bills above.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {recurringExpenses.map((item) => (
            <div
              key={item.id}
              className={`py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                !item.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleActive(item.id)}
                  title={item.isActive ? 'Pause recurring' : 'Activate recurring'}
                  aria-label={item.isActive ? `Pause recurring ${item.title}` : `Activate recurring ${item.title}`}
                  className={`mt-0.5 sm:mt-0 w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                    item.isActive
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'border-slate-300 dark:border-slate-600 hover:border-slate-400'
                  }`}
                >
                  {item.isActive && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>

                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                      ({item.frequency})
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <CategoryIcon category={item.category} className="w-3 h-3 text-slate-400" />
                      {item.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span>Due Day {item.billingDay} of month</span>
                  </div>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-7 sm:pl-0">
                <div className="font-mono tabular-nums font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {formatCurrency(item.amount, selectedCurrency)}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onLogExpenseNow(item)}
                    title="Log this expense into current month's expenses ledger now"
                    aria-label={`Log ${item.title} to ledger now`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-md transition-colors cursor-pointer min-h-[32px]"
                  >
                    <span>+ Log to Ledger</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Edit recurring item"
                    aria-label={`Edit recurring item ${item.title}`}
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRecurring(item.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
                    title="Delete recurring item"
                    aria-label={`Delete recurring item ${item.title}`}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
