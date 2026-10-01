import React from 'react';
import { X, ShieldCheck, Landmark, Check, Copy, Percent, Info, Award, ArrowLeft } from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';

interface AccountDetailsModalProps {
  account: BankAccount;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AccountDetailsModal: React.FC<AccountDetailsModalProps> = ({
  account,
  onClose,
  onShowToast,
}) => {
  const copyIban = () => {
    navigator.clipboard?.writeText(account.iban.replace(/\s+/g, ''));
    onShowToast('IBAN kopiert', account.iban, 'success');
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Konto-Spezifikationen
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {account.accountType}
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Card: Einlagensicherung */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                Gesetzliche Einlagensicherung
              </h4>
              <p className="text-emerald-800 dark:text-emerald-300 mt-1">
                Guthaben bis zu <strong>100.000,00 € pro Kunde</strong> sind durch die gesetzliche Entschädigungseinrichtung deutscher Banken (EdB) vollständig geschützt.
              </p>
            </div>
          </div>

          {/* Konditionen Liste */}
          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Kontoführungsgebühr:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">0,00 € / Monat (Kostenlos)</strong>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">SEPA-Überweisungen:</span>
              <span className="text-slate-900 dark:text-white font-medium">Standard &amp; Instant unbegrenzt inklusive</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Guthabenzins Tagesgeld:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                {account.interestRateDeposit.toFixed(2)} % p.a.
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Dispositionskredit Rahmen:</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                {formatEuro(account.dispoLimit)}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Dispo-Zinssatz (effektiv):</span>
              <span className="text-slate-900 dark:text-white font-mono">9,25 % p.a.</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Bargeldabhebungen:</span>
              <span className="text-slate-900 dark:text-white">Weltweit 5x monatlich gebührenfrei</span>
            </div>

            <div className="flex justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Kontoeröffnung:</span>
              <span className="text-slate-900 dark:text-white">{account.openedDate}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={copyIban}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" />
            <span>IBAN in die Zwischenablage kopieren</span>
          </button>
        </div>
      </div>
    </div>
  );
};
