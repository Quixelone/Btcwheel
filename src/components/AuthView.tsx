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
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AuthViewProps {
  onAuthSuccess: () => void;
}

export function AuthView({ onAuthSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
        console.log('📝 [AuthView] Starting signup process...');
        
        // 🆕 Use server endpoint to create user with email already confirmed
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name
            })
          }
        );
        
        // 🔍 Check if server is reachable
        if (response.status === 404) {
          console.error('❌ [AuthView] Server not found (404) - falling back to direct signup');
          setError('⚠️ Server non disponibile. Creazione account in modalità diretta...');
          
          // Fallback: Use direct Supabase signup
          const { error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
              data: {
                name: formData.name
              }
            }
          });
          
          if (signUpError) {
            if (signUpError.message?.includes('already registered')) {
              console.log('⚠️ [AuthView] User already exists (fallback), attempting auto-login...');
              setError('⚠️ Email già registrata. Provo ad effettuare il login...');
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              const { error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
              });

              if (signInError) {
                console.error('❌ [AuthView] Auto-login failed - wrong password:', signInError);
                setError('❌ Email già registrata. La password inserita non è corretta. Usa "Accedi" invece di "Registrati".');
                setMode('login');
                setLoading(false);
                return;
              }
              
              console.log('✅ [AuthView] Auto-login successful after detecting existing account');
              onAuthSuccess();
              return;
            }
            throw signUpError;
          }
          
          // ⚠️ Warn about email confirmation
          setError('⚠️ Account creato! IMPORTANTE: Conferma la tua email per accedere (controlla la tua casella di posta).');
          setLoading(false);
          return;
        }
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('❌ [AuthView] Signup failed:', result);
          
          // Check if user already exists (409 Conflict or error code)
          if (response.status === 409 || result.code === 'email_exists' || 
              result.error?.includes('already') || result.error?.includes('registered')) {
            console.log('⚠️ [AuthView] User already exists, attempting auto-login...');
            setError('⚠️ Email già registrata. Provo ad effettuare il login...');
            
            // Wait a moment to show the message
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: formData.email,
              password: formData.password,
            });

            if (signInError) {
              // Password might be wrong
              console.error('❌ [AuthView] Auto-login failed - wrong password:', signInError);
              setError('❌ Email già registrata. La password inserita non è corretta. Usa \"Accedi\" invece di \"Registrati\".');
              setMode('login'); // Switch to login mode
              setLoading(false);
              return;
            }
            
            // Login successful!
            console.log('✅ [AuthView] Auto-login successful after detecting existing account');
            onAuthSuccess();
            return;
          }
          
          // Other error - throw to be caught by catch block
          setLoading(false);
          throw new Error(result.error || 'Signup failed');
        }
        
        console.log('✅ [AuthView] Signup successful, now signing in...');
        
        // Auto-login after successful signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          console.error('❌ [AuthView] Auto-login failed:', signInError);
          throw signInError;
        }
        
        console.log('✅ [AuthView] Auto-login successful!');
        onAuthSuccess();
        
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

  // Google OAuth Sign In
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          // Force skip native flow to ensure web redirect
          skipBrowserRedirect: false,
          // Query params to help identify the source app
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
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
        setError('❌ Google OAuth non configurato. Usa email/password oppure segui GOOGLE_OAUTH_CONFIG.md per configurare Google.');
      } else {
        setError(`Errore Google OAuth: ${errorMsg}. Usa email/password come alternativa.`);
      }
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (!isSupabaseConfigured || !supabase) {
      setError('Autenticazione non disponibile. Usa la modalità demo per continuare.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔑 [AuthView] Sending password reset email to:', resetEmail);
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      console.log('✅ [AuthView] Password reset email sent successfully');
      setSuccessMessage('✅ Ti abbiamo inviato un\'email con le istruzioni per reimpostare la password. Controlla la tua casella di posta!');
      setResetEmail('');
      
      // Close reset modal after 3 seconds
      setTimeout(() => {
        setShowResetPassword(false);
        setSuccessMessage('');
      }, 3000);
      
    } catch (err: any) {
      console.error('❌ [AuthView] Reset password error:', err);
      
      const errorMsg = err.message || '';
      if (errorMsg.includes('Email not found') || errorMsg.includes('User not found')) {
        setError('❌ Nessun account trovato con questa email.');
      } else if (errorMsg.includes('rate limit')) {
        setError('⚠️ Troppe richieste. Riprova tra qualche minuto.');
      } else if (errorMsg.includes('Email') || errorMsg.includes('SMTP')) {
        setError('⚠️ Server email non configurato. Contatta il supporto per reimpostare la password.');
      } else {
        setError(errorMsg || 'Errore durante il reset della password. Riprova.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccessMessage('');
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
              Usa email/password (funziona subito) o leggi <code>GOOGLE_OAUTH_CONFIG.md</code>
            </AlertDescription>
          </Alert>

          {/* Social Login */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 border-2"
              onClick={handleGoogleSignIn}
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

          {/* Forgot Password Link - Only show in login mode */}
          {mode === 'login' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowResetPassword(true);
                  setError('');
                  setSuccessMessage('');
                }}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
              >
                Password dimenticata?
              </button>
            </div>
          )}

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

        {/* Reset Password Modal */}
        <AnimatePresence>
          {showResetPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowResetPassword(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md"
              >
                <Card className="p-8">
                  <h2 className="text-gray-900 mb-2">Reimposta Password</h2>
                  <p className="text-gray-600 mb-6">
                    Inserisci la tua email e ti invieremo un link per reimpostare la password.
                  </p>

                  {/* Success Message */}
                  {successMessage && (
                    <Alert className="mb-4 border-emerald-300 bg-emerald-50">
                      <AlertCircle className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="text-emerald-900">
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Error Message */}
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <Label htmlFor="reset-email" className="flex items-center gap-2 mb-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="tuo@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-12"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-12"
                        onClick={() => {
                          setShowResetPassword(false);
                          setResetEmail('');
                          setError('');
                          setSuccessMessage('');
                        }}
                        disabled={loading}
                      >
                        Annulla
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Invio...
                          </>
                        ) : (
                          'Invia Email'
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Warning about email server */}
                  <Alert className="mt-4 border-yellow-300 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-900 text-xs">
                      <strong>Nota:</strong> Se il server email non è configurato, contatta il supporto per reimpostare la password manualmente.
                    </AlertDescription>
                  </Alert>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

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