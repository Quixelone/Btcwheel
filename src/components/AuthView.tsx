import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Mail, Lock, User, Bitcoin, Sparkles, Chrome, AlertCircle } from 'lucide-react';
import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

    if (!isSupabaseConfigured || !supabase) {
      setError('Autenticazione non disponibile. Usa la modalità demo per continuare.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        // Sign up new user
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            },
          },
        });

        if (signUpError) {
          // Check if user already exists
          if (signUpError.message?.includes('already registered') || 
              signUpError.message?.includes('User already registered') ||
              signUpError.status === 422) {
            // Try to login instead
            setError('⚠️ Email già registrata. Provo ad effettuare il login...');
            
            // Wait a moment to show the message
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (signInError) {
              // Password might be wrong
              setError('❌ Email già registrata. La password inserita non è corretta. Usa "Accedi" invece di "Registrati".');
              setMode('login'); // Switch to login mode
              return;
            }
            
            // Login successful!
            onAuthSuccess();
            return;
          }
          
          throw signUpError;
        }

        if (data.user) {
          // Auto-login after signup
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password,
          });

          if (signInError) throw signInError;
          onAuthSuccess();
        }
      } else {
        // Login existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          // Better error messages for login
          if (signInError.message?.includes('Invalid login credentials')) {
            setError('❌ Email o password non corretti. Riprova o crea un nuovo account.');
          } else {
            throw signInError;
          }
          return;
        }
        
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Friendly error messages
      const errorMsg = err.message || '';
      if (errorMsg.includes('Invalid login credentials')) {
        setError('❌ Email o password non corretti.');
      } else if (errorMsg.includes('Email not confirmed')) {
        setError('⚠️ Conferma la tua email prima di accedere. Controlla la tua casella di posta.');
      } else if (errorMsg.includes('User not found')) {
        setError('❌ Account non trovato. Registrati per creare un nuovo account.');
      } else {
        setError(errorMsg || 'Si è verificato un errore. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setError('Autenticazione non disponibile. Usa la modalità demo per continuare.');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
      
      // The user will be redirected to Google
      // On return, the AuthProvider will handle the session
    } catch (err: any) {
      console.error('Google auth error:', err);
      
      // More helpful error message for OAuth configuration issues
      const errorMsg = err.message || '';
      if (errorMsg.includes('provider') || errorMsg.includes('not enabled') || errorMsg.includes('configured')) {
        setError('❌ Google OAuth non configurato. Usa email/password oppure segui GOOGLE_OAUTH_SETUP.md per configurare Google.');
      } else {
        setError(`Errore Google OAuth: ${errorMsg}. Usa email/password come alternativa.`);
      }
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-orange-500 flex items-center justify-center p-4 safe-area-inset">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl">
          {/* Logo/Branding */}
          <div className="text-center mb-8">
            <motion.div
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Bitcoin className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-gray-900 mb-2">Bitcoin Wheel Strategy</h1>
            <p className="text-gray-600">
              {mode === 'signup' 
                ? 'Crea il tuo account per iniziare' 
                : 'Bentornato! Accedi al tuo account'}
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
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google OAuth Warning */}
          <Alert className="mb-4 border-orange-300 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 text-sm">
              <strong>Google OAuth richiede configurazione aggiuntiva.</strong>
              <br />
              Usa email/password (funziona subito) o segui la guida <code>GOOGLE_OAUTH_SETUP.md</code>
            </AlertDescription>
          </Alert>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2"
              onClick={handleGoogleAuth}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              Continua con Google
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-500">
              oppure
            </span>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <Label htmlFor="name" className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Il tuo nome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                  className="h-12"
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tuo@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={loading}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="password" className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={loading}
                minLength={6}
                className="h-12"
              />
              {mode === 'signup' && (
                <p className="text-xs text-gray-500 mt-1">Minimo 6 caratteri</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {mode === 'signup' ? 'Creazione account...' : 'Accesso...'}
                </>
              ) : (
                <>
                  {mode === 'signup' ? (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Crea Account
                    </>
                  ) : (
                    'Accedi'
                  )}
                </>
              )}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={toggleMode}
              disabled={loading}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
            >
              {mode === 'signup' ? (
                <>Hai già un account? <span className="underline">Accedi</span></>
              ) : (
                <>Non hai un account? <span className="underline">Registrati</span></>
              )}
            </button>
          </div>

          {/* Terms */}
          {mode === 'signup' && (
            <p className="mt-6 text-xs text-gray-500 text-center">
              Creando un account accetti i nostri{' '}
              <a href="#" className="text-blue-600 hover:underline">Termini di Servizio</a>
              {' '}e la{' '}
              <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
            </p>
          )}
        </Card>

        {/* Demo Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center"
        >
          <Card className="p-4 bg-white/90 backdrop-blur">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">💡 Demo Mode:</span> Puoi anche{' '}
              <button
                onClick={onAuthSuccess}
                className="text-blue-600 hover:underline font-medium"
              >
                continuare senza registrarti
              </button>
              {' '}(dati salvati solo localmente)
            </p>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
