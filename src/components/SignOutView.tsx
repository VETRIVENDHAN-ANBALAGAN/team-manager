import React from 'react';
import { CheckCircle2, ArrowLeft, RotateCcw } from 'lucide-react';
import { BRAND_LOGO } from '../data';

interface SignOutProps {
  onReturnToLogin: () => void;
}

export default function SignOutView({ onReturnToLogin }: SignOutProps) {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background light decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Glassmorphism Card */}
        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 flex flex-col items-center text-center">
          
          {/* Brand Logo Container */}
          <div className="mb-6 w-20 h-20 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center border border-slate-800 shadow-inner hover:scale-105 transition-transform duration-300">
            <img 
              src={BRAND_LOGO} 
              alt="IMS Precision Logo" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Success Status Badge */}
          <div className="mb-4 w-12 h-12 rounded-full bg-emerald-950/40 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6 animate-pulse" />
          </div>

          {/* Header Title */}
          <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Securely Signed Out</h1>
          
          {/* Message Text */}
          <p className="text-sm text-slate-400 mb-6 max-w-[290px] leading-relaxed">
            Your session has ended successfully. Thank you for using IMS Precision today.
          </p>

          {/* Session Stats Grid */}
          <div className="w-full bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-800/80 grid grid-cols-2 gap-4 divide-x divide-slate-800">
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Session</span>
              <span className="text-base font-semibold text-white">4h 12m</span>
            </div>
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Status</span>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-300">Offline</span>
              </div>
            </div>
          </div>

          {/* Action Button Links */}
          <div className="w-full flex flex-col gap-3">
            <button
              onClick={onReturnToLogin}
              className="w-full h-11 bg-white hover:bg-slate-200 text-slate-950 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-md cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Return to Login
            </button>

            <button
              onClick={() => alert("Corporate site: You would navigate to your organization's external corporate homepage.")}
              className="w-full h-11 bg-transparent hover:bg-slate-900 text-slate-400 hover:text-slate-200 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to Corporate Site
            </button>
          </div>

        </div>

        {/* Footer info text */}
        <div className="mt-6 text-center">
          <p className="text-xs font-medium text-slate-500 opacity-80">
            © 2026 IMS Precision Enterprise. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
