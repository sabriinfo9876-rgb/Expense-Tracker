import React, { useEffect } from 'react';
import { Expense, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrashIcon, XIcon } from './Icons';

interface DeleteConfirmModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  selectedCurrency?: CurrencyCode;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  expense,
  isOpen,
  onConfirm,
  onCancel,
  selectedCurrency,
}) => {
  // Keyboard Escape listener
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen || !expense) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
              <TrashIcon className="w-4 h-4" />
            </div>
            <h3 id="delete-dialog-title" className="text-base font-bold text-slate-900 dark:text-white">
              Delete Expense
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1.5 transition-colors cursor-pointer min-h-[32px] min-w-[32px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Are you sure you want to delete this expense record? This action will remove it from your ledger and calculations.
          </p>
          <div className="mt-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-sm font-bold text-slate-900 dark:text-white">{expense.title}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2 flex-wrap">
              <span className="font-medium text-slate-700 dark:text-slate-300">{expense.category}</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                {formatCurrency(expense.amount, selectedCurrency)}
              </span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-600">·</span>
              <span className="font-mono">{expense.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer min-h-[40px]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer min-h-[40px]"
          >
            Delete Expense
          </button>
        </div>
      </div>
    </div>
  );
};
