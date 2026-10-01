import React, { useState } from 'react';
import { X, Calendar, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { StandingOrder } from '../../types/banking';
import { formatEuro, formatIban } from '../../utils/formatters';

interface StandingOrdersModalProps {
  standingOrders: StandingOrder[];
  onClose: () => void;
  onAddStandingOrder: (order: StandingOrder) => void;
  onDeleteStandingOrder: (id: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const StandingOrdersModal: React.FC<StandingOrdersModalProps> = ({
  standingOrders,
  onClose,
  onAddStandingOrder,
  onDeleteStandingOrder,
  onShowToast,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [iban, setIban] = useState('');
  const [purpose, setPurpose] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState(1);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount.replace(',', '.'));
    if (!recipient || !iban || isNaN(num) || num <= 0) {
      onShowToast('Ungültige Eingabe', 'Bitte alle Pflichtfelder ausfüllen.', 'error');
      return;
    }

    const newOrder: StandingOrder = {
      id: `so-${Date.now()}`,
      recipient,
      iban: iban.toUpperCase(),
      purpose: purpose || 'Dauerauftrag',
      amount: num,
      interval: 'monatlich',
      executionDay: day,
      nextExecution: `01.10.2026`,
    };

    onAddStandingOrder(newOrder);
    onShowToast('Dauerauftrag angelegt', `${recipient} mit ${formatEuro(num)} monatlich gespeichert.`, 'success');
    setShowAddForm(false);
    setRecipient('');
    setIban('');
    setPurpose('');
    setAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={showAddForm ? () => setShowAddForm(false) : onClose}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zurück</span>
            </button>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Zahlungsübersicht
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Daueraufträge &amp; Lastschriften
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
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Aktive Daueraufträge ({standingOrders.length})
            </span>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Neuer Dauerauftrag</span>
              </button>
            )}
          </div>

          {showAddForm ? (
            <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
              <h4 className="font-bold text-slate-900 dark:text-white">Neuen Dauerauftrag einrichten</h4>
              
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Empfänger</label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="Empfängername"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">IBAN</label>
                <input
                  type="text"
                  required
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  placeholder="DE..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Monatlicher Betrag (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono-numbers"
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ausführungstag</label>
                  <select
                    value={day}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value={1}>Jeweils zum 1. des Monats</option>
                    <option value={15}>Jeweils zum 15. des Monats</option>
                    <option value={28}>Jeweils zum Monatsende</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Verwendungszweck</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  placeholder="z. B. Miete oder Sparplan"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold"
                >
                  Speichern
                </button>
              </div>
            </form>
          ) : null}

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {standingOrders.map((order) => (
              <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {order.recipient}
                    </p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {order.purpose} · {order.interval} (zum {order.executionDay}.)
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Nächste Ausführung: {order.nextExecution}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0 flex items-center gap-3">
                  <span className="font-bold text-slate-900 dark:text-white font-mono-numbers">
                    {formatEuro(order.amount)}
                  </span>
                  <button
                    onClick={() => {
                      onDeleteStandingOrder(order.id);
                      onShowToast('Dauerauftrag gelöscht', `${order.recipient} wurde entfernt.`, 'info');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
