import React from 'react';
import { Bell, Moon, Sun, Shield, ArrowLeft } from 'lucide-react';
import { NordBankLogo } from './common/NordBankLogo';

interface HeaderProps {
  userName: string;
  unreadNotificationsCount: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSecurity: () => void;
  canGoBack?: boolean;
  onGoBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  unreadNotificationsCount,
  darkMode,
  onToggleDarkMode,
  onOpenNotifications,
  onOpenProfile,
  onOpenSecurity,
  canGoBack = false,
  onGoBack,
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'AB';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand & User Greeting */}
        <div className="flex items-center gap-3 min-w-0">
          {canGoBack && onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
              title="Zurück zum Hauptmenü"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zurück</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 dark:from-emerald-600 dark:via-teal-600 dark:to-emerald-500 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0 hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            title="Mein Profil"
          >
            {getInitials(userName)}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <NordBankLogo size={20} />
              <span className="text-xs font-black uppercase tracking-wider text-[#002B9E] dark:text-blue-400 font-sans">
                NordDeutscheBank
              </span>
            </div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              Guten Tag, {userName}
            </h1>
          </div>
        </div>

        {/* Zone 2: Desktop Navigation Status / Trust Marker */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Gesichertes Online-Banking (TLS 256-Bit)</span>
          <span aria-hidden="true">·</span>
          <span>NordBank Direkt</span>
        </div>

        {/* Zone 3: Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Security shortcut */}
          <button
            onClick={onOpenSecurity}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Sicherheit"
          >
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Sicherheit</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Design wechseln"
            title={darkMode ? 'Heller Modus' : 'Dunkler Modus'}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Mitteilungen"
            title="Mitteilungen"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
