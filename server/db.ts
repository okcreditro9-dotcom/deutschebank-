import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ManagedUser } from '../src/data/userStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial realistic German banking users
const INITIAL_DB_USERS: ManagedUser[] = [
  {
    id: 'usr-client-101',
    name: 'Maximilian Weber',
    email: 'maximilian.weber@aura-bank.de',
    phone: '+49 171 8923410',
    pin: '12345',
    account: {
      accountHolder: 'Maximilian Weber',
      accountType: 'NordDeutscheBank Girokonto',
      iban: 'DE89 3704 0044 0532 0130 00',
      bic: 'NDEBDEFFXXX',
      balance: 0.0,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      dispoLimit: 0.0,
      interestRateDeposit: 2.75,
      freistellungsAuftragUsed: 0.0,
      freistellungsAuftragTotal: 1000.0,
      openedDate: '2026-02-01',
    },
    card: {
      status: 'pending',
      cardHolder: 'MAXIMILIAN WEBER',
      cardNumber: '4532 8923 1245 6192',
      cardNumberMasked: '•••• •••• •••• 6192',
      expiryMonth: '10',
      expiryYear: '30',
      cvv: '739',
      bankName: 'Deutsche Bank AG',
      cardBalance: 245.0,
      cardType: 'Visa',
      submittedAt: '2026-09-27',
      isFrozen: false,
      dailyLimit: 2500,
      monthlyLimit: 10000,
      contactlessEnabled: true,
      onlinePaymentsEnabled: true,
      atmWithdrawalsEnabled: true,
      foreignCurrencyEnabled: true,
    },
    credit: null,
    transactions: [],
    application: null,
    notifications: [
      {
        id: 'notif-card-pending-init',
        title: 'Bankkarte in Prüfung',
        message: 'Ihre persönliche Bankkarte befindet sich derzeit in der Registrierung und Prüfung. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.',
        timestamp: 'Vor kurzem',
        isRead: false,
        category: 'security',
      },
      {
        id: 'notif-welcome-init',
        title: 'Konto erfolgreich aktiviert',
        message: 'Herzlich willkommen bei der AURA Bank. Ihr Konto ist aktiv und verifiziert.',
        timestamp: 'Vor kurzem',
        isRead: false,
        category: 'banking',
      },
    ],
    standingOrders: [],
    createdAt: '2026-02-01',
    status: 'Aktiv',
  },
  {
    id: 'usr-client-102',
    name: 'Sophie Hoffmann',
    email: 'sophie.hoffmann@aura-bank.de',
    phone: '+49 172 4433221',
    pin: '12345',
    account: {
      accountHolder: 'Sophie Hoffmann',
      accountType: 'NordDeutscheBank Girokonto',
      iban: 'DE12 5005 0201 0987 6543 21',
      bic: 'NDEBDEFFXXX',
      balance: 0.0,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      dispoLimit: 0.0,
      interestRateDeposit: 2.75,
      freistellungsAuftragUsed: 0.0,
      freistellungsAuftragTotal: 1000.0,
      openedDate: '2026-01-15',
    },
    card: {
      status: 'approved',
      cardHolder: 'SOPHIE HOFFMANN',
      cardNumber: '5214 7712 9901 3840',
      cardNumberMasked: '•••• •••• •••• 3840',
      expiryMonth: '08',
      expiryYear: '29',
      cvv: '412',
      bankName: 'Berliner Sparkasse',
      cardBalance: 380.0,
      cardType: 'Mastercard',
      submittedAt: '2026-01-15',
      reviewedAt: '2026-01-16',
      isFrozen: false,
      dailyLimit: 2500,
      monthlyLimit: 10000,
      contactlessEnabled: true,
      onlinePaymentsEnabled: true,
      atmWithdrawalsEnabled: true,
      foreignCurrencyEnabled: true,
    },
    credit: null,
    transactions: [],
    application: null,
    notifications: [
      {
        id: 'notif-card-approved-init',
        title: 'Bankkarte verifiziert & freigeschaltet',
        message: 'Ihre persönliche Bankkarte wurde erfolgreich von der Bank bestätigt. Sie können uneingeschränkt Überweisungen durchführen.',
        timestamp: 'Vor kurzem',
        isRead: false,
        category: 'security',
      },
    ],
    standingOrders: [],
    createdAt: '2026-01-15',
    status: 'Aktiv',
  },
  {
    id: 'usr-client-103',
    name: 'Lukas Schneider',
    email: 'lukas.schneider@aura-bank.de',
    phone: '+49 173 9988776',
    pin: '12345',
    account: {
      accountHolder: 'Lukas Schneider',
      accountType: 'NordDeutscheBank Girokonto',
      iban: 'DE77 2005 0550 5544 3322 11',
      bic: 'NDEBDEFFXXX',
      balance: 0.0,
      availableBalance: 0.0,
      pendingBalance: 0.0,
      dispoLimit: 0.0,
      interestRateDeposit: 2.75,
      freistellungsAuftragUsed: 0.0,
      freistellungsAuftragTotal: 1000.0,
      openedDate: '2026-03-01',
    },
    card: {
      status: 'none',
      cardHolder: '',
      cardNumber: '',
      cardNumberMasked: 'Keine Karte hinterlegt',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      bankName: '',
      cardBalance: 0,
      cardType: 'Debit',
      isFrozen: false,
      dailyLimit: 2500,
      monthlyLimit: 10000,
      contactlessEnabled: false,
      onlinePaymentsEnabled: false,
      atmWithdrawalsEnabled: false,
      foreignCurrencyEnabled: false,
    },
    credit: null,
    transactions: [],
    application: null,
    notifications: [
      {
        id: 'notif-no-card-init',
        title: 'Persönliche Bankkarte erforderlich',
        message: 'Bitte hinterlegen Sie Ihre persönliche Bankkarte mit mind. 148,00 € Guthaben, um Überweisungen freizuschalten.',
        timestamp: 'Vor kurzem',
        isRead: false,
        category: 'security',
      },
    ],
    standingOrders: [],
    createdAt: '2026-03-01',
    status: 'Aktiv',
  },
];

class Database {
  private users: ManagedUser[] = [];

  constructor() {
    this.load();
  }

  private load(): void {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.users = parsed;
          return;
        }
      }
    } catch (err) {
      console.error('[DB] Error reading database.json, initializing defaults:', err);
    }

    this.users = INITIAL_DB_USERS;
    this.save();
  }

  private save(): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.users, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('[DB] Error saving database.json:', err);
    }
  }

  public getAllUsers(): ManagedUser[] {
    return this.users;
  }

  public getUserById(id: string): ManagedUser | undefined {
    return this.users.find((u) => u.id === id);
  }

  public findUserByCredentials(login: string, pin: string): ManagedUser | undefined {
    const cleanLogin = login.trim().toLowerCase();
    const cleanPin = pin.trim();
    const loginDigits = cleanLogin.replace(/\D/g, '');

    return this.users.find((u) => {
      // 1. Match par adresse e-mail ou Gmail
      const matchEmail = u.email.toLowerCase() === cleanLogin;

      // 2. Match par numéro de téléphone (formats exacts ou normalisés sans indicatif / avec indicatif)
      const userPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const matchPhoneExact = (u.phone || '').replace(/[\s\-\+\(\)]/g, '') === cleanLogin.replace(/[\s\-\+\(\)]/g, '');
      const matchPhoneDigits = loginDigits.length >= 6 && userPhoneDigits.length >= 6 && (
        userPhoneDigits === loginDigits ||
        userPhoneDigits.endsWith(loginDigits) ||
        loginDigits.endsWith(userPhoneDigits) ||
        (loginDigits.startsWith('0') && userPhoneDigits.endsWith(loginDigits.substring(1))) ||
        (userPhoneDigits.startsWith('0') && loginDigits.endsWith(userPhoneDigits.substring(1)))
      );

      // 3. Match secondaire (IBAN ou nom complet)
      const matchIban = u.account.iban.replace(/\s+/g, '').toLowerCase() === cleanLogin.replace(/\s+/g, '');
      const matchName = u.name.toLowerCase() === cleanLogin;

      const isMatch = matchEmail || matchPhoneExact || matchPhoneDigits || matchIban || matchName;
      return isMatch && u.pin === cleanPin;
    });
  }

  public registerUser(name: string, email: string, phone: string = '', pin: string = '12345', initialBalance: number = 0): ManagedUser {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    
    // Check if user already exists
    const existing = this.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return existing;
    }

    const newId = `usr-${Date.now()}`;
    const newIban = `DE89 3704 0044 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newUser: ManagedUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim() || '+49 170 0000000',
      pin: pin.trim() || '12345',
      account: {
        accountHolder: cleanName,
        accountType: 'NordDeutscheBank Girokonto',
        iban: newIban,
        bic: 'NDEBDEFFXXX',
        balance: initialBalance > 0 ? initialBalance : 0.0,
        availableBalance: initialBalance > 0 ? initialBalance : 0.0,
        pendingBalance: 0.0,
        dispoLimit: 0.0,
        interestRateDeposit: 2.75,
        freistellungsAuftragUsed: 0.0,
        freistellungsAuftragTotal: 1000.0,
        openedDate: new Date().toLocaleDateString('de-DE'),
      },
      card: {
        status: 'none',
        cardHolder: '',
        cardNumber: '',
        cardNumberMasked: 'Keine Karte hinterlegt',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        bankName: '',
        cardBalance: 0,
        cardType: 'Debit',
        isFrozen: false,
        dailyLimit: 2500,
        monthlyLimit: 10000,
        contactlessEnabled: false,
        onlinePaymentsEnabled: false,
        atmWithdrawalsEnabled: false,
        foreignCurrencyEnabled: false,
      },
      credit: null,
      transactions: initialBalance > 0 ? [
        {
          id: `tx-init-${Date.now()}`,
          recipientOrSender: 'Ersteinlage / Neueröffnung',
          iban: newIban,
          purpose: 'Ersteinlage bei Kontoeröffnung',
          amount: initialBalance,
          type: 'income',
          date: new Date().toISOString().split('T')[0],
          timestamp: Date.now(),
          category: 'Finanzen & Kredit',
          status: 'gebucht',
          referenceId: `REF-INIT-${Date.now()}`,
        }
      ] : [],
      application: null,
      notifications: [
        {
          id: `notif-welcome-${Date.now()}`,
          title: 'Kontoeröffnung erfolgreich',
          message: `Herzlich willkommen bei der AURA Bank, ${cleanName}! Ihr Girokonto ist vollständig eingerichtet und einsatzbereit.`,
          timestamp: 'Gerade eben',
          isRead: false,
          category: 'banking',
        },
      ],
      standingOrders: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Aktiv',
    };

    this.users.push(newUser);
    this.save();
    return newUser;
  }

  public updateUser(updated: ManagedUser): ManagedUser {
    const idx = this.users.findIndex((u) => u.id === updated.id);
    if (idx !== -1) {
      this.users[idx] = updated;
      this.save();
    } else {
      this.users.push(updated);
      this.save();
    }
    return updated;
  }

  public deleteUser(userId: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public bulkSync(users: ManagedUser[]): void {
    if (Array.isArray(users) && users.length > 0) {
      // Merge users by ID
      for (const u of users) {
        const idx = this.users.findIndex(x => x.id === u.id);
        if (idx !== -1) {
          this.users[idx] = u;
        } else {
          this.users.push(u);
        }
      }
      this.save();
    }
  }
}

export const db = new Database();
