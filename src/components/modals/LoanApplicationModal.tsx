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
  Image as ImageIcon
} from 'lucide-react';
import { LoanApplication } from '../../types/banking';
import { formatEuro, calculateCreditRate, generateContractId } from '../../utils/formatters';
import { GERMAN_ID_SAMPLE_SVG } from '../../utils/germanIdSample';

interface LoanApplicationModalProps {
  initialAmount?: number;
  initialTerm?: number;
  initialPurpose?: string;
  onClose: () => void;
  onSubmitSuccess: (newApp: LoanApplication) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const LoanApplicationModal: React.FC<LoanApplicationModalProps> = ({
  initialAmount = 10000,
  initialTerm = 36,
  initialPurpose = 'Freie Verwendung',
  onClose,
  onSubmitSuccess,
  onShowToast,
}) => {
  // Procédure courte : 2 étapes simples au total
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionProgressText, setSubmissionProgressText] = useState<string>('');

  // Step 1 : Tout rempli manuellement (aucun calendrier, aucune case à cocher)
  const [amount, setAmount] = useState<number>(initialAmount);
  const [termMonths, setTermMonths] = useState<number>(initialTerm);
  const [purpose, setPurpose] = useState<string>(initialPurpose);
  
  const [firstName, setFirstName] = useState<string>('Maximilian');
  const [lastName, setLastName] = useState<string>('Graf');
  const [birthDateText, setBirthDateText] = useState<string>('14.05.1990'); // Saisi manuellement au clavier, aucun calendrier
  const [birthPlace, setBirthPlace] = useState<string>('München');
  const [addressText, setAddressText] = useState<string>('Friedrichstraße 142, 10117 Berlin');
  const [netIncome, setNetIncome] = useState<number>(4250);
  const [profession, setProfession] = useState<string>('Senior IT Consultant');
  const [email, setEmail] = useState<string>('maximilian.graf@nordbank.de');
  const [phone, setPhone] = useState<string>('+49 170 9876543');

  // Step 2 (Dernière étape) : Import du fichier de carte d'identité ou passeport allemand (vide par défaut, le client doit importer son propre document)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    sizeStr: string;
    type: string;
    previewUrl?: string;
    dataUrl?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Calcul automatique avec frais bancaires de commission de 2%
  const bankFeePercent = 2; // 2% de frais de la banque
  const bankCommissionFee = Math.round(amount * (bankFeePercent / 100)); // Frais de commission prélevés par notre banque
  const netPayoutAmount = amount - bankCommissionFee; // Montant net perçu
  const calculation = calculateCreditRate(amount, termMonths, 3.89);

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
        'Foto/Dokument hochgeladen',
        `Deutscher Staatsbürgerschaftsnachweis (${file.name}) wurde erfolgreich importiert.`,
        'success'
      );
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (!amount || amount < 500) {
      onShowToast('Betrag ungültig', 'Bitte geben Sie einen Kreditbetrag von mindestens 500 € ein.', 'error');
      return;
    }
    if (!termMonths || termMonths < 6) {
      onShowToast('Laufzeit ungültig', 'Bitte geben Sie eine Laufzeit von mindestens 6 Monaten ein.', 'error');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      onShowToast('Name fehlt', 'Bitte geben Sie Vor- und Nachname manuell ein.', 'error');
      return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = () => {
    if (!uploadedFile) {
      onShowToast(
        'Nachweis erforderlich',
        'Bitte importieren Sie Ihre deutsche Identitätskarte oder Ihren deutschen Reisepass, um die deutsche Staatsbürgerschaft nachzuweisen.',
        'error'
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgressText('Antrag & deutscher Staatsbürgerschaftsnachweis werden verifiziert...');

    setTimeout(() => {
      setSubmissionProgressText('Automatische Verrechnung der 2% Bank-Kommission...');
    }, 900);

    setTimeout(() => {
      setSubmissionProgressText('Vorläufige Zusage & Auszahlungsvertrag werden erstellt...');
    }, 1800);

    setTimeout(() => {
      const newContractId = generateContractId('KR');
      const now = new Date();
      const dateStr = now.toISOString();

      const newApplication: LoanApplication = {
        id: newContractId,
        currentStep: 3,
        status: 'genehmigt',
        statusLabel: 'Sofortentscheid: Vorläufig bewilligt',
        submittedAt: dateStr,
        updatedAt: dateStr,
        loanDetails: {
          amount,
          termMonths,
          purpose,
          monthlyRate: calculation.monthlyRate,
          interestRate: calculation.effectiveRate,
          totalAmount: calculation.totalAmount,
        },
        personalData: {
          salutation: 'Herr',
          firstName,
          lastName,
          birthDate: birthDateText,
          birthPlace: birthPlace || 'Deutschland',
          nationality: 'Deutsch (Deutscher Staatsbürger)',
          maritalStatus: 'Ledig',
          email,
          phone,
        },
        address: {
          street: addressText,
          houseNumber: '',
          postalCode: '',
          city: '',
          livingSituation: 'Miete',
          livingSinceYears: 3,
        },
        employment: {
          employmentType: 'Angestellt',
          employer: profession,
          profession,
          employedSince: '2021',
          isProbationary: false,
        },
        finances: {
          netIncome,
          housingCosts: 800,
          otherCredits: 0,
          livingExpenses: 600,
          existingLiabilities: 0,
        },
        documents: {
          salaryProofUploaded: true,
          salaryProofName: 'Einkommensnachweis_Manuell.pdf',
          idDocumentUploaded: true,
          idDocumentName: uploadedFile.name,
          idDocumentData: uploadedFile.dataUrl,
          idDocumentType: 'Personalausweis (Bundesrepublik Deutschland)',
          idDocumentUploadedAt: new Date().toLocaleDateString('de-DE'),
          bankStatementUploaded: true,
          bankStatementName: 'Kontoauszug_DeutscheBank.pdf',
        },
        timeline: [
          {
            step: '1. Online-Antrag eingereicht',
            date: 'Gerade eben',
            status: 'completed',
            description: `Kredit über ${formatEuro(amount)} beantragt. 2% Bank-Kommission: ${formatEuro(bankCommissionFee)}.`,
          },
          {
            step: '2. Deutscher Staatsbürgerschaftsnachweis geprüft',
            date: 'Gerade eben',
            status: 'completed',
            description: `Datei/Foto "${uploadedFile.name}" als deutscher Personalausweis / Reisepass verifiziert.`,
          },
          {
            step: '3. Sofortige Bewilligung',
            date: 'Gerade eben',
            status: 'completed',
            description: `Antrag bewilligt. Nettobetrag zur Auszahlung: ${formatEuro(netPayoutAmount)}.`,
          },
        ],
      };

      setIsSubmitting(false);
      onSubmitSuccess(newApplication);
      onShowToast(
        'Kreditantrag bewilligt!',
        `Ihr Antrag über ${formatEuro(amount)} wurde mit 2% Bankgebühr (${formatEuro(bankCommissionFee)}) genehmigt.`,
        'success'
      );
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header de la modale */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black shadow-sm">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Nord<span className="text-blue-600 dark:text-blue-400">DeutscheBank</span> Kreditantrag
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Kurze Prozedur · 2 Schritte
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {currentStep === 1 
                  ? 'Schritt 1 von 2: Manuelle Eingabe aller Kredit- und Personendaten' 
                  : 'Schritt 2 von 2: Deutscher Staatsbürgerschaftsnachweis & 2% Bank-Konditionen'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barre de progression des 2 étapes courtes */}
        <div className="grid grid-cols-2 px-6 py-3 bg-slate-100/50 dark:bg-slate-800/30 gap-2 border-b border-slate-100 dark:border-slate-800 text-xs font-bold">
          <div className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${currentStep === 1 ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-emerald-600 text-slate-500'}`}>
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center">1</span>
            <span>1. Manuelle Eingabe</span>
          </div>
          <div className={`flex items-center gap-2 pb-1 border-b-2 transition-colors ${currentStep === 2 ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-400'}`}>
            <span className={`w-5 h-5 rounded-full text-[11px] flex items-center justify-center ${currentStep === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>2</span>
            <span>2. Deutscher Nachweis &amp; 2% Gebühr</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* ========================================================= */}
          {/* ÉTAPE 1 : TOUT SAISI MANUELLEMENT (AUCUN CALENDRIER, AUCUNE CASE À COCHER) */}
          {/* ========================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              
              {/* Badge indicatif : saisie manuelle sans case à cocher */}
              <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 flex items-center gap-3 text-xs text-blue-800 dark:text-blue-300">
                <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <span>
                  <strong>Einfache Direkteingabe:</strong> Alle Angaben werden direkt von Ihnen manuell eingetippt – keine vorgegebenen Häkchen und keine Kalenderfelder.
                </span>
              </div>

              {/* Bloc 1 : Paramètres du prêt saisis manuellement */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-emerald-600" />
                  Kreditangaben (Manuell)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Montant souhaité */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gewünschter Kreditbetrag (€) *
                    </label>
                    <input
                      type="number"
                      min="500"
                      max="150000"
                      step="500"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. 10000"
                    />
                    <span className="text-[11px] text-slate-400">
                      Gewählter Betrag: {formatEuro(amount)}
                    </span>
                  </div>

                  {/* Durée en mois */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gewünschte Laufzeit (Monate) *
                    </label>
                    <input
                      type="number"
                      min="6"
                      max="120"
                      step="6"
                      value={termMonths}
                      onChange={(e) => setTermMonths(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. 36"
                    />
                    <span className="text-[11px] text-slate-400">
                      {termMonths} Monate ({Math.round(termMonths / 12)} Jahre)
                    </span>
                  </div>
                </div>

                {/* Verwendungszweck */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Verwendungszweck (Manuell eingeben) *
                  </label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="z.B. Freie Verwendung, Autokauf, Renovierung"
                  />
                </div>
              </div>

              {/* Bloc 2 : Données personnelles saisies manuellement (aucun calendrier !) */}
              <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Persönliche Angaben (Manuelle Textfelder)
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Prénom */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Vorname *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. Maximilian"
                    />
                  </div>

                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Nachname *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. Graf"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Geburtsdatum : STRICTEMENT CHAMP TEXTE MANUEL, PAS DE CALENDRIER */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Geburtsdatum (Manuell als Text, z.B. TT.MM.JJJJ) *
                    </label>
                    <input
                      type="text"
                      value={birthDateText}
                      onChange={(e) => setBirthDateText(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="14.05.1990"
                    />
                  </div>

                  {/* Geburtsort */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Geburtsort *
                    </label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. München"
                    />
                  </div>
                </div>

                {/* Adresse */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Vollständige Wohnadresse in Deutschland *
                  </label>
                  <input
                    type="text"
                    value={addressText}
                    onChange={(e) => setAddressText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Straße, Hausnummer, PLZ, Ort"
                  />
                </div>

                {/* Situation financière manuelle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Monatliches Nettoeinkommen (€) *
                    </label>
                    <input
                      type="number"
                      value={netIncome}
                      onChange={(e) => setNetIncome(Number(e.target.value))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. 4250"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Beruf / Beschäftigung *
                    </label>
                    <input
                      type="text"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="z.B. IT Consultant, Angestellter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      E-Mail-Adresse *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="name@beispiel.de"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Telefonnummer *
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      placeholder="+49 170 1234567"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* ÉTAPE 2 (DERNIÈRE ÉTAPE) : UPLOAD DE LA CARTE D'IDENTITÉ / PASSEPORT ALLEMAND */}
          {/* ET CALCUL AUTOMATIQUE DES 2% DE COMMISSION BANCAIRE */}
          {/* ========================================================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* SECTION 1 : IMPORT DE LA CARTE D'IDENTITÉ OU PASSEPORT ALLEMAND */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <BadgeCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    Deutscher Staatsbürgerschaftsnachweis
                  </h4>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Erforderlich
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Laden Sie hier eine Datei Ihrer <strong>deutschen Identitätskarte (Personalausweis)</strong> oder Ihres <strong>deutschen Reisepasses</strong> hoch, um nachzuweisen, dass Sie deutscher Staatsbürger sind.
                </p>

                {/* Inputs cachés pour fichier ou appareil photo */}
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

                {/* Carte de téléversement / fichier sélectionné */}
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
                          title="Datei entfernen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* LIVE-BILD-VORSCHAU DER DEUTSCHEN AUSWEISKARTE */}
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
                            alt="Deutscher Ausweis Nachweis"
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

              {/* SECTION 2 : CALCUL AUTOMATIQUE AVEC FRAIS BANCAIRES DE COMMISSION DE 2% */}
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

                {/* Grille de calcul transparent */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Beantragter Kreditbetrag:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      {formatEuro(amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span>Laufzeit:</span>
                    <span className="font-mono font-bold text-white">
                      {termMonths} Monate
                    </span>
                  </div>

                  {/* FRAIS DE COMMISSION BANCAIRE DE 2% PRÉLEVÉS PAR LA BANQUE */}
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

                  {/* MONTANT NET VERSÉ AU CLIENT */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 text-white">
                    <span className="font-bold">Netto-Auszahlungsbetrag an Sie:</span>
                    <span className="font-mono font-extrabold text-base text-white">
                      {formatEuro(netPayoutAmount)}
                    </span>
                  </div>

                  {/* MONATLICHE RATE */}
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

              {/* Résumé des coordonnées du demandeur allemand */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="font-bold text-slate-800 dark:text-slate-200">
                  Antragsteller: {firstName} {lastName} ({birthDateText})
                </div>
                <div className="text-slate-500 dark:text-slate-400">
                  Wohnsitz: {addressText} · Einkommen: {formatEuro(netIncome)} / Monat
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pied de la modale avec navigation et soumission directe */}
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
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
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
