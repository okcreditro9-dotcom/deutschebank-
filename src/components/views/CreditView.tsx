import React, { useState, useRef } from 'react';
import { 
  Landmark, 
  Calendar, 
  Percent, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  ChevronRight,
  ChevronLeft,
  Info,
  DollarSign,
  ArrowLeft,
  Check,
  ShieldCheck,
  Lock,
  AlertTriangle,
  BadgeCheck,
  Building2,
  Trash2,
  Camera,
  Image as ImageIcon,
  FileCheck,
  Loader2,
  CreditCard
} from 'lucide-react';
import { CreditAccount, LoanApplication, SubViewType } from '../../types/banking';
import { formatEuro, calculateCreditRate, generateContractId } from '../../utils/formatters';

interface CreditViewProps {
  credit?: CreditAccount | null;
  application?: LoanApplication | null;
  userEmail?: string;
  userPhone?: string;
  userName?: string;
  onBack?: () => void;
  onOpenSubView: (view: SubViewType) => void;
  onSubmitSuccess?: (newApp: LoanApplication) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const CreditView: React.FC<CreditViewProps> = ({
  credit,
  application,
  userEmail = '',
  userPhone = '',
  userName = '',
  onBack,
  onOpenSubView,
  onSubmitSuccess,
  onShowToast,
}) => {
  // Procédure directe en 2 étapes pour la demande de crédit en ligne (aucune page intermédiaire fictive)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgressText, setSubmissionProgressText] = useState<string>('');

  // Mode pour les clients ayant déjà un crédit : peuvent basculer entre l'aperçu et une nouvelle demande
  const hasActiveCredit = Boolean(credit || (application && application.status === 'genehmigt'));
  const [showApplicationForm, setShowApplicationForm] = useState<boolean>(!hasActiveCredit);

  // Étape 1 : Données personnelles
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>('');

  // Coordonnées vérifiées non modifiables issues de l'inscription
  const lockedEmail = userEmail || 'kunde@nordbank-portal.de';
  const lockedPhone = userPhone || '+49 170 0000000';

  // Adresse courte
  const [shortAddress, setShortAddress] = useState<string>('');

  // Paramètres du prêt (states en STRING pour éliminer le bug du chiffre 0)
  const [amountStr, setAmountStr] = useState<string>('15000');
  const [termStr, setTermStr] = useState<string>('48');
  const [salaryStr, setSalaryStr] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Freie Verwendung');

  // Relations bancaires externes
  const [hasExternalAccount, setHasExternalAccount] = useState<'yes' | 'no' | null>(null);
  const [hasExternalCard, setHasExternalCard] = useState<'yes' | 'no' | null>(null);
  const [externalBankName, setExternalBankName] = useState<string>('');

  // Étape 2 : Justificatif de citoyenneté allemande (Personalausweis ou Reisepass)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeStr: string;
    type: string;
    previewUrl?: string;
    dataUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Conversions numériques
  const numericAmount = Math.max(0, parseInt(amountStr, 10) || 0);
  const numericTerm = parseInt(termStr, 10) || 0;
  const numericSalary = parseInt(salaryStr, 10) || 0;

  // Limite maximale autorisée : 240 mois (20 ans)
  const MAX_TERM_MONTHS = 240;
  const isTermExceeded = numericTerm > MAX_TERM_MONTHS;

  // Calculs financiers avec commission de 2%
  const bankFeePercent = 2;
  const bankCommissionFee = Math.round(numericAmount * (bankFeePercent / 100));
  const netPayoutAmount = Math.max(0, numericAmount - bankCommissionFee);
  const calculation = calculateCreditRate(
    numericAmount > 0 ? numericAmount : 1000, 
    numericTerm > 0 && !isTermExceeded ? numericTerm : 36, 
    3.89
  );

  // Gestion du fichier / photo d'identité
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
        `Deutscher Identitätsnachweis (${file.name}) erfolgreich geladen.`,
        'success'
      );
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Passage de l'étape 1 à l'étape 2
  const handleNextStep = () => {
    if (!firstName.trim()) {
      onShowToast('Vorname fehlt', 'Bitte tragen Sie Ihren Vornamen ein.', 'error');
      return;
    }
    if (!lastName.trim()) {
      onShowToast('Nachname fehlt', 'Bitte tragen Sie Ihren Nachnamen ein.', 'error');
      return;
    }
    if (!birthDate.trim()) {
      onShowToast('Geburtsdatum fehlt', 'Bitte tragen Sie Ihr Geburtsdatum ein (z.B. 15.08.1990).', 'error');
      return;
    }
    if (!numericAmount || numericAmount < 500) {
      onShowToast('Betrag ungültig', 'Der Mindestbetrag für ein Darlehen beträgt 500 €.', 'error');
      return;
    }
    if (!numericTerm || numericTerm < 1) {
      onShowToast('Laufzeit erforderlich', 'Bitte geben Sie die Laufzeit in Monaten ein.', 'error');
      return;
    }
    if (numericTerm > MAX_TERM_MONTHS) {
      onShowToast('Laufzeit überschritten', `Die maximale Laufzeit beträgt ${MAX_TERM_MONTHS} Monate (20 Jahre).`, 'error');
      return;
    }
    if (!numericSalary || numericSalary <= 0) {
      onShowToast('Einkommen fehlt', 'Bitte geben Sie Ihr monatliches Nettoeinkommen ein.', 'error');
      return;
    }
    if (!shortAddress.trim()) {
      onShowToast('Adresse fehlt', 'Bitte geben Sie Ihre Wohnadresse ein.', 'error');
      return;
    }
    if ((hasExternalAccount === 'yes' || hasExternalCard === 'yes') && !externalBankName.trim()) {
      onShowToast('Bankname erforderlich', 'Bitte nennen Sie den Namen Ihrer externen Bank.', 'error');
      return;
    }

    setCurrentStep(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Soumission finale du prêt en ligne
  const handleSubmitApplication = () => {
    if (!uploadedFile) {
      onShowToast(
        'Nachweis erforderlich',
        'Bitte fotografieren oder laden Sie Ihre deutsche Ausweiskarte (Personalausweis oder Reisepass) hoch.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgressText('Antrag & deutscher Staatsbürgerschaftsnachweis werden verifiziert...');

    setTimeout(() => {
      setSubmissionProgressText('Automatische Verrechnung der 2% Bank-Kommission...');
    }, 700);

    setTimeout(() => {
      setSubmissionProgressText('Vorläufige Zusage & Auszahlungsvertrag werden erstellt...');
    }, 1400);

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
      setShowApplicationForm(false);
      if (onSubmitSuccess) {
        onSubmitSuccess(newApplication);
      }
      onShowToast(
        'Kreditantrag eingereicht!',
        `Ihr Antrag über ${formatEuro(numericAmount)} wurde übermittelt und in Ihrer Historie hinterlegt.`,
        'success'
      );
    }, 2100);
  };

  // Progression Donut si crédit déjà existant
  const totalCredit = credit ? credit.requestedAmount : 0;
  const paidCredit = credit ? credit.paidAmount : 0;
  const progressPercent = totalCredit > 0 ? Math.min(100, Math.round((paidCredit / totalCredit) * 100)) : 0;
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn max-w-4xl mx-auto">
      {/* En-tête de section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="w-9 h-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Zurück"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Online-Kredit der NordDeutscheBank</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direkte Kreditbeantragung in 2 einfachen Schritten mit Sofortentscheid
            </p>
          </div>
        </div>

        {hasActiveCredit && (
          <button
            type="button"
            onClick={() => setShowApplicationForm(!showApplicationForm)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-sm"
          >
            {showApplicationForm ? 'Laufenden Kredit anzeigen' : 'Neuen Kredit beantragen'}
          </button>
        )}
      </div>

      {/* CAS A : LE CLIENT A UN CRÉDIT EN COURS ET VEUT CONSULTER SON ÉTAT */}
      {hasActiveCredit && !showApplicationForm && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Laufender Kreditvertrag
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {credit?.title || application?.loanDetails.purpose || 'Ratenkredit'}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Kreditbetrag</span>
              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {formatEuro(credit?.requestedAmount || application?.loanDetails.amount || 0)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Monatliche Rate</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {formatEuro(credit?.monthlyRate || application?.loanDetails.monthlyRate || 0)}
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Laufzeit</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                {credit?.termMonths || application?.loanDetails.termMonths || 0} Monate
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 block mb-1">Status</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5 mt-1">
                <CheckCircle2 className="w-4 h-4" /> Bewilligt &amp; Aktiv
              </span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setShowApplicationForm(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Weiteren Kredit beantragen</span>
            </button>
          </div>
        </section>
      )}

      {/* CAS B : FORMULAIRE DE CRÉDIT DIRECT EN 2 ÉTAPES (AUCUNE PAGE FICTIVE) */}
      {(!hasActiveCredit || showApplicationForm) && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          
          {/* Entête du parcours en 2 étapes */}
          <div className="p-6 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm">
                {currentStep === 1 ? '1' : '2'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {currentStep === 1 
                      ? 'Schritt 1 von 2 : Persönliche Angaben & Kreditdaten' 
                      : 'Schritt 2 von 2 : Deutscher Staatsbürgerschaftsnachweis'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    Stufe {currentStep}/2
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentStep === 1 
                    ? 'Einfache Dateneingabe · Keine festsitzende Null · Höchstlaufzeit 240 Monate' 
                    : 'Foto Ihrer deutschen Ausweiskarte & transparente 2% Bank-Kommission'}
                </p>
              </div>
            </div>
          </div>

          {/* Barre de progression 50% / 100% */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5">
            <div 
              className="bg-emerald-500 h-1.5 transition-all duration-300"
              style={{ width: currentStep === 1 ? '50%' : '100%' }}
            />
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            
            {/* ========================================================= */}
            {/* ÉTAPE 1 : TOUTES LES DONNÉES ENTRÉES DIRECTEMENT PAR LE CLIENT */}
            {/* ========================================================= */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. PERSÖNLICHE ANGABEN */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    1. Persönliche Angaben
                  </h4>

                  {/* Sexe : Masculin ou Féminin */}
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
                          name="view_gender"
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
                          name="view_gender"
                          checked={gender === 'female'}
                          onChange={() => setGender('female')}
                          className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-xs">Weiblich (Frau)</span>
                      </label>
                    </div>
                  </div>

                  {/* Nom et Prénom */}
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

                  {/* Date de naissance */}
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
                      Manuelle Texteingabe ohne störenden Kalender.
                    </p>
                  </div>

                  {/* DEUX COLONNES VERROUILLÉES (GMAIL & TÉLÉPHONE ISSUS DE L'INSCRIPTION) */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-[11px] uppercase tracking-wider">
                        Verifizierte Daten aus Ihrer Registrierung (Nicht veränderbar)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* E-mail verrouillée */}
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

                      {/* Téléphone verrouillé */}
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
                      Wohnadresse (Straße, Hausnummer, PLZ &amp; Stadt) *
                    </label>
                    <input
                      type="text"
                      required
                      value={shortAddress}
                      onChange={(e) => setShortAddress(e.target.value)}
                      placeholder="z.B. Friedrichstraße 10, 10117 Berlin"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                {/* 2. KREDIT- & FINANZANGABEN */}
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
                        Vollständig löschbar ohne blockierende Null.
                      </p>
                    </div>

                    {/* Durée en mois : MAXIMUM 240 MOIS AVEC ALERTE ROUGE */}
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
                            Achtung: Die maximale Kreditlaufzeit ist strikt auf 240 Monate (20 Jahre) begrenzt! Bitte reduzieren Sie Ihre Angabe.
                          </span>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-400">
                          {numericTerm > 0 ? `${numericTerm} Monate (${(numericTerm / 12).toFixed(1)} Jahre)` : 'Laufzeit in Monaten eintragen.'}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Salaire mensuel net */}
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

                {/* 3. RELATIONS BANCAIRES EXTERNES */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    3. Bestehende Bankbeziehungen außerhalb unserer Bank
                  </h4>

                  {/* Question 1 : Compte externe */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Haben Sie ein Bankkonto bei einer anderen Bank außerhalb unserer Bank? *
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="view_ext_acc"
                          checked={hasExternalAccount === 'yes'}
                          onChange={() => setHasExternalAccount('yes')}
                          className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Ja</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="view_ext_acc"
                          checked={hasExternalAccount === 'no'}
                          onChange={() => setHasExternalAccount('no')}
                          className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Nein</span>
                      </label>
                    </div>
                  </div>

                  {/* Question 2 : Carte externe */}
                  <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Besitzen Sie eine Bankkarte (Debit-/Kreditkarte) bei einer anderen Bank? *
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="view_ext_card"
                          checked={hasExternalCard === 'yes'}
                          onChange={() => setHasExternalCard('yes')}
                          className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Ja</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="radio"
                          name="view_ext_card"
                          checked={hasExternalCard === 'no'}
                          onChange={() => setHasExternalCard('no')}
                          className="text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>Nein</span>
                      </label>
                    </div>
                  </div>

                  {/* CHAMP CONDITIONNEL : Nom de l'autre banque si Oui */}
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
                        Bitte tragen Sie den Namen Ihrer bestehenden Bankverbindung ein.
                      </p>
                    </div>
                  )}
                </div>

                {/* Bouton pour aller à l'étape 2 */}
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isTermExceeded}
                    className={`flex items-center gap-2 px-7 py-3 rounded-xl text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer ${
                      isTermExceeded 
                        ? 'bg-slate-400 cursor-not-allowed opacity-60' 
                        : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700'
                    }`}
                  >
                    <span>Weiter zum Staatsbürgerschaftsnachweis (Stufe 2/2)</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* ÉTAPE 2 : UPLOAD / PHOTO DE LA PIÈCE D'IDENTITÉ ALLEMANDE & COMMISSION */}
            {/* ========================================================= */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                
                {/* 1. UPLOAD DE L'IDENTITÉ ALLEMANDE */}
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

                      {/* Prévisualisation */}
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

                {/* 2. DÉCOMPTE TRANSPARENT AVEC COMMISSION BANCAIRE DE 2% */}
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

                    {/* Montant net à verser */}
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

                {/* Résumé du client */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Antragsteller: {gender === 'male' ? 'Herr' : 'Frau'} {firstName} {lastName} ({birthDate})
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Wohnadresse: {shortAddress} · Netto-Monatseinkommen: {formatEuro(numericSalary)}
                  </div>
                  {(hasExternalAccount === 'yes' || hasExternalCard === 'yes') && (
                    <div className="text-slate-500 dark:text-slate-400">
                      Externe Bank: {externalBankName || 'Andere Bank'}
                    </div>
                  )}
                </div>

                {/* Boutons de navigation et soumission finale */}
                <div className="pt-4 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Zurück zur Eingabe</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitApplication}
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
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
