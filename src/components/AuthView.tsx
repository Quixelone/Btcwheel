import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, Lock, User, Bitcoin, Chrome, AlertCircle, ArrowRight } from 'lucide-react';
import { getSupabaseClient } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const { loginAsGuest, signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [_successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const supabase = getSupabaseClient();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { user, error: signUpError } = await signUpWithEmail(
          formData.email,
          formData.password,
          formData.name
        );

        if (signUpError) {
          if (signUpError.message?.includes('already exists') || signUpError.message?.includes('User already exists')) {
            setError('⚠️ Email già registrata. Prova ad accedere.');
            setMode('login');
            setLoading(false);
            return;
          }
          throw signUpError;
        }

        if (user) {
          onAuthSuccess();
        }
      } else {
        const { user, error: signInError } = await signInWithEmail(
          formData.email,
          formData.password
        );

        if (signInError) {
          if (signInError.message?.includes('Invalid password') || signInError.message?.includes('password')) {
            setError('❌ Password non corretta.');
          } else if (signInError.message?.includes('not found') || signInError.message?.includes('User not found')) {
            setError('❌ Utente non trovato. Registrati prima.');
          } else if (signInError.message?.includes('Invalid login credentials')) {
            setError('❌ Email o password non corretti.');
          } else {
            throw signInError;
          }
          return;
        }

        if (user) {
          onAuthSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Si è verificato un errore.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const { error } = await signInWithGoogle();

      if (error) {
        if (error.message === 'Supabase not configured') {
          setError('⚠️ Google Sign-In richiede configurazione Supabase. Usa email/password in locale.');
        } else {
          throw error;
        }
      }
    } catch (err: any) {
      setError(`Errore Google OAuth: ${err.message}`);
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccessMessage('✅ Email di reset inviata!');
      setTimeout(() => setShowResetPassword(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Errore durante il reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0A0A0C] border border-white/[0.08] rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Top Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50" />

          {/* Logo */}
          <div className="text-center mb-10">
            <motion.div
              className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)]"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <Bitcoin className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">BTC Wheel Pro</h1>
            <p className="text-[#888899] font-medium text-sm">
              {mode === 'signup' ? 'Crea il tuo account per iniziare' : 'Bentornato nell\'accademia'}
            </p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-[10px] font-bold uppercase tracking-widest">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Social Login */}
          <div className="space-y-3 mb-8">
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.2] rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-white"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Chrome className="w-4 h-4 mr-3 text-white" />}
              Continua con Google
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full h-12 text-[#666677] hover:text-white hover:bg-white/[0.05] rounded-xl font-bold uppercase text-[9px] tracking-widest"
              onClick={async () => {
                setLoading(true);
                await loginAsGuest();
                setLoading(false);
                onAuthSuccess();
              }}
              disabled={loading}
            >
              <User className="w-3 h-3 mr-2" />
              Modalità Ospite (Demo)
            </Button>
          </div>

          <div className="relative mb-8">
            <Separator className="bg-white/[0.05]" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0C] px-4 text-[9px] font-bold text-[#444455] uppercase tracking-widest">
              oppure
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold text-[#666677] uppercase tracking-widest ml-1">Nome</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666677]" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Il tuo nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    disabled={loading}
                    className="h-12 pl-12 bg-[#030305] border-white/[0.08] rounded-xl focus:border-purple-500/50 text-white placeholder:text-[#444455] transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-bold text-[#666677] uppercase tracking-widest ml-1">Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666677]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tuo@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
                  className="h-12 pl-12 bg-[#030305] border-white/[0.08] rounded-xl focus:border-purple-500/50 text-white placeholder:text-[#444455] transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] font-bold text-[#666677] uppercase tracking-widest ml-1">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666677]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  disabled={loading}
                  minLength={6}
                  className="h-12 pl-12 bg-[#030305] border-white/[0.08] rounded-xl focus:border-purple-500/50 text-white placeholder:text-[#444455] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 bg-purple-600 hover:bg-purple-500 text-white font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] mt-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Crea Account' : 'Accedi'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {mode === 'login' && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                className="text-[10px] font-bold text-[#666677] uppercase tracking-widest hover:text-white transition-colors"
              >
                Password dimenticata?
              </button>
            </div>
          )}

          <div className="mt-8 text-center bg-white/[0.02] -mx-10 -mb-10 p-6 border-t border-white/[0.05]">
            <button
              type="button"
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-[11px] font-bold text-purple-400 uppercase tracking-widest hover:text-purple-300 transition-colors"
            >
              {mode === 'signup' ? 'Hai già un account? Accedi' : 'Non hai un account? Registrati'}
            </button>
          </div>
        </div>

        {/* Reset Modal */}
        <AnimatePresence>
          {showResetPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowResetPassword(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <div className="p-8 bg-[#0A0A0C] border border-white/[0.1] rounded-[24px] shadow-2xl">
                  <h2 className="text-xl font-bold text-white tracking-tight mb-2">Reset Password</h2>
                  <p className="text-[#888899] font-medium text-sm mb-6">
                    Ti invieremo un link per reimpostare la tua password via email.
                  </p>

                  <form onSubmit={handleResetPassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email" className="text-[10px] font-bold text-[#666677] uppercase tracking-widest ml-1">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="tuo@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="h-12 bg-[#030305] border-white/[0.08] rounded-xl text-white"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="ghost"
                        className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px] tracking-widest text-[#888899] hover:text-white"
                        onClick={() => setShowResetPassword(false)}
                      >
                        Annulla
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold uppercase text-[10px] tracking-widest text-white"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Invia Link'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
