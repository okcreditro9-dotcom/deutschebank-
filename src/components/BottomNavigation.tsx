import React from 'react';
import { Home, CreditCard, Landmark, BarChart3, User } from 'lucide-react';
import { NavigationTab } from '../types/banking';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onChangeTab: (tab: NavigationTab) => void;
  pendingLoanApplicationsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onChangeTab,
  pendingLoanApplicationsCount = 0,
}) => {
  const navItems: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'home', label: 'Übersicht', icon: Home },
    { id: 'account', label: 'Konto', icon: CreditCard },
    { id: 'credit', label: 'Kredite', icon: Landmark, badge: pendingLoanApplicationsCount },
    { id: 'transactions', label: 'Umsätze', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <nav
      aria-label="Hauptnavigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-lg shadow-slate-900/5 dark:shadow-black/20"
    >
      <div className="max-w-md md:max-w-xl mx-auto px-2">
        <ul className="grid grid-cols-5 h-16 items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="relative flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => onChangeTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full min-h-[48px] flex flex-col items-center justify-center py-1 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                      : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 ${
                        isActive ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-emerald-600 text-white text-[9px] font-bold flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] mt-1 tracking-tight truncate max-w-[64px]">
                    {item.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};
