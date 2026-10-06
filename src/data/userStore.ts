import { 
  BankAccount, 
  DebitCard, 
  CreditAccount, 
  Transaction, 
  LoanApplication, 
  AppNotification, 
  StandingOrder 
} from '../types/banking';
import { GERMAN_ID_SAMPLE_SVG } from '../utils/germanIdSample';
import { db } from '../firebase';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';

export interface UserUploadedDocument {
  name: string;
  dataUrl: string;
  uploadedAt: string;
  fileSize?: string;
  documentType?: string; // 'Personalausweis' | 'Reisepass'
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  pin: string;
  account: BankAccount;
  card: DebitCard;
  credit: CreditAccount | null;
  transactions: Transaction[];
  application: LoanApplication | null;
  notifications: AppNotification[];
  standingOrders: StandingOrder[];
  idDocument?: UserUploadedDocument;
  createdAt: string;
  status: 'Aktiv' | 'Gesperrt';
}

const STORAGE_KEY = 'aura_banking_users_v5';

// Initial realistic client accounts
const INITIAL_USERS: ManagedUser[] = [
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
      status: 'none',
      cardHolder: '',
      cardNumber: '',
      cardNumberMasked: 'Keine Karte hinterlegt',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      bankName: '',
      cardBalance: 0.0,
      cardType: 'Debit',
      submittedAt: '2026-09-27',
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
      status: 'none',
      cardHolder: '',
      cardNumber: '',
      cardNumberMasked: 'Keine Karte hinterlegt',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      bankName: '',
      cardBalance: 0.0,
      cardType: 'Debit',
      submittedAt: '2026-01-15',
      reviewedAt: '2026-01-16',
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
        id: 'notif-card-approved-init',
        title: 'Konto verifiziert',
        message: 'Ihr Girokonto bei der NordDeutscheBank ist aktiv.',
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
      status: 'none', // Noch keine persönliche Karte hinterlegt
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

// Garantit qu'un objet utilisateur est toujours complet et ne contient jamais de propriétés undefined critiques
export function ensureCompleteUser(partial: Partial<ManagedUser> | null | undefined, fallbackLogin?: string): ManagedUser {
  const p = partial || {};
  const cleanFallback = (fallbackLogin || '').trim();
  const rawEmail = p.email || (cleanFallback.includes('@') ? cleanFallback : 'kunde@nordbank-portal.de');
  const cleanEmail = rawEmail.toLowerCase();
  
  let name = p.name || p.account?.accountHolder;
  if (!name || name === 'undefined') {
    if (cleanEmail.includes('@')) {
      const part = cleanEmail.split('@')[0];
      name = part.charAt(0).toUpperCase() + part.slice(1);
    } else {
      name = 'Kunde';
    }
  }

  const phone = p.phone || '+49 170 0000000';
  const id = p.id || `usr-${Date.now()}`;
  const pin = p.pin || '12345';
  const newIban = p.account?.iban || `DE89 3704 0044 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;

  const account: BankAccount = {
    accountHolder: name,
    accountType: p.account?.accountType || 'NordDeutscheBank Girokonto',
    iban: newIban,
    bic: p.account?.bic || 'NDEBDEFFXXX',
    balance: typeof p.account?.balance === 'number' && !isNaN(p.account.balance) ? p.account.balance : 0.0,
    availableBalance: typeof p.account?.availableBalance === 'number' && !isNaN(p.account.availableBalance) ? p.account.availableBalance : 0.0,
    pendingBalance: typeof p.account?.pendingBalance === 'number' && !isNaN(p.account.pendingBalance) ? p.account.pendingBalance : 0.0,
    dispoLimit: typeof p.account?.dispoLimit === 'number' && !isNaN(p.account.dispoLimit) ? p.account.dispoLimit : 0.0,
    interestRateDeposit: p.account?.interestRateDeposit || 2.75,
    freistellungsAuftragUsed: p.account?.freistellungsAuftragUsed || 0.0,
    freistellungsAuftragTotal: p.account?.freistellungsAuftragTotal || 1000.0,
    openedDate: p.account?.openedDate || new Date().toLocaleDateString('de-DE'),
  };

  const card: DebitCard = p.card || {
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
  };

  return {
    id,
    name,
    email: cleanEmail,
    phone,
    pin,
    account,
    card,
    credit: p.credit || null,
    transactions: Array.isArray(p.transactions) ? p.transactions : [],
    application: p.application || null,
    notifications: Array.isArray(p.notifications) && p.notifications.length > 0 ? p.notifications : [
      {
        id: `notif-welcome-${Date.now()}`,
        title: 'Kontoeröffnung erfolgreich',
        message: `Herzlich willkommen bei der NordDeutscheBank, ${name}! Ihr Girokonto ist vollständig eingerichtet.`,
        timestamp: 'Gerade eben',
        isRead: false,
        category: 'banking',
      }
    ],
    standingOrders: Array.isArray(p.standingOrders) ? p.standingOrders : [],
    createdAt: p.createdAt || new Date().toISOString().split('T')[0],
    status: p.status || 'Aktiv',
  };
}

export const UserStore = {
  // Synchronise en arrière-plan avec la base de données centrale locale du serveur (/data/database.json)
  async syncWithServer(): Promise<ManagedUser[]> {
    if (typeof window === 'undefined') return this.getUsers();
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.users)) {
          this.saveUsers(data.users);
          return data.users;
        }
      }
    } catch (e) {
      console.warn('[UserStore] Impossible de contacter le serveur central, utilisation des données locales:', e);
    }
    return this.getUsers();
  },

  getUsers(): ManagedUser[] {
    if (typeof window === 'undefined') return INITIAL_USERS;
    const possibleKeys = [
      STORAGE_KEY,
      'aura_banking_users_v5',
      'aura_banking_users_v4',
      'aura_banking_users_v3',
      'aura_banking_users_v2',
      'aura_banking_users',
      'nordbank_users',
      'norddeutschebank_users',
    ];

    const userMap = new Map<string, ManagedUser>();

    // 1. Initial base users
    INITIAL_USERS.forEach((u) => userMap.set(u.id, u));

    // 2. Fusion de TOUS les stockages précédents pour ne perdre AUCUN compte existant
    for (const key of possibleKeys) {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            parsed.forEach((u: ManagedUser) => {
              if (u && (u.id || u.email)) {
                // S'assurer que le faux découvert de 2500 € est ramené à 0,00 €
                if (u.account && u.account.dispoLimit === 2500) {
                  u.account.dispoLimit = 0.0;
                }
                userMap.set(u.id || u.email, u);
              }
            });
          }
        }
      } catch (e) {
        // ignorer les clés invalides
      }
    }

    const merged = Array.from(userMap.values());
    return merged;
  },

  saveUsers(users: ManagedUser[]): void {
    if (typeof window === 'undefined') return;
    try {
      const serialized = JSON.stringify(users);
      localStorage.setItem(STORAGE_KEY, serialized);
      // Doublon de sécurité pour que le compte ne disparaisse jamais
      localStorage.setItem('nordbank_users', serialized);
      localStorage.setItem('aura_banking_users', serialized);
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  },

  getUserById(id: string): ManagedUser | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): ManagedUser | undefined {
    const clean = (email || '').trim().toLowerCase();
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === clean);
  },

  // Récupération ciblée ultra-rapide et directe de l'utilisateur depuis Firestore Cloud
  async refreshUserFromFirestore(userIdOrEmail: string): Promise<ManagedUser | undefined> {
    if (typeof window === 'undefined' || !db) return undefined;
    try {
      const clean = (userIdOrEmail || '').trim().toLowerCase();
      const safeDocId = clean.replace(/[^a-zA-Z0-9_-]/g, '_');

      // 1. Essai par safeDocId (email)
      const emailDoc = await getDoc(doc(db, 'users', safeDocId));
      if (emailDoc.exists()) {
        const cloudUser = emailDoc.data() as Partial<ManagedUser>;
        if (cloudUser && cloudUser.email) {
          const complete = ensureCompleteUser(cloudUser, cloudUser.email);
          this.updateUser(complete);
          return complete;
        }
      }

      // 2. Essai par id direct
      const idDoc = await getDoc(doc(db, 'users', userIdOrEmail));
      if (idDoc.exists()) {
        const cloudUser = idDoc.data() as Partial<ManagedUser>;
        if (cloudUser && cloudUser.email) {
          const complete = ensureCompleteUser(cloudUser, cloudUser.email);
          this.updateUser(complete);
          return complete;
        }
      }
    } catch (e) {
      console.warn('[UserStore] refreshUserFromFirestore différé:', e);
    }
    return undefined;
  },

  // Synchronisation globale depuis Firebase Firestore Cloud (Solde, Transactions, Notifications, Profil)
  async syncFromFirestore(): Promise<void> {
    if (typeof window === 'undefined' || !db) return;
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      if (!querySnapshot.empty) {
        const users = this.getUsers();
        let changed = false;

        querySnapshot.forEach((d) => {
          const cloudUser = d.data() as ManagedUser;
          if (cloudUser && cloudUser.email) {
            const idx = users.findIndex(
              (u) => u.id === cloudUser.id || u.email.toLowerCase() === cloudUser.email.toLowerCase()
            );
            if (idx === -1) {
              users.push(ensureCompleteUser(cloudUser, cloudUser.email));
              changed = true;
            } else {
              // Fusionner intelligemment en intégrant les crédits et modifications apportés par l'administrateur
              const existing = users[idx];

              // A. Solde et compte crédité par l'admin
              if (cloudUser.account) {
                if (
                  cloudUser.account.balance !== existing.account.balance ||
                  cloudUser.account.availableBalance !== existing.account.availableBalance ||
                  cloudUser.account.pendingBalance !== existing.account.pendingBalance
                ) {
                  existing.account = {
                    ...existing.account,
                    ...cloudUser.account,
                  };
                  changed = true;
                }
              }

              // B. Nouvelles transactions ajoutées par l'admin ou le système
              if (Array.isArray(cloudUser.transactions) && cloudUser.transactions.length > 0) {
                const existingTxIds = new Set((existing.transactions || []).map((t) => t.id));
                const newTxsFromCloud = cloudUser.transactions.filter((t) => !existingTxIds.has(t.id));
                if (newTxsFromCloud.length > 0 || cloudUser.transactions.length !== (existing.transactions || []).length) {
                  existing.transactions = cloudUser.transactions;
                  changed = true;
                }
              }

              // C. Notifications
              if (Array.isArray(cloudUser.notifications) && cloudUser.notifications.length > 0) {
                const existingNotifIds = new Set((existing.notifications || []).map((n) => n.id));
                const newNotifs = cloudUser.notifications.filter((n) => !existingNotifIds.has(n.id));
                if (newNotifs.length > 0) {
                  existing.notifications = cloudUser.notifications;
                  changed = true;
                }
              }

              // D. Carte bancaire (ex: déblocage ou statut)
              if (cloudUser.card) {
                if (JSON.stringify(cloudUser.card) !== JSON.stringify(existing.card)) {
                  existing.card = cloudUser.card;
                  changed = true;
                }
              }

              // E. Demande de crédit ou statut de prêt
              if (cloudUser.credit !== undefined && JSON.stringify(cloudUser.credit) !== JSON.stringify(existing.credit)) {
                existing.credit = cloudUser.credit;
                changed = true;
              }
              if (cloudUser.application !== undefined && JSON.stringify(cloudUser.application) !== JSON.stringify(existing.application)) {
                existing.application = cloudUser.application;
                changed = true;
              }

              // F. PIN si réinitialisé
              if (cloudUser.pin && cloudUser.pin !== existing.pin) {
                existing.pin = cloudUser.pin;
                changed = true;
              }

              users[idx] = ensureCompleteUser(existing, existing.email);
            }
          }
        });

        if (changed) {
          this.saveUsers(users);
        }
      }
    } catch (err) {
      console.warn('[UserStore] syncFromFirestore différé:', err);
    }
  },

  // Authentification directe : vérifie le cache local, le serveur ET Firebase Firestore
  async authenticateUser(loginInput: string, pinInput: string): Promise<ManagedUser | undefined> {
    const cleanLogin = loginInput.trim();
    const cleanPin = pinInput.trim();

    // 1. Recherche dans le cache local (fusion de tous les comptes enregistrés)
    const localUser = this.findUserByCredentials(cleanLogin, cleanPin);
    if (localUser) {
      return ensureCompleteUser(localUser, cleanLogin);
    }

    // 2. Recherche sur l'API serveur
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: cleanLogin, pin: cleanPin }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          const user: ManagedUser = ensureCompleteUser(data.user, cleanLogin);
          const users = this.getUsers();
          const idx = users.findIndex((u) => u.id === user.id);
          if (idx !== -1) {
            users[idx] = user;
          } else {
            users.push(user);
          }
          this.saveUsers(users);
          return user;
        }
      }
    } catch (err) {
      console.warn('[UserStore] Échec réseau serveur, tentative Firestore:', err);
    }

    // 3. Recherche dans Firestore Cloud (pour les utilisateurs créés sur d'autres appareils/Vercel)
    try {
      if (db) {
        // A. Recherche par identifiant direct (email safeId)
        const safeDocId = cleanLogin.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
        const userDocRef = doc(db, 'users', safeDocId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const cloudData = userDoc.data() as Partial<ManagedUser>;
          if (cloudData && cloudData.pin === cleanPin) {
            const completeUser = ensureCompleteUser(cloudData, cleanLogin);
            const users = this.getUsers();
            const idx = users.findIndex(u => u.id === completeUser.id || u.email.toLowerCase() === completeUser.email.toLowerCase());
            if (idx !== -1) {
              users[idx] = completeUser;
            } else {
              users.push(completeUser);
            }
            this.saveUsers(users);
            return completeUser;
          }
        }

        // B. Recherche par scan Firestore pour retrouver par téléphone ou par nom
        const querySnapshot = await getDocs(collection(db, 'users'));
        for (const d of querySnapshot.docs) {
          const cloudData = d.data() as Partial<ManagedUser>;
          if (cloudData) {
            const matchUser = this.matchesLoginCredentials(cloudData as ManagedUser, cleanLogin, cleanPin);
            if (matchUser) {
              const completeUser = ensureCompleteUser(cloudData, cleanLogin);
              const users = this.getUsers();
              const existingIdx = users.findIndex(u => u.id === completeUser.id || u.email.toLowerCase() === completeUser.email.toLowerCase());
              if (existingIdx !== -1) {
                users[existingIdx] = completeUser;
              } else {
                users.push(completeUser);
              }
              this.saveUsers(users);
              return completeUser;
            }
          }
        }
      }
    } catch (firestoreErr) {
      console.warn('[UserStore] Recherche Firestore fallback:', firestoreErr);
    }

    return undefined;
  },

  // Vérification de correspondance identifiant/téléphone/email + PIN
  matchesLoginCredentials(u: ManagedUser, cleanLogin: string, cleanPin: string): boolean {
    const loginLower = cleanLogin.toLowerCase();
    const loginDigits = cleanLogin.replace(/\D/g, '');
    const userPhoneDigits = (u.phone || '').replace(/\D/g, '');

    const matchEmail = u.email.toLowerCase() === loginLower;
    const matchPhoneExact = (u.phone || '').replace(/[\s\-\+\(\)]/g, '') === cleanLogin.replace(/[\s\-\+\(\)]/g, '');
    const matchPhoneDigits = loginDigits.length >= 6 && userPhoneDigits.length >= 6 && (
      userPhoneDigits === loginDigits ||
      userPhoneDigits.endsWith(loginDigits) ||
      loginDigits.endsWith(userPhoneDigits) ||
      (loginDigits.startsWith('0') && userPhoneDigits.endsWith(loginDigits.substring(1))) ||
      (userPhoneDigits.startsWith('0') && loginDigits.endsWith(userPhoneDigits.substring(1)))
    );
    const matchIban = u.account.iban.replace(/\s+/g, '').toLowerCase() === cleanLogin.replace(/\s+/g, '');
    const matchName = u.name.toLowerCase() === loginLower;

    return (matchEmail || matchPhoneExact || matchPhoneDigits || matchIban || matchName) && u.pin === cleanPin;
  },

  // Recherche d'un utilisateur par son e-mail ou Gmail pour mot de passe oublié
  async findUserByEmailOrPhone(input: string): Promise<ManagedUser | undefined> {
    const clean = input.trim().toLowerCase();
    if (!clean) return undefined;

    // 1. Recherche locale
    const users = this.getUsers();
    let found = users.find(u => u.email.toLowerCase() === clean || (clean.length >= 6 && (u.phone || '').replace(/\D/g, '').includes(clean.replace(/\D/g, ''))));
    if (found) return found;

    // 2. Recherche Firestore Cloud
    if (db) {
      try {
        const safeDocId = clean.replace(/[^a-zA-Z0-9_-]/g, '_');
        const userDocRef = doc(db, 'users', safeDocId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const cloudData = userDoc.data() as ManagedUser;
          if (cloudData) {
            users.push(cloudData);
            this.saveUsers(users);
            return cloudData;
          }
        }

        const querySnapshot = await getDocs(collection(db, 'users'));
        for (const d of querySnapshot.docs) {
          const cloudData = d.data() as ManagedUser;
          if (cloudData && (cloudData.email.toLowerCase() === clean || (clean.length >= 6 && (cloudData.phone || '').replace(/\D/g, '').includes(clean.replace(/\D/g, ''))))) {
            users.push(cloudData);
            this.saveUsers(users);
            return cloudData;
          }
        }
      } catch (e) {
        console.warn('[UserStore] Recherche Firestore par email:', e);
      }
    }

    return undefined;
  },

  // Gestion du code de sécurité 24h valide 15 minutes pour mot de passe oublié
  getResetSecurityCode(email: string): { code: string; isNew: boolean; remainingSeconds: number; validUntil: string } {
    const cleanEmail = email.trim().toLowerCase();
    const storageKey = `pwd_reset_code_${cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
    const now = Date.now();
    const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

    if (typeof window !== 'undefined') {
      try {
        const existingRaw = localStorage.getItem(storageKey);
        if (existingRaw) {
          const parsed = JSON.parse(existingRaw);
          // Si généré il y a moins de 24h, on conserve le code généré pour la fenêtre de 24h
          const timeSinceGeneration = now - parsed.generatedAt;
          if (timeSinceGeneration < TWENTY_FOUR_HOURS_MS) {
            // Est-il encore dans ses 15 minutes de validité active ?
            const remainingMs = Math.max(0, parsed.expiresAt - now);
            const remainingSeconds = Math.ceil(remainingMs / 1000);
            return {
              code: parsed.code,
              isNew: false,
              remainingSeconds,
              validUntil: new Date(parsed.expiresAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
            };
          }
        }
      } catch (e) {}
    }

    // Génération d'un nouveau code à 6 chiffres
    const newCode = `NDB-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiresAt = now + FIFTEEN_MINUTES_MS;

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify({
          code: newCode,
          generatedAt: now,
          expiresAt: expiresAt,
        }));
      } catch (e) {}
    }

    return {
      code: newCode,
      isNew: true,
      remainingSeconds: 15 * 60,
      validUntil: new Date(expiresAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };
  },

  // Mise à jour définitive du mot de passe / PIN dans TOUTES les bases de données (Local, Serveur, Cloud Firestore)
  async updateUserPassword(email: string, newPin: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPin = newPin.trim();

    // 1. Mise à jour dans le cache local
    const users = this.getUsers();
    let updatedUser: ManagedUser | undefined;

    for (let i = 0; i < users.length; i++) {
      if (users[i].email.toLowerCase() === cleanEmail) {
        users[i].pin = cleanPin;
        users[i] = ensureCompleteUser(users[i], cleanEmail);
        updatedUser = users[i];
        break;
      }
    }

    if (!updatedUser) {
      // Rechercher dans Firestore ou créer l'utilisateur complet pour cette adresse
      try {
        if (db) {
          const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
          const userDoc = await getDoc(doc(db, 'users', safeDocId));
          if (userDoc.exists()) {
            updatedUser = ensureCompleteUser(userDoc.data() as Partial<ManagedUser>, cleanEmail);
          }
        }
      } catch (e) {}

      if (!updatedUser) {
        updatedUser = ensureCompleteUser({ email: cleanEmail, pin: cleanPin }, cleanEmail);
      }

      updatedUser.pin = cleanPin;
      users.push(updatedUser);
    }

    this.saveUsers(users);

    // 2. Mise à jour sur l'API serveur
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPin: cleanPin }),
      });
    } catch (err) {
      console.warn('[UserStore] Envoi mise à jour PIN au serveur différé');
    }

    // 3. Mise à jour dans Firebase Firestore Cloud pour que le nouveau mot de passe fonctionne immédiatement partout
    try {
      if (db && updatedUser) {
        const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'users', safeDocId), updatedUser, { merge: true });
        await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
      }
    } catch (err) {
      console.warn('[UserStore] Mise à jour Firestore PIN différée:', err);
    }

    // Nettoyer le code temporaire
    if (typeof window !== 'undefined') {
      try {
        const storageKey = `pwd_reset_code_${cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }

    return true;
  },

  findUserByCredentials(loginInput: string, pinInput: string): ManagedUser | undefined {
    const users = this.getUsers();
    const cleanLogin = loginInput.trim().toLowerCase();
    const cleanPin = pinInput.trim();
    const loginDigits = cleanLogin.replace(/\D/g, '');

    return users.find((u) => {
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
  },

  async registerNewUserAsync(name: string, email: string, phone: string = '', pin: string = '12345', initialBalance: number = 0): Promise<ManagedUser> {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // 1. Enregistrement local garanti
    const localUser = this.registerNewUser(name, email, phone, pin, initialBalance);

    // 2. Synchronisation serveur
    try {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName, email: cleanEmail, phone, pin, initialBalance: 0 }),
      });
    } catch (err) {
      // mode hors ligne ou Vercel
    }

    // 3. Sauvegarde dans Firestore Cloud pour disponibilité universelle sur tous les téléphones
    try {
      if (db) {
        const safeDocId = cleanEmail.replace(/[^a-zA-Z0-9_-]/g, '_');
        await setDoc(doc(db, 'users', safeDocId), localUser, { merge: true });
        await setDoc(doc(db, 'users', localUser.id), localUser, { merge: true });
      }
    } catch (e) {
      console.warn('[UserStore] Erreur sauvegarde Firestore:', e);
    }

    return localUser;
  },

  registerNewUser(name: string, email: string, phone: string = '', pin: string = '12345', initialBalance: number = 0): ManagedUser {
    const users = this.getUsers();
    const newId = `usr-${Date.now()}`;
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const newIban = `DE89 3704 0044 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newUser: ManagedUser = {
      id: newId,
      name: cleanName,
      email: cleanEmail,
      phone: phone.trim() || '+49 170 0000000',
      pin: pin || '12345',
      account: {
        accountHolder: cleanName,
        accountType: 'NordDeutscheBank Girokonto',
        iban: newIban,
        bic: 'NDEBDEFFXXX',
        balance: 0.0,
        availableBalance: 0.0,
        pendingBalance: 0.0,
        dispoLimit: 0.0, // Strictement 0,00 € : aucun découvert factice de 2500 €
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
      transactions: [], // 0 opération effectuée par défaut
      application: null,
      notifications: [
        {
          id: `notif-welcome-${Date.now()}`,
          title: 'Kontoeröffnung erfolgreich',
          message: `Herzlich willkommen bei der NordDeutscheBank, ${cleanName}! Ihr Girokonto ist vollständig eingerichtet und einsatzbereit.`,
          timestamp: 'Gerade eben',
          isRead: false,
          category: 'banking',
        },
      ],
      standingOrders: [],
      createdAt: new Date().toISOString().split('T')[0],
      status: 'Aktiv',
    };

    // Schutz vor Überschreiben: Bestehende Konten niemals löschen oder zurücksetzen!
    const existing = users.find(
      u => u.email.toLowerCase() === cleanEmail || 
      (phone && u.phone && u.phone.replace(/\D/g, '') === phone.replace(/\D/g, '') && phone.replace(/\D/g, '').length >= 6)
    );
    if (existing) {
      return existing;
    }

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  updateUser(updated: ManagedUser): void {
    const safeUser = ensureCompleteUser(updated, updated.email);
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === safeUser.id);
    if (idx !== -1) {
      users[idx] = safeUser;
      this.saveUsers(users);
    } else {
      users.push(safeUser);
      this.saveUsers(users);
    }

    if (typeof window !== 'undefined') {
      fetch(`/api/users/${encodeURIComponent(safeUser.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(safeUser),
      }).catch((err) => {
        console.warn('[UserStore] Synchronisation PUT /api/users/:id différée:', err);
      });
    }

    // Synchronisation immédiate avec Cloud Firestore
    if (typeof window !== 'undefined' && db && safeUser) {
      try {
        const safeDocId = (safeUser.email || '').toLowerCase().replace(/[^a-zA-Z0-9_-]/g, '_');
        if (safeDocId) {
          setDoc(doc(db, 'users', safeDocId), safeUser, { merge: true }).catch((err) =>
            console.warn('[UserStore] Firestore sync safeDocId différée:', err)
          );
        }
        if (safeUser.id) {
          setDoc(doc(db, 'users', safeUser.id), safeUser, { merge: true }).catch((err) =>
            console.warn('[UserStore] Firestore sync userId différée:', err)
          );
        }
      } catch (err) {
        console.warn('[UserStore] Firestore push error:', err);
      }
    }
  },

  updateUserPin(userId: string, newPin: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;
    user.pin = newPin.trim();
    this.updateUser(user);
    return user;
  },

  creditUserBalance(userId: string, amount: number, purpose: string = 'Eingehende SEPA-Überweisung', customDate?: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const absAmount = Math.abs(amount);
    const newBal = user.account.balance + absAmount;
    user.account.balance = newBal;
    user.account.availableBalance = newBal + user.account.pendingBalance;

    const dateStr = customDate || new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      id: `tx-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientOrSender: 'AURA Bank Zentrale',
      iban: user.account.iban,
      purpose,
      amount: absAmount,
      type: 'income',
      date: dateStr,
      timestamp: Date.now(),
      category: 'Finanzen & Kredit',
      status: 'gebucht',
      referenceId: `REF-CR-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    user.transactions.unshift(newTx);
    user.notifications.unshift({
      id: `notif-cr-${Date.now()}`,
      title: 'Gutschrift verbucht',
      message: `Ihrem Konto wurden +${absAmount.toFixed(2)} € gutgeschrieben. Verwendungszweck: ${purpose}`,
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'banking',
    });

    this.updateUser(user);
    return user;
  },

  debitUserBalance(userId: string, amount: number, purpose: string = 'Ausgehende Überweisung / Abbuchung', customDate?: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const absAmount = Math.abs(amount);
    const newBal = user.account.balance - absAmount;
    user.account.balance = newBal;
    user.account.availableBalance = newBal + user.account.pendingBalance;

    const dateStr = customDate || new Date().toISOString().split('T')[0];

    const newTx: Transaction = {
      id: `tx-admin-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      recipientOrSender: 'AURA Bank Lastschrift',
      iban: user.account.iban,
      purpose,
      amount: -absAmount,
      type: 'expense',
      date: dateStr,
      timestamp: Date.now(),
      category: 'Sonstiges',
      status: 'gebucht',
      referenceId: `REF-DB-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    user.transactions.unshift(newTx);
    user.notifications.unshift({
      id: `notif-db-${Date.now()}`,
      title: 'Belastung verbucht',
      message: `Von Ihrem Konto wurden -${absAmount.toFixed(2)} € abgebucht. Verwendungszweck: ${purpose}`,
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'banking',
    });

    this.updateUser(user);
    return user;
  },

  addTransactionToUser(userId: string, tx: Transaction): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.transactions.unshift(tx);
    user.account.balance += tx.amount;
    user.account.availableBalance = user.account.balance + user.account.pendingBalance;

    this.updateUser(user);
    return user;
  },

  deleteTransaction(userId: string, txId: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const targetTx = user.transactions.find((t) => t.id === txId);
    if (targetTx) {
      user.account.balance -= targetTx.amount;
      user.account.availableBalance = user.account.balance + user.account.pendingBalance;
      user.transactions = user.transactions.filter((t) => t.id !== txId);
      this.updateUser(user);
    }
    return user;
  },

  updateUserCardStatus(userId: string, isFrozen: boolean): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.card.isFrozen = isFrozen;
    user.notifications.unshift({
      id: `notif-card-${Date.now()}`,
      title: isFrozen ? 'Debitkarte vorübergehend gesperrt' : 'Debitkarte freigeschaltet',
      message: isFrozen 
        ? 'Ihre Debitkarte wurde vorsorglich durch die Bank gesperrt.' 
        : 'Ihre Debitkarte ist wieder aktiv und voll einsatzbereit.',
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  submitUserCard(
    userId: string, 
    cardData: {
      cardHolder: string;
      cardNumber: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      bankName: string;
      cardBalance: number;
      cardType?: string;
    }
  ): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    const rawNum = cardData.cardNumber.replace(/\s+/g, '');
    const last4 = rawNum.slice(-4) || '0000';
    const masked = `•••• •••• •••• ${last4}`;

    user.card = {
      ...user.card,
      status: 'pending',
      cardHolder: cardData.cardHolder.trim().toUpperCase(),
      cardNumber: cardData.cardNumber.trim(),
      cardNumberMasked: masked,
      expiryMonth: cardData.expiryMonth.trim(),
      expiryYear: cardData.expiryYear.trim(),
      cvv: cardData.cvv.trim(),
      bankName: cardData.bankName.trim(),
      cardBalance: cardData.cardBalance,
      cardType: cardData.cardType || (rawNum.startsWith('4') ? 'Visa' : 'Mastercard'),
      submittedAt: new Date().toISOString().split('T')[0],
      rejectionReason: undefined,
      isFrozen: false,
    };

    user.notifications.unshift({
      id: `notif-card-sub-${Date.now()}`,
      title: 'Bankkarte in Registrierung',
      message: 'Ihre persönliche Bankkarte befindet sich derzeit in der Registrierung und Prüfung. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.',
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  approveUserCard(userId: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.card.status = 'approved';
    user.card.reviewedAt = new Date().toISOString().split('T')[0];
    user.card.rejectionReason = undefined;

    user.notifications.unshift({
      id: `notif-card-appr-${Date.now()}`,
      title: 'Bankkarte genehmigt & verknüpft',
      message: 'Ihre persönliche Bankkarte wurde erfolgreich von der Bank bestätigt und verknüpft. Alle Parameter sind freigeschaltet. Sie können nun uneingeschränkt Überweisungen und Transaktionen durchführen.',
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  rejectUserCard(userId: string, reason: string = 'Mindestguthaben von 148,00 € nicht erreicht oder Verifikation fehlgeschlagen'): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.card.status = 'rejected';
    user.card.reviewedAt = new Date().toISOString().split('T')[0];
    user.card.rejectionReason = reason;

    user.notifications.unshift({
      id: `notif-card-rej-${Date.now()}`,
      title: 'Bankkarte abgelehnt',
      message: `Ihre Bankkarte konnte nicht verknüpft werden: ${reason}. Bitte überprüfen Sie Ihre Angaben und stellen Sie sicher, dass mindestens 148,00 € Guthaben vorhanden sind.`,
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  unlinkUserCard(userId: string): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.card = {
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
    };

    user.notifications.unshift({
      id: `notif-card-unl-${Date.now()}`,
      title: 'Bankkarte entfernt',
      message: 'Ihre verknüpfte Bankkarte wurde getrennt. Solange keine Bankkarte verknüpft ist, können keine Überweisungen ausgeführt werden.',
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  updateUserStatus(userId: string, status: 'Aktiv' | 'Gesperrt'): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.status = status;
    user.notifications.unshift({
      id: `notif-stat-${Date.now()}`,
      title: status === 'Aktiv' ? 'Konto reaktiviert' : 'Konto vorübergehend gesperrt',
      message: status === 'Aktiv' 
        ? 'Ihr Bankkonto ist aktiv und uneingeschränkt nutzbar.'
        : 'Der Zugriff auf Ihr Bankkonto wurde vorübergehend eingeschränkt. Bitte kontaktieren Sie den Kundenservice.',
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'security',
    });

    this.updateUser(user);
    return user;
  },

  setUserCredit(userId: string, credit: CreditAccount | null): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.credit = credit;
    if (credit) {
      user.notifications.unshift({
        id: `notif-credit-${Date.now()}`,
        title: 'Kredit genehmigt & bereitgestellt',
        message: `Ihre Finanzierung (${credit.title}) über ${credit.requestedAmount.toFixed(2)} € wurde genehmigt und auf Ihrem Konto aktiviert.`,
        timestamp: 'Gerade eben',
        isRead: false,
        category: 'credit',
      });
    }

    this.updateUser(user);
    return user;
  },

  addNotificationToUser(userId: string, title: string, message: string, category: 'banking' | 'credit' | 'security' | 'system' = 'system'): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.notifications.unshift({
      id: `notif-custom-${Date.now()}`,
      title,
      message,
      timestamp: 'Gerade eben',
      isRead: false,
      category,
    });

    this.updateUser(user);
    return user;
  },

  saveUserIdDocument(userId: string, name: string, dataUrl: string, fileSize: string = '1.5 MB', documentType: string = 'Personalausweis (Bundesrepublik Deutschland)'): ManagedUser | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    user.idDocument = {
      name,
      dataUrl,
      uploadedAt: new Date().toLocaleDateString('de-DE'),
      fileSize,
      documentType,
    };

    if (user.application) {
      if (!user.application.documents) {
        user.application.documents = {
          salaryProofUploaded: true,
          idDocumentUploaded: true,
          bankStatementUploaded: true,
        };
      }
      user.application.documents.idDocumentUploaded = true;
      user.application.documents.idDocumentName = name;
      user.application.documents.idDocumentData = dataUrl;
      user.application.documents.idDocumentType = documentType;
      user.application.documents.idDocumentUploadedAt = new Date().toLocaleDateString('de-DE');
    }

    this.updateUser(user);
    return user;
  },

  deleteUser(userId: string): void {
    let users = this.getUsers();
    users = users.filter((u) => u.id !== userId);
    this.saveUsers(users);
  },
};
