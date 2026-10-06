import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { BottomNavigation } from './components/BottomNavigation';
import { ToastContainer, ToastMessage } from './components/Toast';

// Views
import { HomeView } from './components/views/HomeView';
import { AccountView } from './components/views/AccountView';
import { CreditView } from './components/views/CreditView';
import { TransactionsView } from './components/views/TransactionsView';
import { ProfileView } from './components/views/ProfileView';
import { AuthView } from './components/views/AuthView';
import { AdminDashboardView } from './components/views/AdminDashboardView';
import { UserStore, ManagedUser, ensureCompleteUser } from './data/userStore';
import { saveUserToFirestore, saveTransactionToFirestore } from './firebase';

// Modals
import { TransferModal } from './components/modals/TransferModal';
import { ReceiveModal } from './components/modals/ReceiveModal';
import { LoanApplicationModal } from './components/modals/LoanApplicationModal';
import { LoanStatusModal } from './components/modals/LoanStatusModal';
import { TransactionDetailModal } from './components/modals/TransactionDetailModal';
import { AccountDetailsModal } from './components/modals/AccountDetailsModal';
import { CreditDetailsModal } from './components/modals/CreditDetailsModal';
import { NotificationsModal } from './components/modals/NotificationsModal';
import { StandingOrdersModal } from './components/modals/StandingOrdersModal';
import { DocumentsModal } from './components/modals/DocumentsModal';
import { SecurityModal } from './components/modals/SecurityModal';
import { HelpModal } from './components/modals/HelpModal';
import { DatenschutzModal } from './components/modals/DatenschutzModal';
import { WhatsAppSupportModal } from './components/modals/WhatsAppSupportModal';
import { LoanSubmittedModal } from './components/modals/LoanSubmittedModal';
import { MessageCircle } from 'lucide-react';
import { formatEuro } from './utils/formatters';

// Mock Data & Types
import { 
  INITIAL_ACCOUNT, 
  INITIAL_CARD, 
  INITIAL_CREDIT, 
  INITIAL_TRANSACTIONS, 
  INITIAL_APPLICATION, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_STANDING_ORDERS, 
  INITIAL_DOCUMENTS 
} from './data/mockBankingData';
import { 
  NavigationTab, 
  SubViewType, 
  Transaction, 
  LoanApplication, 
  DebitCard, 
  StandingOrder, 
  AppNotification,
  BankAccount,
  CreditAccount 
} from './types/banking';

export default function App() {
  // Authentication State: Redirection automatique vers la page de connexion/inscription pour TOUS les visiteurs
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [viewingAsAdminClient, setViewingAsAdminClient] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<{ id?: string; name: string; email: string }>({
    name: 'Marc Dubois',
    email: 'marc.dubois@aura-bank.com',
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [subView, setSubView] = useState<SubViewType>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Data State
  const [account, setAccount] = useState<BankAccount>(INITIAL_ACCOUNT);
  const [card, setCard] = useState<DebitCard>(INITIAL_CARD);
  const [credit, setCredit] = useState<CreditAccount | null>(INITIAL_CREDIT);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [loanSubmittedApp, setLoanSubmittedApp] = useState<LoanApplication | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [standingOrders, setStandingOrders] = useState<StandingOrder[]>([]);
  const [documents] = useState(INITIAL_DOCUMENTS);

  // Pre-filled application parameters from calculator
  const [applicationPreset, setApplicationPreset] = useState<{ amount: number; term: number; purpose: string }>({
    amount: 15000,
    term: 48,
    purpose: 'Projet personnel',
  });

  // Dark Mode State - Standardmäßig Tag-Modus (hell)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aura_dark_mode');
      if (saved !== null) return saved === 'true';
      return false; // Standardmäßig Tag-Modus (hell) wie gewünscht
    }
    return false;
  });

  // Mobile Device Frame preview toggle for desktop users
  const [isMobileFrameView, setIsMobileFrameView] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aura_dark_mode', darkMode.toString());
  }, [darkMode]);

  // 1. Session Persistence: Restaurer la session existante dès le chargement/rechargement de la page (F5 / swipe)
  useEffect(() => {
    const initAndRestoreSession = async () => {
      try {
        // Synchroniser d'abord avec Firestore Cloud et le serveur local
        await UserStore.syncFromFirestore();
        await UserStore.syncWithServer();

        if (typeof window !== 'undefined') {
          const savedSessionRaw = localStorage.getItem('aura_active_session');
          if (savedSessionRaw) {
            const session = JSON.parse(savedSessionRaw);

            if (session.role === 'admin') {
              setIsAdminAuthenticated(true);
              setIsAuthenticated(false);
              return;
            }

            if (session.id || session.email) {
              // Récupérer le compte le plus à jour possible depuis Firestore / UserStore
              let u = session.id ? UserStore.getUserById(session.id) : undefined;
              if (!u && session.email) {
                u = UserStore.getUserByEmail(session.email);
              }
              if (!u) {
                u = await UserStore.refreshUserFromFirestore(session.id || session.email);
              }

              if (u) {
                const safe = ensureCompleteUser(u, session.email || u.email);
                setCurrentUser({ id: safe.id, name: safe.name, email: safe.email });
                setAccount(safe.account);
                setTransactions(safe.transactions || []);
                setCard(safe.card);
                setCredit(safe.credit || null);
                setNotifications(safe.notifications || []);
                setStandingOrders(safe.standingOrders || []);
                setApplication(safe.application || null);
                setIsAuthenticated(true);
              }
            }
          }
        }
      } catch (err) {
        console.warn('[App] Erreur restauration session:', err);
      }
    };

    initAndRestoreSession();
  }, []);

  // 2. Synchronisation automatique et continue avec Cloud Firestore et le serveur
  const refreshUserFromDatabase = useCallback(async (showNotification = false) => {
    const targetId = currentUser.id;
    const targetEmail = currentUser.email;
    if (!targetId && !targetEmail) return;

    try {
      await UserStore.syncFromFirestore();
      await UserStore.syncWithServer();

      let u = targetId ? UserStore.getUserById(targetId) : undefined;
      if (!u && targetEmail) {
        u = UserStore.getUserByEmail(targetEmail);
      }
      if (!u) {
        u = await UserStore.refreshUserFromFirestore(targetId || targetEmail);
      }

      if (u) {
        const safe = ensureCompleteUser(u, targetEmail || u.email);
        setAccount(safe.account);
        setTransactions(safe.transactions || []);
        setCard(safe.card);
        setCredit(safe.credit || null);
        setNotifications(safe.notifications || []);
        setStandingOrders(safe.standingOrders || []);
        setApplication(safe.application || null);

        if (showNotification) {
          addToast(
            'Kontostand aktualisiert',
            `Ihr aktueller Saldo beträgt ${formatEuro(safe.account.balance)}.`,
            'success'
          );
        }
      }
    } catch (err) {
      console.warn('[App] Erreur synchronisation données:', err);
    }
  }, [currentUser.id, currentUser.email]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Polling toutes les 4 secondes pour capter instantanément les crédits de l'administrateur
    const interval = setInterval(() => {
      refreshUserFromDatabase(false);
    }, 4000);

    const onWindowFocus = () => refreshUserFromDatabase(false);
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshUserFromDatabase(false);
      }
    };

    window.addEventListener('focus', onWindowFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onWindowFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [isAuthenticated, refreshUserFromDatabase]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, title, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Synchronisation avec UserStore et Firestore pour persistance en temps réel
  const syncWithUserStore = (updatedAccount?: BankAccount, updatedTransactions?: Transaction[], updatedCard?: DebitCard, updatedCredit?: CreditAccount | null) => {
    if (!currentUser.id) return;
    const existing = UserStore.getUserById(currentUser.id);
    if (existing) {
      const updated: ManagedUser = {
        ...existing,
        account: updatedAccount || account,
        transactions: updatedTransactions || transactions,
        card: updatedCard || card,
        credit: updatedCredit !== undefined ? updatedCredit : credit,
      };
      UserStore.updateUser(updated);

      // Persist to Cloud Firestore database
      saveUserToFirestore(currentUser.id, {
        account: updated.account,
        card: updated.card,
        credit: updated.credit,
        name: currentUser.name,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      }).catch((e) => console.warn('Firestore sync status:', e));
    }
  };

  // Handlers pour les transferts et opérations financières du client
  const handleExecuteTransfer = (newTx: Transaction) => {
    const updatedTxList = [newTx, ...transactions];
    setTransactions(updatedTxList);

    const newBal = account.balance + newTx.amount;
    const updatedAccount: BankAccount = {
      ...account,
      balance: newBal,
      availableBalance: newBal + account.pendingBalance,
    };
    setAccount(updatedAccount);

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title: 'Virement émis',
      message: `Virement de ${Math.abs(newTx.amount).toFixed(2)} € vers ${newTx.recipientOrSender} enregistré.`,
      timestamp: 'À l\'instant',
      isRead: false,
      category: 'banking',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Persist transaction to Firestore sub-collection
    if (currentUser.id) {
      saveTransactionToFirestore(currentUser.id, newTx).catch((e) => console.warn('Firestore tx status:', e));
    }

    syncWithUserStore(updatedAccount, updatedTxList);
  };

  // Handler de demande de prêt
  const handleLoanApplicationSuccess = (newApp: LoanApplication) => {
    setApplication(newApp);
    setSubView(null); // Quitter immédiatement le formulaire pour ne pas rester bloqué sur la page

    // 1. Enregistrer immédiatement l'opération dans l'historique des transactions
    const loanTx: Transaction = {
      id: `tx-loan-${Date.now()}`,
      recipientOrSender: 'NordDeutscheBank Kreditabteilung',
      iban: account.iban,
      bic: 'NDEBDEFFXXX',
      purpose: `Kreditantrag ${newApp.id} (${newApp.loanDetails.purpose}) – In Prüfung`,
      amount: newApp.loanDetails.amount,
      type: 'income',
      date: new Date().toLocaleDateString('de-DE'),
      timestamp: Date.now(),
      category: 'Finanzen & Kredit',
      status: 'ausstehend', // Marqué comme ausstehend (en attente de décision)
      referenceId: newApp.id,
    };

    const updatedTxList = [loanTx, ...transactions];
    setTransactions(updatedTxList);

    // 2. Mettre à jour l'utilisateur et synchroniser avec Firestore
    if (currentUser.id) {
      const user = UserStore.getUserById(currentUser.id);
      if (user) {
        user.application = newApp;
        user.transactions = updatedTxList;
        if (newApp.documents?.idDocumentData) {
          user.idDocument = {
            name: newApp.documents.idDocumentName || 'Deutscher_Personalausweis.svg',
            dataUrl: newApp.documents.idDocumentData,
            uploadedAt: new Date().toLocaleDateString('de-DE'),
            fileSize: '1.2 MB',
            documentType: newApp.documents.idDocumentType || 'Personalausweis (Bundesrepublik Deutschland)',
          };
        }
        UserStore.updateUser(user);
      }
      saveTransactionToFirestore(currentUser.id, loanTx).catch((e) => console.warn('Firestore loan tx status:', e));
    }

    // 3. Notification officielle
    const newNotif: AppNotification = {
      id: `notif-app-${Date.now()}`,
      title: 'Kreditantrag eingereicht',
      message: `Ihr Antrag ${newApp.id} über ${newApp.loanDetails.amount.toFixed(2)} € wurde eingereicht. Nach finaler Bewilligung wird der Betrag direkt gutgeschrieben.`,
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'credit',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // 4. Afficher la boîte de dialogue explicative officielle demandée par le client
    setLoanSubmittedApp(newApp);
  };

  const handleStartApplicationWithParams = (amount: number, termMonths: number, purpose: string) => {
    setApplicationPreset({ amount, term: termMonths, purpose });
    setSubView('kreditantrag');
  };

  const handleOpenSubView = (view: SubViewType) => {
    if (view === 'senden' || view === 'ueberweisung') {
      if (card.status !== 'approved') {
        setActiveTab('account');
        setSubView(null);
        if (card.status === 'none') {
          addToast(
            'Persönliche Bankkarte erforderlich',
            'Sie müssen zuerst Ihre persönliche Bankkarte mit mindestens 148,00 € Guthaben verknüpfen. Solange keine genehmigte Karte vorliegt, sind Überweisungen gesperrt.',
            'error'
          );
        } else if (card.status === 'pending') {
          addToast(
            'Bankkarte in Prüfung',
            'Ihre Bankkarte befindet sich derzeit in der Registrierung und Prüfung. Sobald die Bank Ihren Antrag bestätigt hat, werden die Parameter freigeschaltet und Sie können Überweisungen auf jedes beliebige Bankkonto oder jede Bankkarte ausführen.',
            'info'
          );
        } else if (card.status === 'rejected') {
          addToast(
            'Bankkarte abgelehnt',
            'Ihre hinterlegte Bankkarte wurde abgelehnt (Mindestguthaben von 148,00 € nicht erreicht). Bitte hinterlegen Sie eine gültige Karte mit mind. 148 € Guthaben.',
            'error'
          );
        }
        return;
      }
    }
    setSubView(view);
  };

  const handleRepeatTransfer = (recipient: string, iban: string, amount: number) => {
    handleOpenSubView('senden');
  };

  // Connexion Client Standard : Arrêt spontané de tout média (vidéo/audio)
  const handleLogin = (name: string, email: string, isNewUser?: boolean, accountType?: string, managedUser?: ManagedUser) => {
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

    setIsAuthenticated(true);
    setIsAdminAuthenticated(false);
    setViewingAsAdminClient(false);
    setActiveTab('home');

    // Assurer que le client tombe directement sur le haut de sa page et sur le solde de son compte
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }

    if (managedUser) {
      const safe = ensureCompleteUser(managedUser, email);
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'aura_active_session',
          JSON.stringify({ id: safe.id, name: safe.name, email: safe.email, role: 'client' })
        );
      }
      setCurrentUser({ id: safe.id, name: safe.name, email: safe.email });
      setAccount(safe.account);
      setTransactions(safe.transactions || []);
      setCredit(safe.credit || null);
      setCard(safe.card);
      setNotifications(safe.notifications || []);
      setStandingOrders(safe.standingOrders || []);
      setApplication(safe.application || null);
    } else if (isNewUser) {
      // Neuer Kunde ohne fiktive Buchungen
      const newIban = `DE89 3704 0044 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'aura_active_session',
          JSON.stringify({ email, name, role: 'client' })
        );
      }
      setCurrentUser({ name, email });
      setAccount({
        accountHolder: name,
        accountType: accountType || 'AURA Girokonto Classic',
        iban: newIban,
        bic: 'AURADEBBXXX',
        balance: 0.0,
        availableBalance: 0.0,
        pendingBalance: 0.0,
        dispoLimit: 0.0,
        interestRateDeposit: 2.75,
        freistellungsAuftragUsed: 0.0,
        freistellungsAuftragTotal: 1000.0,
        openedDate: new Date().toLocaleDateString('de-DE'),
      });
      setTransactions([]); // 0 Buchungen
      setCredit(null);
      setApplication(null);
      setStandingOrders([]);
      setCard({
        status: 'none', // Keine Karte bis zur Verknüpfung mit mind. 148 €
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
      });
      setNotifications([
        {
          id: `notif-welcome-${Date.now()}`,
          title: 'Kontoeröffnung bestätigt',
          message: `Herzlich willkommen bei der AURA Bank, ${name}! Ihr Girokonto ist aktiv. Bitte hinterlegen Sie Ihre persönliche Bankkarte mit mind. 148,00 € Guthaben zur Freischaltung von Überweisungen.`,
          timestamp: 'Gerade eben',
          isRead: false,
          category: 'banking',
        },
      ]);
    }
  };

  // Connexion Administrateur Secrete via identifiants 49494949 / 49494949
  const handleAdminLogin = () => {
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('aura_active_session', JSON.stringify({ role: 'admin' }));
    }
    setIsAdminAuthenticated(true);
    setIsAuthenticated(false);
    setViewingAsAdminClient(false);
  };

  const handleAdminLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_active_session');
    }
    setIsAdminAuthenticated(false);
    setIsAuthenticated(false);
    setViewingAsAdminClient(false);
    addToast('Administrator abgemeldet', 'Sie wurden erfolgreich abgemeldet.', 'info');
  };

  // Administrator-Kundenansicht
  const handleAdminViewAsClient = (user: ManagedUser) => {
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    setAccount(user.account);
    setTransactions(user.transactions);
    setCredit(user.credit);
    setCard(user.card);
    setNotifications(user.notifications);
    setStandingOrders(user.standingOrders);
    setApplication(user.application);
    setViewingAsAdminClient(true);
    setActiveTab('home');
    addToast('Kundenansicht aktiviert', `Sie befinden sich im Bereich von ${user.name}.`, 'info');
  };

  const handleClientLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('aura_active_session');
    }
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setViewingAsAdminClient(false);
    addToast('Erfolgreich abgemeldet', 'Auf Wiedersehen bei der NordDeutscheBank.', 'info');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('Alle Benachrichtigungen als gelesen markiert', undefined, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Layer */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* CAS 1: VISITEUR NON CONNECTÉ -> Page de Connexion & Inscription avec Carrousel haut et sections bas */}
      {!isAuthenticated && !isAdminAuthenticated && (
        <AuthView
          onLogin={handleLogin}
          onAdminLogin={handleAdminLogin}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onShowToast={addToast}
        />
      )}

      {/* CAS 2: ADMINISTRATEUR CONNECTÉ EN MODE DASHBOARD CENTRAL */}
      {isAdminAuthenticated && !viewingAsAdminClient && (
        <AdminDashboardView
          onLogout={handleAdminLogout}
          onViewAsClient={handleAdminViewAsClient}
          onShowToast={addToast}
        />
      )}

      {/* CAS 3: CLIENT CONNECTÉ OU ADMINISTRATEUR EN APERÇU DU COMPTE CLIENT */}
      {(isAuthenticated || (isAdminAuthenticated && viewingAsAdminClient)) && (
        <>
          {/* Bandeau supérieur en mode Administrateur Aperçu */}
          {isAdminAuthenticated && viewingAsAdminClient && (
            <div className="sticky top-0 z-50 bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between text-xs border-b border-indigo-500/50 shadow-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-slate-200">
                  Administrator-Modus: Sie visualisieren den Bereich von <strong className="text-white">{currentUser.name}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewingAsAdminClient(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ← Zurück zum Administrator-Dashboard
              </button>
            </div>
          )}

          {/* Frame Container */}
          <div className={`flex-1 flex flex-col mx-auto w-full transition-all duration-300 ${
            isMobileFrameView 
              ? 'max-w-[430px] my-4 rounded-[40px] shadow-2xl border-8 border-slate-800 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900' 
              : 'max-w-4xl'
          }`}>
            {/* Responsive Smartphone Frame Toggle Bar on Desktop */}
            <div className="hidden lg:flex items-center justify-between px-6 py-1.5 bg-slate-200/60 dark:bg-slate-900/60 text-[11px] text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <span>NordDeutscheBank Digitales Banking</span>
              <button
                onClick={() => setIsMobileFrameView(!isMobileFrameView)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer underline"
              >
                {isMobileFrameView ? 'Desktop-Ansicht vergrößern' : 'Smartphone-Format simulieren'}
              </button>
            </div>

            {/* Header */}
            <Header
              userName={currentUser.name.split(' ')[0]}
              unreadNotificationsCount={unreadNotificationsCount}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenNotifications={() => setSubView('benachrichtigungen')}
              onOpenProfile={() => setActiveTab('profile')}
              onOpenSecurity={() => setSubView('sicherheit')}
              canGoBack={activeTab !== 'home' || subView !== null}
              onGoBack={() => {
                if (subView !== null) {
                  setSubView(null);
                } else if (activeTab !== 'home') {
                  setActiveTab('home');
                }
              }}
            />

            {/* Main Content Views */}
            <main className="flex-1 px-4 sm:px-6 pt-6 pb-24">
              {activeTab === 'home' && (
                <HomeView
                  account={account}
                  transactions={transactions}
                  credit={credit}
                  card={card}
                  onNavigateTab={(tab) => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  onOpenSubView={handleOpenSubView}
                  onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                  onShowToast={addToast}
                  onRefreshData={() => refreshUserFromDatabase(true)}
                />
              )}

              {activeTab === 'account' && (
                <AccountView
                  account={account}
                  card={card}
                  onBack={() => setActiveTab('home')}
                  onUpdateCard={(updated) => {
                    setCard(updated);
                    syncWithUserStore(undefined, undefined, updated);
                  }}
                  onOpenSubView={(view) => setSubView(view)}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'credit' && (
                <CreditView
                  credit={credit}
                  application={application}
                  userEmail={currentUser.email}
                  userPhone={UserStore.getUserById(currentUser.id || '')?.phone || ''}
                  userName={currentUser.name}
                  onBack={() => setActiveTab('home')}
                  onOpenSubView={(view) => setSubView(view)}
                  onSubmitSuccess={handleLoanApplicationSuccess}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView
                  transactions={transactions}
                  onBack={() => setActiveTab('home')}
                  onSelectTransaction={(tx) => setSelectedTransaction(tx)}
                  onShowToast={addToast}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  userName={currentUser.name}
                  userEmail={currentUser.email}
                  darkMode={darkMode}
                  onToggleDarkMode={toggleDarkMode}
                  onBack={() => setActiveTab('home')}
                  onOpenSubView={(view) => setSubView(view)}
                  onShowToast={addToast}
                  onLogout={handleClientLogout}
                />
              )}
            </main>
          </div>

          {/* Fixed Bottom Navigation with exactly 5 Tabs */}
          <BottomNavigation
            activeTab={activeTab}
            onChangeTab={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            pendingLoanApplicationsCount={application && application.status === 'in_pruefung' ? 1 : 0}
          />

          {/* SubViews & Modals */}
          {(subView === 'senden' || subView === 'ueberweisung') && (
            <TransferModal
              currentBalance={account.availableBalance}
              card={card}
              onClose={() => setSubView(null)}
              onExecuteTransfer={handleExecuteTransfer}
              onShowToast={addToast}
              onRedirectToCard={() => {
                setSubView(null);
                setActiveTab('account');
              }}
            />
          )}

          {subView === 'empfangen' && (
            <ReceiveModal
              account={account}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {(subView === 'kreditantrag' || subView === 'kreditrechner') && (
            <LoanApplicationModal
              initialAmount={applicationPreset.amount}
              initialTerm={applicationPreset.term}
              initialPurpose={applicationPreset.purpose}
              userEmail={currentUser.email}
              userPhone={UserStore.getUserById(currentUser.id || '')?.phone || ''}
              userName={currentUser.name}
              onClose={() => setSubView(null)}
              onSubmitSuccess={handleLoanApplicationSuccess}
              onShowToast={addToast}
            />
          )}

          {subView === 'antragstatus' && application && (
            <LoanStatusModal
              application={application}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {loanSubmittedApp && (
            <LoanSubmittedModal
              application={loanSubmittedApp}
              onClose={() => setLoanSubmittedApp(null)}
              onGoToTransactions={() => {
                setLoanSubmittedApp(null);
                setSubView(null);
                setActiveTab('transactions');
              }}
              onGoToHome={() => {
                setLoanSubmittedApp(null);
                setSubView(null);
                setActiveTab('home');
              }}
            />
          )}

          {selectedTransaction && (
            <TransactionDetailModal
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(null)}
              onRepeatTransfer={handleRepeatTransfer}
              onShowToast={addToast}
            />
          )}

          {subView === 'kontodetails' && (
            <AccountDetailsModal
              account={account}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'kreditdetails' && credit && (
            <CreditDetailsModal
              credit={credit}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'benachrichtigungen' && (
            <NotificationsModal
              notifications={notifications}
              onClose={() => setSubView(null)}
              onMarkAllAsRead={markAllNotificationsAsRead}
              onSelectNotificationAction={(notif) => {
                setSubView(null);
                if (notif.category === 'credit') {
                  setSubView('antragstatus');
                } else if (notif.category === 'banking') {
                  setActiveTab('transactions');
                } else if (notif.category === 'security') {
                  setSubView('sicherheit');
                }
              }}
            />
          )}

          {subView === 'zahlungsuebersicht' && (
            <StandingOrdersModal
              standingOrders={standingOrders}
              onClose={() => setSubView(null)}
              onAddStandingOrder={(order) => setStandingOrders((prev) => [order, ...prev])}
              onDeleteStandingOrder={(id) => setStandingOrders((prev) => prev.filter((o) => o.id !== id))}
              onShowToast={addToast}
            />
          )}

          {subView === 'dokumente' && (
            <DocumentsModal
              documents={documents}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'sicherheit' && (
            <SecurityModal
              userId={currentUser.id}
              currentPin={currentUser.id ? UserStore.getUserById(currentUser.id)?.pin : '12345'}
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'hilfe' && (
            <HelpModal
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'datenschutz' && (
            <DatenschutzModal
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}

          {subView === 'whatsapp-support' && (
            <WhatsAppSupportModal
              onClose={() => setSubView(null)}
              onShowToast={addToast}
            />
          )}
        </>
      )}
    </div>
  );
}
