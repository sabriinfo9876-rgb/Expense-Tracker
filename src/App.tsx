import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, CategoryFilter, RecurringExpense, CurrencyCode } from './types';
import { SAMPLE_EXPENSES, SAMPLE_RECURRING_EXPENSES } from './data/sampleExpenses';
import { exportToCSV, exportMonthlyCSVReport, generateId, getCurrencyConfig, setStoredCurrency, formatCurrency } from './utils/formatters';
import { Navbar } from './components/Navbar';
import { MonthlyViewBar } from './components/MonthlyViewBar';
import { SummaryCards } from './components/SummaryCards';
import { BudgetGoalCard } from './components/BudgetGoalCard';
import { SpendingTrendsChart } from './components/SpendingTrendsChart';
import { RecurringExpensesCard } from './components/RecurringExpensesCard';
import { CategoryDistributionCard } from './components/CategoryDistributionCard';
import { MonthlyBudgetTrendCard } from './components/MonthlyBudgetTrendCard';
import { BudgetAlertsBanner } from './components/BudgetAlertsBanner';
import { ExportPdfModal } from './components/ExportPdfModal';
import { CurrencySelectorModal } from './components/CurrencySelectorModal';
import { ExpenseForm } from './components/ExpenseForm';
import { ExpenseList } from './components/ExpenseList';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { CheckIcon, RepeatIcon, ReceiptIcon } from './components/Icons';

const LOCAL_STORAGE_KEY = 'personal_expense_tracker_data_pkr_v2';
const BUDGET_STORAGE_KEY = 'personal_budget_goal_pkr_v2';
const BUDGET_ENABLED_STORAGE_KEY = 'personal_budget_goal_enabled_v1';
const RECURRING_STORAGE_KEY = 'personal_recurring_expenses_pkr_v2';
const DEFAULT_MONTHLY_BUDGET = 75000;

export default function App() {
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getCurrentMonthString = () => getTodayString().slice(0, 7);

  // 1. All Expenses state
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const hasTinyAmounts = parsed.some((e: Expense) => e.amount < 300);
          if (!hasTinyAmounts) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.error('Failed to parse expenses from localStorage:', err);
    }
    return SAMPLE_EXPENSES;
  });

  // 2. Monthly Budget Goal state
  const [monthlyBudget, setMonthlyBudget] = useState<number>(() => {
    try {
      const stored = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (stored) {
        const val = parseFloat(stored);
        if (!isNaN(val) && val > 0) {
          return val;
        }
      }
    } catch (err) {
      console.error('Failed to parse budget goal from localStorage:', err);
    }
    return DEFAULT_MONTHLY_BUDGET;
  });

  // 2b. Feature: Budget Goal Toggle state
  const [isBudgetGoalEnabled, setIsBudgetGoalEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(BUDGET_ENABLED_STORAGE_KEY);
      if (stored !== null) {
        return stored === 'true';
      }
    } catch (err) {
      console.error('Failed to parse budget enabled state:', err);
    }
    return true; // Enabled by default
  });

  // 3. Feature: Currency Formatter state
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    return getCurrencyConfig().code;
  });
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);

  // 4. Recurring Expenses state
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    try {
      const stored = localStorage.getItem(RECURRING_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error('Failed to parse recurring expenses from localStorage:', err);
    }
    return SAMPLE_RECURRING_EXPENSES;
  });

  // 5. Monthly View state
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'recurring'>('dashboard');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync expenses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error('Failed to save expenses to localStorage:', err);
    }
  }, [expenses]);

  // Sync budget goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, monthlyBudget.toString());
    } catch (err) {
      console.error('Failed to save budget goal to localStorage:', err);
    }
  }, [monthlyBudget]);

  // Sync budget goal enabled state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_ENABLED_STORAGE_KEY, isBudgetGoalEnabled.toString());
    } catch (err) {
      console.error('Failed to save budget goal toggle to localStorage:', err);
    }
  }, [isBudgetGoalEnabled]);

  // Sync recurring expenses to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(RECURRING_STORAGE_KEY, JSON.stringify(recurringExpenses));
    } catch (err) {
      console.error('Failed to save recurring expenses to localStorage:', err);
    }
  }, [recurringExpenses]);

  // Toast notification helper
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
    return () => clearTimeout(timer);
  }, []);

  // Handle currency change
  const handleSelectCurrency = (code: CurrencyCode) => {
    setSelectedCurrency(code);
    setStoredCurrency(code);
    showToast(`Currency format updated to ${code}!`);
  };

  // Filter expenses by selected month
  const displayedExpenses = useMemo(() => {
    if (selectedMonth === 'all') {
      return expenses;
    }
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Calculate current month's spent for budget alerts
  const currentMonthSpent = useMemo(() => {
    const targetKey = selectedMonth === 'all' ? getCurrentMonthString() : selectedMonth;
    return expenses
      .filter((e) => e.date && e.date.startsWith(targetKey))
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, selectedMonth]);

  // Add Expense handler
  const handleAddExpense = (newExpenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: generateId(),
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);

    const newMonth = newExpense.date.slice(0, 7);
    if (selectedMonth !== 'all' && selectedMonth !== newMonth) {
      setSelectedMonth(newMonth);
    }

    // Budget alert on addition if budget goal is enabled
    if (isBudgetGoalEnabled) {
      const targetMonthKey = newMonth;
      const existingMonthTotal = expenses
        .filter((e) => e.date && e.date.startsWith(targetMonthKey))
        .reduce((sum, e) => sum + e.amount, 0);
      const newMonthTotal = existingMonthTotal + newExpense.amount;

      if (newMonthTotal > monthlyBudget) {
        showToast(`🚨 Budget Alert: Exceeded your ${formatCurrency(monthlyBudget, selectedCurrency)} budget!`);
      } else if (newMonthTotal >= 0.8 * monthlyBudget) {
        showToast(`⚠️ Caution: Reached ${((newMonthTotal / monthlyBudget) * 100).toFixed(0)}% of monthly budget.`);
      } else {
        showToast(`Added "${newExpense.title}" successfully!`);
      }
    } else {
      showToast(`Added "${newExpense.title}" successfully!`);
    }
  };

  // Update Expense handler
  const handleUpdateExpense = (id: string, updatedData: Omit<Expense, 'id' | 'createdAt'>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedData } : item))
    );
    setEditingExpense(null);
    showToast(`Updated "${updatedData.title}" successfully!`);
  };

  // Delete Expense handler
  const handleConfirmDelete = () => {
    if (!expenseToDelete) return;
    const deletedTitle = expenseToDelete.title;
    setExpenses((prev) => prev.filter((item) => item.id !== expenseToDelete.id));

    if (editingExpense?.id === expenseToDelete.id) {
      setEditingExpense(null);
    }

    setExpenseToDelete(null);
    showToast(`Deleted "${deletedTitle}".`);
  };

  // Budget Goal Update handler
  const handleUpdateBudget = (newBudget: number) => {
    setMonthlyBudget(newBudget);
    showToast(`Monthly budget goal updated to ${formatCurrency(newBudget, selectedCurrency)}!`);
  };

  // Recurring Expenses Handlers
  const handleAddRecurring = (item: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    const newRec: RecurringExpense = {
      ...item,
      id: generateId(),
      createdAt: Date.now(),
    };
    setRecurringExpenses((prev) => [newRec, ...prev]);
    showToast(`Added recurring expense "${newRec.title}"!`);
  };

  const handleUpdateRecurring = (id: string, item: Omit<RecurringExpense, 'id' | 'createdAt'>) => {
    setRecurringExpenses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...item } : r))
    );
    showToast('Updated recurring expense successfully.');
  };

  const handleDeleteRecurring = (id: string) => {
    const target = recurringExpenses.find((r) => r.id === id);
    setRecurringExpenses((prev) => prev.filter((r) => r.id !== id));
    showToast(`Removed "${target?.title || 'recurring item'}".`);
  };

  const handleToggleRecurringActive = (id: string) => {
    setRecurringExpenses((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  // One-click Log Recurring Expense to Ledger
  const handleLogRecurringNow = (item: RecurringExpense) => {
    const today = getTodayString();
    const newExpense: Expense = {
      id: generateId(),
      title: `${item.title} (${item.frequency})`,
      amount: item.amount,
      category: item.category,
      date: today,
      createdAt: Date.now(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
    setSelectedMonth(today.slice(0, 7));
    setActiveMainTab('dashboard');
    showToast(`Logged ${formatCurrency(item.amount, selectedCurrency)} for "${item.title}" into expenses!`);
  };

  // Reset to default sample data
  const handleResetSampleData = () => {
    setExpenses(SAMPLE_EXPENSES);
    setRecurringExpenses(SAMPLE_RECURRING_EXPENSES);
    setMonthlyBudget(DEFAULT_MONTHLY_BUDGET);
    setIsBudgetGoalEnabled(true);
    setSelectedMonth(getCurrentMonthString());
    setEditingExpense(null);
    setActiveCategory('All');
    showToast('Reset to default sample expenses & recurring items.');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (displayedExpenses.length === 0) return;
    exportToCSV(displayedExpenses, selectedCurrency);
    showToast('Exported expenses to CSV.');
  };

  // Export Monthly CSV Report
  const handleExportMonthlyCSV = () => {
    if (displayedExpenses.length === 0) return;
    const monthLabel = selectedMonth === 'all' ? 'All Months (Lifetime)' : selectedMonth;
    exportMonthlyCSVReport(displayedExpenses, monthLabel, monthlyBudget, selectedCurrency);
    showToast(`Exported monthly CSV report for ${monthLabel}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Bar Navigation */}
      <Navbar
        onExportCSV={handleExportCSV}
        onExportPDF={() => setIsPdfModalOpen(true)}
        onResetData={handleResetSampleData}
        hasExpenses={displayedExpenses.length > 0}
        selectedCurrency={selectedCurrency}
        onOpenCurrencySelector={() => setIsCurrencyModalOpen(true)}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200 no-print">
          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center font-bold">
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Tabs for Dashboard vs Recurring Subscriptions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 no-print">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveMainTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMainTab === 'dashboard'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ReceiptIcon className="w-3.5 h-3.5" />
              <span>Expenses & Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('recurring')}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeMainTab === 'recurring'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <RepeatIcon className="w-3.5 h-3.5" />
              <span>Recurring Expenses</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-indigo-100 text-indigo-700">
                {recurringExpenses.filter((r) => r.isActive).length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium underline cursor-pointer"
            >
              Format: {selectedCurrency}
            </button>
            <span>·</span>
            <span>{expenses.length} records</span>
          </div>
        </div>

        {/* Feature 1: Monthly View Navigator */}
        <section aria-label="Monthly View Selector" className="no-print">
          <MonthlyViewBar
            expenses={expenses}
            selectedMonth={selectedMonth}
            onSelectMonth={setSelectedMonth}
            onExportMonthlyCSV={handleExportMonthlyCSV}
          />
        </section>

        {activeMainTab === 'recurring' ? (
          /* Recurring Expenses Manager View */
          <section aria-label="Recurring Expenses Management" className="no-print">
            <RecurringExpensesCard
              recurringExpenses={recurringExpenses}
              onAddRecurring={handleAddRecurring}
              onUpdateRecurring={handleUpdateRecurring}
              onDeleteRecurring={handleDeleteRecurring}
              onToggleActive={handleToggleRecurringActive}
              onLogExpenseNow={handleLogRecurringNow}
            />
          </section>
        ) : (
          /* Main Dashboard View: Scoped to Selected Month */
          <>
            {/* Feature: Budget Alerts Banner (only shown if Budget Goal is enabled) */}
            {isBudgetGoalEnabled && (
              <section aria-label="Budget Alerts Notification" className="no-print">
                <BudgetAlertsBanner
                  totalSpent={currentMonthSpent}
                  monthlyBudget={monthlyBudget}
                  selectedMonth={selectedMonth}
                  onOpenEditBudget={() => {
                    setActiveMainTab('dashboard');
                  }}
                />
              </section>
            )}

            {/* Visual Summary Cards */}
            <section aria-label="Financial Summary" className="no-print">
              <SummaryCards expenses={displayedExpenses} />
            </section>

            {/* Monthly Budget Goal (with Toggle) + Spending Trends Chart */}
            <section aria-label="Budget and Analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
              {/* Feature: Monthly Budget Goal with ON/OFF Toggle */}
              <div className="lg:col-span-5">
                <BudgetGoalCard
                  expenses={displayedExpenses}
                  monthlyBudget={monthlyBudget}
                  isBudgetGoalEnabled={isBudgetGoalEnabled}
                  onToggleBudgetGoal={() => setIsBudgetGoalEnabled(!isBudgetGoalEnabled)}
                  onUpdateBudget={handleUpdateBudget}
                />
              </div>

              {/* Spending Trends Chart Feature */}
              <div className="lg:col-span-7">
                <SpendingTrendsChart expenses={displayedExpenses} />
              </div>
            </section>

            {/* Category Distribution + Monthly Budget Trend */}
            <section aria-label="Category Distribution and Budget Trend" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
              {/* Category Distribution with interactive SVG donut and quick filtering */}
              <div className="lg:col-span-6">
                <CategoryDistributionCard
                  expenses={displayedExpenses}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                />
              </div>

              {/* Monthly Budget Trend showing multi-month budget vs actuals */}
              <div className="lg:col-span-6">
                <MonthlyBudgetTrendCard
                  expenses={expenses}
                  monthlyBudget={monthlyBudget}
                />
              </div>
            </section>

            {/* 2-Column Responsive Layout: Add/Edit Form & Transactions List */}
            {/* OVERLAP FIX: lg:sticky lg:top-24 so it never sticks or overlaps in 1-column mobile/tablet view! */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Expense Form (Add / Edit) */}
              <section className="lg:col-span-4 lg:sticky lg:top-24 self-start bg-transparent z-10" aria-label="Expense Form">
                <ExpenseForm
                  onAddExpense={handleAddExpense}
                  onUpdateExpense={handleUpdateExpense}
                  editingExpense={editingExpense}
                  onCancelEdit={() => setEditingExpense(null)}
                  selectedCurrency={selectedCurrency}
                />
              </section>

              {/* Right Column: Expense Table / List with Real-time Title Search & Category Filter */}
              <section className="lg:col-span-8" aria-label="Transactions List">
                <ExpenseList
                  expenses={displayedExpenses}
                  onEditExpense={(exp) => {
                    setEditingExpense(exp);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onRequestDelete={(exp) => setExpenseToDelete(exp)}
                  onResetSampleData={handleResetSampleData}
                  activeCategory={activeCategory}
                  onSelectCategory={setActiveCategory}
                />
              </section>
            </div>
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        expense={expenseToDelete}
        isOpen={expenseToDelete !== null}
        onConfirm={handleConfirmDelete}
        onCancel={() => setExpenseToDelete(null)}
      />

      {/* Feature: PDF Export Statement Modal */}
      <ExportPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        expenses={displayedExpenses}
        monthlyBudget={monthlyBudget}
        selectedMonth={selectedMonth}
      />

      {/* Feature: Currency Formatter Selector Modal */}
      <CurrencySelectorModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        selectedCurrency={selectedCurrency}
        onSelectCurrency={handleSelectCurrency}
      />

      {/* Clean Unboxed Footer with Built With REMOVED */}
      <footer className="border-t border-slate-200 bg-white py-5 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Personal Expense Tracker</span>
            <span aria-hidden="true">·</span>
            <span>All records stored locally in browser ({selectedCurrency})</span>
          </div>
          <div>
            <button
              type="button"
              onClick={() => setIsCurrencyModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors cursor-pointer"
            >
              Change Currency Formatter ({selectedCurrency})
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
