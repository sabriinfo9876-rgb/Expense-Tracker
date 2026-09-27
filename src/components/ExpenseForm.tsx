import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, FormErrors, CurrencyCode } from '../types';
import { CATEGORIES } from '../data/sampleExpenses';
import { getCurrencyConfig } from '../utils/formatters';
import { PlusIcon, CheckIcon, XIcon } from './Icons';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onUpdateExpense: (id: string, updated: Omit<Expense, 'id' | 'createdAt'>) => void;
  editingExpense: Expense | null;
  onCancelEdit: () => void;
  selectedCurrency?: CurrencyCode;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({
  onAddExpense,
  onUpdateExpense,
  editingExpense,
  onCancelEdit,
  selectedCurrency = 'PKR',
}) => {
  const currencyConfig = getCurrencyConfig(selectedCurrency);
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const QUICK_ADD_PRESETS = [
    { title: 'Chai & Snacks', amount: 250, category: 'Food' as ExpenseCategory, icon: '☕' },
    { title: 'Lunch / Meal', amount: 650, category: 'Food' as ExpenseCategory, icon: '🍔' },
    { title: 'Fuel / Transit', amount: 1500, category: 'Transport' as ExpenseCategory, icon: '⛽' },
    { title: 'Grocery', amount: 2500, category: 'Food' as ExpenseCategory, icon: '🛒' },
    { title: 'Mobile Load', amount: 500, category: 'Bills' as ExpenseCategory, icon: '📱' },
    { title: 'Careem / Ride', amount: 450, category: 'Transport' as ExpenseCategory, icon: '🚕' },
  ];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('Food');
  const [date, setDate] = useState(getTodayString());
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  // When editingExpense changes, synchronize form fields
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date || getTodayString());
      setErrors({});
      setTouched({});
    } else {
      resetForm();
    }
  }, [editingExpense]);

  const resetForm = () => {
    setTitle('');
    setAmount('');
    setCategory('Food');
    setDate(getTodayString());
    setErrors({});
    setTouched({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. Title validation: cannot be empty
    if (!title.trim()) {
      newErrors.title = 'Expense title is required.';
    } else if (title.trim().length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    }

    // 2. Amount validation: must be a valid positive number
    const parsedAmount = parseFloat(amount);
    if (!amount.trim()) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than 0.';
    } else if (!/^\d+(\.\d{1,2})?$/.test(amount.trim())) {
      newErrors.amount = 'Amount can have at most 2 decimal places.';
    }

    // 3. Category validation: cannot be empty
    if (!category) {
      newErrors.category = 'Please select a category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ title: true, amount: true, category: true });

    if (!validate()) {
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parseFloat(parseFloat(amount).toFixed(2)),
      category: category as ExpenseCategory,
      date: date || getTodayString(),
    };

    if (editingExpense) {
      onUpdateExpense(editingExpense.id, payload);
    } else {
      onAddExpense(payload);
      resetForm();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) {
      setErrors((prev) => ({ ...prev, title: undefined }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
    if (errors.amount) {
      setErrors((prev) => ({ ...prev, amount: undefined }));
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value as ExpenseCategory);
    if (errors.category) {
      setErrors((prev) => ({ ...prev, category: undefined }));
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 sm:p-5 shadow-xs w-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div>
          <h2 className="text-sm sm:text-base font-semibold text-slate-900">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            {editingExpense ? 'Update the details for this transaction.' : 'Record your spending to keep budgets in check.'}
          </p>
        </div>
        {editingExpense && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-md hover:bg-slate-100 min-h-[36px]"
          >
            <XIcon className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Feature: Quick Add Buttons */}
      {!editingExpense && (
        <div className="mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 tracking-wider">
              ⚡ Quick Add Shortcuts
            </span>
            <span className="text-[10px] text-slate-400">Tap to fill</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {QUICK_ADD_PRESETS.map((p) => (
              <button
                key={p.title}
                type="button"
                onClick={() => {
                  setTitle(p.title);
                  setAmount(p.amount.toString());
                  setCategory(p.category);
                  setErrors({});
                }}
                className="p-2 text-left rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/60 bg-slate-50 transition-all cursor-pointer group min-h-[46px] flex flex-col justify-center min-w-0"
              >
                <div className="text-[11px] font-medium text-slate-800 truncate flex items-center gap-1 min-w-0">
                  <span className="shrink-0">{p.icon}</span>
                  <span className="truncate">{p.title}</span>
                </div>
                <div className="text-[10px] font-mono text-slate-500 font-semibold group-hover:text-indigo-600 truncate mt-0.5">
                  {currencyConfig.symbol.trim() || currencyConfig.code} {p.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="expense-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Expense Title <span className="text-red-500">*</span>
          </label>
          <input
            id="expense-title"
            type="text"
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Grocery shopping, Fuel, Bill"
            className={`w-full px-3 py-2.5 text-base sm:text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[44px] ${
              errors.title
                ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500'
                : 'border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-600'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1" role="alert">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Amount & Category Row - Stacks vertically on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Amount Input */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-700 mb-1">
              Amount ({currencyConfig.code}) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold font-mono pointer-events-none">
                {currencyConfig.symbol.trim() || currencyConfig.code}
              </span>
              <input
                id="expense-amount"
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={handleAmountChange}
                placeholder="e.g. 2500"
                className={`w-full pl-10 pr-3 py-2.5 text-base sm:text-sm rounded-lg border font-mono tabular-nums transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 min-h-[44px] ${
                  errors.amount
                    ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500'
                    : 'border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1" role="alert">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={handleCategoryChange}
              className={`w-full px-3 py-2.5 text-base sm:text-sm rounded-lg border transition-colors outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white min-h-[44px] ${
                errors.category
                  ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500'
                  : 'border-slate-200 hover:border-slate-300 focus:border-indigo-600'
              }`}
            >
              <option value="" disabled>
                Select category...
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1" role="alert">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-700 mb-1">
            Date
          </label>
          <input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2.5 text-base sm:text-sm rounded-lg border border-slate-200 bg-white hover:border-slate-300 focus:border-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 transition-colors min-h-[44px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg shadow-xs transition-colors focus:ring-2 focus:ring-indigo-500/30 focus:outline-none cursor-pointer min-h-[44px]"
          >
            {editingExpense ? (
              <>
                <CheckIcon className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            ) : (
              <>
                <PlusIcon className="w-4 h-4" />
                <span>Add Expense</span>
              </>
            )}
          </button>

          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-4 py-3 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
