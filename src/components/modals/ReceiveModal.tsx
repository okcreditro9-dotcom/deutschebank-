import React, { useState } from 'react';
import { X, Copy, Check, QrCode, Share2, ArrowDownLeft, ShieldCheck, ArrowLeft } from 'lucide-react';
import { BankAccount } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';

interface ReceiveModalProps {
  account: BankAccount;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  account,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<string>('');

  const copyIban = () => {
    navigator.clipboard?.writeText(account.iban.replace(/\s+/g, ''));
    setCopied(true);
    onShowToast('IBAN kopiert', account.iban, 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLink = () => {
    onShowToast(
      'Zahlungslink erstellt',
      `https://pay.nordbank.de/pay/${account.iban.replace(/\s+/g, '')}`,
      'info'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto text-center">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3 text-left">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Geld empfangen
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                GiroCode &amp; Bankverbindung
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
          {/* Simulated QR Code (EPC QR-Code / GiroCode) */}
          <div className="flex flex-col items-center">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-md inline-block">
              {/* Clean SVG Matrix QR Code representation */}
              <div className="w-44 h-44 bg-slate-950 p-2 rounded-xl flex flex-col items-center justify-center relative">
                <div className="w-full h-full bg-white rounded-lg flex items-center justify-center p-2">
                  <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1 border-2 border-slate-900">
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-200 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-white rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-emerald-600 rounded-xs flex items-center justify-center text-[7px] text-white font-black">AURA</div>
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-white rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                    <div className="bg-slate-200 rounded-xs" />
                    <div className="bg-slate-900 rounded-xs" />
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 max-w-xs">
              Scannen mit jeder deutschen Banking-App für eine vorbefüllte Überweisung.
            </p>
          </div>

          {/* IBAN Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Kontoinhaber</span>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{account.accountHolder}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">IBAN</span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                  {formatIban(account.iban)}
                </span>
                <button
                  type="button"
                  onClick={copyIban}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  title="IBAN kopieren"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">BIC</span>
              <p className="text-xs font-bold font-mono text-slate-900 dark:text-white">{account.bic}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyIban}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>IBAN kopieren</span>
            </button>
            <button
              type="button"
              onClick={handleShareLink}
              className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              title="Link teilen"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
