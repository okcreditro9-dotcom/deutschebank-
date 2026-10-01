import React, { useState, useEffect } from 'react';
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
import { UserStore, ManagedUser } from './data/userStore';

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
import { MessageCircle } from 'lucide-react';

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

  // Synchronisation automatique continue avec la base de données centrale (/data/database.json)
  useEffect(() => {
    const refreshFromDb = async () => {
      await UserStore.syncWithServer();
      if (currentUser.id) {
        const u = UserStore.getUserById(currentUser.id);
        if (u) {
          setAccount(u.account);
          setTransactions(u.transactions);
          setCard(u.card);
          setCredit(u.credit);
          setApplication(u.application);
          setNotifications(u.notifications);
          setStandingOrders(u.standingOrders);
        }
      }
    };

    refreshFromDb();
    const interval = setInterval(refreshFromDb, 7000);
    const onWindowFocus = () => refreshFromDb();
    window.addEventListener('focus', onWindowFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onWindowFocus);
    };
  }, [currentUser.id]);

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

  // Synchronisation avec UserStore pour persistance en temps réel
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

    syncWithUserStore(updatedAccount, updatedTxList);
  };

  // Handler de demande de prêt
  const handleLoanApplicationSuccess = (newApp: LoanApplication) => {
    setApplication(newApp);
    setSubView('antragstatus');

    if (currentUser.id) {
      const user = UserStore.getUserById(currentUser.id);
      if (user) {
        user.application = newApp;
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
    }

    const newNotif: AppNotification = {
      id: `notif-app-${Date.now()}`,
      title: 'Kreditantrag eingereicht',
      message: `Ihr Antrag ${newApp.id} über ${newApp.loanDetails.amount.toFixed(2)} € wurde mit deutschem Staatsbürgerschaftsnachweis erfolgreich eingereicht.`,
      timestamp: 'Gerade eben',
      isRead: false,
      category: 'credit',
    };
    setNotifications((prev) => [newNotif, ...prev]);
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

    if (managedUser) {
      setCurrentUser({ id: managedUser.id, name: managedUser.name, email: managedUser.email });
      setAccount(managedUser.account);
      setTransactions(managedUser.transactions);
      setCredit(managedUser.credit);
      setCard(managedUser.card);
      setNotifications(managedUser.notifications);
      setStandingOrders(managedUser.standingOrders);
      setApplication(managedUser.application);
    } else if (isNewUser) {
      // Neuer Kunde ohne fiktive Buchungen
      const newIban = `DE89 3704 0044 ${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      setCurrentUser({ name, email });
      setAccount({
        accountHolder: name,
        accountType: accountType || 'AURA Girokonto Classic',
        iban: newIban,
        bic: 'AURADEBBXXX',
        balance: 0.0,
        availableBalance: 0.0,
        pendingBalance: 0.0,
        dispoLimit: 2500.0,
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

    setIsAdminAuthenticated(true);
    setIsAuthenticated(false);
    setViewingAsAdminClient(false);
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAuthenticated(false);
    setViewingAsAdminClient(false);
    addToast('Déconnexion administrateur', 'Vous avez été déconnecté.', 'info');
  };

  // Aperçu administrateur du compte client ("Voir l'espace de ce client")
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
    addToast('Aperçu du compte client', `Vous visualisez l'espace de ${user.name}.`, 'info');
  };

  const handleClientLogout = () => {
    setIsAuthenticated(false);
    setIsAdminAuthenticated(false);
    setViewingAsAdminClient(false);
    addToast('Déconnexion réussie', 'À bientôt sur AURA Bank.', 'info');
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    addToast('Toutes les notifications sont marquées comme lues', undefined, 'info');
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
                  Mode Administrateur : Vous visualisez l'espace de <strong className="text-white">{currentUser.name}</strong>
                </span>
              </div>
              <button
                onClick={() => setViewingAsAdminClient(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
              >
                ← Retour au Dashboard Administrateur
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
              <span>AURA Digital Banking Experience</span>
              <button
                onClick={() => setIsMobileFrameView(!isMobileFrameView)}
                className="hover:text-emerald-600 dark:hover:text-emerald-400 font-semibold cursor-pointer underline"
              >
                {isMobileFrameView ? 'Agrandir l\'affichage (Mode Bureau)' : 'Simuler format Smartphone'}
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
                  onBack={() => setActiveTab('home')}
                  onOpenSubView={(view) => setSubView(view)}
                  onStartApplicationWithParams={handleStartApplicationWithParams}
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
