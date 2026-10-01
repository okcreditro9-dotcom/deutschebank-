import React from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  Clock, 
  FileCheck, 
  Share2,
  Repeat,
  ArrowLeft
} from 'lucide-react';
import { Transaction } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction;
  onClose: () => void;
  onRepeatTransfer?: (recipient: string, iban: string, amount: number) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onRepeatTransfer,
  onShowToast,
}) => {
  const isPositive = transaction.amount > 0;

  const handleDownloadSlip = () => {
    onShowToast(
      'Buchungsbeleg heruntergeladen',
      `Bank_Beleg_${transaction.referenceId}.pdf wurde gespeichert.`,
      'success'
    );
  };

  const handleRepeat = () => {
    onClose();
    if (onRepeatTransfer) {
      onRepeatTransfer(
        transaction.recipientOrSender,
        transaction.iban,
        Math.abs(transaction.amount)
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Transaktionsdetails
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Elektronischer Buchungsbeleg
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Amount Hero */}
          <div className="text-center py-3">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
                isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isPositive ? <ArrowDownLeft className="w-7 h-7" /> : <ArrowUpRight className="w-7 h-7" />}
            </div>

            <div
              className={`text-3xl font-extrabold font-mono-numbers ${
                isPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {formatEuro(transaction.amount)}
            </div>

            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              {transaction.recipientOrSender}
            </p>

            <span className="inline-block mt-2 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full">
              Status: {transaction.status === 'gebucht' ? 'Erfolgreich gebucht' : 'Vorgemerkt / In Bearbeitung'}
            </span>
          </div>

          {/* Details Table */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Verwendungszweck:</span>
              <strong className="text-slate-900 dark:text-white text-right max-w-[240px]">
                {transaction.purpose}
              </strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Gegenpartei IBAN:</span>
              <span className="font-mono font-semibold text-slate-900 dark:text-white">
                {formatIban(transaction.iban)}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Kategorie:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {transaction.category}
              </span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Buchungstag:</span>
              <span className="text-slate-900 dark:text-white font-mono">{transaction.date}</span>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-200/60 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Wertstellung (Valuta):</span>
              <span className="text-slate-900 dark:text-white font-mono">{transaction.date}</span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400">Referenz-ID (End-to-End):</span>
              <span className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                {transaction.referenceId}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadSlip}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Beleg als PDF</span>
            </button>

            {!isPositive && onRepeatTransfer && (
              <button
                type="button"
                onClick={handleRepeat}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                <Repeat className="w-4 h-4" />
                <span>Erneut überweisen</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
