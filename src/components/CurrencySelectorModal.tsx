import React from 'react';
import { CurrencyCode, CurrencyFormat } from '../types';
import { SUPPORTED_CURRENCIES, formatCurrency } from '../utils/formatters';
import { XIcon, CheckIcon } from './Icons';

interface CurrencySelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCurrency: CurrencyCode;
  onSelectCurrency: (code: CurrencyCode) => void;
}

export const CurrencySelectorModal: React.FC<CurrencySelectorModalProps> = ({
  isOpen,
  onClose,
  selectedCurrency,
  onSelectCurrency,
}) => {
  if (!isOpen) return null;

  const sampleAmount = 75450;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="currency-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-5 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">
          <div className="min-w-0 pr-2">
            <h3 id="currency-modal-title" className="text-xs sm:text-sm font-bold text-slate-900 truncate">
              Currency Formatter & Settings
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 truncate">
              Select your preferred display currency and symbol
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
            aria-label="Close currency modal"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Currency List */}
        <div className="p-3 sm:p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {SUPPORTED_CURRENCIES.map((curr) => {
            const isSelected = selectedCurrency === curr.code;
            const previewText = formatCurrency(sampleAmount, curr.code);

            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => {
                  onSelectCurrency(curr.code);
                  onClose();
                }}
                className={`w-full p-2.5 sm:p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer min-h-[44px] ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {curr.symbol.trim() || curr.code}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {curr.label}
                    </div>
                    <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                      Preview: <span className="font-semibold text-slate-700">{previewText}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 ml-2">
                    <CheckIcon className="w-3 h-3" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3.5 sm:px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] sm:text-xs text-slate-500">
          <span className="truncate pr-2">Updates all charts & tables</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer min-h-[36px] shrink-0"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
