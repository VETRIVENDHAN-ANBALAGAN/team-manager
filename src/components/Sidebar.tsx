import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderOpen, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Plus, 
  TrendingUp,
  ShieldCheck,
  Briefcase,
  Building,
  UserCheck
} from 'lucide-react';
import { BRAND_LOGO, CLANS } from '../data';
import { User, UserRole } from '../types';

interface SidebarProps {
  currentUser: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onNewReport: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSwitchRole: (role: UserRole) => void;
}

export default function Sidebar({ 
  currentUser,
  activeTab, 
  setActiveTab, 
  onLogout, 
  onNewReport,
  isMobileOpen,
  setIsMobileOpen,
  onSwitchRole
}: SidebarProps) {

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects Workspace', icon: Briefcase },
    { id: 'clients', label: 'Clients Ledger', icon: Building },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'files', label: 'Secure Files', icon: FolderOpen },
    { id: 'reports', label: 'Insight Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter(item => {
    const role = currentUser?.role;
    if (role === 'Team Member') {
      return ['dashboard', 'projects', 'files', 'settings'].includes(item.id);
    }
    if (role === 'Clan Leader') {
      return ['dashboard', 'projects', 'team', 'files', 'reports', 'settings'].includes(item.id);
    }
    return true; // Admin has full access
  });

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileOpen(false);
  };

  // Find clan info if assigned
  const userClan = CLANS.find(c => c.id === currentUser?.clanId);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800 text-slate-300 p-4 font-sans select-none overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 mb-5 shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg">
          <img src={BRAND_LOGO} alt="IMS Pro Logo" className="w-full h-full object-cover" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-tight leading-none text-base flex items-center gap-1.5">
            IMS Pro
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase">
              Pro
            </span>
          </h1>
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase mt-1">Enterprise Tier</p>
        </div>
      </div>

      {/* Authenticated User Status Box */}
      {currentUser && (
        <div className="mb-5 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 shrink-0 shadow-inner">
          <div className="flex items-center gap-3 mb-2.5">
            <div className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center text-xs font-bold text-white uppercase shadow ${
              currentUser.role === 'Admin' 
                ? 'bg-blue-600' 
                : currentUser.role === 'Clan Leader' 
                  ? 'bg-amber-600' 
                  : 'bg-emerald-600'
            }`}>
              {currentUser.name.split(' ')[0][0]}
              {currentUser.name.split(' ')[1]?.[0] || ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  currentUser.role === 'Admin' 
                    ? 'bg-blue-400' 
                    : currentUser.role === 'Clan Leader' 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-400'
                }`}></span>
                <p className="text-[10px] font-semibold text-slate-400 truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* Clan Badge / Workload Info */}
          {userClan ? (
            <div className={`px-2 py-1.5 rounded-lg border text-[10px] flex items-center gap-1.5 font-semibold ${userClan.bg} ${userClan.text} ${userClan.border}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${userClan.badgeBg}`}></div>
              <span className="truncate">Active Clan: {userClan.name}</span>
            </div>
          ) : (
            <div className="px-2 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-500 text-[10px] font-semibold text-center uppercase tracking-wide">
              Global Overview Access
            </div>
          )}
        </div>
      )}

      {/* Primary Action Call */}
      <button 
        onClick={onNewReport}
        className="w-full bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-950/20 active:scale-[0.98] text-white py-2.5 px-4 rounded-xl font-semibold text-xs mb-5 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md"
      >
        <Plus className="w-4 h-4" /> New Project / Report
      </button>

      {/* Navigation List */}
      <ul className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/30 font-bold border-l-4 border-blue-400' 
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/60'
                }`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Footer Support & System Status */}
      <div className="mt-auto border-t border-slate-900 pt-3 flex flex-col gap-1 shrink-0">
        <div className="px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-900/80 flex items-center gap-2 mb-1 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-slate-300 truncate">RBAC Engine Online</p>
            <p className="text-[10px] text-emerald-500 font-medium tracking-wide">✓ Mode: {currentUser?.role || 'Guest'}</p>
          </div>
        </div>

        <button 
          onClick={() => alert(`Active Session: ${currentUser?.name} (${currentUser?.role}). Authenticated under company identity. Click Sign Out to clear cached roles.`)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Session Diagnostic</span>
        </button>

        <button 
          onClick={onLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-950/20 hover:border-red-900/10 transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Navigation Sidebar */}
      <nav className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 z-40">
        <SidebarContent />
      </nav>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 transition-opacity duration-300"
        />
      )}

      {/* Mobile Drawer Left Container */}
      <div className={`md:hidden fixed top-0 bottom-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </div>
    </>
  );
}
