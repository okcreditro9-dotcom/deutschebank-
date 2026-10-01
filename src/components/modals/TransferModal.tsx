import React, { useState } from 'react';
import { 
  X, 
  Send, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { Transaction, DebitCard as DebitCardType } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';

interface TransferModalProps {
  currentBalance: number;
  card?: DebitCardType;
  onClose: () => void;
  onExecuteTransfer: (newTx: Transaction) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onRedirectToCard?: () => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  currentBalance,
  card,
  onClose,
  onExecuteTransfer,
  onShowToast,
  onRedirectToCard,
}) => {
  const [recipient, setRecipient] = useState('');
  const [iban, setIban] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState('');
  const [isInstant, setIsInstant] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'tan' | 'success'>('form');
  const [tanCode, setTanCode] = useState('');

  // Quick recipient templates
  const quickRecipients = [
    { name: 'Dr. Sarah Weber', iban: 'DE77 2005 0550 1234 5678 90' },
    { name: 'Wohnbau Süd GmbH', iban: 'DE12 5005 0201 0123 4567 89' },
    { name: 'Stadtwerke München', iban: 'DE55 7001 0080 0009 8765 43' },
  ];

  const handleSelectQuickRecipient = (item: { name: string; iban: string }) => {
    setRecipient(item.name);
    setIban(item.iban);
  };

  const handleProceedToTan = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(',', '.'));
    if (!recipient || !iban || isNaN(num) || num <= 0) {
      onShowToast('Ungültige Eingabe', 'Bitte füllen Sie alle Pflichtfelder korrekt aus.', 'error');
      return;
    }
    if (num > currentBalance + 5000) {
      onShowToast('Limit überschritten', 'Der Betrag übersteigt Ihr verfügbares Guthaben inkl. Dispo.', 'error');
      return;
    }
    setStep('tan');
  };

  const handleConfirmTransfer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const num = parseFloat(amount.replace(',', '.'));
      const newTx: Transaction = {
        id: `tx-${Date.now()}`,
        recipientOrSender: recipient,
        iban: iban.toUpperCase(),
        purpose: purpose || 'Überweisung',
        amount: -Math.abs(num),
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now(),
        category: 'Sonstiges',
        status: isInstant ? 'gebucht' : 'ausstehend',
        referenceId: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      };

      setIsSubmitting(false);
      setStep('success');
      onExecuteTransfer(newTx);
      onShowToast(
        'Überweisung ausgeführt',
        `${formatEuro(num)} erfolgreich an ${recipient} übermittelt.`,
        'success'
      );
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={step === 'tan' ? () => setStep('form') : onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                SEPA-Überweisung
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                {step === 'form' && 'Geld überweisen'}
                {step === 'tan' && 'Sicherheitsfreigabe (2FA / TAN)'}
                {step === 'success' && 'Überweisung erfolgreich!'}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {card && card.status !== 'approved' ? (
            <div className="py-6 space-y-5 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {card.status === 'none' && 'Persönliche Bankkarte erforderlich'}
                  {card.status === 'pending' && 'Bankkarte noch in Prüfung'}
                  {card.status === 'rejected' && 'Bankkarte nicht verknüpft / abgelehnt'}
                </h4>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                  {card.status === 'none' && (
                    <>
                      Sie haben noch keine persönliche Bankkarte verknüpft. 
                      <strong> Wichtig: Auf Ihrer Bankkarte muss ein Mindestguthaben von mindestens 148,00 € vorhanden sein</strong>, andernfalls kann unsere Bank Ihre Karte nicht mit unserer Banking-App verknüpfen. Solange die Karte nicht verknüpft und genehmigt wurde, können Sie keine Überweisungen oder Transaktionen zu anderen Konten oder Karten durchführen.
                    </>
                  )}
                  {card.status === 'pending' && (
                    <>
                      Ihre persönliche Bankkarte befindet sich derzeit in der <strong>Registrierung und Prüfung</strong>. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.
                    </>
                  )}
                  {card.status === 'rejected' && (
                    <>
                      Ihre Bankkarte wurde von der Bank abgelehnt: {card.rejectionReason || 'Mindestguthaben von 148,00 € nicht erreicht'}. Bitte hinterlegen Sie eine gültige persönliche Bankkarte mit mindestens 148,00 € Guthaben.
                    </>
                  )}
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onRedirectToCard) onRedirectToCard();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                >
                  {card.status === 'none' && 'Persönliche Bankkarte jetzt verknüpfen (Mind. 148 €)'}
                  {card.status === 'pending' && 'Bankkarten-Status ansehen'}
                  {card.status === 'rejected' && 'Neue Bankkarte hinterlegen'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Schließen
                </button>
              </div>
            </div>
          ) : (
            <>
              {step === 'form' && (
                <form onSubmit={handleProceedToTan} className="space-y-4">
              {/* Quick Recipient Chips */}
              <div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                  Schnellauswahl Empfänger:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickRecipients.map((qr) => (
                    <button
                      key={qr.name}
                      type="button"
                      onClick={() => handleSelectQuickRecipient(qr)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      {qr.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empfänger Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Empfänger / Begünstigter *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. Max Mustermann oder Firmenname"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* IBAN */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  IBAN des Empfängers *
                </label>
                <input
                  type="text"
                  required
                  placeholder="DE89 ..."
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Betrag */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Betrag in EUR *</span>
                  <span className="text-slate-400 font-normal">
                    Verfügbar: {formatEuro(currentBalance)}
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-extrabold font-mono-numbers focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <span className="absolute right-3.5 top-3 text-xs font-bold text-slate-400">
                    €
                  </span>
                </div>
              </div>

              {/* Verwendungszweck */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Verwendungszweck (optional)
                </label>
                <input
                  type="text"
                  maxLength={140}
                  placeholder="z. B. Rechnungsnummer oder Verwendungszweck"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* SEPA Echtzeitüberweisung Option */}
              <label className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isInstant}
                  onChange={(e) => setIsInstant(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      SEPA Instant Überweisung (Gebührenfrei)
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Geld ist in wenigen Sekunden auf dem Empfängerkonto gutgeschrieben.
                  </span>
                </div>
              </label>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <span>Weiter zur Freigabe</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {step === 'tan' && (
            <div className="space-y-5 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  AURA Secure TAN freigeben
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  Überweisung von <strong>{formatEuro(parseFloat(amount))}</strong> an <strong>{recipient}</strong> ({iban}) autorisieren.
                </p>
              </div>

              {/* Secure TAN box */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs max-w-xs mx-auto">
                <span className="text-[11px] text-slate-400 block mb-1">
                  Sicherheits-Freigabe-TAN:
                </span>
                <span className="font-mono font-bold text-sm tracking-widest text-emerald-600 dark:text-emerald-400">
                  928 410
                </span>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Zurück
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Buche Überweisung...</span>
                    </>
                  ) : (
                    <span>Jetzt freigeben</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Buchung erfolgreich!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Ihr Auftrag wurde über das SEPA-System ausgeführt.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Empfänger:</span>
                  <strong className="text-slate-900 dark:text-white">{recipient}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Betrag:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                    {formatEuro(parseFloat(amount))}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Ausführung:</span>
                  <span className="text-slate-900 dark:text-white">SEPA Instant (Sofort gebucht)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs transition-colors cursor-pointer"
              >
                Fertig
              </button>
            </div>
          )}
          </>
        )}
        </div>
      </div>
    </div>
  );
};
