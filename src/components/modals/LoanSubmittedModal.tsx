import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Landmark, 
  ArrowRight, 
  FileText, 
  ShieldCheck, 
  AlertCircle,
  X,
  History
} from 'lucide-react';
import { LoanApplication } from '../../types/banking';
import { formatEuro } from '../../utils/formatters';

interface LoanSubmittedModalProps {
  application: LoanApplication;
  onClose: () => void;
  onGoToTransactions: () => void;
  onGoToHome: () => void;
}

export const LoanSubmittedModal: React.FC<LoanSubmittedModalProps> = ({
  application,
  onClose,
  onGoToTransactions,
  onGoToHome,
}) => {
  const amount = application.loanDetails.amount;
  const purpose = application.loanDetails.purpose;
  const contractId = application.id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header mit grünem Akzent */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-slate-50 to-indigo-500/10 dark:from-emerald-950/40 dark:via-slate-900 dark:to-indigo-950/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Antrag eingereicht
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  {contractId}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Kreditantrag erfolgreich übermittelt
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Betrag Hero */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white text-center border border-slate-800 shadow-inner space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Beantragter Darlehensbetrag
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {formatEuro(amount)}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-center gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Status: In manueller Prüfung durch die Kreditabteilung</span>
            </div>
          </div>

          {/* Die beiden zentralen Erklärungen des Benutzers */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Wichtige Informationen zur Bearbeitung &amp; Auszahlung
            </h4>

            {/* 1. Gutschrift bei Bewilligung */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Gutschrift bei Bewilligung des Kredits
                </h5>
              </div>
              <p className="text-xs text-emerald-800 dark:text-emerald-200/90 leading-relaxed pl-4.5">
                Sobald Ihr Darlehensantrag von der Kreditabteilung final bewilligt wird, wird der Betrag von <strong>{formatEuro(amount)}</strong> automatisch und direkt Ihrem <strong>Girokonto gutgeschrieben</strong>. Sie sehen das Guthaben sofort in Ihrem aktuellen Kontostand.
              </p>
            </div>

            {/* 2. Bescheid im gegenteiligen Fall */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Entscheidung im gegenteiligen Fall (Ablehnung oder Rückfrage)
                </h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-4.5">
                Sollte der Antrag abgelehnt werden oder Unterlagen nachgefordert werden, wird Ihnen diese Antwort transparent und detailliert direkt in Ihrer <strong>Umsatzhistorie</strong> und Ihren Benachrichtigungen angezeigt.
              </p>
            </div>

            {/* 3. In der Historie vermerkt */}
            <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3">
              <History className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <strong>In Ihrer Historie eingetragen :</strong> Der Antrag wurde soeben als ausstehende Buchung ("In Prüfung") in Ihrer Umsatzhistorie angelegt, damit Sie den Fortschritt jederzeit nachvollziehen können.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onGoToTransactions}
              className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Zur Umsatzhistorie</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onGoToHome}
              className="w-full sm:w-auto flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Zur Kontoübersicht</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
