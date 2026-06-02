import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, LogIn } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { auth, googleProvider } from '@/src/lib/firebase';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email, password);
        onClose();
      } else if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        onClose();
      } else if (mode === 'forgot-password') {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset link sent! Please check your email.');
        // Don't close immediately so they can see success
      }
      
      // Reset fields if closing/finished
      if (mode !== 'forgot-password') {
        setName('');
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error: any) {
      console.error('Failed to login with Google', error);
      setError(error.message || 'Google login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-surface rounded-[2rem] shadow-2xl overflow-hidden"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">
                    {mode === 'signin' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    {mode === 'signin' ? 'Please enter your details' : mode === 'signup' ? 'Join our professional network' : 'Enter your email to receive a reset link'}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {success && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-2xl flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {success}
                  </div>
                  <button 
                    type="button"
                    onClick={() => { setMode('signin'); setSuccess(null); }}
                    className="text-emerald-800 font-bold underline text-xs ml-3.5 text-left"
                  >
                    Back to Sign In
                  </button>
                </motion.div>
              )}

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    x: [0, -4, 4, -4, 4, 0] 
                  }}
                  transition={{ 
                    opacity: { duration: 0.2 },
                    y: { duration: 0.2 },
                    x: { duration: 0.4, delay: 0.1 }
                  }}
                  className={cn(
                    "mb-6 p-4 text-sm font-medium rounded-2xl flex flex-col gap-2",
                    error.includes('not found') ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-600"
                  )}
                >
                   <div className="flex items-center gap-2">
                     <div className={cn("w-1.5 h-1.5 rounded-full", error.includes('not found') ? "bg-amber-500" : "bg-red-500")} />
                     {error}
                   </div>
                   {error.includes('not found') && mode === 'signin' && (
                     <button 
                       type="button"
                       onClick={() => { setMode('signup'); setError(null); }}
                       className="text-amber-800 font-bold underline text-xs ml-3.5 text-left"
                     >
                       Switch to Create Account
                     </button>
                   )}
                </motion.div>
              )}

              <div className="space-y-6">
                {mode !== 'forgot-password' && (
                  <>
                    <motion.button 
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      type="button"
                      disabled={googleLoading || loading}
                      onClick={handleGoogleLogin}
                      className="w-full bg-surface border border-slate-200 text-slate-700 py-3.5 rounded-2xl text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all shadow-sm disabled:opacity-70"
                    >
                      {googleLoading ? (
                        <div className="w-5 h-5 border-2 border-slate-200 border-t-brand rounded-full animate-spin" />
                      ) : (
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                      )}
                      Continue with Google
                    </motion.button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-100"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-surface px-4 text-slate-400 font-bold tracking-widest">Or continue with email</span>
                      </div>
                    </div>
                  </>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                   <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-1.5"
                   >
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <motion.div
                      whileFocus={{ scale: 1.01 }}
                      className="transition-shadow duration-200"
                    >
                      <input
                        required
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Johnson"
                        className={cn(
                          "w-full bg-slate-50 border border-transparent rounded-2xl py-3 px-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-brand/10 focus:border-brand/30 outline-none",
                          error && "border-red-100"
                        )}
                      />
                    </motion.div>
                  </motion.div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <motion.div 
                    className="relative"
                    whileFocus={{ scale: 1.01 }}
                  >
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(null); setSuccess(null); }}
                      placeholder="alex@example.com"
                      className={cn(
                        "w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-brand/10 focus:border-brand/30 outline-none",
                        error && "border-red-100"
                      )}
                    />
                  </motion.div>
                </div>

                {mode !== 'forgot-password' && (
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <motion.div 
                      className="relative"
                      whileFocus={{ scale: 1.01 }}
                    >
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={cn(
                          "w-full bg-slate-50 border border-transparent rounded-2xl py-3 pl-11 pr-4 text-sm transition-all focus:bg-white focus:ring-4 focus:ring-brand/10 focus:border-brand/30 outline-none",
                          error && "border-red-100"
                        )}
                      />
                    </motion.div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between py-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" className="rounded border-slate-300 text-brand focus:ring-brand" />
                      <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                    </label>
                    <button 
                      type="button" 
                      onClick={() => setMode('forgot-password')}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
                
                {mode === 'forgot-password' && (
                  <div className="text-right py-2">
                    <button 
                      type="button" 
                      onClick={() => setMode('signin')}
                      className="text-xs font-bold text-brand hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                  {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
                </motion.button>
              </form>
            </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <p className="text-center text-sm text-slate-500">
                  {mode === 'signin' || mode === 'forgot-password' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => {
                      setMode(mode === 'signin' || mode === 'forgot-password' ? 'signup' : 'signin');
                      setError(null);
                      setSuccess(null);
                    }}
                    className="text-brand font-bold hover:underline"
                  >
                    {mode === 'signin' || mode === 'forgot-password' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
