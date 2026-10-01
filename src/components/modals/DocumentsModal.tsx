import React, { useState } from 'react';
import { X, FileText, Download, Check, Sparkles, Filter, ArrowLeft } from 'lucide-react';
import { BankDocument } from '../../types/banking';

interface DocumentsModalProps {
  documents: BankDocument[];
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const DocumentsModal: React.FC<DocumentsModalProps> = ({
  documents,
  onClose,
  onShowToast,
}) => {
  const [filter, setFilter] = useState<string>('Alle');

  const filtered = documents.filter((doc) => {
    if (filter === 'Alle') return true;
    return doc.type === filter;
  });

  const handleDownload = (doc: BankDocument) => {
    onShowToast(
      'Dokument heruntergeladen',
      `${doc.title}.pdf (${doc.size}) erfolgreich geladen.`,
      'success'
    );
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
              <ArrowLeft className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Elektronische Postbox
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Dokumente &amp; Kontoauszüge
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

        {/* Filter buttons */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
          {['Alle', 'Kontoauszug', 'Kreditvertrag', 'Steuerbescheinigung'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                filter === f
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3">
          {filtered.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white truncate">
                    {doc.title}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {doc.date} · {doc.size} · ID: {doc.demoId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownload(doc)}
                className="p-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 transition-colors shrink-0 cursor-pointer"
                title="PDF herunterladen"
              >
                <Download className="w-4 h-4 text-emerald-500" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
