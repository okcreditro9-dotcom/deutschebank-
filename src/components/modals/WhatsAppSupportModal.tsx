import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Copy, 
  Check, 
  CheckCircle2,
  Sparkles,
  QrCode,
  AlertCircle
} from 'lucide-react';

interface WhatsAppSupportModalProps {
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const WhatsAppSupportModal: React.FC<WhatsAppSupportModalProps> = ({ onClose, onShowToast }) => {
  const WHATSAPP_URL = 'https://wa.me/qr/LGKAAD5GCWA4O1';
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(WHATSAPP_URL);
    }
    setCopied(true);
    onShowToast('WhatsApp-Link kopiert', WHATSAPP_URL, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDirectRedirect = () => {
    window.location.href = WHATSAPP_URL;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header mit Zurück-Button oben links */}
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
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Kundenservice Online
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                WhatsApp Kundenservice
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
          {/* Main Hero Card for WhatsApp */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-xl relative overflow-hidden space-y-4">
            <div className="absolute right-0 top-0 translate-x-6 -translate-y-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-md shrink-0">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                      Offizieller NordDeutscheBank Kundenservice
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 inline" />
                  </div>
                  <h4 className="text-base sm:text-lg font-black text-white">
                    Direkt-Chat mit Berater
                  </h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-emerald-500/30 text-emerald-100 text-[10px] font-bold border border-emerald-400/40">
                24/7 Aktiv
              </span>
            </div>

            <p className="text-xs text-emerald-100 leading-relaxed relative z-10">
              Haben Sie Fragen zu Ihrer <strong>persönlichen Bankkarte</strong>, der <strong>Kontoeröffnung</strong>, <strong>Überweisungen</strong> oder <strong>Kreditanträgen</strong>? Unser Kundenservice-Team betreut Sie direkt in WhatsApp.
            </p>

            {/* Prominent Primary Redirect Button */}
            <div className="space-y-2 pt-1 relative z-10">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-emerald-50 active:scale-[0.99] text-emerald-800 font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer text-center"
              >
                <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                <span>Auf WhatsApp chatten</span>
                <ExternalLink className="w-4 h-4 text-emerald-600 ml-1" />
              </a>

              <button
                type="button"
                onClick={handleDirectRedirect}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700/60 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Direkte Weiterleitung im selben Fenster</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* QR Code & Direct Link Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
            <div className="flex items-center gap-2">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                QR-Code mit dem Smartphone scannen
              </h5>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Simulated QR Code representation with WhatsApp icon center */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                <div className="w-32 h-32 bg-slate-950 p-2 rounded-xl flex items-center justify-center relative">
                  <div className="w-full h-full bg-white rounded-lg flex items-center justify-center relative p-1">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                      {/* Matrix patterns */}
                      <rect x="0" y="0" width="28" height="28" fill="currentColor" rx="2" />
                      <rect x="4" y="4" width="20" height="20" fill="white" rx="1" />
                      <rect x="8" y="8" width="12" height="12" fill="currentColor" rx="1" />

                      <rect x="72" y="0" width="28" height="28" fill="currentColor" rx="2" />
                      <rect x="76" y="4" width="20" height="20" fill="white" rx="1" />
                      <rect x="80" y="8" width="12" height="12" fill="currentColor" rx="1" />

                      <rect x="0" y="72" width="28" height="28" fill="currentColor" rx="2" />
                      <rect x="4" y="76" width="20" height="20" fill="white" rx="1" />
                      <rect x="8" y="80" width="12" height="12" fill="currentColor" rx="1" />

                      {/* Random data dots */}
                      <rect x="34" y="10" width="6" height="6" fill="currentColor" />
                      <rect x="46" y="14" width="6" height="6" fill="currentColor" />
                      <rect x="58" y="8" width="6" height="6" fill="currentColor" />

                      <rect x="10" y="34" width="6" height="6" fill="currentColor" />
                      <rect x="18" y="46" width="6" height="6" fill="currentColor" />
                      <rect x="6" y="58" width="6" height="6" fill="currentColor" />

                      <rect x="34" y="34" width="32" height="32" fill="#10b981" rx="6" />

                      <rect x="74" y="36" width="6" height="6" fill="currentColor" />
                      <rect x="86" y="46" width="6" height="6" fill="currentColor" />
                      <rect x="78" y="58" width="6" height="6" fill="currentColor" />

                      <rect x="36" y="76" width="6" height="6" fill="currentColor" />
                      <rect x="48" y="86" width="6" height="6" fill="currentColor" />
                      <rect x="60" y="78" width="6" height="6" fill="currentColor" />
                      <rect x="82" y="82" width="12" height="12" fill="currentColor" rx="2" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1 text-center sm:text-left">
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Öffnen Sie Ihre Smartphone-Kamera oder die WhatsApp-App und halten Sie die Linse auf den Code, um die Konversation sofort zu starten.
                </p>

                <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate flex-1 select-all">
                    {WHATSAPP_URL}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] transition-colors cursor-pointer shrink-0"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Kopiert' : 'Kopieren'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Vorteile & Servicezeiten */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Schnelle Antwortzeit</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  In der Regel antwortet unser Berater-Team innerhalb weniger Minuten.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Persönliche Hilfe</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Individuelle Beratung zu Konto, Karte, Dispo und Kreditvorhaben.
                </p>
              </div>
            </div>
          </div>

          {/* Wichtiger Sicherheitshinweis */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold text-xs">Wichtiger Sicherheitshinweis:</p>
              <p className="text-[11px] leading-relaxed">
                Unser Bankberater wird Sie im WhatsApp-Chat <strong>niemals</strong> nach Ihrer geheimen 5-stelligen App-PIN oder Ihren Online-Banking-Passwörtern fragen. Geben Sie vertrauliche Zugangsdaten niemals weiter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
