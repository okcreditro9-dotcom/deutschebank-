import React, { useState } from 'react';
import { 
  User, 
  Settings, 
  Shield, 
  Lock, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  Globe, 
  Moon, 
  Sun, 
  Check, 
  Mail,
  Phone,
  CreditCard,
  ArrowLeft,
  MessageCircle
} from 'lucide-react';
import { SubViewType } from '../../types/banking';
import { ProfilePromoVideo } from '../profile/ProfilePromoVideo';

interface ProfileViewProps {
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onBack?: () => void;
  onOpenSubView: (view: SubViewType) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onLogout?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName = 'Maximilian Weber',
  userEmail = 'kunde@aura-bank.de',
  userPhone = '+49 171 8923410',
  darkMode,
  onToggleDarkMode,
  onBack,
  onOpenSubView,
  onShowToast,
  onLogout,
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {onBack && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700"
            title="Zurück zur Übersicht"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Zurück zur Übersicht</span>
          </button>
        </div>
      )}

      {/* 1. Profil-Header-Karte */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shrink-0">
            {initials}
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {userName}
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Verifiziertes Bankkonto
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Deutsche Bank AG · Taunusanlage 12, Frankfurt am Main
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {userEmail}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {userPhone}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. OFFZIELLER FINANZFILM & ANALYSE DER NORDDEUTSCHEBANK */}
      <ProfilePromoVideo 
        onShowToast={onShowToast}
      />

      {/* 3. EINZIGER OFFIZIELLER WHATSAPP-WEITERLEITUNGS-BUTTON */}
      <a
        href="https://wa.me/qr/LGKAAD5GCWA4O1"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-lg shadow-emerald-950/20 flex items-center justify-between transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
            <MessageCircle className="w-6 h-6 fill-white" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-white">
                Offizieller WhatsApp-Kundenservice
              </span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border border-white/20">
                Direkt-Chat 24/7
              </span>
            </div>
            <p className="text-[11px] text-emerald-100 font-normal">
              Klicken Sie hier für die sofortige Verbindung zu Ihrem Berater der NordDeutscheBank
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform shrink-0" />
      </a>

      {/* 4. Einstellungen & Darstellung: NUR TAG- & NACHTMODUS */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Einstellungen &amp; Darstellung
        </h4>

        {/* Tag- & Nachtmodus (1-Klick-Umschaltung für alle Seiten) */}
        <div 
          onClick={onToggleDarkMode}
          className="py-3 px-3.5 -mx-1 rounded-2xl flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shadow-xs ${
              darkMode 
                ? 'bg-indigo-950/70 text-indigo-400 border border-indigo-800/50' 
                : 'bg-amber-100/80 text-amber-600 border border-amber-200'
            }`}>
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-amber-500 fill-amber-400/30" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {darkMode ? 'Nachtmodus (Dunkel)' : 'Tagmodus (Hell - Standard)'}
              </p>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {darkMode ? 'Alle Seiten und Menüs im augenschonenden Nacht-Design' : 'Alle Seiten im hellen, klaren Tag-Design'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleDarkMode();
            }}
            aria-label="Tag- oder Nachtmodus umschalten"
            className={`w-13 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 shadow-inner ${
              darkMode ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200" />
          </button>
        </div>
      </section>

      {/* 5. Sicherheit & Hilfe */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-1">
          Sicherheit &amp; Services
        </h4>

        {/* Sicherheit & Zugangs-PIN */}
        <button
          onClick={() => onOpenSubView('sicherheit')}
          className="w-full py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group text-left border-b border-slate-100 dark:border-slate-800/70 pb-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Sicherheit &amp; Zugangs-PIN</p>
              <span className="text-[11px] text-slate-400">PIN &amp; Passwort ändern (direkte Datenbankspeicherung)</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Hilfe & FAQ */}
        <button
          onClick={() => onOpenSubView('hilfe')}
          className="w-full py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer group text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">Hilfe &amp; Kundenservice</p>
              <span className="text-[11px] text-slate-400">Häufige Fragen (FAQ), Bankgeheimnis &amp; WhatsApp-Support</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </section>

      {/* 6. Abmelde-Button */}
      <div className="pt-2">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200/80 dark:border-rose-900/50 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sitzung beenden / Abmelden</span>
        </button>
      </div>

      {/* Logout-Bestätigung Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">
                Sitzung wirklich beenden?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sie werden sicher vom AURA Online-Banking abgemeldet.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Abbrechen
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-xs text-white transition-colors cursor-pointer shadow-md shadow-rose-900/20"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
