import React, { useState } from 'react';
import { 
  CreditCard, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Sliders, 
  FileText, 
  ShieldCheck, 
  Calendar, 
  ArrowUpRight, 
  Wifi, 
  Eye, 
  EyeOff,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Info,
  Building2,
  Euro,
  ArrowLeft
} from 'lucide-react';
import { BankAccount, DebitCard as DebitCardType, SubViewType } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';
import { NordBankLogo } from '../common/NordBankLogo';

interface AccountViewProps {
  account: BankAccount;
  card: DebitCardType;
  onBack?: () => void;
  onUpdateCard: (updatedCard: DebitCardType) => void;
  onOpenSubView: (view: SubViewType) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AccountView: React.FC<AccountViewProps> = ({
  account,
  card,
  onBack,
  onUpdateCard,
  onOpenSubView,
  onShowToast,
}) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);

  // Registration Modal State
  const [showRegisterCardModal, setShowRegisterCardModal] = useState(card.status === 'none');
  const [cardHolderInput, setCardHolderInput] = useState(card.cardHolder || account.accountHolder.toUpperCase());
  const [bankNameInput, setBankNameInput] = useState(card.bankName || '');
  const [cardNumberInput, setCardNumberInput] = useState(card.cardNumber || '');
  const [expiryMonthInput, setExpiryMonthInput] = useState(card.expiryMonth || '');
  const [expiryYearInput, setExpiryYearInput] = useState(card.expiryYear || '');
  const [cvvInput, setCvvInput] = useState(card.cvv || '');
  const [cardBalanceInput, setCardBalanceInput] = useState(card.cardBalance > 0 ? card.cardBalance.toString() : '150');
  const [formError, setFormError] = useState<string | null>(null);

  const toggleFreezeCard = () => {
    const nextState = !card.isFrozen;
    onUpdateCard({ ...card, isFrozen: nextState });
    onShowToast(
      nextState ? 'Karte gesperrt' : 'Karte entsperrt',
      nextState 
        ? 'Ihre Bankkarte wurde vorübergehend deaktiviert.' 
        : 'Ihre Bankkarte ist wieder voll einsatzbereit.',
      nextState ? 'error' : 'success'
    );
  };

  const copyIban = () => {
    navigator.clipboard?.writeText(account.iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    onShowToast('IBAN kopiert', account.iban, 'info');
    setTimeout(() => setCopiedIban(false), 2000);
  };

  const copyCard = () => {
    const numToCopy = card.cardNumber || 'Keine Nummer vorhanden';
    navigator.clipboard?.writeText(numToCopy.replace(/\s+/g, ''));
    setCopiedCard(true);
    onShowToast('Kartennummer kopiert', numToCopy, 'info');
    setTimeout(() => setCopiedCard(false), 2000);
  };

  // Format Card Number input with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 16);
    const parts = cleaned.match(/.{1,4}/g);
    setCardNumberInput(parts ? parts.join(' ') : cleaned);
  };

  // Submit Card Registration
  const handleSubmitCardRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const rawNum = cardNumberInput.replace(/\s+/g, '');
    if (rawNum.length !== 16) {
      setFormError('Die Kartennummer muss genau 16 Ziffern enthalten.');
      return;
    }

    if (!bankNameInput.trim()) {
      setFormError('Bitte geben Sie den Namen Ihrer ausstellenden Bank an.');
      return;
    }

    if (!cardHolderInput.trim()) {
      setFormError('Bitte geben Sie den Namen des Karteninhabers an.');
      return;
    }

    const m = parseInt(expiryMonthInput, 10);
    const y = parseInt(expiryYearInput, 10);
    if (isNaN(m) || m < 1 || m > 12 || isNaN(y) || y < 24) {
      setFormError('Bitte geben Sie ein gültiges Ablaufdatum (MM / JJ) an.');
      return;
    }

    if (cvvInput.trim().length < 3) {
      setFormError('Die Prüfnummer (CVV / CVC) muss 3 Ziffern lang sein.');
      return;
    }

    const bal = parseFloat(cardBalanceInput.replace(',', '.'));
    if (isNaN(bal) || bal < 148.0) {
      setFormError('Wichtig: Auf Ihrer Bankkarte muss ein Mindestguthaben von mindestens 148,00 € vorhanden sein, andernfalls kann unsere Bank Ihre Karte nicht mit unserer Banking-App verknüpfen.');
      return;
    }

    const last4 = rawNum.slice(-4);
    const masked = `•••• •••• •••• ${last4}`;
    const cardType = rawNum.startsWith('4') ? 'Visa' : 'Mastercard';

    const updatedCard: DebitCardType = {
      ...card,
      status: 'pending',
      cardHolder: cardHolderInput.trim().toUpperCase(),
      cardNumber: cardNumberInput.trim(),
      cardNumberMasked: masked,
      expiryMonth: expiryMonthInput.trim().padStart(2, '0'),
      expiryYear: expiryYearInput.trim().slice(-2),
      cvv: cvvInput.trim(),
      bankName: bankNameInput.trim(),
      cardBalance: bal,
      cardType,
      submittedAt: new Date().toISOString().split('T')[0],
      rejectionReason: undefined,
      isFrozen: false,
    };

    onUpdateCard(updatedCard);
    setShowRegisterCardModal(false);
    onShowToast(
      'Bankkarte in Registrierung',
      'Ihre persönliche Bankkarte befindet sich derzeit in der Registrierung und Prüfung. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.',
      'info'
    );
  };

  const freistellungPercent = Math.round((account.freistellungsAuftragUsed / account.freistellungsAuftragTotal) * 100);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück zur Übersicht"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zurück</span>
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Konto &amp; Karten
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {account.accountType} · Deutsche Einlagensicherung bis 100.000 €
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSubView('kontodetails')}
          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          Kontokonditionen anzeigen
        </button>
      </div>

      {/* STATUS BANNER FOR PERSONAL BANK CARD */}
      {card.status === 'none' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
                Keine persönliche Bankkarte verknüpft
              </h4>
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-300/90">
                Es muss sich um Ihre <strong>persönliche Bankkarte</strong> handeln. Auf Ihrer Bankkarte muss ein <strong>Mindestguthaben von mindestens 148,00 €</strong> vorhanden sein, andernfalls kann unsere Bank Ihre Karte nicht mit unserer Banking-App verknüpfen.
              </p>
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                ⚠️ Solange Ihre Bankkarte nicht verknüpft und durch die Bank genehmigt wurde, können Sie keine Transaktionen oder Überweisungen zu einem anderen Bankkonto oder einer anderen Karte durchführen.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterCardModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Persönliche Bankkarte jetzt verknüpfen (Mind. 148 € Guthaben)</span>
          </button>
        </div>
      )}

      {card.status === 'pending' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-900 dark:text-sky-200 space-y-3">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-sky-800 dark:text-sky-300">
                  Bankkarte befindet sich in der Registrierung und Prüfung
                </h4>
                <span className="text-[10px] bg-sky-500/20 text-sky-700 dark:text-sky-300 font-bold px-2 py-0.5 rounded-full border border-sky-500/40">
                  Ausstehend
                </span>
              </div>
              <p className="text-xs leading-relaxed text-sky-700 dark:text-sky-300/90">
                Ihre Bankkarte befindet sich derzeit in der Registrierung und Prüfung durch unsere Bank. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.
              </p>
              <div className="text-[11px] text-sky-800 dark:text-sky-300 flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono">
                <span>Bank: <strong>{card.bankName || 'Angegebene Bank'}</strong></span>
                <span>Karte: <strong>{card.cardNumberMasked}</strong></span>
                <span>Kartenguthaben: <strong>{formatEuro(card.cardBalance)}</strong> (≥ 148,00 €)</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterCardModal(true)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline font-semibold cursor-pointer"
          >
            Kartendaten korrigieren oder aktualisieren →
          </button>
        </div>
      )}

      {card.status === 'rejected' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200 space-y-3">
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-rose-800 dark:text-rose-300">
                Bankkarte konnte nicht verknüpft werden
              </h4>
              <p className="text-xs leading-relaxed text-rose-700 dark:text-rose-300/90">
                {card.rejectionReason || 'Das Mindestguthaben von 148,00 € wurde nicht erreicht oder die Kartendaten konnten nicht verifiziert werden.'}
              </p>
              <p className="text-xs font-semibold text-rose-800 dark:text-rose-200">
                ⚠️ Solange keine verifizierte Bankkarte vorliegt, sind Überweisungen zu anderen Bankkonten oder Karten gesperrt.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRegisterCardModal(true)}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neue persönliche Bankkarte hinterlegen</span>
          </button>
        </div>
      )}

      {card.status === 'approved' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300">
                Persönliche Bankkarte genehmigt &amp; verknüpft
              </h4>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90">
                Alle Parameter sind freigeschaltet. Sie können Überweisungen zu jedem beliebigen Bankkonto oder jeder Bankkarte ausführen.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/30 whitespace-nowrap">
            Guthaben: {formatEuro(card.cardBalance)}
          </span>
        </div>
      )}

      {/* 1. Bankkarte im Premium-Look */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-950 via-zinc-900 to-slate-800 text-white p-6 sm:p-7 shadow-2xl border border-slate-700/60 max-w-lg mx-auto w-full">
        {/* Subtle holographic foil shine */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-60 h-60 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between h-52 sm:h-56">
          {/* Top row of card */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <NordBankLogo size={22} />
              <span className="text-base font-black tracking-widest bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                NORDBANK
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                {card.cardType || 'DEBIT CARD'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-slate-400 rotate-90" />
              {card.status === 'pending' && (
                <span className="text-[10px] bg-sky-500/30 text-sky-200 border border-sky-500/50 px-2 py-0.5 rounded-full font-bold">
                  In Prüfung
                </span>
              )}
              {card.status === 'approved' && !card.isFrozen && (
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 px-2 py-0.5 rounded-full font-bold">
                  Aktiv
                </span>
              )}
              {card.status === 'rejected' && (
                <span className="text-[10px] bg-rose-500/30 text-rose-200 border border-rose-500/50 px-2 py-0.5 rounded-full font-bold">
                  Abgelehnt
                </span>
              )}
              {card.status === 'none' && (
                <span className="text-[10px] bg-amber-500/30 text-amber-200 border border-amber-500/50 px-2 py-0.5 rounded-full font-bold">
                  Nicht verknüpft
                </span>
              )}
              {card.isFrozen && (
                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                  Gesperrt
                </span>
              )}
            </div>
          </div>

          {/* Chip and Bank Name */}
          <div className="flex items-center justify-between my-auto">
            <div className="w-11 h-8 rounded-md bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 border border-amber-300/40 shadow-inner flex items-center justify-center">
              <div className="w-7 h-5 border border-amber-800/40 rounded-sm grid grid-cols-2 opacity-60" />
            </div>
            {card.bankName && (
              <span className="text-xs font-semibold text-slate-300 font-mono tracking-wider">
                {card.bankName}
              </span>
            )}
          </div>

          {/* Card Number & Expiry */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-base sm:text-lg font-mono tracking-widest font-semibold text-slate-100">
                {card.status === 'none' 
                  ? '•••• •••• •••• ••••' 
                  : (showCardNumber ? (card.cardNumber || card.cardNumberMasked) : card.cardNumberMasked)}
              </span>
              {card.status !== 'none' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setShowCardNumber(!showCardNumber)}
                    className="text-slate-400 hover:text-white p-1 transition-colors"
                    title="Nummer ein-/ausblenden"
                  >
                    {showCardNumber ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={copyCard}
                    className="text-slate-400 hover:text-white p-1 transition-colors"
                    title="Kartennummer kopieren"
                  >
                    {copiedCard ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-end justify-between text-xs text-slate-300">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Karteninhaber</span>
                <span className="font-semibold tracking-wider font-mono">
                  {card.cardHolder || account.accountHolder.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Gültig bis</span>
                <span className="font-semibold font-mono">
                  {card.expiryMonth && card.expiryYear ? `${card.expiryMonth}/${card.expiryYear}` : '••/••'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 block">CVV</span>
                <span className="font-semibold font-mono">
                  {showCardNumber && card.cvv ? card.cvv : '•••'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Card Quick Actions: Freeze / Limits / Register */}
      <div className="flex items-center justify-center flex-wrap gap-3">
        {card.status === 'approved' ? (
          <>
            <button
              onClick={toggleFreezeCard}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm ${
                card.isFrozen
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              {card.isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4 text-slate-500" />}
              <span>{card.isFrozen ? 'Karte jetzt entsperren' : 'Karte temporär sperren'}</span>
            </button>

            <button
              onClick={() => onOpenSubView('sicherheit')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 cursor-pointer shadow-sm"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Kartenlimits anpassen</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowRegisterCardModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {card.status === 'none' ? 'Persönliche Bankkarte jetzt verknüpfen' : 'Kartendaten einsehen / bearbeiten'}
            </span>
          </button>
        )}
      </div>

      {/* 2. Kontostammdaten & Konditionen */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Kontodetails &amp; IBAN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                IBAN (International Bank Account Number)
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {formatIban(account.iban)}
              </span>
            </div>
            <button
              onClick={copyIban}
              className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 cursor-pointer"
              title="Kopieren"
            >
              {copiedIban ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                BIC / SWIFT-Code
              </span>
              <span className="text-sm font-bold font-mono text-slate-900 dark:text-white">
                {account.bic}
              </span>
            </div>
            <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded">
              SEPA Instant
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              Eingeräumter Dispositionskredit (Dispolimit)
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-mono-numbers text-slate-900 dark:text-white">
                {formatEuro(account.dispoLimit)}
              </span>
              <span className="text-xs text-slate-400">
                Zins: 9,25 % p.a.
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
              Guthabenzins Tagesgeld
            </span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
                {account.interestRateDeposit.toFixed(2)} % p.a.
              </span>
              <span className="text-xs text-slate-400">
                Monatliche Zinsausschüttung
              </span>
            </div>
          </div>
        </div>

        {/* Freistellungsauftrag Progress */}
        <div className="pt-2">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Freistellungsauftrag (Sparer-Pauschbetrag 2026)
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">
              {formatEuro(account.freistellungsAuftragUsed)} von {formatEuro(account.freistellungsAuftragTotal)} ({freistellungPercent}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${freistellungPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* 3. Schnell-Aktionen für Kontoführung */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Kontoservices &amp; Verwaltung
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => onOpenSubView('zahlungsuebersicht')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Daueraufträge &amp; Lastschriften
                </p>
                <span className="text-[11px] text-slate-500">3 aktive Daueraufträge</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={() => onOpenSubView('dokumente')}
            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-left transition-colors cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Elektronische Kontoauszüge
                </p>
                <span className="text-[11px] text-slate-500">Monatlich digital als PDF</span>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* MODAL: PERSONAL BANK CARD REGISTRATION / VERIFICATION */}
      {showRegisterCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterCardModal(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
                  title="Zurück"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zurück</span>
                </button>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Persönliche Bankkarte hinterlegen
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Sichere Verknüpfung zur Freischaltung von Überweisungen
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRegisterCardModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Schließen"
              >
                ✕
              </button>
            </div>

            {/* Crucial Banking Instructions Banner in German */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Wichtige Bankvorschrift zum Kartenguthaben:
                  </span>
                  <p className="leading-relaxed">
                    Es handelt sich um <strong>Ihre echte, persönliche Bankkarte</strong>. Auf dieser Bankkarte muss ein <strong>Mindestguthaben von mindestens 148,00 €</strong> vorhanden sein, andernfalls kann unsere Bank Ihre Karte nicht mit unserer Banking-App verknüpfen.
                  </p>
                  <p className="font-semibold text-amber-800 dark:text-amber-300 pt-1">
                    ⚠️ Solange Ihre Bankkarte nicht verknüpft und genehmigt wurde, können Sie keine Überweisungen oder Transaktionen zu anderen Konten ausführen.
                  </p>
                </div>
              </div>
            </div>

            {formError && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Registration Form */}
            <form onSubmit={handleSubmitCardRegistration} className="space-y-4 text-xs">
              {/* Cardholder */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Name des Karteninhabers *
                </label>
                <input
                  type="text"
                  required
                  placeholder="z. B. MAXIMILIAN WEBER"
                  value={cardHolderInput}
                  onChange={(e) => setCardHolderInput(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Muss mit dem Inhabernamen Ihres Kontos übereinstimmen.
                </span>
              </div>

              {/* Issuing Bank */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Name der ausstellenden Bank *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="z. B. Deutsche Bank, Sparkasse, Commerzbank, ING, DKB..."
                    value={bankNameInput}
                    onChange={(e) => setBankNameInput(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* 16-Digit Card Number */}
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Kartennummer (16 Ziffern) *
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="4532 •••• •••• ••••"
                    value={cardNumberInput}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-wider text-sm"
                  />
                </div>
              </div>

              {/* Expiry and CVV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Gültig bis (MM / JJ) *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="MM"
                      maxLength={2}
                      value={expiryMonthInput}
                      onChange={(e) => setExpiryMonthInput(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2.5 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="JJ"
                      maxLength={2}
                      value={expiryYearInput}
                      onChange={(e) => setExpiryYearInput(e.target.value.replace(/\D/g, ''))}
                      className="px-3 py-2.5 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Prüfziffer (CVV / CVC) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength={4}
                    value={cvvInput}
                    onChange={(e) => setCvvInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2.5 text-center rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono tracking-widest"
                  />
                </div>
              </div>

              {/* Verified Card Balance (Mandatory >= 148 €) */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Euro className="w-4 h-4 text-emerald-500" />
                    <span>Aktuelles Kartenguthaben in € *</span>
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                    Mindestwert: 148,00 €
                  </span>
                </div>

                <input
                  type="number"
                  step="0.01"
                  min="148"
                  required
                  placeholder="148.00"
                  value={cardBalanceInput}
                  onChange={(e) => setCardBalanceInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-base"
                />

                {parseFloat(cardBalanceInput || '0') < 148 ? (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>Guthaben zu gering! Es sind mindestens 148,00 € erforderlich, um die Karte zu verknüpfen.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 shrink-0" />
                    <span>Guthabenanforderung von mind. 148,00 € ist erfüllt.</span>
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Persönliche Bankkarte zur Prüfung einreichen</span>
                </button>

                {card.status !== 'none' && (
                  <button
                    type="button"
                    onClick={() => setShowRegisterCardModal(false)}
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Abbrechen
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
