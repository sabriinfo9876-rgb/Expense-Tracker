import React, { useState, useMemo } from 'react';
import { Expense, CategoryFilter, SortOption, CurrencyCode } from '../types';
import { CATEGORIES } from '../data/sampleExpenses';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  EditIcon,
  TrashIcon,
  SearchIcon,
  FilterIcon,
  CategoryIcon,
  RotateCcwIcon,
  XIcon,
} from './Icons';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onRequestDelete: (expense: Expense) => void;
  onResetSampleData: () => void;
  activeCategory: CategoryFilter;
  onSelectCategory: (category: CategoryFilter) => void;
  selectedCurrency?: CurrencyCode;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEditExpense,
  onRequestDelete,
  onResetSampleData,
  activeCategory,
  onSelectCategory,
  selectedCurrency,
}) => {
  // Real-time title search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filter expenses by category AND by title in real-time with guarded sorting
  const filteredExpenses = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return expenses
      .filter((exp) => {
        if (!exp) return false;
        // 1. Category Filter
        const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
        if (!matchesCategory) return false;

        // 2. Real-time Title Filter
        const titleStr = typeof exp.title === 'string' ? exp.title.toLowerCase() : '';
        const matchesTitle = !trimmedQuery || titleStr.includes(trimmedQuery);
        return matchesTitle;
      })
      .sort((a, b) => {
        const aCreated = a.createdAt || 0;
        const bCreated = b.createdAt || 0;
        const aAmt = typeof a.amount === 'number' && Number.isFinite(a.amount) ? a.amount : 0;
        const bAmt = typeof b.amount === 'number' && Number.isFinite(b.amount) ? b.amount : 0;

        if (sortBy === 'date-desc') {
          const dateDiff = (b.date || '').localeCompare(a.date || '');
          return dateDiff !== 0 ? dateDiff : bCreated - aCreated;
        }
        if (sortBy === 'date-asc') {
          const dateDiff = (a.date || '').localeCompare(b.date || '');
          return dateDiff !== 0 ? dateDiff : aCreated - bCreated;
        }
        if (sortBy === 'amount-desc') {
          return bAmt - aAmt;
        }
        if (sortBy === 'amount-asc') {
          return aAmt - bAmt;
        }
        if (sortBy === 'title-asc') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [expenses, activeCategory, searchQuery, sortBy]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
  const filterOptions: CategoryFilter[] = ['All', ...CATEGORIES];

  // Helper to highlight matching text in title in real-time safely
  const renderHighlightedTitle = (title: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed || !title) return title || '';

    try {
      const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = title.split(regex);

      return parts.map((part, index) =>
        regex.test(part) ? (
          <mark
            key={index}
            className="bg-amber-100 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 font-semibold px-0.5 rounded-xs"
          >
            {part}
          </mark>
        ) : (
          part
        )
      );
    } catch {
      return title;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-colors w-full">
      {/* Header and Filter Controls */}
      <div className="p-4 sm:p-6 border-b border-slate-200/90 dark:border-slate-800 space-y-4">
        {/* Header summary and sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Expenses Ledger
              </h2>
              <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {filteredExpenses.length} of {expenses.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Filtered Total:{' '}
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {formatCurrency(filteredTotal, selectedCurrency)}
              </span>
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="sort-select" className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 outline-none focus:border-indigo-600 dark:focus:border-indigo-500 font-medium cursor-pointer"
            >
              <option value="date-desc">Newest Date First</option>
              <option value="date-asc">Oldest Date First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </div>
        </div>

        {/* Real-time Title Search Input Bar */}
        <div className="relative">
          <label htmlFor="title-search-input" className="sr-only">
            Filter expenses by title in real-time
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              id="title-search-input"
              type="text"
              placeholder="Search expenses by title in real-time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-600 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 min-h-[44px]"
            />
            {searchQuery && (
              <div className="absolute right-2.5 flex items-center gap-1.5">
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500 hidden sm:inline">
                  {filteredExpenses.length} found
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear title search"
                  className="p-1.5 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Clear search input"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar -mx-1 px-1">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <FilterIcon className="w-3.5 h-3.5" /> Category:
          </span>
          {filterOptions.map((cat) => {
            const trimmedQuery = searchQuery.trim().toLowerCase();
            const count = expenses.filter((e) => {
              if (!e) return false;
              const matchCat = cat === 'All' || e.category === cat;
              const titleStr = typeof e.title === 'string' ? e.title.toLowerCase() : '';
              const matchTitle = !trimmedQuery || titleStr.includes(trimmedQuery);
              return matchCat && matchTitle;
            }).length;

            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer min-h-[38px] ${
                  isActive
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {cat !== 'All' && <CategoryIcon category={cat} className="w-3.5 h-3.5" />}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                    isActive ? 'bg-slate-800 dark:bg-indigo-700 text-slate-300' : 'bg-slate-200/70 dark:bg-slate-700/80 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary */}
        {(searchQuery.trim() || activeCategory !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 dark:text-slate-500">Active filters:</span>
            {activeCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 px-2 py-0.5 rounded-md text-xs font-medium">
                Category: {activeCategory}
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-indigo-950 dark:hover:text-white cursor-pointer ml-1"
                  title="Remove category filter"
                  aria-label="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2 py-0.5 rounded-md text-xs font-medium">
                Title: &ldquo;{searchQuery.trim()}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-amber-950 dark:hover:text-white cursor-pointer ml-1"
                  title="Remove title search filter"
                  aria-label="Remove title search filter"
                >
                  ×
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                onSelectCategory('All');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline transition-colors cursor-pointer ml-auto"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table on Tablet/Desktop, Cards on Mobile */}
      {filteredExpenses.length === 0 ? (
        <div className="py-14 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center mb-3">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">No matching expenses found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
            {expenses.length === 0
              ? 'You have not added any expenses yet. Use the form to record your first transaction.'
              : searchQuery.trim() && activeCategory !== 'All'
              ? `No expenses found with title "${searchQuery}" in category "${activeCategory}".`
              : searchQuery.trim()
              ? `No expense titles match "${searchQuery}".`
              : `No expenses found in category "${activeCategory}".`}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {(activeCategory !== 'All' || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('All');
                  setSearchQuery('');
                }}
                className="px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer min-h-[38px]"
              >
                Clear Filters
              </button>
            )}

            {expenses.length === 0 && (
              <button
                type="button"
                onClick={onResetSampleData}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-lg transition-colors cursor-pointer min-h-[38px]"
              >
                <RotateCcwIcon className="w-3.5 h-3.5" />
                Load Sample Expenses
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-5">
                    Expense Title
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Category
                  </th>
                  <th scope="col" className="py-3.5 px-4">
                    Date
                  </th>
                  <th scope="col" className="py-3.5 px-5 text-right">
                    Amount
                  </th>
                  <th scope="col" className="py-3.5 px-5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">
                      <span>{renderHighlightedTitle(exp.title)}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
                        <CategoryIcon category={exp.category} className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-mono">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-4 px-5 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white text-base">
                      {formatCurrency(exp.amount, selectedCurrency)}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => onEditExpense(exp)}
                          className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Edit expense"
                          aria-label={`Edit ${exp.title}`}
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(exp)}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete expense"
                          aria-label={`Delete ${exp.title}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View with comfortable touch hitboxes */}
          <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {renderHighlightedTitle(exp.title)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 shrink-0">
                      <CategoryIcon category={exp.category} className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      {exp.category}
                    </span>
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="font-mono text-slate-400 dark:text-slate-500 shrink-0">{formatDate(exp.date)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {formatCurrency(exp.amount, selectedCurrency)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1.5">
                    <button
                      type="button"
                      onClick={() => onEditExpense(exp)}
                      className="p-2.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                      aria-label={`Edit ${exp.title}`}
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(exp)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer min-h-[42px] min-w-[42px] flex items-center justify-center"
                      aria-label={`Delete ${exp.title}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer bar with summary count */}
      <div className="py-3.5 px-4 sm:px-6 bg-slate-50/70 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <span>
          Showing {filteredExpenses.length} of {expenses.length} transactions
        </span>
        <span className="font-mono tabular-nums font-semibold text-slate-800 dark:text-slate-200">
          Subtotal: {formatCurrency(filteredTotal, selectedCurrency)}
        </span>
      </div>
    </div>
  );
};
