import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Landmark, 
  Lock, 
  Unlock, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Send, 
  LogOut, 
  Eye, 
  EyeOff,
  Check,
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  RefreshCw,
  Sliders,
  DollarSign,
  UserCheck,
  UserX,
  X,
  ArrowLeft,
  Download,
  ZoomIn,
  Upload,
  BadgeCheck,
  Camera
} from 'lucide-react';
import { ManagedUser, UserStore } from '../../data/userStore';
import { formatEuro, formatIban } from '../../utils/formatters';
import { Transaction, CreditAccount } from '../../types/banking';
import { downloadFile } from '../../utils/germanIdSample';

interface AdminDashboardViewProps {
  onLogout: () => void;
  onViewAsClient: (user: ManagedUser) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onLogout,
  onViewAsClient,
  onShowToast,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>(() => UserStore.getUsers());
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminMainView, setAdminMainView] = useState<'clients' | 'cards'>('clients');
  const [cardsFilter, setCardsFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [revealedCards, setRevealedCards] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'balance' | 'transactions' | 'credit' | 'card' | 'idDocument' | 'message'>('balance');
  const [viewingPhotoModal, setViewingPhotoModal] = useState<{ src: string; title: string; filename: string } | null>(null);
  const adminFileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadIdPhoto = (dataUrl: string, filename: string) => {
    downloadFile(dataUrl, filename);
    onShowToast('Téléchargement lancé', `Le document "${filename}" a été téléchargé avec succès.`, 'success');
  };

  const handleAdminUploadId = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedUser) return;
    const file = e.target.files?.[0];
    if (file) {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        UserStore.saveUserIdDocument(selectedUser.id, file.name, dataUrl, sizeStr, 'Personalausweis (Bundesrepublik Deutschland)');
        reloadUsers();
        onShowToast('Justificatif enregistré', `La pièce d'identité "${file.name}" a été associée au dossier de ${selectedUser.name}.`, 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleRevealCard = (id: string) => {
    setRevealedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleApproveCard = (userId: string) => {
    UserStore.approveUserCard(userId);
    reloadUsers();
    onShowToast('Bankkarte genehmigt & freigeschaltet', 'Die persönliche Bankkarte wurde erfolgreich von der Bank verifiziert. Überweisungen sind nun aktiv.', 'success');
  };

  const handleRejectCard = (userId: string, reason?: string) => {
    UserStore.rejectUserCard(userId, reason || 'Mindestguthaben von 148,00 € nicht erreicht oder Verifikation fehlgeschlagen');
    reloadUsers();
    onShowToast('Bankkarte abgelehnt', 'Die Bankkarte wurde abgelehnt und der Kunde wurde im System informiert.', 'error');
  };

  const pendingCardsCount = users.filter((u) => u.card && u.card.status === 'pending').length;

  // Manual Fund Transfer Form
  const [manualAmount, setManualAmount] = useState('');
  const [manualType, setManualType] = useState<'credit' | 'debit'>('credit');
  const [manualPurpose, setManualPurpose] = useState('Virement bancaire entrant');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);

  // New Transaction Form Modal
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txSender, setTxSender] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txPurpose, setTxPurpose] = useState('');
  const [txCategory, setTxCategory] = useState<any>('Virement');
  const [txStatus, setTxStatus] = useState<'gebucht' | 'ausstehend'>('gebucht');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // New Loan Form Modal
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanTitle, setLoanTitle] = useState('Prêt Personnel Sérénité');
  const [loanAmount, setLoanAmount] = useState('15000');
  const [loanTerm, setLoanTerm] = useState('48');
  const [loanRate, setLoanRate] = useState('3.89');
  const [loanPurpose, setLoanPurpose] = useState('Projet personnel & Aménagement');

  // Message Form
  const [msgTitle, setMsgTitle] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgCategory, setMsgCategory] = useState<'banking' | 'credit' | 'security' | 'system'>('banking');

  // New User Modal
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserPin, setNewUserPin] = useState('12345');
  const [newUserInitialBalance, setNewUserInitialBalance] = useState('0');

  const reloadUsers = async () => {
    await UserStore.syncFromFirestore();
    const list = await UserStore.syncWithServer();
    setUsers(list);
  };

  useEffect(() => {
    reloadUsers();
    const interval = setInterval(reloadUsers, 8000);
    return () => clearInterval(interval);
  }, []);

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.account.iban.replace(/\s+/g, '').toLowerCase().includes(q.replace(/\s+/g, '')) ||
      (u.phone && u.phone.includes(q))
    );
  });

  // Global KPIs
  const totalDeposits = users.reduce((acc, u) => acc + (u.account?.balance || 0), 0);
  const totalLoans = users.reduce((acc, u) => acc + (u.credit?.remainingAmount || 0), 0);
  const totalTransactionsCount = users.reduce((acc, u) => acc + (u.transactions?.length || 0), 0);

  // 1. Crédit / Débit manuel de solde
  const handleExecuteManualOperation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const val = parseFloat(manualAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      onShowToast('Montant invalide', 'Veuillez saisir un montant supérieur à 0.', 'error');
      return;
    }

    if (manualType === 'credit') {
      UserStore.creditUserBalance(selectedUser.id, val, manualPurpose || 'Virement entrant', manualDate);
      onShowToast('Crédit effectué', `+${formatEuro(val)} crédités sur le compte de ${selectedUser.name}.`, 'success');
    } else {
      UserStore.debitUserBalance(selectedUser.id, val, manualPurpose || 'Prélèvement bancaire', manualDate);
      onShowToast('Débit effectué', `-${formatEuro(val)} débités du compte de ${selectedUser.name}.`, 'info');
    }

    reloadUsers();
    setManualAmount('');
  };

  // 2. Création de transaction personnalisée détaillée
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const val = parseFloat(txAmount.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      onShowToast('Montant invalide', 'Veuillez saisir un montant valide.', 'error');
      return;
    }

    const newTx: Transaction = {
      id: `tx-adm-${Date.now()}`,
      recipientOrSender: txSender || (txType === 'income' ? 'AURA Crédit' : 'AURA Débit'),
      iban: selectedUser.account.iban,
      purpose: txPurpose || 'Opération manuelle',
      amount: txType === 'income' ? val : -val,
      type: txType,
      date: txDate || new Date().toISOString().split('T')[0],
      timestamp: Date.now(),
      category: txCategory,
      status: txStatus,
      referenceId: `REF-ADM-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    UserStore.addTransactionToUser(selectedUser.id, newTx);
    reloadUsers();
    setShowAddTxModal(false);
    setTxSender('');
    setTxAmount('');
    setTxPurpose('');
    onShowToast('Transaction enregistrée', `Opération de ${formatEuro(val)} ajoutée pour ${selectedUser.name}.`, 'success');
  };

  // 3. Suppression d'une transaction existante
  const handleDeleteTx = (txId: string) => {
    if (!selectedUser) return;
    UserStore.deleteTransaction(selectedUser.id, txId);
    reloadUsers();
    onShowToast('Transaction supprimée', 'L\'opération a été retirée et le solde du compte a été ajusté.', 'info');
  };

  // 4. Blocage / Déblocage de la carte bancaire
  const handleToggleCardFreeze = () => {
    if (!selectedUser) return;
    const nextState = !selectedUser.card.isFrozen;
    UserStore.updateUserCardStatus(selectedUser.id, nextState);
    reloadUsers();
    onShowToast(
      nextState ? 'Carte suspendue' : 'Carte réactivée',
      `La carte bancaire de ${selectedUser.name} est maintenant ${nextState ? 'bloquée' : 'active'}.`,
      nextState ? 'error' : 'success'
    );
  };

  // 5. Blocage / Activation du compte client
  const handleToggleAccountStatus = () => {
    if (!selectedUser) return;
    const nextStatus = selectedUser.status === 'Aktiv' ? 'Gesperrt' : 'Aktiv';
    UserStore.updateUserStatus(selectedUser.id, nextStatus);
    reloadUsers();
    onShowToast(
      nextStatus === 'Aktiv' ? 'Compte activé' : 'Compte suspendu',
      `Le statut du compte de ${selectedUser.name} est désormais : ${nextStatus === 'Aktiv' ? 'Actif' : 'Suspendu'}.`,
      nextStatus === 'Aktiv' ? 'success' : 'error'
    );
  };

  // 6. Octroyer / Modifier un crédit pour le client
  const handleGrantCredit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const amount = parseFloat(loanAmount);
    const months = parseInt(loanTerm);
    const rate = parseFloat(loanRate);

    if (isNaN(amount) || amount <= 0 || isNaN(months) || months <= 0) {
      onShowToast('Erreur', 'Paramètres de prêt invalides.', 'error');
      return;
    }

    // Calcul de la mensualité
    const monthlyRate = Math.round(((amount / months) * (1 + (rate / 100) * (months / 12))) * 100) / 100;

    const newCredit: CreditAccount = {
      id: `cr-${Date.now()}`,
      title: loanTitle || 'Prêt Personnel AURA',
      contractNumber: `PRET-FR-${Math.floor(100000 + Math.random() * 900000)}`,
      requestedAmount: amount,
      remainingAmount: amount,
      interestRateEffective: rate,
      interestRateNominal: Math.max(0.5, rate - 0.1),
      monthlyRate,
      termMonths: months,
      remainingMonths: months,
      nextPaymentDate: '15/10/2026',
      paidAmount: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: '2030-12-15',
      purpose: loanPurpose,
      status: 'Aktiv',
    };

    UserStore.setUserCredit(selectedUser.id, newCredit);
    reloadUsers();
    setShowLoanModal(false);
    onShowToast('Prêt bancaire accordé', `Un crédit de ${formatEuro(amount)} a été activé sur le compte de ${selectedUser.name}.`, 'success');
  };

  const handleRemoveCredit = () => {
    if (!selectedUser) return;
    UserStore.setUserCredit(selectedUser.id, null);
    reloadUsers();
    onShowToast('Crédit clôturé', `Le prêt pour ${selectedUser.name} a été clôturé avec succès.`, 'info');
  };

  // 7. Envoyer un message / une notification
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !msgTitle || !msgText) return;

    UserStore.addNotificationToUser(selectedUser.id, msgTitle, msgText, msgCategory);
    reloadUsers();
    setMsgTitle('');
    setMsgText('');
    onShowToast('Message transmis', `La notification a été envoyée sur l'espace client de ${selectedUser.name}.`, 'success');
  };

  // 8. Création manuelle d'un client par l'administrateur
  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    const initialBal = parseFloat(newUserInitialBalance) || 0;
    const user = UserStore.registerNewUser(newUserName, newUserEmail, newUserPhone, newUserPin || '12345', initialBal);

    reloadUsers();
    setSelectedUserId(user.id);
    setShowNewUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    setNewUserPin('12345');
    setNewUserInitialBalance('0');
    onShowToast('Client créé', `Le compte de ${user.name} a été créé avec succès.`, 'success');
  };

  // 9. Suppression du compte client
  const handleDeleteUser = (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer définitivement ce compte client ?')) {
      UserStore.deleteUser(userId);
      reloadUsers();
      const remaining = UserStore.getUsers();
      if (remaining.length > 0) {
        setSelectedUserId(remaining[0].id);
      }
      onShowToast('Compte supprimé', 'Le client et toutes ses données ont été supprimés.', 'info');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-700 shrink-0"
              title="Retour à l'accueil / Déconnexion"
            >
              <ArrowLeft className="w-4 h-4 text-indigo-400" />
              <span>Retour</span>
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-base shadow-md shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-extrabold tracking-tight text-white">
                  AURA BANK · TABLEAU DE BORD ADMINISTRATEUR
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/40">
                  ID: 49494949
                </span>
              </div>
              <span className="text-xs text-slate-400">
                Gestion manuelle et centralisée de tous les comptes clients
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNewUserModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau client</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Clients enregistrés
              </span>
              <span className="text-2xl font-black text-white font-mono-numbers">
                {users.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 text-indigo-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Total des dépôts clients
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono-numbers">
                {formatEuro(totalDeposits)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Encours total des crédits
              </span>
              <span className="text-2xl font-black text-sky-400 font-mono-numbers">
                {formatEuro(totalLoans)}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-950/60 text-sky-400 flex items-center justify-center">
              <Landmark className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Navigation Switcher: Kundenverwaltung vs Bankkarten-Prüfung & Freigabe */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setAdminMainView('clients')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              adminMainView === 'clients'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Kundenkonten &amp; Verwaltung ({users.length})</span>
          </button>

          <button
            onClick={() => setAdminMainView('cards')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer relative ${
              adminMainView === 'cards'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bankkarten-Prüfung &amp; Freigabe</span>
            {pendingCardsCount > 0 ? (
              <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                {pendingCardsCount} Prüfung ausstehend
              </span>
            ) : (
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px]">
                Alle geprüft
              </span>
            )}
          </button>
        </div>

        {adminMainView === 'clients' ? (
          /* 2-Column Layout : Left Client List, Right Client Controls */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Client Selector (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-900 rounded-3xl border border-slate-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Liste des clients ({users.length})
              </h3>
              <button
                onClick={reloadUsers}
                className="p-1 text-slate-400 hover:text-white"
                title="Actualiser la liste"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Rechercher par nom, e-mail, IBAN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Client List Items */}
            <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  Aucun client trouvé.
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSelected = u.id === selectedUser?.id;
                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500/80 ring-1 ring-indigo-500'
                          : 'bg-slate-800/50 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-bold text-xs text-white truncate">
                            {u.name}
                          </span>
                        </div>
                        <span className="font-bold text-xs font-mono-numbers text-emerald-400 whitespace-nowrap">
                          {formatEuro(u.account.balance)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="truncate max-w-[170px]">{u.email}</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {u.transactions.length} opération(s)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Client Detailed Controls (7 Cols) */}
          {selectedUser ? (
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6">
              {/* Selected User Header Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-extrabold text-base shrink-0 shadow-md">
                    {selectedUser.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white truncate">
                        {selectedUser.name}
                      </h4>
                      {selectedUser.status === 'Gesperrt' ? (
                        <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                          Compte Suspendu
                        </span>
                      ) : (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                          Compte Actif
                        </span>
                      )}
                      {selectedUser.card.isFrozen && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                          Carte bloquée
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {selectedUser.email} {selectedUser.phone ? `· ${selectedUser.phone}` : ''}
                    </p>
                    <p className="text-[11px] font-mono text-indigo-300 mt-0.5">
                      IBAN : {formatIban(selectedUser.account.iban)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewAsClient(selectedUser)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                    title="Ouvrir la session directe de ce client"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Voir l'espace de ce client</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(selectedUser.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer border border-slate-700"
                    title="Supprimer ce compte client"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
                <button
                  onClick={() => setActiveTab('balance')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'balance'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  Crédit / Débit manuel
                </button>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'transactions'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  Transactions ({selectedUser.transactions.length})
                </button>
                <button
                  onClick={() => setActiveTab('credit')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'credit'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  Crédit / Prêt ({selectedUser.credit ? 'Actif' : 'Aucun'})
                </button>
                <button
                  onClick={() => setActiveTab('idDocument')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'idDocument'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Passeport / CNI Allemande</span>
                  {(selectedUser.idDocument?.dataUrl || selectedUser.application?.documents?.idDocumentData) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('card')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'card'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Bankkarte &amp; Prüfung</span>
                  {selectedUser.card.status === 'pending' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('message')}
                  className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'message'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-800/40'
                  }`}
                >
                  Envoyer un message
                </button>
              </div>

              {/* TAB 1: Balance Adjustment (Créditer / Débiter) */}
              {activeTab === 'balance' && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block mb-0.5">Solde actuel disponible</span>
                      <span className="text-2xl font-black text-white font-mono-numbers">
                        {formatEuro(selectedUser.account.balance)}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      Découvert autorisé : {formatEuro(selectedUser.account.dispoLimit)}
                    </span>
                  </div>

                  <form onSubmit={handleExecuteManualOperation} className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Effectuer une opération manuelle sur le solde
                    </h4>

                    {/* Radio : Crédit vs Débit */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setManualType('credit')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                          manualType === 'credit'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                        <span>Créditer des fonds (+)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setManualType('debit')}
                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all cursor-pointer ${
                          manualType === 'debit'
                            ? 'bg-rose-600/20 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4 text-rose-400" />
                        <span>Débiter des fonds (-)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Montant en € *
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            required
                            placeholder="0,00"
                            value={manualAmount}
                            onChange={(e) => setManualAmount(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono-numbers font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                          />
                          <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-bold">€</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Motif / Libellé de l'opération
                        </label>
                        <input
                          type="text"
                          required
                          value={manualPurpose}
                          onChange={(e) => setManualPurpose(e.target.value)}
                          placeholder="ex : Virement reçu ou Déblocage de prêt"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-300">
                          Date de valeur
                        </label>
                        <input
                          type="date"
                          value={manualDate}
                          onChange={(e) => setManualDate(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        manualType === 'credit'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {manualType === 'credit' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      <span>
                        {manualType === 'credit'
                          ? `Enregistrer le crédit sur le compte de ${selectedUser.name}`
                          : `Enregistrer le débit sur le compte de ${selectedUser.name}`}
                      </span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: Transactions Management */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Historique des opérations ({selectedUser.transactions.length})
                    </h4>
                    <button
                      onClick={() => setShowAddTxModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter une opération</span>
                    </button>
                  </div>

                  <div className="divide-y divide-slate-800 max-h-[420px] overflow-y-auto">
                    {selectedUser.transactions.length === 0 ? (
                      <div className="py-12 text-center text-slate-500 text-xs space-y-2">
                        <p className="font-semibold text-slate-400">Aucune opération pour ce client</p>
                        <p className="text-[11px]">Le compte est vierge de toute opération fictive, conformément à vos instructions.</p>
                        <button
                          onClick={() => setShowAddTxModal(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Créer une première transaction</span>
                        </button>
                      </div>
                    ) : (
                      selectedUser.transactions.map((tx) => {
                        const isPos = tx.amount > 0;
                        return (
                          <div key={tx.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">{tx.recipientOrSender}</p>
                              <p className="text-slate-400 text-[11px] truncate">{tx.purpose}</p>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {tx.date} · {tx.category} · {tx.status === 'gebucht' ? 'Validé' : 'En attente'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`font-mono-numbers font-bold ${
                                isPos ? 'text-emerald-400' : 'text-slate-200'
                              }`}>
                                {formatEuro(tx.amount)}
                              </span>
                              <button
                                onClick={() => handleDeleteTx(tx.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                                title="Supprimer et réajuster le solde"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Credit / Loan Management */}
              {activeTab === 'credit' && (
                <div className="space-y-4">
                  {selectedUser.credit ? (
                    <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                            Contrat actif N° : {selectedUser.credit.contractNumber}
                          </span>
                          <h4 className="text-base font-bold text-white">{selectedUser.credit.title}</h4>
                        </div>
                        <button
                          onClick={handleRemoveCredit}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 text-xs font-semibold cursor-pointer border border-rose-500/30"
                        >
                          Clôturer ce crédit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Montant accordé</span>
                          <span className="font-mono-numbers font-bold text-white">
                            {formatEuro(selectedUser.credit.requestedAmount)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Restant à rembourser</span>
                          <span className="font-mono-numbers font-bold text-emerald-400">
                            {formatEuro(selectedUser.credit.remainingAmount)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Mensualité</span>
                          <span className="font-mono-numbers font-bold text-white">
                            {formatEuro(selectedUser.credit.monthlyRate)}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-800">
                          <span className="text-[10px] text-slate-400 block">Taux d'intérêt</span>
                          <span className="font-mono-numbers font-bold text-white">
                            {selectedUser.credit.interestRateEffective.toFixed(2)} %
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 text-indigo-400 flex items-center justify-center mx-auto">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Aucun crédit actif pour ce client</h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto">
                        Vous pouvez configurer et octroyer manuellement un prêt bancaire à ce client selon les conditions choisies.
                      </p>
                      <button
                        onClick={() => setShowLoanModal(true)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                      >
                        Accorder un prêt bancaire
                      </button>
                    </div>
                  )}

                  {/* Section Justificatif allemand dans Crédit / Prêt */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">
                          Preuve de nationalité allemande (Personalausweis / Reisepass)
                        </h5>
                      </div>
                      <button
                        onClick={() => setActiveTab('idDocument')}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                      >
                        Voir en grand format →
                      </button>
                    </div>

                    {(() => {
                      const doc = selectedUser.idDocument || (selectedUser.application?.documents?.idDocumentData ? {
                        name: selectedUser.application.documents.idDocumentName || 'Deutscher_Personalausweis.svg',
                        dataUrl: selectedUser.application.documents.idDocumentData,
                        uploadedAt: selectedUser.application.documents.idDocumentUploadedAt || '26.09.2026',
                        fileSize: '1.2 MB',
                        documentType: selectedUser.application.documents.idDocumentType || 'Personalausweis (Bundesrepublik Deutschland)',
                      } : null);

                      if (!doc) {
                        return (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                            <span className="text-slate-400">Aucune pièce d'identité importée pour ce dossier.</span>
                            <button
                              onClick={() => adminFileInputRef.current?.click()}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs cursor-pointer"
                            >
                              Importer maintenant
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                          <div 
                            onClick={() => setViewingPhotoModal({ src: doc.dataUrl, title: `Justificatif d'identité - ${selectedUser.name}`, filename: doc.name })}
                            className="w-36 h-24 rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center shrink-0 border border-slate-800 cursor-pointer hover:border-emerald-500 transition-colors"
                          >
                            <img src={doc.dataUrl} alt="Aperçu Ausweis" className="max-h-24 w-auto object-contain" />
                          </div>
                          <div className="flex-1 space-y-1 text-xs">
                            <span className="font-bold text-white block">{doc.name}</span>
                            <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                              <BadgeCheck className="w-3.5 h-3.5" />
                              Deutscher Staatsbürgerschaftsnachweis verifiziert 🇩🇪
                            </span>
                            <span className="text-[10px] text-slate-500 block">Importé le {doc.uploadedAt}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingPhotoModal({ src: doc.dataUrl, title: `Justificatif d'identité - ${selectedUser.name}`, filename: doc.name })}
                              className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                              <span>Voir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDownloadIdPhoto(doc.dataUrl, doc.name)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Télécharger</span>
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}

              {/* TAB DÉDIÉ : Justificatif d'identité & Passeport allemand avec visualisation HD et téléchargement direct */}
              {activeTab === 'idDocument' && (
                <div className="space-y-4">
                  {/* Header Card */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-5 h-5 text-emerald-400" />
                        <h4 className="text-sm font-bold text-white">
                          Deutscher Staatsbürgerschaftsnachweis (Pièce d'identité / Passeport)
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Vérification de la nationalité allemande du client pour approbation du prêt et du compte bancaire.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        ref={adminFileInputRef}
                        onChange={handleAdminUploadId}
                        accept="image/*,application/pdf"
                        className="hidden"
                      />
                      <button
                        onClick={() => adminFileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Remplacer / Importer</span>
                      </button>
                    </div>
                  </div>

                  {/* Document Details & Viewer */}
                  {(() => {
                    const doc = selectedUser.idDocument || (selectedUser.application?.documents?.idDocumentData ? {
                      name: selectedUser.application.documents.idDocumentName || 'Deutscher_Personalausweis.svg',
                      dataUrl: selectedUser.application.documents.idDocumentData,
                      uploadedAt: selectedUser.application.documents.idDocumentUploadedAt || '26.09.2026',
                      fileSize: '1.2 MB',
                      documentType: selectedUser.application.documents.idDocumentType || 'Personalausweis (Bundesrepublik Deutschland)',
                    } : null);

                    if (!doc) {
                      return (
                        <div className="p-8 rounded-2xl bg-slate-800/30 border border-dashed border-slate-700 text-center space-y-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                            <FileText className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-bold text-white">Aucun justificatif allemand importé</h4>
                          <p className="text-xs text-slate-400 max-w-sm mx-auto">
                            Le client n'a pas encore téléversé sa pièce d'identité ou son passeport allemand. Vous pouvez l'importer manuellement ci-dessus.
                          </p>
                          <button
                            onClick={() => adminFileInputRef.current?.click()}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                          >
                            Importer un document pour ce client
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {/* Metadata Card */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                            <span className="text-[10px] text-slate-400 block">Type de pièce</span>
                            <span className="font-bold text-white truncate block">
                              {doc.documentType || 'Personalausweis'}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                            <span className="text-[10px] text-slate-400 block">Nom du fichier</span>
                            <span className="font-mono text-emerald-400 truncate block text-[11px]" title={doc.name}>
                              {doc.name}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                            <span className="text-[10px] text-slate-400 block">Date d'importation</span>
                            <span className="font-bold text-white">
                              {doc.uploadedAt}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
                            <span className="text-[10px] text-slate-400 block">Statut nationalité</span>
                            <span className="font-bold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Allemand certifié 🇩🇪
                            </span>
                          </div>
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                          <div className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="font-bold">Aperçu haute résolution :</span>
                            <span className="text-[11px] text-slate-400">Cliquez sur Télécharger pour sauvegarder la photo originale</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingPhotoModal({ src: doc.dataUrl, title: `Justificatif d'identité - ${selectedUser.name}`, filename: doc.name })}
                              className="px-3.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
                              <span>Agrandir / Plein écran</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadIdPhoto(doc.dataUrl, doc.name)}
                              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                            >
                              <Download className="w-4 h-4" />
                              <span>Télécharger la photo</span>
                            </button>
                          </div>
                        </div>

                        {/* Image Display Frame */}
                        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 p-3 sm:p-5 flex items-center justify-center shadow-xl">
                          <img
                            src={doc.dataUrl}
                            alt="Justificatif allemand"
                            className="max-h-[460px] w-auto max-w-full object-contain rounded-xl shadow-2xl cursor-pointer hover:opacity-95 transition-opacity"
                            onClick={() => setViewingPhotoModal({ src: doc.dataUrl, title: `Justificatif d'identité - ${selectedUser.name}`, filename: doc.name })}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* TAB 4: Card Review, Security & Account Status */}
              {activeTab === 'card' && (
                <div className="space-y-4">
                  {/* Detailed Card Review Section */}
                  <div className="p-5 rounded-2xl bg-slate-800/70 border border-slate-700 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            Persönliche Bankkarte des Kunden
                          </h4>
                          {selectedUser.card.status === 'pending' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/40 animate-pulse">
                              ⏳ In Prüfung erforderlich
                            </span>
                          )}
                          {selectedUser.card.status === 'approved' && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                              ✓ Genehmigt &amp; Aktiv
                            </span>
                          )}
                          {selectedUser.card.status === 'rejected' && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/40">
                              ✕ Abgelehnt
                            </span>
                          )}
                          {selectedUser.card.status === 'none' && (
                            <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-full">
                              Keine Karte hinterlegt
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Mindestguthaben-Vorschrift: Mindestens 148,00 € erforderlich zur Verknüpfung
                        </p>
                      </div>

                      {/* Approval / Rejection Buttons */}
                      <div className="flex items-center gap-2">
                        {selectedUser.card.status !== 'none' && (
                          <>
                            {selectedUser.card.status !== 'approved' && (
                              <button
                                type="button"
                                onClick={() => handleApproveCard(selectedUser.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Akzeptieren &amp; Freischalten</span>
                              </button>
                            )}

                            {selectedUser.card.status !== 'rejected' && (
                              <button
                                type="button"
                                onClick={() => handleRejectCard(selectedUser.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Ablehnen</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {selectedUser.card.status === 'none' ? (
                      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-center py-6 text-xs text-slate-400">
                        <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        Der Kunde hat noch keine persönliche Bankkarte registriert. Überweisungen sind im Kundenkonto automatisch gesperrt.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Visual Card Preview in Admin */}
                        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-700 text-white text-xs font-mono space-y-2.5">
                          <div className="flex items-center justify-between text-slate-400 text-[11px]">
                            <span>Bank: <strong className="text-white">{selectedUser.card.bankName || 'Nicht angegeben'}</strong></span>
                            <span className="text-indigo-400 font-bold">{selectedUser.card.cardType || 'Kreditkarte'}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm sm:text-base tracking-widest font-bold text-emerald-400">
                            <span>
                              {revealedCards[selectedUser.id] 
                                ? (selectedUser.card.cardNumber || selectedUser.card.cardNumberMasked) 
                                : selectedUser.card.cardNumberMasked}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => toggleRevealCard(selectedUser.id)}
                                className="text-slate-400 hover:text-white p-1 text-xs"
                                title="Nummer ein-/ausblenden"
                              >
                                {revealedCards[selectedUser.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px] text-slate-300">
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">Karteninhaber</span>
                              <span className="font-bold text-white truncate block">{selectedUser.card.cardHolder}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">Gültig bis</span>
                              <span className="font-bold text-white">{selectedUser.card.expiryMonth}/{selectedUser.card.expiryYear}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-500 uppercase block">CVV / CVC</span>
                              <span className="font-bold text-amber-400">
                                {revealedCards[selectedUser.id] ? selectedUser.card.cvv : '•••'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Balance and Rule Check Box */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block mb-0.5">Deklariertes Kartenguthaben</span>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white font-mono-numbers text-sm">
                                {formatEuro(selectedUser.card.cardBalance)}
                              </span>
                              {selectedUser.card.cardBalance >= 148 ? (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded">
                                  ✓ ≥ 148,00 € Erfüllt
                                </span>
                              ) : (
                                <span className="text-[10px] bg-rose-500/20 text-rose-400 font-bold px-2 py-0.5 rounded">
                                  ⚠️ Unter 148,00 €
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <span className="text-slate-400 block mb-0.5">Status der Überweisungs-Freigabe</span>
                            <span className={`font-bold block ${selectedUser.card.status === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                              {selectedUser.card.status === 'approved' ? 'Überweisungen Aktiv (Freigeschaltet)' : 'Überweisungen Gesperrt (Keine Freigabe)'}
                            </span>
                          </div>
                        </div>

                        {selectedUser.card.rejectionReason && (
                          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                            <strong>Grund für Ablehnung:</strong> {selectedUser.card.rejectionReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Carte freeze toggle */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Debitkarte vorübergehend sperren</p>
                      <span className="text-[11px] text-slate-400">
                        Zustand: {selectedUser.card.isFrozen ? 'Vorübergehend gesperrt' : 'Voll einsatzbereit'}
                      </span>
                    </div>

                    <button
                      onClick={handleToggleCardFreeze}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedUser.card.isFrozen
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-rose-600 hover:bg-rose-500 text-white'
                      }`}
                    >
                      {selectedUser.card.isFrozen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{selectedUser.card.isFrozen ? 'Karte entsperren' : 'Karte sperren'}</span>
                    </button>
                  </div>

                  {/* Statut du compte client */}
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Zugriff auf das Kundenkonto</p>
                      <span className="text-[11px] text-slate-400">
                        Status: {selectedUser.status === 'Aktiv' ? 'Konto aktiv' : 'Konto vorübergehend gesperrt'}
                      </span>
                    </div>

                    <button
                      onClick={handleToggleAccountStatus}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        selectedUser.status === 'Gesperrt'
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      {selectedUser.status === 'Gesperrt' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      <span>{selectedUser.status === 'Gesperrt' ? 'Konto reaktivieren' : 'Konto sperren'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-800">
                      <span className="text-slate-400 block mb-0.5">Tageslimit</span>
                      <span className="font-bold text-white font-mono-numbers">
                        {formatEuro(selectedUser.card.dailyLimit)} / Tag
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-800">
                      <span className="text-slate-400 block mb-0.5">Monatslimit</span>
                      <span className="font-bold text-white font-mono-numbers">
                        {formatEuro(selectedUser.card.monthlyLimit)} / Monat
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: Send Notification */}
              {activeTab === 'message' && (
                <form onSubmit={handleSendMessage} className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Transmettre une notification directe au client
                  </h4>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Titre de la notification *</label>
                    <input
                      type="text"
                      required
                      value={msgTitle}
                      onChange={(e) => setMsgTitle(e.target.value)}
                      placeholder="ex : Confirmation de virement ou Information sur votre compte"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Message détaillé *</label>
                    <textarea
                      required
                      rows={3}
                      value={msgText}
                      onChange={(e) => setMsgText(e.target.value)}
                      placeholder="Saisissez ici le texte qui apparaîtra dans les notifications de l'application du client..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Catégorie</label>
                    <select
                      value={msgCategory}
                      onChange={(e) => setMsgCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs outline-none"
                    >
                      <option value="banking">Opération bancaire</option>
                      <option value="credit">Prêt &amp; Financement</option>
                      <option value="security">Sécurité &amp; Carte</option>
                      <option value="system">Information générale</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la notification au client</span>
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="lg:col-span-7 p-12 text-center text-slate-500 text-sm">
              Sélectionnez un client sur la gauche pour gérer son compte bancaire.
            </div>
          )}
        </div>
        ) : (
          /* Dedicated Bank Cards Center */
          <div className="space-y-6">
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdminMainView('clients')}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-700 shrink-0"
                    title="Zurück zur Kundenverwaltung"
                  >
                    <ArrowLeft className="w-4 h-4 text-indigo-400" />
                    <span>Zurück</span>
                  </button>
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-indigo-400" />
                      <span>Zentrales Bankkarten-Prüfzentrum</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Überprüfen und genehmigen Sie die persönlichen Bankkarten aller Kunden mit dem 148,00 € Mindestguthaben.
                    </p>
                  </div>
                </div>

                {/* Status Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { key: 'all', label: 'Alle', count: users.length },
                    { key: 'pending', label: 'In Prüfung', count: users.filter((u) => u.card.status === 'pending').length },
                    { key: 'approved', label: 'Genehmigt', count: users.filter((u) => u.card.status === 'approved').length },
                    { key: 'rejected', label: 'Abgelehnt', count: users.filter((u) => u.card.status === 'rejected').length },
                  ].map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setCardsFilter(f.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        cardsFilter === f.key
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                      }`}
                    >
                      {f.label} ({f.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Regulatory Notice Banner in German */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-300 mb-0.5">Vorgabe für Banküberweisungen:</strong>
                  Kunden müssen ihre <strong>echte persönliche Bankkarte mit mindestens 148,00 € Guthaben</strong> verknüpfen. Solange Sie als Administrator die Karte nicht über den Button "Akzeptieren &amp; Freischalten" bestätigen, sind Überweisungen für das Kundenkonto automatisch gesperrt.
                </div>
              </div>
            </div>

            {/* Cards List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {users
                .filter((u) => {
                  if (cardsFilter === 'all') return true;
                  return u.card.status === cardsFilter;
                })
                .map((u) => {
                  const card = u.card;
                  const isPending = card.status === 'pending';
                  const isApproved = card.status === 'approved';
                  const isRejected = card.status === 'rejected';
                  const isNone = card.status === 'none';

                  return (
                    <div
                      key={u.id}
                      className={`p-5 rounded-3xl border transition-all ${
                        isPending
                          ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      {/* Header info */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{u.name}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">({u.account.iban.slice(0, 14)}...)</span>
                          </div>
                          <span className="text-xs text-slate-400 block truncate">{u.email}</span>
                        </div>

                        {/* Status Badge */}
                        <div>
                          {isPending && (
                            <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                              ⏳ In Prüfung
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                              ✓ Genehmigt &amp; Aktiv
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[11px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                              ✕ Abgelehnt
                            </span>
                          )}
                          {isNone && (
                            <span className="text-[11px] bg-slate-800 text-slate-400 border border-slate-700 px-2.5 py-1 rounded-full font-bold">
                              Keine Karte
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Preview Box */}
                      {isNone ? (
                        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 text-center py-6 text-xs text-slate-500">
                          Der Kunde hat noch keine persönliche Bankkarte zur Verknüpfung eingereicht.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-950 via-zinc-900 to-slate-900 border border-slate-700/80 text-white font-mono text-xs space-y-3">
                            <div className="flex items-center justify-between text-slate-400 text-[11px]">
                              <span className="truncate max-w-[200px]">Bank: <strong className="text-white">{card.bankName || 'Nicht angegeben'}</strong></span>
                              <span className="text-emerald-400 font-bold uppercase">{card.cardType || 'Mastercard'}</span>
                            </div>

                            <div className="flex items-center justify-between text-sm sm:text-base font-bold text-white tracking-widest">
                              <span>
                                {revealedCards[u.id] ? (card.cardNumber || card.cardNumberMasked) : card.cardNumberMasked}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleRevealCard(u.id)}
                                className="text-slate-400 hover:text-white p-1 cursor-pointer"
                                title="Nummer ein-/ausblenden"
                              >
                                {revealedCards[u.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-emerald-400" />}
                              </button>
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block">Inhaber</span>
                                <span className="font-bold text-white truncate block">{card.cardHolder || u.name.toUpperCase()}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block">Gültig bis</span>
                                <span className="font-bold text-white">{card.expiryMonth}/{card.expiryYear}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase block">CVV</span>
                                <span className="font-bold text-amber-400 font-mono">{revealedCards[u.id] ? card.cvv : '•••'}</span>
                              </div>
                            </div>
                          </div>

                          {/* Balance verification pill */}
                          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Deklariertes Kartenguthaben</span>
                              <span className="font-bold text-white font-mono-numbers text-sm">
                                {formatEuro(card.cardBalance)}
                              </span>
                            </div>
                            <div>
                              {card.cardBalance >= 148 ? (
                                <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" /> Mindestwert ≥ 148 € erfüllt
                                </span>
                              ) : (
                                <span className="text-[11px] bg-rose-500/20 text-rose-400 font-bold px-2.5 py-1 rounded-full border border-rose-500/30 flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5" /> Unter 148 € erforderlich
                                </span>
                              )}
                            </div>
                          </div>

                          {card.rejectionReason && (
                            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                              Ablehnungsgrund: {card.rejectionReason}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-4 border-t border-slate-800 mt-4">
                        {isPending && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleApproveCard(u.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Akzeptieren &amp; Freischalten</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectCard(u.id)}
                              className="px-3.5 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <X className="w-4 h-4" />
                              <span>Ablehnen</span>
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleRejectCard(u.id, 'Nachträglich durch Administrator entzogen')}
                              className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Freigabe entziehen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setAdminMainView('clients');
                                onViewAsClient(u);
                              }}
                              className="flex-1 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Als Kunde einloggen</span>
                            </button>
                          </>
                        )}

                        {isRejected && (
                          <button
                            type="button"
                            onClick={() => handleApproveCard(u.id)}
                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Nachträglich genehmigen &amp; freischalten</span>
                          </button>
                        )}

                        {isNone && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setAdminMainView('clients');
                              setActiveTab('message');
                              onShowToast('Benachrichtigung verfassen', `Senden Sie eine Aufforderung an ${u.name}.`, 'info');
                            }}
                            className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Kartenaufforderung senden</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* Modal: New Transaction */}
      {showAddTxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-700 shrink-0"
                  title="Retour"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span>Retour</span>
                </button>
                <h3 className="text-base font-bold text-white">Ajouter une opération manuelle</h3>
              </div>
              <button onClick={() => setShowAddTxModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('income')}
                  className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                    txType === 'income' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Crédit / Entrée (+)
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('expense')}
                  className={`py-2 rounded-xl font-bold border transition-colors cursor-pointer ${
                    txType === 'expense' ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-800 border-slate-700 text-slate-300'
                  }`}
                >
                  Débit / Sortie (-)
                </button>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Émetteur ou Bénéficiaire *</label>
                <input
                  type="text"
                  required
                  placeholder="ex : Trésor Public, Employeur, Virement..."
                  value={txSender}
                  onChange={(e) => setTxSender(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Montant en € *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0,00"
                    value={txAmount}
                    onChange={(e) => setTxAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Date</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Motif / Libellé de l'opération</label>
                <input
                  type="text"
                  placeholder="ex : Salaire mensuel ou Remboursement"
                  value={txPurpose}
                  onChange={(e) => setTxPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Catégorie</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  >
                    <option value="Virement">Virement</option>
                    <option value="Salaire">Salaire</option>
                    <option value="Logement">Logement</option>
                    <option value="Alimentation">Alimentation</option>
                    <option value="Loisirs">Loisirs</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1">Statut</label>
                  <select
                    value={txStatus}
                    onChange={(e) => setTxStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  >
                    <option value="gebucht">Validé (exécuté)</option>
                    <option value="ausstehend">En attente / En cours</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTxModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New Loan Grant */}
      {showLoanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-700 shrink-0"
                  title="Retour"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span>Retour</span>
                </button>
                <h3 className="text-base font-bold text-white">Accorder un prêt bancaire</h3>
              </div>
              <button onClick={() => setShowLoanModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGrantCredit} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Intitulé du prêt</label>
                <input
                  type="text"
                  required
                  value={loanTitle}
                  onChange={(e) => setLoanTitle(e.target.value)}
                  placeholder="ex : Prêt Personnel Sérénité"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Montant emprunté (€) *</label>
                  <input
                    type="number"
                    step="100"
                    min="500"
                    required
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Durée (en mois) *</label>
                  <input
                    type="number"
                    min="6"
                    max="120"
                    required
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Taux annuel effectif (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={loanRate}
                    onChange={(e) => setLoanRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Motif / Destination</label>
                  <input
                    type="text"
                    value={loanPurpose}
                    onChange={(e) => setLoanPurpose(e.target.value)}
                    placeholder="ex : Travaux ou Véhicule"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Activer le crédit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: New User Creation */}
      {showNewUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer shadow-sm border border-slate-700 shrink-0"
                  title="Retour"
                >
                  <ArrowLeft className="w-4 h-4 text-indigo-400" />
                  <span>Retour</span>
                </button>
                <h3 className="text-base font-bold text-white">Créer un nouveau client</h3>
              </div>
              <button onClick={() => setShowNewUserModal(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Nom et prénom complets *</label>
                <input
                  type="text"
                  required
                  placeholder="ex : Sophie Lambert"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Adresse e-mail *</label>
                  <input
                    type="email"
                    required
                    placeholder="sophie.lambert@mail.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Téléphone</label>
                  <input
                    type="tel"
                    placeholder="+33 6 00 00 00 00"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 block mb-1">Mot de passe / Code d'accès</label>
                  <input
                    type="text"
                    value={newUserPin}
                    onChange={(e) => setNewUserPin(e.target.value)}
                    placeholder="12345"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Solde initial (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newUserInitialBalance}
                    onChange={(e) => setNewUserInitialBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewUserModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer"
                >
                  Créer le compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL APERÇU HD & TÉLÉCHARGEMENT DE LA PIÈCE D'IDENTITÉ / PASSEPORT */}
      {viewingPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-slate-900 max-w-4xl w-full rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/80">
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">{viewingPhotoModal.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{viewingPhotoModal.filename}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadIdPhoto(viewingPhotoModal.src, viewingPhotoModal.filename)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Télécharger la photo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPhotoModal(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto flex items-center justify-center bg-slate-950 flex-1">
              <img
                src={viewingPhotoModal.src}
                alt={viewingPhotoModal.title}
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-xl shadow-2xl border border-slate-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
