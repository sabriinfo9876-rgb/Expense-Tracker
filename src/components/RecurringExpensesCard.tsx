import React, { useState } from 'react';
import { ExpenseCategory, RecurringExpense, RecurringFrequency } from '../types';
import { CATEGORIES } from '../data/sampleExpenses';
import { formatCurrency, generateId } from '../utils/formatters';
import {
  RepeatIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  EditIcon,
  XIcon,
  CategoryIcon,
} from './Icons';

interface RecurringExpensesCardProps {
  recurringExpenses: RecurringExpense[];
  onAddRecurring: (item: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onUpdateRecurring: (id: string, item: Omit<RecurringExpense, 'id' | 'createdAt'>) => void;
  onDeleteRecurring: (id: string) => void;
  onToggleActive: (id: string) => void;
  onLogExpenseNow: (item: RecurringExpense) => void;
}

export const RecurringExpensesCard: React.FC<RecurringExpensesCardProps> = ({
  recurringExpenses,
  onAddRecurring,
  onUpdateRecurring,
  onDeleteRecurring,
  onToggleActive,
  onLogExpenseNow,
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
      if (r.frequency === 'Monthly') return sum + r.amount;
      if (r.frequency === 'Weekly') return sum + r.amount * 4.33;
      if (r.frequency === 'Yearly') return sum + r.amount / 12;
      return sum + r.amount;
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
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }
    const day = parseInt(billingDay, 10);
    if (isNaN(day) || day < 1 || day > 31) {
      setError('Billing day must be between 1 and 31.');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parsedAmount,
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
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs w-full overflow-hidden">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <RepeatIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                Recurring Expenses & Subscriptions
              </h2>
              <span className="text-[10px] sm:text-[11px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md">
                {recurringExpenses.filter((r) => r.isActive).length} Active
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Fixed commitments · Projected: {' '}
              <span className="font-mono font-bold text-slate-800">
                {formatCurrency(totalMonthlyCommitment)}/mo
              </span>
            </p>
          </div>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer self-start sm:self-auto min-h-[36px]"
          >
            <PlusIcon className="w-3.5 h-3.5" />
            <span>Add Recurring</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form Modal/Drawer */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="p-4 my-3 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <h3 className="text-xs font-semibold text-slate-800">
              {editingId ? 'Edit Recurring Expense' : 'Add New Recurring Expense'}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-600 p-0.5"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="rec-title" className="block text-xs font-medium text-slate-700 mb-1">
                Title / Subscription Name *
              </label>
              <input
                id="rec-title"
                type="text"
                placeholder="e.g. House Rent, PTCL Broadband, Gym"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-indigo-600"
              />
            </div>

            <div>
              <label htmlFor="rec-amount" className="block text-xs font-medium text-slate-700 mb-1">
                Amount (Rs) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono font-semibold">
                  Rs
                </span>
                <input
                  id="rec-amount"
                  type="number"
                  min="1"
                  step="any"
                  placeholder="e.g. 15000"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-mono outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="rec-category" className="block text-xs font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                id="rec-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-indigo-600"
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
                <label htmlFor="rec-freq" className="block text-xs font-medium text-slate-700 mb-1">
                  Frequency
                </label>
                <select
                  id="rec-freq"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-indigo-600"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="rec-day" className="block text-xs font-medium text-slate-700 mb-1">
                  Due Day
                </label>
                <input
                  id="rec-day"
                  type="number"
                  min="1"
                  max="31"
                  value={billingDay}
                  onChange={(e) => setBillingDay(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 bg-white outline-none focus:border-indigo-600 font-mono"
                  placeholder="Day 1"
                />
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-rose-600 font-medium">{error}</p>}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>{editingId ? 'Save Changes' : 'Save Recurring Expense'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List of Recurring Expenses */}
      {recurringExpenses.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No recurring expenses set up yet. Add rent, broadband, or bills above.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {recurringExpenses.map((item) => (
            <div
              key={item.id}
              className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors ${
                !item.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => onToggleActive(item.id)}
                  title={item.isActive ? 'Pause recurring' : 'Activate recurring'}
                  className={`mt-0.5 sm:mt-0 w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${
                    item.isActive
                      ? 'bg-emerald-500 border-emerald-600 text-white'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  {item.isActive && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                </button>

                <div>
                  <div className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({item.frequency})
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <CategoryIcon category={item.category} className="w-3 h-3 text-slate-400" />
                      {item.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Due Day {item.billingDay} of month</span>
                  </div>
                </div>
              </div>

              {/* Amount and Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-6 sm:pl-0">
                <div className="font-mono tabular-nums font-bold text-slate-900 text-sm">
                  {formatCurrency(item.amount)}
                </div>

                <div className="flex items-center gap-1">
                  {/* One-click Log to Expenses Button */}
                  <button
                    type="button"
                    onClick={() => onLogExpenseNow(item)}
                    title="Log this expense into current month's expenses ledger now"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors cursor-pointer"
                  >
                    <span>+ Log Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <EditIcon className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteRecurring(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Delete"
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
