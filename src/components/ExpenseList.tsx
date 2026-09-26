import React, { useState, useMemo } from 'react';
import { Expense, CategoryFilter, SortOption } from '../types';
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
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEditExpense,
  onRequestDelete,
  onResetSampleData,
  activeCategory,
  onSelectCategory,
}) => {
  // Real-time title search state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');

  // Filter expenses by category AND by title in real-time
  const filteredExpenses = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    return expenses
      .filter((exp) => {
        // 1. Existing Category Filter
        const matchesCategory = activeCategory === 'All' || exp.category === activeCategory;
        if (!matchesCategory) return false;

        // 2. Real-time Title Filter
        const matchesTitle = !trimmedQuery || exp.title.toLowerCase().includes(trimmedQuery);
        return matchesTitle;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt;
        }
        if (sortBy === 'date-asc') {
          return new Date(a.date).getTime() - new Date(b.date).getTime() || a.createdAt - b.createdAt;
        }
        if (sortBy === 'amount-desc') {
          return b.amount - a.amount;
        }
        if (sortBy === 'amount-asc') {
          return a.amount - b.amount;
        }
        if (sortBy === 'title-asc') {
          return a.title.localeCompare(b.title);
        }
        return 0;
      });
  }, [expenses, activeCategory, searchQuery, sortBy]);

  const filteredTotal = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const filterOptions: CategoryFilter[] = ['All', ...CATEGORIES];

  // Helper to highlight matching text in title in real-time
  const renderHighlightedTitle = (title: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return title;

    const regex = new RegExp(`(${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = title.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-amber-100 text-amber-950 font-semibold px-0.5 rounded-xs"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header and Filter Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/90 space-y-4">
        {/* Header summary and sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <span>Expenses</span>
              <span className="text-xs font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                {filteredExpenses.length} of {expenses.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filtered Total:{' '}
              <span className="font-mono tabular-nums font-semibold text-slate-900">
                {formatCurrency(filteredTotal)}
              </span>
            </p>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="sort-select" className="text-xs text-slate-500 font-medium">
              Sort:
            </label>
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 text-slate-700 outline-none focus:border-indigo-600 font-medium"
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
            <span className="absolute left-3.5 text-slate-400 pointer-events-none">
              <SearchIcon className="w-4 h-4" />
            </span>
            <input
              id="title-search-input"
              type="text"
              placeholder="Search expenses by title in real-time..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/70 hover:bg-white focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <div className="absolute right-2.5 flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
                  {filteredExpenses.length} found
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  title="Clear title search"
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
                  aria-label="Clear search input"
                >
                  <XIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Category Filter Buttons (Works alongside the Title Search Bar) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <FilterIcon className="w-3 h-3" /> Category:
          </span>
          {filterOptions.map((cat) => {
            // Count matching items within this category considering the real-time title search
            const trimmedQuery = searchQuery.trim().toLowerCase();
            const count = expenses.filter((e) => {
              const matchCat = cat === 'All' || e.category === cat;
              const matchTitle = !trimmedQuery || e.title.toLowerCase().includes(trimmedQuery);
              return matchCat && matchTitle;
            }).length;

            const isActive = activeCategory === cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {cat !== 'All' && <CategoryIcon category={cat} className="w-3 h-3" />}
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-sm ${
                    isActive ? 'bg-slate-800 text-slate-300' : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Filters Summary (If searching or non-All category) */}
        {(searchQuery.trim() || activeCategory !== 'All') && (
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
            <span className="text-slate-400">Active filters:</span>
            {activeCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                Category: {activeCategory}
                <button
                  type="button"
                  onClick={() => onSelectCategory('All')}
                  className="hover:text-indigo-900 cursor-pointer ml-0.5"
                  title="Remove category filter"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                Title: &ldquo;{searchQuery.trim()}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-amber-950 cursor-pointer ml-0.5"
                  title="Remove title search filter"
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
              className="text-[11px] text-slate-500 hover:text-slate-900 underline transition-colors cursor-pointer ml-auto"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Content: Table on Tablet/Desktop, Cards on Mobile */}
      {filteredExpenses.length === 0 ? (
        <div className="py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <SearchIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No matching expenses found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {expenses.length === 0
              ? 'You have not added any expenses yet. Use the form on the left to add your first expense.'
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
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
            )}

            {expenses.length === 0 && (
              <button
                type="button"
                onClick={onResetSampleData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcwIcon className="w-3 h-3" />
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
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th scope="col" className="py-3 px-4">
                    Expense Title
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Category
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Date
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Amount
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{renderHighlightedTitle(exp.title)}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {/* Zero-Pill discipline: unboxed metadata with category icon */}
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <CategoryIcon category={exp.category} className="w-3.5 h-3.5 text-slate-500" />
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => onEditExpense(exp)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                          title="Edit expense"
                          aria-label={`Edit ${exp.title}`}
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onRequestDelete(exp)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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

          {/* Mobile Card List View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredExpenses.map((exp) => (
              <div
                key={exp.id}
                className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {renderHighlightedTitle(exp.title)}
                  </div>
                  {/* Zero-Pill text metadata with separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <CategoryIcon category={exp.category} className="w-3 h-3 text-slate-500" />
                      {exp.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{formatDate(exp.date)}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-bold font-mono tabular-nums text-slate-900">
                    {formatCurrency(exp.amount)}
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => onEditExpense(exp)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                      aria-label={`Edit ${exp.title}`}
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRequestDelete(exp)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
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

      {/* Footer bar with summary count and export option */}
      <div className="py-3 px-4 sm:px-5 bg-slate-50/60 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing {filteredExpenses.length} of {expenses.length} items
        </span>
        <span className="font-mono tabular-nums">
          Subtotal: {formatCurrency(filteredTotal)}
        </span>
      </div>
    </div>
  );
};
