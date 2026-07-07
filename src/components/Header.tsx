import React, { useState } from 'react';
import { Search, Bell, History, Settings, CheckSquare, Sun, Moon, Menu } from 'lucide-react';
import { ADMIN_USER } from '../data';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddTaskClick: () => void;
  onToggleTheme: () => void;
  isDark: boolean;
  onMenuToggle: () => void;
  onSearchChange: (query: string) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onAddTaskClick,
  onToggleTheme,
  isDark,
  onMenuToggle,
  onSearchChange
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchVal(value);
    onSearchChange(value);
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'IMS Dashboard';
      case 'team':
        return 'Team Management';
      case 'files':
        return 'Asset Files Vault';
      case 'reports':
        return 'Analytics & Reports';
      case 'settings':
        return 'System Settings';
      default:
        return 'IMS Enterprise';
    }
  };

  const navLinks = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'team', label: 'Team' },
    { id: 'files', label: 'Files' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="w-full h-16 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 md:px-6 sticky top-0 z-30 flex items-center justify-between transition-colors duration-200">
      
      {/* Left Area: Title or Mobile Toggle */}
      <div className="flex items-center gap-4">
        {/* Mobile menu hamburger */}
        <button 
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 focus:outline-none cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Section Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-6">
          <h2 className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight shrink-0 font-sans">
            {getHeaderTitle()}
          </h2>

          {/* Desktop Sub Navigation link shortcuts */}
          <nav className="hidden xl:flex items-center gap-4 border-l border-slate-200 dark:border-slate-800 pl-6 text-sm font-semibold select-none">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`py-1 relative cursor-pointer font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 dark:border-blue-400' 
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Right Area: Interactive Actions */}
      <div className="flex items-center gap-3">
        {/* Search bar input container */}
        <div className="relative hidden md:block select-text">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchVal}
            onChange={handleSearch}
            placeholder="Search resources, files, logs..."
            className="w-48 lg:w-64 pl-9 pr-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10 transition-all"
          />
        </div>

        {/* Theme Toggler */}
        <button
          onClick={onToggleTheme}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 cursor-pointer"
        >
          {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
        </button>

        {/* Notification bell and indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors duration-150 relative cursor-pointer"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-950"></span>
          </button>

          {/* Quick Notification Drawer Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2.5 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-4 animate-fade-in text-slate-700 dark:text-slate-300">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800/80 mb-2">
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Alert Center</span>
                <button 
                  onClick={() => setShowNotifications(false)} 
                  className="text-[10px] font-bold text-blue-500 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              </div>
              <ul className="space-y-3 max-h-60 overflow-y-auto">
                <li className="text-xs p-2.5 rounded-xl bg-red-500/5 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20">
                  <p className="font-semibold text-red-700 dark:text-red-400">Server Storage Overload</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Node Alpha is approaching 95% storage capacity limit.</p>
                </li>
                <li className="text-xs p-2.5 rounded-xl bg-blue-500/5 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-950/20">
                  <p className="font-semibold text-blue-700 dark:text-blue-400">New Report Finalized</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Elena Rodriguez uploaded Q3 compliance ledger report.</p>
                </li>
                <li className="text-xs p-2.5 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400">Streak Met: Team Alpha</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">All members completed on-time attendance for 5 straight days.</p>
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Action Button: Add Task */}
        <button
          onClick={onAddTaskClick}
          className="hidden md:flex bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 active:scale-95 text-xs font-semibold px-4 py-1.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm cursor-pointer border border-transparent dark:border-slate-200"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>

        {/* User Info & Avatar */}
        <div className="flex items-center gap-2.5 border-l border-slate-200 dark:border-slate-800 pl-3 md:pl-4 select-none shrink-0">
          <img
            src={ADMIN_USER.avatarUrl}
            alt={ADMIN_USER.name}
            title={`${ADMIN_USER.name} - ${ADMIN_USER.role}`}
            className="w-8.5 h-8.5 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer hover:border-blue-500 transition-colors"
          />
          <div className="hidden lg:block">
            <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[100px]">{ADMIN_USER.name}</p>
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate max-w-[100px] uppercase tracking-wider mt-0.5">Admin</p>
          </div>
        </div>

      </div>

    </header>
  );
}
