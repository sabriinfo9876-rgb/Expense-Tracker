import { Expense, CurrencyCode, CurrencyFormat } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyFormat[] = [
  {
    code: 'PKR',
    symbol: 'Rs ',
    label: 'PKR - Pakistani Rupee (Rs)',
    locale: 'en-PK',
    decimals: 0,
    symbolPosition: 'prefix',
  },
  {
    code: 'USD',
    symbol: '$',
    label: 'USD - US Dollar ($)',
    locale: 'en-US',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'EUR',
    symbol: '€',
    label: 'EUR - Euro (€)',
    locale: 'de-DE',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'GBP',
    symbol: '£',
    label: 'GBP - British Pound (£)',
    locale: 'en-GB',
    decimals: 2,
    symbolPosition: 'prefix',
  },
  {
    code: 'AED',
    symbol: 'AED ',
    label: 'AED - UAE Dirham (د.إ)',
    locale: 'en-AE',
    decimals: 0,
    symbolPosition: 'prefix',
  },
  {
    code: 'SAR',
    symbol: 'SAR ',
    label: 'SAR - Saudi Riyal (﷼)',
    locale: 'ar-SA',
    decimals: 0,
    symbolPosition: 'prefix',
  },
  {
    code: 'INR',
    symbol: '₹',
    label: 'INR - Indian Rupee (₹)',
    locale: 'en-IN',
    decimals: 0,
    symbolPosition: 'prefix',
  },
];

const CURRENCY_STORAGE_KEY = 'personal_expense_currency_code_v1';

export const getCurrencyConfig = (code?: CurrencyCode): CurrencyFormat => {
  if (code) {
    const found = SUPPORTED_CURRENCIES.find((c) => c.code === code);
    if (found) return found;
  }
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
    if (stored) {
      const found = SUPPORTED_CURRENCIES.find((c) => c.code === stored);
      if (found) return found;
    }
  } catch {
    // ignore
  }
  return SUPPORTED_CURRENCIES[0]; // PKR by default
};

export const setStoredCurrency = (code: CurrencyCode): void => {
  try {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
  } catch (err) {
    console.error('Failed to save currency to localStorage:', err);
  }
};

export const formatCurrency = (amount: number, currencyCode?: CurrencyCode): string => {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || isNaN(amount)) {
    const config = getCurrencyConfig(currencyCode);
    return `${config.symbol}0`;
  }

  const config = getCurrencyConfig(currencyCode);
  const absAmount = Math.abs(amount);
  const isZero = absAmount < 1e-9;
  const isNegative = !isZero && amount < 0;

  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: Number.isInteger(absAmount) ? 0 : config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(isZero ? 0 : absAmount);

  const sign = isNegative ? '-' : '';

  if (config.symbolPosition === 'suffix') {
    return `${sign}${formatted} ${config.symbol}`.trim();
  }
  return `${sign}${config.symbol}${formatted}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr || typeof dateStr !== 'string') return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day || isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;
    const date = new Date(year, month - 1, day);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const generateId = (): string => {
  return 'exp-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 7);
};

export const exportToCSV = (expenses: Expense[], currencyCode?: CurrencyCode): void => {
  if (!expenses || expenses.length === 0) return;
  const config = getCurrencyConfig(currencyCode);
  const headers = ['Title', `Amount (${config.code})`, 'Category', 'Date'];
  const rows = expenses.map((exp) => [
    `"${(exp.title || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}"`,
    typeof exp.amount === 'number' && Number.isFinite(exp.amount) ? exp.amount.toFixed(config.decimals) : '0',
    `"${(exp.category || '').replace(/"/g, '""')}"`,
    `"${(exp.date || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `expenses-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMonthlyCSVReport = (
  expenses: Expense[],
  monthLabel: string,
  monthlyBudget: number,
  currencyCode?: CurrencyCode
): void => {
  if (!expenses || expenses.length === 0) return;
  const config = getCurrencyConfig(currencyCode);
  const totalSpent = expenses.reduce((sum, e) => sum + (Number.isFinite(e.amount) ? e.amount : 0), 0);
  const variance = Math.round((monthlyBudget - totalSpent) * 100) / 100;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    if (e.category && Number.isFinite(e.amount)) {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    }
  });

  const lines: string[] = [
    'PERSONAL EXPENSE TRACKER - MONTHLY FINANCIAL REPORT',
    `Report Period,"${(monthLabel || '').replace(/"/g, '""')}"`,
    `Generated Date,${new Date().toISOString().slice(0, 10)}`,
    `Currency,${config.code}`,
    `Monthly Budget Goal,${Number.isFinite(monthlyBudget) ? monthlyBudget.toFixed(config.decimals) : '0'}`,
    `Total Spent,${totalSpent.toFixed(config.decimals)}`,
    `Net Variance / Savings,${variance.toFixed(config.decimals)}`,
    `Transaction Count,${expenses.length}`,
    '',
    'CATEGORY BREAKDOWN',
    'Category,Total Amount,Share (%)',
  ];

  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : '0.0';
    lines.push(`"${cat.replace(/"/g, '""')}",${amt.toFixed(config.decimals)},${pct}%`);
  });

  lines.push('');
  lines.push('ITEMIZED TRANSACTIONS');
  lines.push('Date,Title,Category,Amount');

  expenses.forEach((exp) => {
    const amt = Number.isFinite(exp.amount) ? exp.amount.toFixed(config.decimals) : '0';
    lines.push(
      `"${(exp.date || '').replace(/"/g, '""')}","${(exp.title || '').replace(/"/g, '""').replace(/[\r\n]+/g, ' ')}","${(exp.category || '').replace(/"/g, '""')}",${amt}`
    );
  });

  const csvContent = '\uFEFF' + lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedMonth = (monthLabel || 'month').toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.setAttribute('download', `monthly-report-${sanitizedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
