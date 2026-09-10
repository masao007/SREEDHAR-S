import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldCheck, Mail, Lock, User, AlertCircle, Sparkles, ArrowRight, Check } from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsDemo,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('worker');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        await signInWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Please provide your full name');
          setIsLoading(false);
          return;
        }
        await signUpWithEmail(email, password, displayName, role);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid email or password. Please verify and try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Google sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoSignIn = async (demoRole: UserRole) => {
    setError(null);
    setIsLoading(true);
    try {
      await signInAsDemo(demoRole);
    } catch (err: any) {
      console.error(err);
      setError('Guest demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0c0c0c] border border-gray-800 rounded-lg w-full max-w-md p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors cursor-pointer text-xs"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-black uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Firebase Security Layer</span>
          </div>
          <h3 className="font-display text-xl font-black uppercase tracking-tight text-white">
            {authMode === 'login' ? 'Worker & Employer Login' : 'Create Money Maker Account'}
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Access verified works, real-time location radar, and instant UPI payouts
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex bg-[#141414] border border-gray-800 rounded p-0.5 mb-5 text-xs">
          <button
            onClick={() => {
              setAuthMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              authMode === 'login'
                ? 'bg-emerald-600 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setError(null);
            }}
            className={`flex-1 py-1.5 font-bold uppercase tracking-wider rounded transition-all cursor-pointer ${
              authMode === 'register'
                ? 'bg-emerald-600 text-black shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-2.5 rounded bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Google 1-Tap Sign In */}
        <button
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full bg-[#161616] hover:bg-[#202020] border border-gray-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-4 rounded flex items-center justify-center space-x-2.5 transition-colors cursor-pointer mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-[10px] text-gray-500 uppercase font-bold">Or Email & Password</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Arun Sharma"
                    className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  Primary Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('worker')}
                    className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all border ${
                      role === 'worker'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                        : 'bg-[#141414] border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    🛵 Worker
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('employer')}
                    className={`py-1.5 px-3 rounded text-xs font-bold uppercase transition-all border ${
                      role === 'employer'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                        : 'bg-[#141414] border-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    🏢 Employer / Biz
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 bg-[#141414] border border-gray-700 rounded text-xs text-white placeholder-gray-600 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase tracking-wider py-2.5 rounded transition-colors cursor-pointer flex items-center justify-center space-x-2 shadow-md mt-2"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : authMode === 'login' ? (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            ) : (
              <>
                <span>Create Verified Account</span>
                <Check className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Demo One-Click Sign In Options */}
        <div className="mt-5 pt-4 border-t border-gray-800">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 text-center mb-2.5">
            Instant Demo Profiles
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoSignIn('worker')}
              disabled={isLoading}
              className="bg-[#141414] hover:bg-[#1f1f1f] border border-gray-800 hover:border-gray-700 text-gray-300 py-1.5 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>🛵 Demo Worker</span>
            </button>
            <button
              onClick={() => handleDemoSignIn('employer')}
              disabled={isLoading}
              className="bg-[#141414] hover:bg-[#1f1f1f] border border-gray-800 hover:border-gray-700 text-gray-300 py-1.5 px-2 rounded text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center space-x-1"
            >
              <span>🏢 Demo Employer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
