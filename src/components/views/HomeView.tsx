import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Landmark, 
  Send, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Calendar,
  Sparkles,
  ArrowRight,
  Inbox,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { BankAccount, CreditAccount, Transaction, DebitCard as DebitCardType, NavigationTab, SubViewType } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';
import { NordBankLogo } from '../common/NordBankLogo';

interface HomeViewProps {
  account: BankAccount;
  transactions: Transaction[];
  credit?: CreditAccount | null;
  card?: DebitCardType;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenSubView: (view: SubViewType) => void;
  onSelectTransaction: (tx: Transaction) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onRefreshData?: () => Promise<void> | void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  account,
  transactions,
  credit,
  card,
  onNavigateTab,
  onOpenSubView,
  onSelectTransaction,
  onShowToast,
  onRefreshData,
}) => {
  const [hideBalances, setHideBalances] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'6m' | '30d'>('6m');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    if (onRefreshData) {
      await onRefreshData();
    }
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  // Assurer que le client tombe directement et entièrement sur le solde de son compte dès connexion
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  const copyIban = () => {
    navigator.clipboard?.writeText(account.iban.replace(/\s+/g, ''));
    setCopiedIban(true);
    onShowToast('IBAN kopiert', account.iban, 'info');
    setTimeout(() => setCopiedIban(false), 2000);
  };

  // Monthly stats for chart
  const monthlyData = transactions.length === 0
    ? [
        { month: 'Apr', income: 0, expense: 0 },
        { month: 'Mai', income: 0, expense: 0 },
        { month: 'Jun', income: 0, expense: 0 },
        { month: 'Jul', income: 0, expense: 0 },
        { month: 'Aug', income: 0, expense: 0 },
        { month: 'Sep', income: 0, expense: 0 },
      ]
    : [
        { month: 'Apr', income: 4250, expense: 2890 },
        { month: 'Mai', income: 4250, expense: 3120 },
        { month: 'Jun', income: 4500, expense: 3400 },
        { month: 'Jul', income: 4250, expense: 2950 },
        { month: 'Aug', income: 4250, expense: 3200 },
        { month: 'Sep', income: 4985, expense: 3110 },
      ];

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* 1. Hauptbereich: Magnifique Tableau Bleu Noir Pur pour le Solde Bancaire */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#02050E] via-[#050C1D] to-[#010309] text-white p-6 sm:p-8 shadow-2xl shadow-black/90 border border-[#142340]">
        {/* Lueur et reflets bleu nuit profond */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-indigo-950/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <NordBankLogo size={240} />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2.5">
              <NordBankLogo size={24} />
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-white font-sans">
                NordDeutscheBank · Hauptkonto
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-2.5 py-0.5 rounded-full font-black">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verifiziert
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold border border-white/20 transition-all cursor-pointer shadow-xs"
                title="Kontostand aktualisieren"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-white'}`} />
                <span className="hidden sm:inline">{isRefreshing ? 'Wird aktualisiert...' : 'Konto aktualisieren'}</span>
                <span className="sm:hidden">{isRefreshing ? '...' : 'Aktualisieren'}</span>
              </button>

              <button
                onClick={() => setHideBalances(!hideBalances)}
                className="text-slate-300 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/10 cursor-pointer"
                title={hideBalances ? 'Beträge einblenden' : 'Beträge ausblenden'}
              >
                {hideBalances ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Saldo Display: Texture Blanc Pur et Gros */}
          <div className="mb-6">
            <span className="text-xs sm:text-sm font-black text-white uppercase tracking-widest block mb-1.5 drop-shadow-sm">
              Gesamter Kontostand
            </span>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight font-mono-numbers text-white drop-shadow-[0_2px_16px_rgba(255,255,255,0.4)]">
              {hideBalances ? '•••••• €' : formatEuro(account.balance)}
            </div>
          </div>

          {/* Tableau Bleu Noir Pur Détaillé du Solde */}
          <div className="rounded-2xl bg-[#060D1F]/90 backdrop-blur-md border border-[#1A2D52] p-4.5 sm:p-5 mb-6 shadow-inner">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* En Vert Pur et Gros */}
              <div>
                <span className="text-xs text-white font-bold block mb-1">Verfügbares Guthaben</span>
                <span className="text-xl sm:text-2xl font-black text-[#10B981] font-mono-numbers block drop-shadow-[0_2px_10px_rgba(16,185,129,0.4)]">
                  {hideBalances ? '•••• €' : formatEuro(account.availableBalance)}
                </span>
                <span className="text-[11px] text-emerald-300/90 font-medium">Sofort verfügbar</span>
              </div>

              {/* En Jaune Pur et Gros */}
              <div>
                <span className="text-xs text-white font-bold block mb-1">Ausstehende Beträge</span>
                <span className="text-xl sm:text-2xl font-black text-[#FACC15] font-mono-numbers block drop-shadow-[0_2px_10px_rgba(250,204,21,0.4)]">
                  {hideBalances ? '•••• €' : formatEuro(account.pendingBalance)}
                </span>
                <span className="text-[11px] text-yellow-200/90 font-medium">In Wertstellung</span>
              </div>

              {/* En Blanc Pur et Gros */}
              <div>
                <span className="text-xs text-white font-bold block mb-1">Eingeräumter Dispo</span>
                <span className="text-xl sm:text-2xl font-black text-white font-mono-numbers block drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
                  {hideBalances ? '•••• €' : formatEuro(account.dispoLimit)}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">Dispositionsrahmen</span>
              </div>

              {/* En Vert Pur et Gros */}
              <div>
                <span className="text-xs text-white font-bold block mb-1">Guthabenzins p.a.</span>
                <span className="text-xl sm:text-2xl font-black text-[#10B981] font-mono-numbers block drop-shadow-[0_2px_10px_rgba(16,185,129,0.4)]">
                  {account.interestRateDeposit.toFixed(2)} %
                </span>
                <span className="text-[11px] text-emerald-300/90 font-medium">Monatlich gutgeschrieben</span>
              </div>
            </div>
          </div>

          {/* Card Footer: IBAN, BIC and Details Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={copyIban}
                className="flex items-center gap-2 text-xs font-mono font-bold text-white hover:text-blue-100 bg-[#060D1E] hover:bg-[#0A1633] px-3.5 py-2 rounded-xl border border-[#1C2C4E] transition-colors cursor-pointer shadow-sm"
                title="IBAN kopieren"
              >
                <span>{formatIban(account.iban)}</span>
                {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
              </button>
              <span className="text-xs font-mono font-bold text-white bg-[#060D1E] px-3 py-2 rounded-xl border border-[#1C2C4E]">
                BIC: {account.bic}
              </span>
            </div>

            <button
              onClick={() => onOpenSubView('kontodetails')}
              className="flex items-center gap-1.5 text-xs font-black text-[#02050E] bg-white hover:bg-slate-100 px-5 py-2.5 rounded-xl transition-all shadow-xl shadow-black/40 hover:scale-[1.02] active:scale-95 cursor-pointer"
            >
              <span>Details anzeigen</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      </section>

      {/* Informative Bank Card Status Banner */}
      {card && card.status !== 'approved' && (
        <div className={`p-4 sm:p-5 rounded-3xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-sm ${
          card.status === 'none'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            : card.status === 'pending'
            ? 'bg-sky-500/10 border-sky-500/30 text-sky-900 dark:text-sky-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
        }`}>
          <div className="flex items-start gap-3">
            <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${
              card.status === 'none' ? 'text-amber-500' : card.status === 'pending' ? 'text-sky-500' : 'text-rose-500'
            }`} />
            <div className="space-y-0.5">
              <span className="font-extrabold text-sm block">
                {card.status === 'none' && 'Persönliche Bankkarte erforderlich (Mind. 148,00 € Guthaben)'}
                {card.status === 'pending' && 'Bankkarte in Registrierung und Prüfung'}
                {card.status === 'rejected' && 'Bankkarte abgelehnt (Mind. 148,00 € erforderlich)'}
              </span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {card.status === 'none' && 'Es muss sich um Ihre persönliche Bankkarte handeln. Mindestguthaben: 148,00 €. Ohne verknüpfte Karte sind Überweisungen gesperrt.'}
                {card.status === 'pending' && 'Ihre Karte wird aktuell durch die Bank verifiziert. Nach Freigabe werden alle Überweisungsparameter freigeschaltet.'}
                {card.status === 'rejected' && (card.rejectionReason || 'Mindestguthaben nicht erfüllt. Bitte hinterlegen Sie eine gültige persönliche Bankkarte.')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('account')}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-bold text-xs shadow-sm hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer shrink-0"
          >
            {card.status === 'none' ? 'Karte jetzt verknüpfen' : 'Status einsehen'}
          </button>
        </div>
      )}

      {/* 2. Schnellaktionen (Quick Actions) */}
      <section aria-label="Schnellaktionen">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Schnellaktionen
        </h2>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          <button
            onClick={() => onOpenSubView('senden')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
              Geld senden
            </span>
          </button>

          <button
            onClick={() => onOpenSubView('empfangen')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
              Geld empfangen
            </span>
          </button>

          <button
            onClick={() => onNavigateTab('credit')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
              Kredit
            </span>
          </button>

          <button
            onClick={() => onOpenSubView('ueberweisung')}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all active:scale-95 group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 text-center">
              Überweisung
            </span>
          </button>
        </div>
      </section>

      {/* 2b. WhatsApp Kundenservice Direktkontakt */}
      <section className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-sm">
            <MessageCircle className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                Offizieller Berater-Chat · 24/7
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-white">
              WhatsApp Kundenservice
            </h3>
            <p className="text-xs text-emerald-100">
              Direkte Beratung &amp; schnelle Hilfe zu Konto, Karte oder Kredit.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10 shrink-0">
          <button
            onClick={() => onOpenSubView('whatsapp-support')}
            className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Details &amp; QR-Code
          </button>
          <a
            href="https://wa.me/qr/LGKAAD5GCWA4O1"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
            <span>Chat starten</span>
          </a>
        </div>
      </section>

      {/* 3. Kreditübersicht Banner (Mein Kredit oder Kredit-Angebot) */}
      <section className="bg-gradient-to-r from-emerald-950/40 to-slate-900 rounded-3xl p-5 sm:p-6 border border-emerald-800/30 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {credit ? 'NordDeutscheBank Kredit-Status' : 'NordDeutscheBank Wunschkredit'}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold">
              {credit ? credit.title : 'Wunschkredit mit digitalem Sofortentscheid'}
            </h3>
            <p className="text-xs text-slate-300">
              {credit ? (
                <>
                  Restbetrag:{' '}
                  <strong className="text-white font-mono-numbers">{formatEuro(credit.remainingAmount)}</strong>
                  {' '}· Monatliche Rate:{' '}
                  <strong className="text-emerald-300 font-mono-numbers">{formatEuro(credit.monthlyRate)}</strong>
                </>
              ) : (
                'Finanzierungen von 1.000 € bis 50.000 € · Faire Zinsen ab 3,79 % effektiver Jahreszins.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('credit')}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-colors cursor-pointer"
            >
              <span>{credit ? 'Kredit verwalten' : 'Jetzt online beantragen'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Einnahmen-/Ausgaben-Diagramm & Finanzübersicht */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Einnahmen- &amp; Ausgabenanalyse
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monatlicher Cashflow im Vergleich (Girokonto)
            </p>
          </div>

          {/* Filter button toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
            <button
              onClick={() => setChartPeriod('6m')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartPeriod === '6m'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              6 Monate
            </button>
            <button
              onClick={() => setChartPeriod('30d')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                chartPeriod === '30d'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              September 2026
            </button>
          </div>
        </div>

        {/* Bar Chart Visualization */}
        <div className="space-y-4">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
            {monthlyData.map((item) => {
              const maxVal = 5500;
              const incomeHeight = Math.round((item.income / maxVal) * 100);
              const expenseHeight = Math.round((item.expense / maxVal) * 100);

              return (
                <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-full">
                    {/* Income bar */}
                    <div
                      style={{ height: `${incomeHeight}%` }}
                      className="w-2.5 sm:w-4 bg-emerald-500 rounded-t-sm transition-all group-hover:brightness-110"
                      title={`${item.month}: Einnahmen ${formatEuro(item.income)}`}
                    />
                    {/* Expense bar */}
                    <div
                      style={{ height: `${expenseHeight}%` }}
                      className="w-2.5 sm:w-4 bg-slate-400 dark:bg-slate-600 rounded-t-sm transition-all group-hover:brightness-110"
                      title={`${item.month}: Ausgaben ${formatEuro(item.expense)}`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Legend and Summary Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-500" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Einnahmen (Sep: 4.985,50 €)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-slate-400 dark:bg-slate-600" />
                <span className="text-slate-600 dark:text-slate-300 font-medium">Ausgaben (Sep: 3.110,39 €)</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Überschuss +1.875,11 €</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Übersicht der letzten Transaktionen */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Letzte Transaktionen
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Aktuelle Buchungen &amp; Vormerkungen
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Alle anzeigen ({transactions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Inbox className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Bisher keine Umsätze vorhanden
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Ihr Konto ist eröffnet und einsatzbereit. Ihre Umsätze erscheinen hier, sobald erste Buchungen oder Überweisungen eingehen.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => onOpenSubView('empfangen')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm cursor-pointer"
                >
                  Geld empfangen / einzahlen
                </button>
              </div>
            </div>
          ) : (
            recentTransactions.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {tx.recipientOrSender}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.date}</span>
                        {tx.status === 'ausstehend' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-600 dark:text-amber-400 font-medium">Vorgemerkt</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-sm font-bold font-mono-numbers block ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {formatEuro(tx.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {tx.status === 'gebucht' ? 'Erfolgreich' : 'In Bearbeitung'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
