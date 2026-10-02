import React, { useState, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  KeyRound, 
  Smartphone, 
  Check, 
  Copy, 
  ArrowDown, 
  ArrowRight, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  MessageCircle,
  Loader2
} from 'lucide-react';
import { UserStore } from '../../data/userStore';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSuccess: (email: string) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  onClose,
  onSuccess,
  onShowToast,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [emailInput, setEmailInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [userFoundName, setUserFoundName] = useState('');

  // Schritt 2: Vertrauenswürdiges Gerät
  const [isTrustedDevice, setIsTrustedDevice] = useState<'yes' | 'no'>('yes');

  // Schritt 3: Sicherheitscode
  const [generatedCode, setGeneratedCode] = useState('');
  const [validUntilTime, setValidUntilTime] = useState('');
  const [remainingSeconds, setRemainingSeconds] = useState(15 * 60);
  const [pastedCodeInput, setPastedCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Schritt 4: Neues Passwort
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Timer für 15 Minuten
  useEffect(() => {
    if (step === 3 && remainingSeconds > 0) {
      const interval = setInterval(() => {
        setRemainingSeconds((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, remainingSeconds]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Schritt 1 : E-Mail prüfen
  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      onShowToast('E-Mail erforderlich', 'Bitte geben Sie Ihre registrierte Gmail / E-Mail-Adresse ein.', 'error');
      return;
    }

    setIsSearching(true);
    try {
      const user = await UserStore.findUserByEmailOrPhone(cleanEmail);
      setIsSearching(false);

      if (!user) {
        onShowToast('Konto nicht gefunden', 'Zu dieser E-Mail-Adresse existiert kein Kundenkonto bei der NordDeutscheBank.', 'error');
        return;
      }

      setUserFoundName(user.name);
      setStep(2);
    } catch (err) {
      setIsSearching(false);
      onShowToast('Verbindungsfehler', 'Die Server-Datenbank konnte nicht abgefragt werden.', 'error');
    }
  };

  // Schritt 2 : Vertrauensgerät bestätigen
  const handleConfirmDevice = () => {
    if (isTrustedDevice === 'no') {
      return;
    }

    // Code anfordern (Einmalig pro 24h, gültig 15 Minuten)
    const codeData = UserStore.getResetSecurityCode(emailInput);
    setGeneratedCode(codeData.code);
    setValidUntilTime(codeData.validUntil);
    setRemainingSeconds(codeData.remainingSeconds);
    setStep(3);
  };

  // Schritt 3 : Code kopieren
  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(generatedCode);
    }
    setCopiedCode(true);
    setPastedCodeInput(generatedCode); // Préremplissage automatique en bonus ergonomique
    onShowToast('Code kopiert!', 'Der Sicherheitscode wurde in die Zwischenablage kopiert.', 'success');
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Schritt 3 : Code verifizieren
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = pastedCodeInput.trim().toUpperCase().replace(/\s+/g, '');
    const cleanExpected = generatedCode.trim().toUpperCase().replace(/\s+/g, '');

    if (remainingSeconds <= 0) {
      onShowToast('Code abgelaufen', 'Der Sicherheitscode ist nach 15 Minuten abgelaufen. Bitte fordern Sie einen neuen an.', 'error');
      return;
    }

    if (cleanInput !== cleanExpected) {
      onShowToast('Ungültiger Code', 'Der eingegebene Sicherheitscode stimmt nicht überein.', 'error');
      return;
    }

    setStep(4);
  };

  // Schritt 4 : Neues Passwort speichern
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = newPin.trim();

    if (!cleanPin || cleanPin.length < 4) {
      onShowToast('Zu kurz', 'Das neue Passwort muss mindestens 4 Zeichen lang sein.', 'error');
      return;
    }

    if (cleanPin !== confirmPin.trim()) {
      onShowToast('Keine Übereinstimmung', 'Die beiden Passwörter stimmen nicht überein.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await UserStore.updateUserPassword(emailInput, cleanPin);
      setIsSaving(false);
      setStep(5);
      onShowToast('Passwort geändert!', 'Ihr neues Passwort wurde erfolgreich in der Datenbank gespeichert.', 'success');
    } catch (err) {
      setIsSaving(false);
      onShowToast('Speicherfehler', 'Das Passwort konnte nicht aktualisiert werden.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Online-Zugang wiederherstellen
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                NordDeutscheBank Sicherheitsprotokoll (Schritt {step} von 4)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* ======================================================== */}
          {/* SCHRITT 1 : GMAIL / E-MAIL DES KONTOS EINGEBEN */}
          {/* ======================================================== */}
          {step === 1 && (
            <form onSubmit={handleVerifyEmail} className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  1. Geben Sie die Gmail / E-Mail Ihres Kontos ein
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Tragen Sie die E-Mail-Adresse ein, mit der Sie Ihr NordDeutscheBank Girokonto eröffnet haben.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Gmail / E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="z.B. ihr-name@gmail.com"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Ihre Identitätsdaten sind durch 256-Bit SSL-Bankverschlüsselung und das deutsche Bankgeheimnis geschützt.
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Konto wird gesucht...</span>
                    </>
                  ) : (
                    <>
                      <span>Weiter zur Geräte-Überprüfung</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SCHRITT 2 : IST DIES IHR VERTRAUENSWÜRDIGES GERÄT? */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    Konto verifiziert: {userFoundName}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white pt-1">
                  2. Geräte-Sicherheitsabfrage
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Zur Verhinderung von unberechtigten Zugriffen bestätigen Sie bitte den Status Ihres aktuellen Smartphones oder Computers.
                </p>
              </div>

              {/* Frage: Est-ce votre appareil de confiance ? */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-black text-slate-800 dark:text-slate-200 block">
                  Ist dies Ihr vertrauenswürdiges Gerät, auf dem Sie Ihr erstes Konto eröffnet haben? *
                </label>

                <div className="space-y-2 pt-1">
                  {/* Option Ja */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isTrustedDevice === 'yes'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="trusted_device_radio"
                      checked={isTrustedDevice === 'yes'}
                      onChange={() => setIsTrustedDevice('yes')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Ja, dies ist mein vertrauenswürdiges Hauptgerät</span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        Ich habe mich auf diesem Gerät bereits zuvor legitimiert.
                      </span>
                    </div>
                  </label>

                  {/* Option Nein */}
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isTrustedDevice === 'no'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    <input
                      type="radio"
                      name="trusted_device_radio"
                      checked={isTrustedDevice === 'no'}
                      onChange={() => setIsTrustedDevice('no')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <div className="text-xs">
                      <span className="font-bold block">Nein, dies ist ein neues oder fremdes Gerät</span>
                      <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                        Aus Sicherheitsgründen ist eine Identitätsfreigabe erforderlich.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Cas Nein : Nachricht für fremdes Gerät */}
              {isTrustedDevice === 'no' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Manuelle Freigabe über Berater-Chat erforderlich</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                    Da es sich um ein neues Gerät handelt, muss Ihr Zugang aus Schutz vor Kontodiebstahl über unseren offiziellen WhatsApp-Support freigeschaltet werden.
                  </p>
                  <a
                    href="https://wa.me/qr/LGKAAD5GCWA4O1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp-Kundenservice kontaktieren</span>
                  </a>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Zurück
                </button>

                <button
                  type="button"
                  onClick={handleConfirmDevice}
                  disabled={isTrustedDevice === 'no'}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>Sicherheitscode generieren</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* SCHRITT 3 : 24H EINMAL-CODE MIT 15-MINUTEN-TIMER & KOPIER-PFEIL */}
          {/* ======================================================== */}
          {step === 3 && (
            <form onSubmit={handleVerifyCode} className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  3. Einmaliger 24h-Sicherheitscode
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Dieser Sicherheitscode wird <strong>nur einmal alle 24 Stunden generiert</strong> und ist für <strong>15 Minuten gültig</strong>.
                </p>
              </div>

              {/* Countdown-Timer */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Code-Gültigkeit:
                </span>
                <span className="font-mono font-black text-emerald-700 dark:text-emerald-300 text-sm">
                  {formatTimer(remainingSeconds)} (bis {validUntilTime} Uhr)
                </span>
              </div>

              {/* Großer Code-Anzeigebereich mit Kopieren-Button */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-slate-800 shadow-lg space-y-3 text-center">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">
                  Ihr persönlicher Autorisierungscode
                </span>

                <div className="text-3xl sm:text-4xl font-mono font-black tracking-widest text-emerald-400 select-all py-1">
                  {generatedCode}
                </div>

                <div className="flex justify-center pt-1">
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs transition-colors border border-white/20 cursor-pointer shadow-xs"
                  >
                    {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedCode ? 'In Zwischenablage kopiert!' : 'Code hier kopieren'}</span>
                  </button>
                </div>
              </div>

              {/* PFEIL & HINWEISTEXT ZUM EINFÜGEN */}
              <div className="flex flex-col items-center justify-center text-center space-y-1 py-1">
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center animate-bounce">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kopieren Sie den Code oben und fügen Sie ihn hier unten ein:
                </p>
              </div>

              {/* Eingabefeld für den eingefügten Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sicherheitscode hier einfügen *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={pastedCodeInput}
                    onChange={(e) => setPastedCodeInput(e.target.value)}
                    placeholder="z.B. NDB-123456"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 outline-none uppercase shadow-xs"
                  />
                  {pastedCodeInput.trim().toUpperCase() === generatedCode.trim().toUpperCase() && (
                    <span className="absolute right-3 top-3 text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ← Zurück
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Code bestätigen</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SCHRITT 4 : NEUES PASSWORT / NEUEN PIN FESTLEGEN */}
          {/* ======================================================== */}
          {step === 4 && (
            <form onSubmit={handleUpdatePassword} className="space-y-5 animate-fadeIn">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  4. Neues Passwort / Online-PIN festlegen
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Definieren Sie Ihr neues Passwort. Dieses wird sofort in der zentralen Bankdatenbank aktualisiert und ist für alle zukünftigen Anmeldungen gültig.
                </p>
              </div>

              <div className="space-y-3">
                {/* Neues Passwort */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Neues Passwort / Online-PIN *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value)}
                      placeholder="Mindestens 4 Zeichen / Ziffern"
                      className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Passwort wiederholen */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Neues Passwort bestätigen *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value)}
                    placeholder="Gleiches Passwort wiederholen"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-medium text-xs focus:ring-2 focus:ring-emerald-500 outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Sobald Sie bestätigen, wird dieses Passwort in Ihrem Cloud-Konto gespeichert. Sie verlieren zu keinem Zeitpunkt den Zugriff auf Ihr Konto oder Ihr Guthaben.
                </span>
              </div>

              {/* Speichern Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Datenbank wird aktualisiert...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Passwort jetzt dauerhaft speichern</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ======================================================== */}
          {/* SCHRITT 5 : ERFOLGSBESTÄTIGUNG */}
          {/* ======================================================== */}
          {step === 5 && (
            <div className="text-center space-y-4 py-4 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Passwort erfolgreich geändert!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Ihr neues Passwort ist ab sofort aktiv. Sie können sich ab jetzt jederzeit mit Ihrer E-Mail / Telefonnummer und diesem neuen Passwort anmelden.
                </p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onSuccess(emailInput);
                    onClose();
                  }}
                  className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Jetzt mit neuem Passwort anmelden
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
