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
  const config = getCurrencyConfig(currencyCode);

  const formatted = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : config.decimals,
    maximumFractionDigits: config.decimals,
  }).format(amount);

  if (config.symbolPosition === 'suffix') {
    return `${formatted} ${config.symbol}`.trim();
  }
  return `${config.symbol}${formatted}`;
};

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
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
  const config = getCurrencyConfig(currencyCode);
  const headers = ['Title', `Amount (${config.code})`, 'Category', 'Date'];
  const rows = expenses.map((exp) => [
    `"${exp.title.replace(/"/g, '""')}"`,
    exp.amount.toFixed(config.decimals),
    `"${exp.category}"`,
    exp.date,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
  const config = getCurrencyConfig(currencyCode);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const variance = monthlyBudget - totalSpent;

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const lines: string[] = [
    'PERSONAL EXPENSE TRACKER - MONTHLY FINANCIAL REPORT',
    `Report Period,${monthLabel}`,
    `Generated Date,${new Date().toISOString().slice(0, 10)}`,
    `Currency,${config.code}`,
    `Monthly Budget Goal,${monthlyBudget}`,
    `Total Spent,${totalSpent}`,
    `Net Variance / Savings,${variance}`,
    `Transaction Count,${expenses.length}`,
    '',
    'CATEGORY BREAKDOWN',
    'Category,Total Amount,Share (%)',
  ];

  Object.entries(categoryTotals).forEach(([cat, amt]) => {
    const pct = totalSpent > 0 ? ((amt / totalSpent) * 100).toFixed(1) : '0.0';
    lines.push(`"${cat}",${amt.toFixed(config.decimals)},${pct}%`);
  });

  lines.push('');
  lines.push('ITEMIZED TRANSACTIONS');
  lines.push('Date,Title,Category,Amount');

  expenses.forEach((exp) => {
    lines.push(
      `"${exp.date}","${exp.title.replace(/"/g, '""')}","${exp.category}",${exp.amount.toFixed(config.decimals)}`
    );
  });

  const csvContent = lines.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const sanitizedMonth = monthLabel.toLowerCase().replace(/[^a-z0-9]/g, '-');
  link.setAttribute('download', `monthly-report-${sanitizedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

