import React, { useState, useEffect } from 'react';
import { 
  Landmark, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sliders, 
  Sparkles, 
  FileText, 
  Calculator,
  ChevronRight,
  Info,
  DollarSign,
  ArrowLeft,
  Search,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { CreditAccount, LoanApplication, SubViewType } from '../../types/banking';
import { formatEuro, calculateCreditRate } from '../../utils/formatters';

interface CreditViewProps {
  credit?: CreditAccount | null;
  application?: LoanApplication | null;
  onBack?: () => void;
  onOpenSubView: (view: SubViewType) => void;
  onStartApplicationWithParams?: (amount: number, termMonths: number, purpose: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreditView: React.FC<CreditViewProps> = ({
  credit,
  application,
  onBack,
  onOpenSubView,
  onStartApplicationWithParams,
  onShowToast,
}) => {
  // Kreditrechner interactive state avec gestion String (élimination du bug du zéro)
  const [calcAmountStr, setCalcAmountStr] = useState<string>('15000');
  const [calcTermStr, setCalcTermStr] = useState<string>('48');
  const [calcIncomeStr, setCalcIncomeStr] = useState<string>('');
  const [calcPurpose, setCalcPurpose] = useState<string>('Freie Verwendung');
  const [showSondertilgungModal, setShowSondertilgungModal] = useState<boolean>(false);
  const [sondertilgungAmount, setSondertilgungAmount] = useState<number>(1000);

  // Conversion numérique
  const calcAmount = Math.max(0, parseInt(calcAmountStr, 10) || 0);
  const calcTerm = parseInt(calcTermStr, 10) || 0;
  const calcIncome = Math.max(0, parseInt(calcIncomeStr, 10) || 0);

  // Limite maximale de 240 mois
  const MAX_TERM_MONTHS = 240;
  const isCalcTermExceeded = calcTerm > MAX_TERM_MONTHS;

  // Google Search Grounding (gemini-3.5-flash with googleSearch tool)
  const [marketRates, setMarketRates] = useState<{
    text: string;
    sources: { title: string; uri: string }[];
    timestamp?: string;
  } | null>(null);
  const [loadingRates, setLoadingRates] = useState<boolean>(false);

  const fetchLiveMarketRates = async () => {
    setLoadingRates(true);
    try {
      const res = await fetch('/api/gemini/search-rates');
      const data = await res.json();
      if (data && data.success) {
        setMarketRates({
          text: data.text,
          sources: data.sources || [],
          timestamp: data.timestamp,
        });
      }
    } catch (err) {
      console.warn('Could not fetch live rates:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchLiveMarketRates();
  }, []);

  // Calculate live results
  const calculation = calculateCreditRate(calcAmount > 0 ? calcAmount : 1000, calcTerm > 0 && !isCalcTermExceeded ? calcTerm : 36, 3.89);

  // Repayment progress calculation
  const totalCredit = credit ? credit.requestedAmount : 0;
  const paidCredit = credit ? credit.paidAmount : 0;
  const progressPercent = totalCredit > 0 ? Math.min(100, Math.round((paidCredit / totalCredit) * 100)) : 0;

  // Circular progress SVG values
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleApplyNow = () => {
    if (isCalcTermExceeded) {
      onShowToast('Laufzeit überschritten', `Die maximale Laufzeit beträgt ${MAX_TERM_MONTHS} Monate (20 Jahre).`, 'error');
      return;
    }
    if (onStartApplicationWithParams) {
      onStartApplicationWithParams(calcAmount, calcTerm, calcPurpose);
    } else {
      onOpenSubView('kreditantrag');
    }
  };

  const handleExecuteSondertilgung = () => {
    onShowToast(
      'Sondertilgung vorgemerkt',
      `Betrag von ${formatEuro(sondertilgungAmount)} wurde zur Verrechnung eingereicht.`,
      'success'
    );
    setShowSondertilgungModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* 1. Header Bereich der Kredite */}
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
              Kredite &amp; Finanzierung
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Transparente Konditionen, flexible Laufzeiten und digitale Sofortprüfung
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSubView('kreditantrag')}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Kredit beantragen</span>
        </button>
      </div>

      {/* 2. Aktiver Antrag Banner (falls vorhanden) */}
      {application && (
        <div 
          onClick={() => onOpenSubView('antragstatus')}
          className="bg-slate-900 text-white p-4 sm:p-5 rounded-3xl border border-emerald-500/30 flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-500 transition-all shadow-md group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {application.id.replace(/^DEMO-?/i, '')}
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                  {application.statusLabel}
                </span>
              </div>
              <p className="text-sm font-semibold truncate text-slate-200">
                Antrag: {formatEuro(application.loanDetails.amount)} · {application.loanDetails.purpose}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0">
            <span className="hidden sm:inline">Status prüfen</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* 3. „Mein Kredit“ Hauptkarte mit Kreisdiagramm oder Kein-Kredit-Karte */}
      {credit ? (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Linker Bereich: Kreditdetails */}
            <div className="space-y-5 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Mein Kredit · Vertrag {credit.contractNumber}
                </span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-medium">
                  {credit.status}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {credit.title}
              </h3>

              {/* Grid mit den Kennzahlen */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Gewünschter Kreditbetrag
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
                    {formatEuro(credit.requestedAmount)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Verbleibender Betrag
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
                    {formatEuro(credit.remainingAmount)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Monatliche Rate
                  </span>
                  <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
                    {formatEuro(credit.monthlyRate)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Effektiver Jahreszins
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
                    {credit.interestRateEffective.toFixed(2)} %
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Verbleibende Laufzeit
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
                    {credit.remainingMonths} von {credit.termMonths} Mon.
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">
                    Nächste Zahlung
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    15.10.2026
                  </span>
                </div>
              </div>

              {/* Buttons für Details und Sondertilgung */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onOpenSubView('kreditdetails')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors cursor-pointer"
                >
                  Tilgungsplan anzeigen
                </button>
                <button
                  onClick={() => setShowSondertilgungModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                >
                  Sondertilgung leisten
                </button>
              </div>
            </div>

            {/* Rechter Bereich: Rückzahlungsfortschritt als Kreisdiagramm */}
            <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 w-full lg:w-72 shrink-0">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
                Rückzahlungsfortschritt
              </h4>

              {/* SVG Donut Progress */}
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                  {/* Background Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-slate-200 dark:stroke-slate-700 fill-none"
                    strokeWidth="14"
                  />
                  {/* Progress Ring */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    className="stroke-emerald-500 fill-none transition-all duration-1000 ease-out"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono-numbers">
                    {progressPercent}%
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Getilgt
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bereits getilgt:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono-numbers">
                    {formatEuro(credit.paidAmount)}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-800/40 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Kein laufender Kredit
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold">
            Sie haben aktuell noch keinen Kredit abgeschlossen
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Nutzen Sie unseren digitalen Kreditrechner weiter unten, um Ihre persönliche Wunschrate von <strong>5.000 € bis 100.000 €</strong> zu berechnen. Für Unternehmen und Selbstständige bieten wir Online-Finanzierungen bis zu <strong>5.000.000 €</strong> an. Die Prüfung erfolgt unverbindlich, schufa-neutral und in Echtzeit.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onOpenSubView('kreditantrag')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Jetzt Kredit beantragen</span>
            </button>
          </div>
        </section>
      )}

      {/* 4. KREDITRECHNER (Manuelle Eingabe & 2% Bank-Kommission) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              NordDeutscheBank Kreditrechner
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manuelle Eingabe ohne Kalender oder Checkboxen · Automatische 2% Bank-Kommission
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Manuelle Eingabefelder (Kein Slider, keine Checkboxen, kein Kalender) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Manuelle Eingabe: Wunschbetrag */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Kreditbetrag (€) *</span>
                {calcAmount > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                    {formatEuro(calcAmount)}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={calcAmountStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCalcAmountStr(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="z.B. 10000"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">
                  €
                </span>
              </div>
            </div>

            {/* Manuelle Eingabe: Laufzeit in Monaten (Max. 240 mois) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Laufzeit in Monaten *</span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Max. 240 Monate (20 Jahre)
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={calcTermStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCalcTermStr(val);
                  }}
                  className={`w-full px-4 py-2.5 pr-16 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm outline-none transition-colors ${
                    isCalcTermExceeded 
                      ? 'border-rose-500 focus:ring-2 focus:ring-rose-500 bg-rose-50/20' 
                      : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                  }`}
                  placeholder="z.B. 48"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">
                  Monate
                </span>
              </div>

              {/* Alerte rouge de dépassement des 240 mois */}
              {isCalcTermExceeded && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-400 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <span>
                    ⚠️ Achtung: Die maximale Kreditlaufzeit beträgt 240 Monate (20 Jahre)! Bitte reduzieren Sie Ihre Angabe.
                  </span>
                </div>
              )}
            </div>

            {/* Manuelle Eingabe: Monatliches Einkommen */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monatliches Nettoeinkommen (€) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={calcIncomeStr}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setCalcIncomeStr(val);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="z.B. 3800"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">
                  € / Monat
                </span>
              </div>
            </div>

            {/* Manuelle Eingabe: Verwendungszweck */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Verwendungszweck (Manuell) *
              </label>
              <input
                type="text"
                value={calcPurpose}
                onChange={(e) => setCalcPurpose(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                placeholder="z.B. Freie Verwendung, Fahrzeugkauf, Renovierung"
              />
            </div>
          </div>

          {/* Berechnungsergebnis mit 2% Bank-Kommission */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg border border-slate-800">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                  Automatische Kreditberechnung
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  2% Bank-Kommission
                </span>
              </div>

              {/* Geschätzte Monatsrate */}
              <div className="mb-5">
                <span className="text-xs text-slate-400 block mb-1">
                  Geschätzte monatliche Rate
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono-numbers">
                  {formatEuro(calculation.monthlyRate)}
                </div>
                <span className="text-[11px] text-slate-400">
                  für {calcTerm} Monate fest vereinbart
                </span>
              </div>

              <div className="space-y-2.5 pt-4 border-t border-white/10 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Beantragter Kreditbetrag:</span>
                  <span className="font-bold text-white font-mono-numbers">{formatEuro(calcAmount)}</span>
                </div>

                {/* 2% Kommissionsgebühr der Bank */}
                <div className="flex justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                  <span>Bank-Kommissionsgebühr (2%):</span>
                  <span className="font-mono text-emerald-400">
                    - {formatEuro(Math.round(calcAmount * 0.02))}
                  </span>
                </div>

                <div className="flex justify-between p-2 rounded-xl bg-white/5 text-white font-bold">
                  <span>Netto-Auszahlung:</span>
                  <span className="font-mono text-white font-extrabold">
                    {formatEuro(calcAmount - Math.round(calcAmount * 0.02))}
                  </span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span>Gesamtrückzahlung:</span>
                  <span className="font-bold text-white font-mono-numbers">{formatEuro(calculation.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="button"
                onClick={handleApplyNow}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <span>Diesen Kredit jetzt beantragen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Einfache 2-Schritt-Prozedur · Deutscher Identitätsnachweis
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ECHTZEIT-MARKTZINSEN & EZB-LEITZINSEN (Google Search Grounding mit gemini-3.5-flash) */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-indigo-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Live-Marktdaten &amp; EZB-Leitzinsen
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Google Search Live
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Echtzeit-Finanzdaten via Google Search Grounding (gemini-3.5-flash)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLiveMarketRates}
            disabled={loadingRates}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-slate-200 transition-colors border border-white/10 cursor-pointer disabled:opacity-50"
            title="Aktualisieren"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRates ? 'animate-spin' : ''}`} />
            <span>{loadingRates ? 'Suchen...' : 'Aktualisieren'}</span>
          </button>
        </div>

        {loadingRates && !marketRates ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-300">
              Google Search Grounding durchsucht aktuelle Finanzquellen...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs leading-relaxed text-slate-200">
              {marketRates?.text || "Aktuelle Marktzinsen werden geladen..."}
            </div>

            {marketRates?.sources && marketRates.sources.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Verifizierte Quellen aus der Google-Suche:
                </span>
                <div className="flex flex-wrap gap-2">
                  {marketRates.sources.map((src, index) => (
                    <a
                      key={index}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-400/20 text-[11px] font-medium transition-all"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate max-w-[260px]">{src.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Sondertilgung Demo Modal */}
      {showSondertilgungModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Sondertilgung leisten
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Bei AURA können Sie jederzeit kostenfreie Sondertilgungen vornehmen, um Ihre Restschuld schneller abzubauen.
            </p>

            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sondertilgungsbetrag
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="100"
                  max={credit?.remainingAmount || 10000}
                  step="100"
                  value={sondertilgungAmount}
                  onChange={(e) => setSondertilgungAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-semibold font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">€</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Maximaler Restbetrag: {formatEuro(credit?.remainingAmount || 0)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowSondertilgungModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleExecuteSondertilgung}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer"
              >
                Jetzt einreichen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
