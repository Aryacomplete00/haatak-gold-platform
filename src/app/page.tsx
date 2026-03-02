'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { validateCredentials } from '@/data/users';

type Tab = 'login' | 'signup';

interface StoredAccount {
  name: string;
  email: string;
  password: string;
}

function getStoredAccounts(): StoredAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('haatak_accounts') || '[]');
  } catch {
    return [];
  }
}

function saveAccount(account: StoredAccount): void {
  const existing = getStoredAccounts();
  existing.push(account);
  localStorage.setItem('haatak_accounts', JSON.stringify(existing));
}

export default function AuthPage() {
  const router = useRouter();
  const { login } = useUser();

  const [tab, setTab] = useState<Tab>('login');

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // ── Login handler ─────────────────────────────────────────────────────────
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    setTimeout(() => {
      // Check user-created accounts first
      const accounts = getStoredAccounts();
      const localMatch = accounts.find(
        (a) => a.email.toLowerCase() === loginEmail.toLowerCase() && a.password === loginPassword
      );

      if (localMatch) {
        login(localMatch.email, localMatch.name);
        router.push('/home');
        return;
      }

      // Fall back to hardcoded registered users
      const registeredUser = validateCredentials(loginEmail, loginPassword);
      if (registeredUser) {
        login(registeredUser.email, registeredUser.name);
        router.push('/home');
        return;
      }

      setLoginLoading(false);
      setLoginError('Invalid email or password. Please try again.');
    }, 1000);
  };

  // ── Sign Up handler ───────────────────────────────────────────────────────
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (signupPassword.length < 4) {
      setSignupError('Password must be at least 4 characters.');
      return;
    }
    if (signupPassword !== signupConfirm) {
      setSignupError('Passwords do not match.');
      return;
    }

    // Check if email already exists
    const existing = getStoredAccounts();
    const { REGISTERED_USERS } = require('@/data/users');
    const emailExists =
      existing.some((a: StoredAccount) => a.email.toLowerCase() === signupEmail.toLowerCase()) ||
      REGISTERED_USERS.some((u: { email: string }) => u.email.toLowerCase() === signupEmail.toLowerCase());

    if (emailExists) {
      setSignupError('An account with this email already exists. Please log in.');
      return;
    }

    setSignupLoading(true);
    setTimeout(() => {
      saveAccount({ name: signupName.trim(), email: signupEmail.trim(), password: signupPassword });
      login(signupEmail.trim(), signupName.trim());
      router.push('/home');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }}
        />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <span className="text-4xl">✨</span>
            </div>
          </div>
          <h1
            className="text-5xl font-bold mb-2 gold-gradient-text"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            HAATAK
          </h1>
          <p className="text-gray-400 text-lg">Digital Gold Investment Platform</p>
        </div>

        {/* Card */}
        <div className="premium-card overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => { setTab('login'); setLoginError(''); }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all ${tab === 'login'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              🔑 Login
            </button>
            <button
              onClick={() => { setTab('signup'); setSignupError(''); }}
              className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all ${tab === 'signup'
                  ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-500/5'
                  : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              🌟 Create Account
            </button>
          </div>

          <div className="p-8">
            {/* ── LOGIN FORM ───────────────────────────────────── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1">Welcome Back</h2>
                  <p className="text-gray-400 text-sm">Sign in to your HAATAK account</p>
                </div>

                {loginError && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
                    <p className="text-red-400 text-sm font-medium">{loginError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => { setLoginEmail(e.target.value); setLoginError(''); }}
                    className={`input-gold ${loginError ? 'border-red-500/50' : ''}`}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                    className={`input-gold ${loginError ? 'border-red-500/50' : ''}`}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-amber-500 text-amber-500 focus:ring-amber-500 focus:ring-offset-0"
                    />
                    <span className="text-sm text-gray-400">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-amber-500 hover:text-amber-400 transition">
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <div className="spinner w-5 h-5 border-2" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition"
                  >
                    Create one →
                  </button>
                </p>
              </form>
            )}

            {/* ── SIGN UP FORM ──────────────────────────────────── */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1">Create Account</h2>
                  <p className="text-gray-400 text-sm">Start investing in digital gold today</p>
                </div>

                {signupError && (
                  <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <span className="text-red-400 text-lg flex-shrink-0">⚠️</span>
                    <p className="text-red-400 text-sm font-medium">{signupError}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="signup-name" className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    value={signupName}
                    onChange={(e) => { setSignupName(e.target.value); setSignupError(''); }}
                    className="input-gold"
                    placeholder="John Doe"
                    required
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signupEmail}
                    onChange={(e) => { setSignupEmail(e.target.value); setSignupError(''); }}
                    className="input-gold"
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => { setSignupPassword(e.target.value); setSignupError(''); }}
                    className="input-gold"
                    placeholder="Choose a strong password"
                    required
                    autoComplete="new-password"
                    minLength={4}
                  />
                </div>

                <div>
                  <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="signup-confirm"
                    type="password"
                    value={signupConfirm}
                    onChange={(e) => { setSignupConfirm(e.target.value); setSignupError(''); }}
                    className="input-gold"
                    placeholder="Re-enter your password"
                    required
                    autoComplete="new-password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={signupLoading}
                  className="btn-gold w-full flex items-center justify-center gap-2"
                >
                  {signupLoading ? (
                    <>
                      <div className="spinner w-5 h-5 border-2" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-gray-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-amber-400 hover:text-amber-300 font-semibold transition"
                  >
                    Sign in →
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🔒</div>
            <p className="text-xs text-gray-400">Bank-Grade Security</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-xs text-gray-400">Instant Trading</p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🏆</div>
            <p className="text-xs text-gray-400">99.9% Pure Gold</p>
          </div>
        </div>
      </div>
    </div>
  );
}
