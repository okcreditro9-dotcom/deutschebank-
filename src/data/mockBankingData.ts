import { BankAccount, CreditAccount, DebitCard, LoanApplication, StandingOrder, Transaction, AppNotification, BankDocument } from '../types/banking';
import { GERMAN_ID_SAMPLE_SVG } from '../utils/germanIdSample';

export const INITIAL_ACCOUNT: BankAccount = {
  accountHolder: 'Maximilian Graf',
  accountType: 'NordDeutscheBank Premium Girokonto',
  iban: 'DE89 3704 0044 0532 0130 00',
  bic: 'NDEB DE FF XXX',
  balance: 0.0,
  availableBalance: 0.0,
  pendingBalance: 0.0,
  dispoLimit: 0.0,
  interestRateDeposit: 2.75,
  freistellungsAuftragUsed: 420.00,
  freistellungsAuftragTotal: 1000.00,
  openedDate: '2023-04-15',
};

export const INITIAL_CARD: DebitCard = {
  status: 'approved',
  cardHolder: 'MAXIMILIAN GRAF',
  cardNumber: '5355 4289 9102 4289',
  cardNumberMasked: '•••• •••• •••• 4289',
  expiryMonth: '08',
  expiryYear: '29',
  cvv: '842',
  bankName: 'NordDeutscheBank',
  cardBalance: 520.0,
  cardType: 'Mastercard',
  submittedAt: '2026-01-10',
  reviewedAt: '2026-01-11',
  isFrozen: false,
  dailyLimit: 2500,
  monthlyLimit: 10000,
  contactlessEnabled: true,
  onlinePaymentsEnabled: true,
  atmWithdrawalsEnabled: true,
  foreignCurrencyEnabled: true,
};

export const INITIAL_CREDIT: CreditAccount = {
  id: 'KR-2025-0982',
  title: 'Wohn- & Modernisierungskredit',
  contractNumber: 'KR-VERTRAG-882194',
  requestedAmount: 18500.00,
  remainingAmount: 12350.00,
  paidAmount: 6150.00,
  interestRateEffective: 3.89,
  interestRateNominal: 3.82,
  monthlyRate: 345.50,
  termMonths: 60,
  remainingMonths: 38,
  nextPaymentDate: '2026-10-15',
  startDate: '2025-01-15',
  endDate: '2029-12-15',
  purpose: 'Wohnungsmodernisierung & Energieeffizienz',
  status: 'Aktiv',
};

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_APPLICATION: LoanApplication | null = null;

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'Kreditantrag Status-Update',
    message: 'Ihr Antrag KR-2026-88914 über 12.500 € befindet sich im finalen Prüfungsschritt.',
    timestamp: 'Vor 2 Stunden',
    isRead: false,
    category: 'credit',
  },
  {
    id: 'notif-2',
    title: 'Gehaltseingang verbucht',
    message: 'Gutschrift über 4.250,00 € von SAP SE & Co. KG erfolgreich gebucht.',
    timestamp: 'Gestern, 09:12 Uhr',
    isRead: false,
    category: 'banking',
  },
  {
    id: 'notif-3',
    title: 'Sicherheitshinweis',
    message: 'Neue Anmeldung mit biometrischer Authentifizierung (Face ID) auf iPhone 16 Pro erkannt.',
    timestamp: '25.09.2026',
    isRead: true,
    category: 'security',
  },
  {
    id: 'notif-4',
    title: 'Quartals-Kontoauszug verfügbar',
    message: 'Ihr elektronischer Kontoauszug für das 3. Quartal 2026 steht im Dokumentenbereich zum Abruf bereit.',
    timestamp: '20.09.2026',
    isRead: true,
    category: 'system',
  },
];

export const INITIAL_STANDING_ORDERS: StandingOrder[] = [
  {
    id: 'so-1',
    recipient: 'Wohnbau Süd Management GmbH',
    iban: 'DE12 5005 0201 0123 4567 89',
    purpose: 'Miete Wohnung 3.OG',
    amount: 1150.00,
    interval: 'monatlich',
    executionDay: 1,
    nextExecution: '01.10.2026',
  },
  {
    id: 'so-2',
    recipient: 'AURA Tagesgeld Sparkonto',
    iban: 'DE89 3704 0044 0532 0130 88',
    purpose: 'Monatlicher Notgroschen Sparplan',
    amount: 500.00,
    interval: 'monatlich',
    executionDay: 1,
    nextExecution: '01.10.2026',
  },
  {
    id: 'so-3',
    recipient: 'Stadtwerke München Energie',
    iban: 'DE55 7001 0080 0009 8765 43',
    purpose: 'Abschlag Strom & Ökogas',
    amount: 145.00,
    interval: 'monatlich',
    executionDay: 15,
    nextExecution: '15.10.2026',
  },
];

export const INITIAL_DOCUMENTS: BankDocument[] = [
  {
    id: 'doc-1',
    title: 'Kontoauszug Nr. 09 / September 2026',
    type: 'Kontoauszug',
    date: '26.09.2026',
    size: '184 KB',
    demoId: 'DOC-KA-2026-09',
  },
  {
    id: 'doc-2',
    title: 'Kreditvertrag Wohn- & Modernisierung',
    type: 'Kreditvertrag',
    date: '15.01.2025',
    size: '1.2 MB',
    demoId: 'DOC-KV-882194',
  },
  {
    id: 'doc-3',
    title: 'Jahressteuerbescheinigung 2025',
    type: 'Steuerbescheinigung',
    date: '10.02.2026',
    size: '420 KB',
    demoId: 'DOC-ST-2025',
  },
  {
    id: 'doc-4',
    title: 'Kontoauszug Nr. 08 / August 2026',
    type: 'Kontoauszug',
    date: '31.08.2026',
    size: '172 KB',
    demoId: 'DOC-KA-2026-08',
  },
];
