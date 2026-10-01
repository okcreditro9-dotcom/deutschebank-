import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  CircleDot, 
  ArrowRight, 
  Download, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { LoanApplication } from '../../types/banking';
import { formatEuro, formatDateGerman } from '../../utils/formatters';

interface LoanStatusModalProps {
  application: LoanApplication;
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoanStatusModal: React.FC<LoanStatusModalProps> = ({
  application,
  onClose,
  onShowToast,
}) => {
  const [showSubmittedDetails, setShowSubmittedDetails] = useState<boolean>(false);
  const [isSigning, setIsSigning] = useState<boolean>(false);
  const [signatureCompleted, setSignatureCompleted] = useState<boolean>(false);

  const handleSimulateSignature = () => {
    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setSignatureCompleted(true);
      onShowToast(
        'Digitale Signatur erfolgreich',
        'Der Darlehensvertrag wurde qualifiziert elektronisch signiert.',
        'success'
      );
    }, 1800);
  };

  const handleDownloadContract = () => {
    onShowToast(
      'Download gestartet',
      `Darlehensvertrag_${application.id.replace(/^DEMO-?/i, '')}.pdf wird heruntergeladen.`,
      'info'
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
                  Antragsstatus
                </span>
                <span className="text-[11px] font-mono font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                  {application.id}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {application.loanDetails.purpose}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Status Hero Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-800/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Aktueller Bearbeitungsstatus
                  </span>
                </div>
                <h4 className="text-lg sm:text-xl font-extrabold text-white">
                  {signatureCompleted ? 'Auszahlung in Vorbereitung' : application.statusLabel}
                </h4>
                <p className="text-xs text-slate-300 mt-1">
                  Kreditbetrag: <strong className="text-white font-mono-numbers">{formatEuro(application.loanDetails.amount)}</strong> · 
                  Bank-Kommission (2%): <strong className="text-emerald-400 font-mono-numbers">- {formatEuro(Math.round(application.loanDetails.amount * 0.02))}</strong> · 
                  Netto-Auszahlung: <strong className="text-white font-mono-numbers">{formatEuro(application.loanDetails.amount - Math.round(application.loanDetails.amount * 0.02))}</strong>
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40">
                  <span>🇩🇪 Deutscher Staatsbürgerschaftsnachweis (Personalausweis/Pass) geprüft</span>
                </div>
              </div>

              <button
                onClick={handleDownloadContract}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition-colors self-start sm:self-auto cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-300" />
                <span>Vertragsentwurf (PDF)</span>
              </button>
            </div>
          </div>

          {/* Timeline / Fortschrittsanzeige */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Fortschritt &amp; Bearbeitungsschritte
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              {application.timeline.map((step, idx) => {
                const isCompleted = step.status === 'completed' || (signatureCompleted && idx === 3);
                const isCurrent = (signatureCompleted && idx === 4) || (!signatureCompleted && step.status === 'current');

                return (
                  <div key={idx} className="relative">
                    {/* Circle marker */}
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isCurrent ? (
                        <CircleDot className="w-3.5 h-3.5" />
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold ${
                          isCompleted
                            ? 'text-slate-900 dark:text-white'
                            : isCurrent
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-400'
                        }`}>
                          {step.step}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {step.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nächste Schritte CTA Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Nächster Schritt:{' '}
                  {signatureCompleted
                    ? 'Automatische Gutschrift auf Ihr Konto'
                    : 'Vertragsunterzeichnung per Video-Ident / eID'}
                </h5>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  {signatureCompleted
                    ? 'Die Auszahlung über 12.500,00 € wird im nächsten Bankclearing direkt auf Ihr AURA Premium Girokonto überwiesen.'
                    : 'Alle Bonitäts- und Gehaltsprüfungen sind positiv abgeschlossen. Schließen Sie den Vertrag jetzt digital mit einem Klick ab.'}
                </p>

                {!signatureCompleted && (
                  <button
                    onClick={handleSimulateSignature}
                    disabled={isSigning}
                    className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {isSigning ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>Signiere Vertrag digital...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Jetzt online unterzeichnen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Deutscher Staatsbürgerschaftsnachweis (Foto / Dokument) */}
          {(application.documents?.idDocumentData || application.documents?.idDocumentName) && (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Deutscher Staatsbürgerschaftsnachweis (Ausweis/Pass)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  🇩🇪 Geprüft &amp; Gültig
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Dokument: <strong className="text-slate-700 dark:text-slate-200">{application.documents?.idDocumentName || 'Deutscher_Personalausweis.svg'}</strong>
              </p>
              {application.documents?.idDocumentData && (
                <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 p-2 flex items-center justify-center max-h-52">
                  <img
                    src={application.documents.idDocumentData}
                    alt="Ausweis Vorschau"
                    className="max-h-48 w-auto object-contain rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          )}

          {/* Eingereichte Informationen (Klappbereich) */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => setShowSubmittedDetails(!showSubmittedDetails)}
              className="w-full p-4 flex items-center justify-between text-left text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <span>Eingereichte Antragsdaten anzeigen</span>
              {showSubmittedDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showSubmittedDetails && (
              <div className="p-4 space-y-3 text-xs bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Antragsteller:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {application.personalData.salutation} {application.personalData.firstName} {application.personalData.lastName}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Geburtsdatum:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {application.personalData.birthDate}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Adresse:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {application.address.street} {application.address.houseNumber}, {application.address.postalCode} {application.address.city}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Beruf &amp; Arbeitgeber:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {application.employment.profession} ({application.employment.employer})
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Monatliches Netto:</span>
                  <span className="font-semibold text-slate-900 dark:text-white font-mono-numbers">
                    {formatEuro(application.finances.netIncome)}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-slate-500 dark:text-slate-400">Hochgeladene Dokumente:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    3/3 verifiziert
                  </span>
                </div>
              </div>
            )}
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
