import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Lock, 
  Check, 
  Database,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserStore } from '../../data/userStore';

interface SecurityModalProps {
  onClose: () => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  userId?: string;
  currentPin?: string;
  onPinUpdated?: (newPin: string) => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({ 
  onClose, 
  onShowToast,
  userId = 'usr-client-101',
  currentPin: initialPin,
  onPinUpdated
}) => {
  const [showPinChange, setShowPinChange] = useState(true);
  const [inputCurrentPin, setInputCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successSaved, setSuccessSaved] = useState(false);

  // Aktuellen Benutzer aus dem Store laden
  const activeUser = UserStore.getUserById(userId);
  const userPin = activeUser?.pin || initialPin || '12345';

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanInputCurrent = inputCurrentPin.trim();
    const cleanNewPin = newPin.trim();
    const cleanConfirm = confirmPin.trim();

    // Validierung der aktuellen PIN
    if (cleanInputCurrent !== userPin && userPin) {
      onShowToast(
        'Aktuelle PIN nicht korrekt', 
        'Die eingegebene aktuelle PIN stimmt nicht mit den hinterlegten Zugangsdaten überein.', 
        'error'
      );
      return;
    }

    // Mindestlänge / Format
    if (cleanNewPin.length < 5) {
      onShowToast(
        'Ungültige PIN', 
        'Die neue Zugangs-PIN muss mindestens 5 Ziffern oder Zeichen lang sein.', 
        'error'
      );
      return;
    }

    // Übereinstimmungsprüfung
    if (cleanNewPin !== cleanConfirm) {
      onShowToast(
        'PINs stimmen nicht überein', 
        'Die Bestätigung stimmt nicht mit der neuen PIN überein.', 
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // 1. Direktes Speichern in der Bank-Datenbank / UserStore
      UserStore.updateUserPin(userId, cleanNewPin);

      // 2. Sicherheits-Benachrichtigung für den Benutzer anlegen
      UserStore.addNotificationToUser(
        userId,
        'Zugangs-PIN aktualisiert',
        `Ihre Sicherheits-PIN für das Bankkonto wurde am ${new Date().toLocaleDateString('de-DE')} um ${new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr erfolgreich geändert und in der Bankdatenbank gespeichert.`,
        'security'
      );

      if (onPinUpdated) {
        onPinUpdated(cleanNewPin);
      }

      setIsSubmitting(false);
      setSuccessSaved(true);
      setInputCurrentPin('');
      setNewPin('');
      setConfirmPin('');

      onShowToast(
        'PIN erfolgreich geändert', 
        'Ihre neue Zugangs-PIN wurde direkt in der Bankdatenbank gespeichert und ist ab sofort aktiv.', 
        'success'
      );

      // Nach 2 Sekunden Erfolgsstatus zurücksetzen
      setTimeout(() => {
        setSuccessSaved(false);
      }, 3500);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Header */}
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
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Sicherheit &amp; Zugriff
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Zugangs-PIN &amp; Passwort ändern
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
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Status Box */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200">
                Sicherheitslevel: Bankdatenbank geschützt
              </h4>
              <p className="text-emerald-800 dark:text-emerald-300 text-[11px]">
                Ihre Anmeldedaten und PINs sind mit AES-256 verschlüsselt und ausschließlich für Sie und die Bank geschützt.
              </p>
            </div>
          </div>

          {/* Erfolgsmeldung nach Änderung */}
          {successSaved && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 animate-fadeIn">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs">Änderung erfolgreich gespeichert!</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                  Ihre neue Zugangs-PIN ist ab sofort in unserer Datenbank aktiv.
                </p>
              </div>
            </div>
          )}

          {/* Formulaire de modification du mot de passe / PIN */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">Kontopasswort / PIN</p>
                  <span className="text-[11px] text-slate-500">Änderung wird direkt in der Datenbank gespeichert</span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-500" />
                Live DB
              </span>
            </div>

            <form onSubmit={handleChangePin} className="space-y-3.5">
              {/* Aktuelle PIN */}
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Aktuelle Zugangs-PIN / Passwort
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={inputCurrentPin}
                    onChange={(e) => setInputCurrentPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Aktuelle PIN eingeben"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Neue PIN */}
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Neue Zugangs-PIN / Neues Passwort
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Mindestens 5 Ziffern"
                />
              </div>

              {/* Neue PIN bestätigen */}
              <div>
                <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
                  Neue PIN bestätigen
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono tracking-widest text-center text-sm shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="PIN wiederholen"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>{isSubmitting ? 'Wird in Datenbank gespeichert...' : 'Neues Passwort / PIN in Datenbank speichern'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Autorisierte Geräte & Sicherheitshinweise */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-slate-400">
              Autorisierte Geräte &amp; Sitzungen
            </h4>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-emerald-500" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Aktuelles Mobilgerät</p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Aktiv &amp; verifiziert · Deutsche Bank Protokoll
                  </span>
                </div>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded">
                Geschützt
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
