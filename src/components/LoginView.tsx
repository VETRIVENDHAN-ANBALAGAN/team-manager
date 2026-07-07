import React, { useState } from 'react';
import { Mail, Lock, Building, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { GEOMETRIC_LOGO } from '../data';

interface LoginProps {
  onLoginSuccess: (email: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    setIsLoading(true);
    // Simulate API authorization delay
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(email);
    }, 750);
  };

  const handleSSOLogin = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(provider === 'Google' ? 'vetrimgk@gmail.com' : 'sso.admin@company.com');
    }, 500);
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
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5 font-sans">Sign In</h1>
            <p className="text-sm text-slate-400">Enter your details to access your dashboard.</p>
          </div>

          {/* Validation Alert */}
          {error && (
            <div className="mb-4 p-3.5 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                <button
                  type="button"
                  onClick={() => alert("Mock password recovery: In a production setup, this sends a secure reset token to your registered email.")}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </button>
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

            {/* Remember Me Toggle */}
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
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Or continue with Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800/80"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 bg-slate-950 text-slate-500 font-medium">Or continue with</span>
            </div>
          </div>

          {/* SSO Actions */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => handleSSOLogin('Google')}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 font-semibold text-sm rounded-xl h-[42px] flex items-center justify-center gap-3 transition-colors duration-150 cursor-pointer"
            >
              {/* Google SVG Logo */}
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              Single Sign-On (Google)
            </button>

            <button
              type="button"
              onClick={() => handleSSOLogin('SAML')}
              disabled={isLoading}
              className="w-full bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-200 font-semibold text-sm rounded-xl h-[42px] flex items-center justify-center gap-3 transition-colors duration-150 cursor-pointer"
            >
              <Building className="w-4.5 h-4.5 text-slate-400" />
              Enterprise SSO (SAML)
            </button>
          </div>

          {/* Footer Footnote Terms */}
          <div className="mt-6 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              By signing in, you agree to our{' '}
              <a href="#" className="text-slate-400 hover:text-slate-300 underline underline-offset-2 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-slate-400 hover:text-slate-300 underline underline-offset-2 hover:underline">
                Privacy Policy
              </a>
              .
            </p>
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
