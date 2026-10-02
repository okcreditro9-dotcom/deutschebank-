import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Download, 
  Calendar, 
  ChevronRight,
  Sparkles,
  Layers,
  Inbox,
  ArrowLeft
} from 'lucide-react';
import { Transaction } from '../../types/banking';
import { formatEuro } from '../../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  onBack?: () => void;
  onSelectTransaction: (tx: Transaction) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onBack,
  onSelectTransaction,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterTimeframe, setFilterTimeframe] = useState<'all' | 'month' | 'quarter'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle');

  const categories = ['Alle', 'Gehalt', 'Wohnen', 'Lebensmittel', 'Mobilität', 'Freizeit & Shopping', 'Finanzen & Kredit', 'Abonnements'];

  // Filtered transactions
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      // Search
      const matchesSearch = 
        tx.recipientOrSender.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.amount.toString().includes(searchTerm);

      if (!matchesSearch) return false;

      // Type filter
      if (filterType === 'income' && tx.type !== 'income') return false;
      if (filterType === 'expense' && tx.type !== 'expense') return false;

      // Category filter
      if (selectedCategory !== 'Alle' && tx.category !== selectedCategory) return false;

      return true;
    });
  }, [transactions, searchTerm, filterType, filterTimeframe, selectedCategory]);

  // Aggregate stats
  const totalIncome = filtered
    .filter((tx) => tx.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = filtered
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

  const handleExportCsv = () => {
    onShowToast(
      'Export erstellt',
      `Kontoauszug mit ${filtered.length} Buchungen als CSV heruntergeladen.`,
      'success'
    );
  };

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
              Aktivitäten &amp; Buchungen
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Detaillierte Übersicht aller Kontobewegungen und Kartenumsätze
            </p>
          </div>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Exportieren (CSV)</span>
        </button>
      </div>

      {/* Aggregate Balance Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Gefilterte Einnahmen
          </span>
          <span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono-numbers">
            +{formatEuro(totalIncome)}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Gefilterte Ausgaben
          </span>
          <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-mono-numbers">
            -{formatEuro(totalExpense)}
          </span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
            Buchungssaldo
          </span>
          <span className={`text-base sm:text-lg font-bold font-mono-numbers ${
            totalIncome - totalExpense >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
          }`}>
            {formatEuro(totalIncome - totalExpense)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 space-y-4 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Empfänger, Verwendungszweck, Kategorie oder Betrag suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Löschen
            </button>
          )}
        </div>

        {/* Tab Controls: Type & Categories */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Typ-Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Alle
            </button>
            <button
              type="button"
              onClick={() => setFilterType('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'income'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Einnahmen
            </button>
            <button
              type="button"
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Ausgaben
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400">
            {filtered.length} {filtered.length === 1 ? 'Eintrag' : 'Einträge'} gefunden
          </span>
        </div>

        {/* Category horizontal scroll list */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Keine Umsätze gefunden
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Es liegen derzeit keine Buchungen vor. Sobald eine Überweisung oder Kartenzahlung verbucht wird, erscheint diese hier in Ihrer Historie.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((tx) => {
              const isPositive = tx.amount > 0;
              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2.5 -mx-2.5 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isPositive ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {tx.recipientOrSender}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {tx.purpose}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        <span>{tx.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{tx.date}</span>
                        {tx.status === 'ausstehend' && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-amber-700 dark:text-amber-300 font-bold px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-[10px]">
                              {tx.purpose.includes('Kreditantrag') ? 'Kreditantrag in Prüfung' : 'Vorgemerkt'}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-2">
                    <div>
                      <span
                        className={`text-sm font-bold font-mono-numbers block ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {formatEuro(tx.amount)}
                      </span>
                      <span className={`text-[10px] font-semibold ${
                        tx.status === 'gebucht' 
                          ? 'text-slate-400' 
                          : 'text-amber-600 dark:text-amber-400 font-bold'
                      }`}>
                        {tx.status === 'gebucht' ? 'Gebucht' : (tx.purpose.includes('Kreditantrag') ? 'In Prüfung' : 'Ausstehend')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
