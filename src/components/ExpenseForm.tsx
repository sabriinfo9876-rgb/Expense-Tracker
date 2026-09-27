import React, { useState, useEffect } from 'react';
import { Expense, ExpenseCategory, FormErrors, CurrencyCode } from '../types';
import { CATEGORIES } from '../data/sampleExpenses';
import { getCurrencyConfig } from '../utils/formatters';
import { PlusIcon, CheckIcon, XIcon, CategoryIcon } from './Icons';

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
    { title: 'Lunch & Meals', amount: 650, category: 'Food' as ExpenseCategory },
    { title: 'Fuel & Transit', amount: 1500, category: 'Transport' as ExpenseCategory },
    { title: 'Grocery Run', amount: 2500, category: 'Food' as ExpenseCategory },
    { title: 'Utility / Mobile', amount: 800, category: 'Bills' as ExpenseCategory },
  ];

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory | ''>('Food');
  const [date, setDate] = useState(getTodayString());
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When editingExpense changes, synchronize form fields
  useEffect(() => {
    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date || getTodayString());
      setErrors({});
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
    setIsSubmitting(false);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    const trimmedTitle = title.trim();

    // 1. Title validation
    if (!trimmedTitle) {
      newErrors.title = 'Expense title is required.';
    } else if (trimmedTitle.length < 2) {
      newErrors.title = 'Title must be at least 2 characters.';
    } else if (trimmedTitle.length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters.';
    }

    // 2. Amount validation
    const trimmedAmount = amount.trim();
    const parsedAmount = Number(trimmedAmount);

    if (!trimmedAmount) {
      newErrors.amount = 'Amount is required.';
    } else if (isNaN(parsedAmount) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Amount must be a valid number greater than 0.';
    } else if (parsedAmount > 100000000) {
      newErrors.amount = 'Amount cannot exceed 100,000,000.';
    } else {
      const decimalSplit = trimmedAmount.split('.');
      if (decimalSplit.length > 2 || (decimalSplit[1] && decimalSplit[1].length > 2)) {
        newErrors.amount = 'Amount can have at most 2 decimal places.';
      }
    }

    // 3. Category validation
    if (!category || !CATEGORIES.includes(category as ExpenseCategory)) {
      newErrors.category = 'Please select a valid category.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const trimmedDate = (date || '').trim();
      const validDate = trimmedDate && !isNaN(new Date(trimmedDate).getTime()) ? trimmedDate : getTodayString();
      const cleanAmount = Math.round(Number(amount.trim()) * 100) / 100;
      const payload = {
        title: title.trim(),
        amount: cleanAmount,
        category: category as ExpenseCategory,
        date: validDate,
      };

      if (editingExpense) {
        onUpdateExpense(editingExpense.id, payload);
      } else {
        onAddExpense(payload);
        resetForm();
      }
    } finally {
      setTimeout(() => {
        setIsSubmitting(false);
      }, 300);
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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-xs w-full transition-colors">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {editingExpense ? 'Update transaction details' : 'Log an expense into your ledger'}
          </p>
        </div>
        {editingExpense && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 min-h-[36px]"
          >
            <XIcon className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>

      {/* Quick Add Presets with SVG Icons */}
      {!editingExpense && (
        <div className="mb-5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Quick Shortcuts
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Tap to fill</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
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
                className="p-2.5 text-left rounded-lg border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 bg-slate-50/70 dark:bg-slate-800/50 transition-all cursor-pointer group min-h-[46px] flex flex-col justify-center min-w-0"
              >
                <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5 min-w-0">
                  <CategoryIcon category={p.category} className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate">{p.title}</span>
                </div>
                <div className="text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 truncate mt-0.5">
                  {currencyConfig.symbol.trim() || currencyConfig.code} {p.amount.toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Title Input */}
        <div>
          <label htmlFor="expense-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Expense Title <span className="text-rose-500">*</span>
          </label>
          <input
            id="expense-title"
            type="text"
            maxLength={100}
            value={title}
            onChange={handleTitleChange}
            placeholder="e.g. Grocery shopping, Fuel, Internet bill"
            aria-invalid={errors.title ? 'true' : 'false'}
            className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors outline-none h-11 min-h-[44px] ${
              errors.title
                ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
            }`}
          />
          {errors.title && (
            <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1" role="alert">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 inline-block shrink-0" />
              {errors.title}
            </p>
          )}
        </div>

        {/* Amount & Category Row - Stacks on mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Amount Input */}
          <div>
            <label htmlFor="expense-amount" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Amount ({currencyConfig.code}) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-xs font-semibold font-mono pointer-events-none">
                {currencyConfig.symbol.trim() || currencyConfig.code}
              </span>
              <input
                id="expense-amount"
                type="number"
                step="any"
                min="0.01"
                max="100000000"
                value={amount}
                onChange={handleAmountChange}
                placeholder="2500"
                aria-invalid={errors.amount ? 'true' : 'false'}
                className={`w-full pl-11 pr-3.5 py-2.5 text-sm rounded-lg border font-mono tabular-nums transition-colors outline-none h-11 min-h-[44px] ${
                  errors.amount
                    ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
                }`}
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1" role="alert">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 inline-block shrink-0" />
                {errors.amount}
              </p>
            )}
          </div>

          {/* Category Select */}
          <div>
            <label htmlFor="expense-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="expense-category"
              value={category}
              onChange={handleCategoryChange}
              aria-invalid={errors.category ? 'true' : 'false'}
              className={`w-full px-3.5 py-2.5 text-sm rounded-lg border transition-colors outline-none h-11 min-h-[44px] ${
                errors.category
                  ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-950/20 text-slate-900 dark:text-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
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
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium flex items-center gap-1" role="alert">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 inline-block shrink-0" />
                {errors.category}
              </p>
            )}
          </div>
        </div>

        {/* Date Row */}
        <div>
          <label htmlFor="expense-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Transaction Date
          </label>
          <input
            id="expense-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 outline-none transition-colors h-11 min-h-[44px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center gap-2.5">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg shadow-xs transition-all focus:ring-2 focus:ring-indigo-500/30 focus:outline-none cursor-pointer h-11 min-h-[44px]"
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
              className="px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer h-11 min-h-[44px]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
