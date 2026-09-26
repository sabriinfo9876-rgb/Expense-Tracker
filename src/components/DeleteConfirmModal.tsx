import React from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../utils/formatters';
import { TrashIcon, XIcon } from './Icons';

interface DeleteConfirmModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  expense,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !expense) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
              <TrashIcon className="w-4 h-4" />
            </div>
            <h3 id="delete-dialog-title" className="text-base font-semibold text-slate-900">
              Delete Expense
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 rounded-md p-1 transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this expense? This action cannot be undone.
          </p>
          <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="text-sm font-semibold text-slate-900">{expense.title}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <span>{expense.category}</span>
              <span>·</span>
              <span className="font-mono tabular-nums font-semibold text-slate-800">
                {formatCurrency(expense.amount)}
              </span>
              <span>·</span>
              <span>{expense.date}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
