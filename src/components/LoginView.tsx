import React, { useState } from 'react';
import { Mail, Lock, Building, ArrowRight, ShieldCheck, AlertCircle, User as UserIcon } from 'lucide-react';
import { GEOMETRIC_LOGO, CLANS } from '../data';
import { User, UserRole } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User, token: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('Team Member');
  const [clanId, setClanId] = useState('vanguard');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (isRegister && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister 
        ? { email, password, name: name.trim(), role, clanId: role === 'Admin' ? undefined : clanId }
        : { email, password };

      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Success
      localStorage.setItem('ims_jwt_token', data.token);
      localStorage.setItem('ims_current_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.token);
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden transition-colors duration-200">
      {/* Background radial gradient decoration */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="w-full max-w-[420px] z-10 transition-all duration-300 transform">
        <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl p-6 md:p-8 relative overflow-hidden">
          
          {/* Top Brand Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-900 rounded-2xl mb-4 border border-slate-800 shadow-inner group hover:border-blue-500/40 transition-colors duration-300">
              <img 
                src={GEOMETRIC_LOGO} 
                alt="IMS Logo" 
                className="w-12 h-12 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5 font-sans">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-sm text-slate-400">
              {isRegister ? 'Register your enterprise profile.' : 'Enter your details to access your dashboard.'}
            </p>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-xl text-sm bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150 h-[42px]"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="work@company.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-xl text-sm bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150 h-[42px]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="password">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => alert("Credentials recovery: Please contact system administrator to reset database values.")}
                    className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-800 rounded-xl text-sm bg-slate-900/50 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150 h-[42px]"
                />
              </div>
            </div>

            {isRegister && (
              <>
                {/* Role selection dropdown */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="role">
                    Access Role
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 border border-slate-800 rounded-xl text-sm bg-slate-900/50 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150 h-[42px]"
                  >
                    <option value="Team Member">Team Member (Clan isolation limits)</option>
                    <option value="Clan Leader">Clan Leader (Clan control)</option>
                    <option value="Admin">Systems Administrator (Full system clearance)</option>
                  </select>
                </div>

                {/* Clan Selection (Only if not Admin) */}
                {role !== 'Admin' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="clanId">
                      Assigned Clan
                    </label>
                    <select
                      id="clanId"
                      value={clanId}
                      onChange={(e) => setClanId(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-800 rounded-xl text-sm bg-slate-900/50 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 transition-all duration-150 h-[42px]"
                    >
                      {CLANS.map(clan => (
                        <option key={clan.id} value={clan.id}>
                          {clan.name} ({clan.description})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {!isRegister && (
              /* Remember Me Toggle */
              <div className="flex items-center pt-1.5 pb-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-900 text-blue-600 focus:ring-blue-500/20 focus:ring-offset-slate-950"
                />
                <label htmlFor="remember-me" className="ml-2.5 text-sm text-slate-400 select-none">
                  Keep me signed in
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl h-[42px] flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-150 shadow-lg shadow-blue-950/40 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegister ? 'Sign Up' : 'Sign In'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle Register / Login link */}
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>

        </div>

        {/* Outer footer links */}
        <div className="mt-5 text-center flex justify-center items-center gap-4 text-xs font-semibold text-slate-500">
          <a href="#" className="hover:text-slate-400 transition-colors">Help Center</a>
          <span className="text-slate-800 font-normal">•</span>
          <a href="#" className="hover:text-slate-400 transition-colors">Contact Support</a>
        </div>
      </div>
    </div>
  );
}
