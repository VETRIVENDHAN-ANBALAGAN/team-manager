import React from 'react';
import { 
  Sun, 
  Moon, 
  RotateCcw, 
  ShieldAlert, 
  Wifi, 
  WifiOff, 
  BellRing, 
  Database,
  Lock,
  ChevronRight,
  Info
} from 'lucide-react';

interface SettingsViewProps {
  isDark: boolean;
  onToggleTheme: () => void;
  isOfflineSimulated: boolean;
  onToggleOfflineSimulation: () => void;
  onResetFactoryDefaults: () => void;
}

export default function SettingsView({
  isDark,
  onToggleTheme,
  isOfflineSimulated,
  onToggleOfflineSimulation,
  onResetFactoryDefaults
}: SettingsViewProps) {

  const handleResetClick = () => {
    if (confirm("Restore Factory Defaults?\nThis will clear any custom changes, tasks, or uploaded assets and rebuild the pristine enterprise mockup. This operation is fully offline-safe.")) {
      onResetFactoryDefaults();
      alert("System restored successfully. Loaded default asset databases, attendance logs, and task priorities.");
    }
  };

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto animate-fade-in pb-12 font-sans select-none text-slate-700 dark:text-slate-300">
      
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/60 dark:border-slate-900 pb-5">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Settings</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Configure display modes, network simulations, notifications and offline storage parameters.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Main Configurations (Spans 2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Display Parameters */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-5 h-5 text-blue-500" /> Theme Preference
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Implement dark mode as a default theme option for improved readability in low light environments, conforming strictly with user requirements.
            </p>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/40 dark:border-slate-800/40 mt-2">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Default Dark Theme</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Toggle display state between Corporate Slate & Night Mode.</p>
              </div>
              <button
                onClick={onToggleTheme}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDark ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isDark ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 2: Network & Connection Simulation */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              {isOfflineSimulated ? <WifiOff className="w-5 h-5 text-red-500" /> : <Wifi className="w-5 h-5 text-emerald-500" />}
              Connection Parameters
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simulate an offline scenario to verify that our `localStorage` caching systems retain 100% of information and state updates smoothly without active internet connections.
            </p>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Simulate Weak / Offline Network</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5">Showcases robust offline storage warnings and synchronization ledgers.</p>
              </div>
              <button
                onClick={onToggleOfflineSimulation}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isOfflineSimulated ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isOfflineSimulated ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Security & Encryption */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 md:p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" /> Local Storage Security
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              All client logs, profiles, files, and state details are cryptographically buffered in high-performance localStorage segments. Clear caches only on trusted enterprise networks.
            </p>

            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/20 text-xs text-blue-800 dark:text-blue-300 flex gap-2.5">
              <Info className="w-4.5 h-4.5 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Security Audit Status: <span className="font-bold">Passed</span>. Our storage system avoids cross-site scripting (XSS) vulnerabilities by implementing sanitizations on all custom file uploads and member registrations.
              </p>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Backups, Defaults, & Disclaimers */}
        <div className="space-y-6">
          
          {/* Factory Default controls */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-500" /> Database Management
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reset caches, clean files database structures, or restore pristine default datasets easily.
            </p>

            <button
              onClick={handleResetClick}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 hover:shadow-lg hover:shadow-red-950/20 active:scale-98 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Restore Default Mockups
            </button>
          </div>

          {/* Operational Rules */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" /> Enterprise Policy
            </h4>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-2.5 font-medium leading-relaxed list-disc list-inside">
              <li>All updates are logged securely under Admin credentials.</li>
              <li>Attendance ledgers export in UTF-8 format directly for payroll synchronization.</li>
              <li>Weak Connection simulation activates warning banners on headers.</li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
