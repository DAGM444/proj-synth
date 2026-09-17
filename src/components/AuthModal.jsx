import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Music2, X, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    authError,
    setAuthError,
  } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset form when modal opens or mode changes
  useEffect(() => {
    if (isAuthModalOpen) {
      setIdentifier('');
      setEmail('');
      setUsername('');
      setPassword('');
      setConfirmPassword('');
      setShowPassword(false);
      setIsSubmitting(false);
      setAuthError(null);
    }
  }, [isAuthModalOpen, authModalMode, setAuthError]);

  if (!isAuthModalOpen) return null;

  const isLogin = authModalMode === 'login';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (isLogin) {
      if (!identifier.trim() || !password) {
        setAuthError('Please fill in all fields.');
        return;
      }
      setIsSubmitting(true);
      try {
        await login({ identifier: identifier.trim(), password });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email.trim() || !username.trim() || !password) {
        setAuthError('Please fill in all required fields.');
        return;
      }
      if (password.length < 6) {
        setAuthError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setAuthError('Passwords do not match.');
        return;
      }
      setIsSubmitting(true);
      try {
        await register({
          email: email.trim(),
          username: username.trim(),
          password,
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={closeAuthModal}
    >
      <div
        className="bg-[#181818] border border-[#282828] rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-white animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute right-4 top-4 p-2 text-[#b3b3b3] hover:text-white rounded-full hover:bg-[#282828] transition-colors"
          title="Close"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#1DB954] flex items-center justify-center shadow-lg shadow-[#1DB954]/25 mb-3">
            <Music2 className="w-7 h-7 text-black" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white tracking-tight">
            {isLogin ? 'Log in to Proj Synth' : 'Create your account'}
          </h2>
          <p className="text-xs text-[#b3b3b3] mt-1">
            {isLogin
              ? 'Welcome back! Access your custom playlists and tracks.'
              : 'Sign up to build personal playlists and enjoy music.'}
          </p>
        </div>

        {/* Mode Switch Pills */}
        <div className="flex bg-[#121212] p-1 rounded-full mb-6 border border-[#282828]">
          <button
            type="button"
            onClick={() => setAuthModalMode('login')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              isLogin
                ? 'bg-[#282828] text-white shadow-sm'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setAuthModalMode('register')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
              !isLogin
                ? 'bg-[#282828] text-white shadow-sm'
                : 'text-[#b3b3b3] hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert Box */}
        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2.5 text-red-400 text-xs animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1">{authError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isLogin ? (
            /* LOGIN FIELDS */
            <div>
              <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
                Email or Username
              </label>
              <input
                type="text"
                required
                autoFocus
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Enter email or username"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] text-white text-sm border border-[#333] focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder:text-[#555]"
              />
            </div>
          ) : (
            /* REGISTER FIELDS */
            <>
              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] text-white text-sm border border-[#333] focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder:text-[#555]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. synthmaster"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] text-white text-sm border border-[#333] focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder:text-[#555]"
                />
              </div>
            </>
          )}

          {/* Password Field */}
          <div>
            <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Enter password' : 'At least 6 characters'}
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-[#121212] text-white text-sm border border-[#333] focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder:text-[#555]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#727272] hover:text-white transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Register only) */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-[#b3b3b3] uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#121212] text-white text-sm border border-[#333] focus:outline-none focus:border-[#1DB954] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder:text-[#555]"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-full text-sm font-heading transition-all shadow-md shadow-[#1DB954]/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLogin ? 'Logging in...' : 'Creating account...'}</span>
              </>
            ) : (
              <span>{isLogin ? 'Log In' : 'Sign Up'}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-6 pt-4 border-t border-[#282828] text-center text-xs text-[#b3b3b3]">
          {isLogin ? (
            <p>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('register')}
                className="text-white font-semibold underline hover:text-[#1DB954] transition-colors ml-1"
              >
                Sign up for Proj Synth
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthModalMode('login')}
                className="text-white font-semibold underline hover:text-[#1DB954] transition-colors ml-1"
              >
                Log in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
