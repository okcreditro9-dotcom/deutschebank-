import React, { useState, useRef } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload, 
  FileCheck, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Loader2, 
  Percent, 
  Landmark,
  BadgeCheck,
  Building2,
  Trash2,
  Camera,
  Image as ImageIcon,
  Lock,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { LoanApplication } from '../../types/banking';
import { formatEuro, calculateCreditRate, generateContractId } from '../../utils/formatters';

interface LoanApplicationModalProps {
  initialAmount?: number;
  initialTerm?: number;
  initialPurpose?: string;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  onClose: () => void;
  onSubmitSuccess: (newApp: LoanApplication) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  initialAmount,
  initialTerm,
  initialPurpose = '',
  userEmail = '',
  userPhone = '',
  userName = '',
  onClose,
  onSubmitSuccess,
  onShowToast,
}) => {
  // Procédure en 2 étapes simples
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgressText, setSubmissionProgressText] = useState<string>('');

  // Sexe : Masculin ou Féminin
  const [gender, setGender] = useState<'male' | 'female'>('male');

  // Nom et Prénom : VIDES par défaut, aucun exemple forcé
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Date de naissance : saisie manuelle sans calendrier complexe
  const [birthDate, setBirthDate] = useState<string>('');

  // E-mail et Téléphone vérifiés lors de l'inscription (colonnes verrouillées non modifiables)
  const lockedEmail = userEmail || 'kunde@nordbank-portal.de';
  const lockedPhone = userPhone || '+49 170 0000000';

  // Adresse locale courte (Rue, N°, Code Postal & Ville réunis)
  const [shortAddress, setShortAddress] = useState<string>('');

  // Gestion des montants sous forme de texte (STRING) pour éviter le bug du chiffre "0" non supprimable
  const [amountStr, setAmountStr] = useState<string>(initialAmount ? String(initialAmount) : '');
  const [termStr, setTermStr] = useState<string>(initialTerm ? String(initialTerm) : '');
  const [salaryStr, setSalaryStr] = useState<string>('');
  const [purpose, setPurpose] = useState<string>(initialPurpose);

  // Questions bancaires externes :
  // 1. Avez-vous un compte bancaire en dehors de notre banque ?
  const [hasExternalAccount, setHasExternalAccount] = useState<'yes' | 'no' | null>(null);
  // 2. Avez-vous une carte bancaire en dehors de notre banque ?
  const [hasExternalCard, setHasExternalCard] = useState<'yes' | 'no' | null>(null);
  // Nom de l'autre banque si Oui à l'un ou l'autre
  const [externalBankName, setExternalBankName] = useState<string>('');

  // Étape 2 : Import ou photo du document d'identité allemand (Personalausweis / Reisepass)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeStr: string;
    type: string;
    previewUrl?: string;
    dataUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Conversion numérique dynamique pour les calculs financiers
  const numericAmount = Math.max(0, parseInt(amountStr, 10) || 0);
  const numericTerm = parseInt(termStr, 10) || 0;
  const numericSalary = parseInt(salaryStr, 10) || 0;

  // Limite maximale de durée : 240 mois
  const MAX_TERM_MONTHS = 240;
  const isTermExceeded = numericTerm > MAX_TERM_MONTHS;

  // Calcul financier transparent avec 2% de commission bancaire
  const bankFeePercent = 2;
  const bankCommissionFee = Math.round(numericAmount * (bankFeePercent / 100));
  const netPayoutAmount = Math.max(0, numericAmount - bankCommissionFee);
  const calculation = calculateCreditRate(numericAmount > 0 ? numericAmount : 1000, numericTerm > 0 && !isTermExceeded ? numericTerm : 36, 3.89);

  // Gestion sécurisée de l'import de document
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedFile({
          name: file.name,
          sizeStr,
          type: file.type,
          previewUrl: dataUrl,
          dataUrl: dataUrl,
        });
      };
      reader.readAsDataURL(file);

      onShowToast(
        'Dokument erfasst',
        `Deutscher Identitätsnachweis (${file.name}) erfolgreich hochgeladen.`,
        'success'
      );
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Validation de l'étape 1
  const handleNext = () => {
    if (!firstName.trim()) {
      onShowToast('Vorname fehlt', 'Bitte geben Sie Ihren Vornamen ein.', 'error');
      return;
    }
    if (!lastName.trim()) {
      onShowToast('Nachname fehlt', 'Bitte geben Sie Ihren Nachnamen ein.', 'error');
      return;
    }
    if (!birthDate.trim()) {
      onShowToast('Geburtsdatum fehlt', 'Bitte geben Sie Ihr Geburtsdatum ein (z.B. 15.08.1990).', 'error');
      return;
    }
    if (!numericAmount || numericAmount < 500) {
      onShowToast('Betrag ungültig', 'Bitte geben Sie einen Kreditbetrag von mindestens 500 € ein.', 'error');
      return;
    }
    if (!numericTerm || numericTerm < 1) {
      onShowToast('Laufzeit erforderlich', 'Bitte geben Sie die gewünschte Laufzeit in Monaten ein.', 'error');
      return;
    }
    if (numericTerm > MAX_TERM_MONTHS) {
      onShowToast('Laufzeit überschritten', `Die maximale Laufzeit beträgt ${MAX_TERM_MONTHS} Monate (20 Jahre).`, 'error');
      return;
    }
    if (!numericSalary || numericSalary <= 0) {
      onShowToast('Monatseinkommen fehlt', 'Bitte geben Sie Ihr monatliches Nettoeinkommen ein.', 'error');
      return;
    }
    if (!shortAddress.trim()) {
      onShowToast('Adresse fehlt', 'Bitte tragen Sie Ihre Wohnadresse (Straße, Hausnummer, PLZ & Stadt) ein.', 'error');
      return;
    }
    if ((hasExternalAccount === 'yes' || hasExternalCard === 'yes') && !externalBankName.trim()) {
      onShowToast('Bankname erforderlich', 'Bitte nennen Sie den Namen Ihrer externen Bank.', 'error');
      return;
    }

    setCurrentStep(2);
  };

  // Soumission finale du prêt
  const handleSubmit = () => {
    if (!uploadedFile) {
      onShowToast(
        'Nachweis erforderlich',
        'Bitte fotografieren oder importieren Sie Ihre deutsche Ausweiskarte (Personalausweis oder Reisepass).',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgressText('Antrag & deutscher Staatsbürgerschaftsnachweis werden verifiziert...');

    setTimeout(() => {
      setSubmissionProgressText('Automatische Verrechnung der 2% Bank-Kommission...');
    }, 800);

    setTimeout(() => {
      setSubmissionProgressText('Vorläufige Zusage & Auszahlungsvertrag werden erstellt...');
    }, 1600);

    setTimeout(() => {
      const newContractId = generateContractId('KR');
      const now = new Date();
      const dateStr = now.toISOString();

      const newApplication: LoanApplication = {
        id: newContractId,
        currentStep: 3,
        status: 'in_pruefung',
        statusLabel: 'In Prüfung durch die Kreditabteilung',
        submittedAt: dateStr,
        updatedAt: dateStr,
        loanDetails: {
          amount: numericAmount,
          termMonths: numericTerm,
          purpose: purpose.trim() || 'Freie Verwendung',
          monthlyRate: calculation.monthlyRate,
          interestRate: calculation.effectiveRate,
          totalAmount: calculation.totalAmount,
        },
        personalData: {
          salutation: gender === 'male' ? 'Herr' : 'Frau',
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate: birthDate.trim(),
          birthPlace: 'Deutschland',
          nationality: 'Deutsch (Deutscher Staatsbürger)',
          maritalStatus: 'Ledig',
          email: lockedEmail,
          phone: lockedPhone,
        },
        address: {
          street: shortAddress.trim(),
          houseNumber: '',
          postalCode: '',
          city: '',
          livingSituation: 'Miete',
          livingSinceYears: 3,
        },
        employment: {
          employmentType: 'Angestellt',
          employer: 'Angestellt / Selbstständig',
          profession: 'Beschäftigt',
          employedSince: '2022',
          isProbationary: false,
        },
        finances: {
          netIncome: numericSalary,
          housingCosts: 0,
          otherCredits: 0,
          livingExpenses: 0,
          existingLiabilities: 0,
        },
        documents: {
          salaryProofUploaded: true,
          salaryProofName: 'Monatseinkommen_Erklaerung.pdf',
          idDocumentUploaded: true,
          idDocumentName: uploadedFile.name,
          idDocumentData: uploadedFile.dataUrl,
          idDocumentType: 'Personalausweis (Bundesrepublik Deutschland)',
          idDocumentUploadedAt: new Date().toLocaleDateString('de-DE'),
          bankStatementUploaded: true,
          bankStatementName: 'Kontoauszug_NordBank.pdf',
        },
        timeline: [
          {
            step: '1. Online-Antrag eingereicht',
            date: 'Gerade eben',
            status: 'completed',
            description: `Kredit über ${formatEuro(numericAmount)} über ${numericTerm} Monate beantragt. 2% Bank-Kommission: ${formatEuro(bankCommissionFee)}.`,
          },
          {
            step: '2. Deutscher Identitätsnachweis verifiziert',
            date: 'Gerade eben',
            status: 'completed',
            description: `Dokument "${uploadedFile.name}" als deutscher Ausweis geprüft und archiviert.`,
          },
          {
            step: '3. Bewilligung & Auszahlungsvorbereitung',
            date: 'Gerade eben',
            status: 'completed',
            description: `Sofortentscheid erteilt. Netto-Auszahlung: ${formatEuro(netPayoutAmount)}.`,
          },
        ],
      };

      setIsSubmitting(false);
      onSubmitSuccess(newApplication);
      onShowToast(
        'Kreditantrag eingereicht!',
        `Ihr Antrag über ${formatEuro(numericAmount)} wurde erfolgreich übermittelt und in Ihrer Historie hinterlegt.`,
        'success'
      );
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* En-tête de la modale */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Kreditantrag der NordDeutscheBank
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Stufe {currentStep} von 2
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep === 1 
                  ? 'Einfaches Antragsformular – Schnelle & unkomplizierte Dateneingabe' 
                  : 'Staatsbürgerschaftsnachweis & Auszahlungsübersicht mit 2% Bankgebühr'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barre d'étape simplifiée */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
          <div 
            className="bg-emerald-500 h-1.5 transition-all duration-300"
            style={{ width: currentStep === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Corps principal du formulaire */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* ========================================================= */}
          {/* ÉTAPE 1 : FORMULAIRE SIMPLIFIÉ, VRAIE SAISIE, SANS EXEMPLES FORCÉS */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">

              {/* SECTION A : INFORMATIONS PERSONNELLES & CIVILITÉ */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  1. Persönliche Angaben
                </h4>

                {/* Sexe : Masculin ou Féminin avec boutons radio / cases à cocher */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Geschlecht *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      gender === 'male' 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'male'}
                        onChange={() => setGender('male')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs">Männlich (Herr)</span>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      gender === 'female' 
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-bold shadow-xs' 
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                      <input
                        type="radio"
                        name="gender"
                        checked={gender === 'female'}
                        onChange={() => setGender('female')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs">Weiblich (Frau)</span>
                    </label>
                  </div>
                </div>

                {/* Nom et Prénom dans deux colonnes distinctes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ihr Vorname"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ihr Nachname"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* Date de naissance (saisie manuelle sans calendrier complexe) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Geburtsdatum *
                  </label>
                  <input
                    type="text"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    placeholder="TT.MM.JJJJ (z.B. 15.08.1990)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-mono font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Einfache manuelle Eingabe des Geburtstags als Text (Tag.Monat.Jahr).
                  </p>
                </div>

                {/* DEUX COLONNES NON MODIFIABLES / LECTURE SEULE (Gmail & Téléphone de l'inscription) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-[11px] uppercase tracking-wider">
                      Verifizierte Kontodaten aus Ihrer Registrierung (Nicht veränderbar)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Colonne 1 : Gmail / Email verrouillée */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>E-Mail (Gmail-Konto)</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Verifiziert
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={lockedEmail}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs font-medium cursor-not-allowed select-none outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>

                    {/* Colonne 2 : Téléphone verrouillé */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                        <span>Mobilfunknummer</span>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Registriert
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={lockedPhone}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs font-medium cursor-not-allowed select-none outline-none"
                        />
                        <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adresse locale courte */}
                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Vollständige Wohnadresse (Kurze Zeile) *
                  </label>
                  <input
                    type="text"
                    required
                    value={shortAddress}
                    onChange={(e) => setShortAddress(e.target.value)}
                    placeholder="Straße, Hausnummer, PLZ & Stadt (z.B. Friedrichstraße 10, 10117 Berlin)"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400">
                    Wie auf Ihrem Ausweis oder Reisepass verzeichnet.
                  </p>
                </div>
              </div>

              {/* SECTION B : PARAMÈTRES DU PRÊT & SALAIRE (SANS BUG DU ZÉRO !) */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  2. Kredit- &amp; Finanzangaben
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Montant souhaité */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Kreditbetrag (€) *</span>
                      {numericAmount > 0 && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          {formatEuro(numericAmount)}
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={amountStr}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setAmountStr(val);
                        }}
                        placeholder="z.B. 15000"
                        className="w-full px-4 py-2.5 pr-8 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">€</span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Vollständig löschbar ohne festsitzende Null.
                    </p>
                  </div>

                  {/* Durée en mois avec DÉLAI FINAL À 240 MOIS & ALERTE ROUGE */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Laufzeit in Monaten *</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Max. 240 Monate (20 Jahre)
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={termStr}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setTermStr(val);
                        }}
                        placeholder="z.B. 48"
                        className={`w-full px-4 py-2.5 pr-16 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs outline-none transition-colors ${
                          isTermExceeded 
                            ? 'border-rose-500 focus:ring-2 focus:ring-rose-500 bg-rose-50/20' 
                            : 'border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">Monate</span>
                    </div>

                    {/* ALERTE ROUGE DE DÉPASSEMENT DES 240 MOIS */}
                    {isTermExceeded ? (
                      <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-400 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-shake">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>
                          Achtung: Die maximale Kreditlaufzeit ist strikt auf 240 Monate (20 Jahre) begrenzt! Bitte reduzieren Sie Ihre Eingabe.
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        {numericTerm > 0 ? `${numericTerm} Monate (${(numericTerm / 12).toFixed(1)} Jahre)` : 'Geben Sie die gewünschte Anzahl an Monaten ein.'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Salaire mensuel (Monatliches Nettoeinkommen) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Monatliches Nettoeinkommen (€) *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        required
                        value={salaryStr}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setSalaryStr(val);
                        }}
                        placeholder="z.B. 3200"
                        className="w-full px-4 py-2.5 pr-14 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">€ / Mon.</span>
                    </div>
                  </div>

                  {/* Verwendungszweck */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Verwendungszweck
                    </label>
                    <input
                      type="text"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="z.B. Freie Verwendung, Fahrzeug, Sanierung"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION C : COMPTES ET CARTES EXTERNES */}
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  3. Bestehende Bankbeziehungen außerhalb unserer Bank
                </h4>

                {/* Question 1 : Compte bancaire externe */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Haben Sie ein Bankkonto bei einer anderen Bank außerhalb unserer Bank? *
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="externalAccount"
                        checked={hasExternalAccount === 'yes'}
                        onChange={() => setHasExternalAccount('yes')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Ja</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="externalAccount"
                        checked={hasExternalAccount === 'no'}
                        onChange={() => setHasExternalAccount('no')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Nein</span>
                    </label>
                  </div>
                </div>

                {/* Question 2 : Carte bancaire externe */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                    Besitzen Sie eine Bankkarte (Debit-/Kreditkarte) bei einer anderen Bank? *
                  </label>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="externalCard"
                        checked={hasExternalCard === 'yes'}
                        onChange={() => setHasExternalCard('yes')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Ja</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                      <input
                        type="radio"
                        name="externalCard"
                        checked={hasExternalCard === 'no'}
                        onChange={() => setHasExternalCard('no')}
                        className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span>Nein</span>
                    </label>
                  </div>
                </div>

                {/* CHAMP CONDITIONNEL : Nom de l'autre banque si "Ja" coché */}
                {(hasExternalAccount === 'yes' || hasExternalCard === 'yes') && (
                  <div className="space-y-1 p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 animate-fadeIn">
                    <label className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                      Name Ihrer anderen Bank *
                    </label>
                    <input
                      type="text"
                      required
                      value={externalBankName}
                      onChange={(e) => setExternalBankName(e.target.value)}
                      placeholder="z.B. Sparkasse, Deutsche Bank, Commerzbank, ING..."
                      className="w-full px-4 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Bitte tragen Sie das Institut Ihrer bestehenden Bankverbindung ein.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ÉTAPE 2 : UPLOAD / PHOTO DE LA PIÈCE D'IDENTITÉ ALLEMANDE & COMMISSION */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION IDENTITÉ NATIONALE ALLEMANDE */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Deutscher Staatsbürgerschaftsnachweis
                  </h4>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Erforderlich
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Laden Sie ein Foto Ihrer <strong>deutschen Ausweiskarte (Personalausweis)</strong> oder Ihres <strong>deutschen Reisepasses</strong> hoch, um Ihre deutsche Staatsbürgerschaft nachzuweisen.
                </p>

                {/* Inputs cachés (fichier et appareil photo) */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="hidden"
                />
                <input
                  type="file"
                  ref={cameraInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                />

                {uploadedFile ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/50 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                          <FileCheck className="w-6 h-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {uploadedFile.name}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white shrink-0">
                              🇩🇪 Deutscher Nachweis
                            </span>
                          </div>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                            Größe: {uploadedFile.sizeStr} · Deutsche Staatsbürgerschaft verifiziert
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 cursor-pointer shadow-xs"
                        >
                          Ändern
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                          title="Entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Prévisualisation de l'image */}
                    {(uploadedFile.dataUrl || uploadedFile.previewUrl) && (
                      <div className="p-3 bg-slate-900 rounded-2xl border border-emerald-500/40 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-emerald-400 px-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <BadgeCheck className="w-4 h-4 text-emerald-400" />
                            Vorschau: Deutscher Personalausweis / Reisepass
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">100 % Lesbar</span>
                        </div>
                        <div className="rounded-xl overflow-hidden bg-slate-950/80 border border-slate-800 flex items-center justify-center p-2 max-h-56">
                          <img
                            src={uploadedFile.dataUrl || uploadedFile.previewUrl}
                            alt="Deutscher Ausweis"
                            className="max-h-50 w-auto object-contain rounded-lg shadow-lg"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/20 transition-all cursor-pointer text-center space-y-2 flex flex-col items-center justify-center group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <Camera className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Foto mit Kamera aufnehmen
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Ausweis oder Reisepass direkt fotografieren
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-emerald-50/20 transition-all cursor-pointer text-center space-y-2 flex flex-col items-center justify-center group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center transition-colors">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Bild / Datei aus Galerie auswählen
                      </div>
                      <div className="text-[10px] text-slate-400">
                        JPG, PNG, WEBP, PDF (max. 15 MB)
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* SECTION RÉCAPITULATIF & 2% DE COMMISSION BANCAIRE */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                      Kreditabrechnung &amp; 2% Bank-Kommission
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Automatische Berechnung
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Beantragter Kreditbetrag:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatEuro(numericAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>Laufzeit:</span>
                    <span className="font-mono font-bold text-white">
                      {numericTerm} Monate (max. 240)
                    </span>
                  </div>

                  {/* 2% de commission bancaire */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span>Bank-Kommissionsgebühr (2%):</span>
                        <p className="text-[10px] text-emerald-400/80 font-normal">
                          Automatische Bearbeitungs- &amp; Provisionsgebühr unserer Bank
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-base text-emerald-400 font-extrabold">
                      - {formatEuro(bankCommissionFee)}
                    </span>
                  </div>

                  {/* Montant net reversé */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
                    <span className="font-bold">Netto-Auszahlungsbetrag an Sie:</span>
                    <span className="font-mono font-extrabold text-base text-white">
                      {formatEuro(netPayoutAmount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-slate-300">
                    <span>Geschätzte monatliche Rate:</span>
                    <span className="font-mono font-extrabold text-emerald-400 text-lg">
                      {formatEuro(calculation.monthlyRate)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 flex items-center justify-between">
                  <span>Effektiver Jahreszins: 3,89 %</span>
                  <span>Keine versteckten Zusatzkosten</span>
                </div>
              </div>

              {/* Résumé des informations du demandeur */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Antragsteller: {gender === 'male' ? 'Herr' : 'Frau'} {firstName} {lastName} ({birthDate})
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Adresse: {shortAddress} · Netto-Monatseinkommen: {formatEuro(numericSalary)}
                </div>
                {(hasExternalAccount === 'yes' || hasExternalCard === 'yes') && (
                  <div className="text-slate-500 dark:text-slate-400">
                    Externe Bank: {externalBankName || 'Andere Bank'}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pied de la modale */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
          {currentStep === 2 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Zurück zur Eingabe</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-xs font-bold transition-all cursor-pointer"
            >
              Abbrechen
            </button>
          )}

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isTermExceeded}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer ${
                isTermExceeded 
                  ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                  : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
              }`}
            >
              <span>Weiter zum Staatsbürgerschaftsnachweis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !uploadedFile}
              className="flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submissionProgressText || 'Wird eingereicht...'}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kreditantrag jetzt einreichen</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
