export type NavigationTab = 'home' | 'account' | 'credit' | 'transactions' | 'profile';

export type SubViewType = 
  | null 
  | 'kontodetails'
  | 'kreditdetails'
  | 'kreditrechner'
  | 'kreditantrag'
  | 'antragstatus'
  | 'senden'
  | 'empfangen'
  | 'ueberweisung'
  | 'benachrichtigungen'
  | 'sicherheit'
  | 'einstellungen'
  | 'hilfe'
  | 'datenschutz'
  | 'dokumente'
  | 'zahlungsuebersicht'
  | 'whatsapp-support';

export interface Transaction {
  id: string;
  recipientOrSender: string;
  iban: string;
  bic?: string;
  purpose: string;
  amount: number; // positive for income, negative for expense
  type: 'income' | 'expense';
  date: string; // ISO date string (YYYY-MM-DD or formatted)
  timestamp: number;
  category: 'Gehalt' | 'Wohnen' | 'Lebensmittel' | 'Mobilität' | 'Freizeit & Shopping' | 'Finanzen & Kredit' | 'Abonnements' | 'Sonstiges' | 'Virement' | 'Salaire' | 'Logement' | 'Alimentation' | 'Loisirs' | 'Autre' | string;
  status: 'gebucht' | 'ausstehend';
  referenceId: string;
  isRecurring?: boolean;
}

export interface CreditAccount {
  id: string;
  title: string;
  contractNumber: string;
  requestedAmount: number;
  remainingAmount: number;
  interestRateEffective: number; // e.g. 3.89
  interestRateNominal: number; // e.g. 3.82
  monthlyRate: number;
  termMonths: number;
  remainingMonths: number;
  nextPaymentDate: string;
  paidAmount: number;
  startDate: string;
  endDate: string;
  purpose: string;
  status: 'Aktiv' | 'Genehmigt' | 'Beantragt';
}

export interface LoanApplication {
  id: string; // e.g. DEMO-KR-2026-98421
  currentStep: number;
  status: 'in_pruefung' | 'genehmigt' | 'unterlagen_fehlen' | 'ausgezahlt';
  statusLabel: string;
  submittedAt: string;
  updatedAt: string;
  loanDetails: {
    amount: number;
    termMonths: number;
    purpose: string;
    monthlyRate: number;
    interestRate: number;
    totalAmount: number;
  };
  personalData: {
    salutation: 'Herr' | 'Frau' | 'Divers';
    firstName: string;
    lastName: string;
    birthDate: string;
    birthPlace: string;
    nationality: string;
    maritalStatus: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    houseNumber: string;
    postalCode: string;
    city: string;
    livingSituation: 'Miete' | 'Eigentum' | 'Eltern / WG';
    livingSinceYears: number;
  };
  employment: {
    employmentType: 'Angestellt' | 'Beamter' | 'Selbstständig' | 'Rentner';
    employer: string;
    profession: string;
    employedSince: string;
    isProbationary: boolean;
  };
  finances: {
    netIncome: number;
    housingCosts: number;
    otherCredits: number;
    livingExpenses: number;
    existingLiabilities: number;
  };
  documents: {
    salaryProofUploaded: boolean;
    salaryProofName?: string;
    idDocumentUploaded: boolean;
    idDocumentName?: string;
    idDocumentData?: string;
    idDocumentType?: string;
    idDocumentUploadedAt?: string;
    bankStatementUploaded: boolean;
    bankStatementName?: string;
  };
  timeline: Array<{
    step: string;
    date: string;
    status: 'completed' | 'current' | 'pending';
    description: string;
  }>;
}

export interface BankAccount {
  accountHolder: string;
  accountType: string;
  iban: string;
  bic: string;
  balance: number;
  availableBalance: number;
  pendingBalance: number;
  dispoLimit: number;
  interestRateDeposit: number;
  freistellungsAuftragUsed: number;
  freistellungsAuftragTotal: number;
  openedDate: string;
}

export type CardStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface DebitCard {
  status: CardStatus;
  cardHolder: string;
  cardNumber: string; // Full 16 digits
  cardNumberMasked: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  bankName: string; // Issuing bank (e.g. Deutsche Bank, Sparkasse, etc.)
  cardBalance: number; // Balance on card (minimum 148.00 € required)
  cardType?: 'Mastercard' | 'Visa' | 'Debit' | string;
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  isFrozen: boolean;
  dailyLimit: number;
  monthlyLimit: number;
  contactlessEnabled: boolean;
  onlinePaymentsEnabled: boolean;
  atmWithdrawalsEnabled: boolean;
  foreignCurrencyEnabled: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'banking' | 'credit' | 'security' | 'system';
  actionUrl?: string;
}

export interface StandingOrder {
  id: string;
  recipient: string;
  iban: string;
  purpose: string;
  amount: number;
  interval: 'monatlich' | 'vierteljährlich' | 'jährlich';
  executionDay: number;
  nextExecution: string;
}

export interface BankDocument {
  id: string;
  title: string;
  type: 'Kontoauszug' | 'Kreditvertrag' | 'Steuerbescheinigung' | 'Mitteilung';
  date: string;
  size: string;
  demoId: string;
}
