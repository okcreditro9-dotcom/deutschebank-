import React from 'react';
import { X, ShieldCheck, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

interface DatenschutzModalProps {
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DatenschutzModal: React.FC<DatenschutzModalProps> = ({ onClose, onShowToast }) => {
  const handleExportData = () => {
    onShowToast('DSGVO-Datenexport bereitgestellt', 'Ihre gespeicherten Profildaten wurden exportiert.', 'success');
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
                Datenschutz &amp; Transparenz
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                DSGVO-Datenschutzerklärung
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100 % Bankgeheimnis &amp; Exklusiver Datenschutz</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Alle Kundendaten werden nach strengen europäischen Bankenstandards mit AES-256 verschlüsselt. Ausschließlich die Bank hat Zugriff – Dritte sind ausgeschlossen.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
              1. Verantwortliche Stelle &amp; Bankgeheimnis
            </h4>
            <p>
              AURA Banking &amp; Kredit. Die Einhaltung des Bankgeheimnisses und der europäischen Datenschutz-Grundverordnung (DSGVO) steht an oberster Stelle.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
              2. Ihre Rechte als betroffene Person
            </h4>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO), Berichtigung, Sperrung oder Löschung (Art. 17 DSGVO) sowie Datenübertragbarkeit (Art. 20 DSGVO).
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleExportData}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              DSGVO-Datenkopie herunterladen (JSON)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
