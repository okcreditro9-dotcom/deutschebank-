import React, { useState } from 'react';
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
  ArrowLeft
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
  // Kreditrechner interactive state
  const [calcAmount, setCalcAmount] = useState<number>(15000);
  const [calcTerm, setCalcTerm] = useState<number>(48);
  const [calcIncome, setCalcIncome] = useState<number>(3800);
  const [calcPurpose, setCalcPurpose] = useState<string>('Freie Verwendung');
  const [showSondertilgungModal, setShowSondertilgungModal] = useState<boolean>(false);
  const [sondertilgungAmount, setSondertilgungAmount] = useState<number>(1000);

  // Calculate live results
  const calculation = calculateCreditRate(calcAmount, calcTerm, 3.89);

  // Repayment progress calculation
  const totalCredit = credit ? credit.requestedAmount : 0;
  const paidCredit = credit ? credit.paidAmount : 0;
  const progressPercent = totalCredit > 0 ? Math.min(100, Math.round((paidCredit / totalCredit) * 100)) : 0;

  // Circular progress SVG values
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const handleApplyNow = () => {
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
                <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                  {formatEuro(calcAmount)}
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="150000"
                  step="500"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="z.B. 10000"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">
                  €
                </span>
              </div>
            </div>

            {/* Manuelle Eingabe: Laufzeit in Monaten */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Laufzeit in Monaten *</span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {Math.round(calcTerm / 12)} Jahre
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="6"
                  max="120"
                  step="6"
                  value={calcTerm}
                  onChange={(e) => setCalcTerm(Math.max(1, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  placeholder="z.B. 36"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-bold">
                  Monate
                </span>
              </div>
            </div>

            {/* Manuelle Eingabe: Monatliches Einkommen */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Monatliches Nettoeinkommen (€) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="500"
                  max="50000"
                  step="100"
                  value={calcIncome}
                  onChange={(e) => setCalcIncome(Math.max(0, Number(e.target.value)))}
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
