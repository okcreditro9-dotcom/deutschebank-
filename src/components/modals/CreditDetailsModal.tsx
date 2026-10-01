import React from 'react';
import { X, Download, Landmark, FileText, CheckCircle2, Calendar, ArrowLeft } from 'lucide-react';
import { CreditAccount } from '../../types/banking';
import { formatEuro } from '../../utils/formatters';

interface CreditDetailsModalProps {
  credit: CreditAccount;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreditDetailsModal: React.FC<CreditDetailsModalProps> = ({
  credit,
  onClose,
  onShowToast,
}) => {
  // Sample schedule for upcoming 5 rates
  const upcomingRates = [
    { nr: 23, date: '15.10.2026', rate: 345.50, interest: 39.80, repayment: 305.70, remaining: 12044.30 },
    { nr: 24, date: '15.11.2026', rate: 345.50, interest: 38.81, repayment: 306.69, remaining: 11737.61 },
    { nr: 25, date: '15.12.2026', rate: 345.50, interest: 37.82, repayment: 307.68, remaining: 11429.93 },
    { nr: 26, date: '15.01.2027', rate: 345.50, interest: 36.83, repayment: 308.67, remaining: 11121.26 },
    { nr: 27, date: '15.02.2027', rate: 345.50, interest: 35.83, repayment: 309.67, remaining: 10811.59 },
  ];

  const handleDownload = () => {
    onShowToast(
      'Tilgungsplan heruntergeladen',
      `Tilgungsplan_${credit.contractNumber}.pdf gespeichert.`,
      'success'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
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
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Kreditvertrag
                </span>
                <span className="text-xs font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                  {credit.contractNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {credit.title}
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
          {/* Key numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Kreditbetrag</span>
              <span className="text-sm font-bold font-mono-numbers text-slate-900 dark:text-white">
                {formatEuro(credit.requestedAmount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Aktuelle Restschuld</span>
              <span className="text-sm font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
                {formatEuro(credit.remainingAmount)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Effektivzins</span>
              <span className="text-sm font-bold font-mono-numbers text-slate-900 dark:text-white">
                {credit.interestRateEffective.toFixed(2)} %
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] text-slate-400 block">Monatsrate</span>
              <span className="text-sm font-bold font-mono-numbers text-slate-900 dark:text-white">
                {formatEuro(credit.monthlyRate)}
              </span>
            </div>
          </div>

          {/* Tilgungsplan Auszug */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Auszug Zins- und Tilgungsplan
              </h4>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Gesamten Plan laden (PDF)</span>
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 font-semibold">
                    <th className="p-3">Rate Nr.</th>
                    <th className="p-3">Fälligkeit</th>
                    <th className="p-3">Gesamtrate</th>
                    <th className="p-3">Zinsanteil</th>
                    <th className="p-3">Tilgungsanteil</th>
                    <th className="p-3">Restschuld</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono-numbers">
                  {upcomingRates.map((r) => (
                    <tr key={r.nr} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{r.nr}</td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 font-sans">{r.date}</td>
                      <td className="p-3 font-bold text-slate-900 dark:text-white">{formatEuro(r.rate)}</td>
                      <td className="p-3 text-slate-500">{formatEuro(r.interest)}</td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">{formatEuro(r.repayment)}</td>
                      <td className="p-3 font-semibold text-slate-900 dark:text-white">{formatEuro(r.remaining)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
};
