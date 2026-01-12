import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/localStorage';
import { toast } from 'sonner@2.0.3';

// Auth hook for btcwheel app - supports both local and Supabase modes
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured (constant, not function!)
    const supabaseEnabled = isSupabaseConfigured;
    
    console.log('🔐 [useAuth] Checking authentication...');
    console.log('🔐 [useAuth] Supabase configured:', supabaseEnabled);
    
    if (!supabaseEnabled) {
      console.log('⚠️ [useAuth] Supabase not configured, using local mode');
      
      // Check localStorage for local user
      const localUser = storage.getItem('btcwheel_local_user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          setUser(parsedUser as User);
          console.log('✅ [useAuth] Local user found:', parsedUser.email);
        } catch (error) {
          console.error('❌ [useAuth] Error parsing local user:', error);
          storage.removeItem('btcwheel_local_user');
        }
      } else {
        console.log('⚠️ [useAuth] No local user found');
      }
      
      setLoading(false);
      return;
    }

    // Get initial session
    console.log('☁️ [useAuth] Checking Supabase session...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ [useAuth] Session found! User:', session.user.email);
        console.log('🔑 [useAuth] Access token:', session.access_token.substring(0, 20) + '...');
      } else {
        console.log('⚠️ [useAuth] No active session found');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 [useAuth] Auth state changed:', _event);
      if (session) {
        console.log('✅ [useAuth] New session:', session.user.email);
      } else {
        console.log('⚠️ [useAuth] Session cleared');
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Local mode sign in
      const localUser = storage.getItem('btcwheel_local_user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        if (parsedUser.email === email) {
          setUser(parsedUser as User);
          toast.success('Accesso effettuato!');
          return { user: parsedUser as User, error: null };
        }
      }
      toast.error('Credenziali non valide');
      return { user: null, error: new Error('Invalid credentials') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        return { user: null, error };
      }

      toast.success('Accesso effettuato!');
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('Errore durante l\'accesso');
      return { user: null, error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    if (!isSupabaseConfigured) {
      // Local mode sign up
      const newUser = {
        id: `local-${Date.now()}`,
        email,
        user_metadata: { name: name || 'User' },
        created_at: new Date().toISOString(),
      };
      
      storage.setItem('btcwheel_local_user', JSON.stringify(newUser));
      setUser(newUser as User);
      toast.success('Account creato! Benvenuto!');
      return { user: newUser as User, error: null };
    }

    try {
      console.log('📝 [useAuth] Signing up via server endpoint...');
      
      // Import project info
      const { projectId } = await import('../utils/supabase/info');
      
      // Call server endpoint to create user with confirmed email
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-7c0f82ca/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name: name || 'User' }),
      });
      
      const result = await response.json();
      
      if (!response.ok || result.error) {
        console.error('❌ [useAuth] Signup error:', result.error);
        toast.error(result.error || 'Errore durante la registrazione');
        return { user: null, error: new Error(result.error) };
      }
      
      console.log('✅ [useAuth] User created successfully via server');
      
      // Now sign in the user automatically
      console.log('🔐 [useAuth] Auto-signing in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ [useAuth] Auto-signin error:', error);
        toast.success('Account creato! Puoi ora effettuare il login.');
        return { user: null, error };
      }
      
      console.log('✅ [useAuth] User signed in successfully');
      toast.success('Account creato e accesso effettuato! Benvenuto! 🎉');
      return { user: data.user, error: null };
      
    } catch (error) {
      console.error('❌ [useAuth] Sign up error:', error);
      toast.error('Errore durante la registrazione');
      return { user: null, error: error as Error };
    }
  };

  const signOut = async () => {
    console.log('🚪 [useAuth] Signing out...');
    
    if (!isSupabaseConfigured) {
      console.log('💾 [useAuth] Local mode - clearing localStorage');
      // Local mode sign out
      storage.removeItem('btcwheel_local_user');
      setUser(null);
      toast.success('Disconnesso');
      return { error: null };
    }

    try {
      console.log('☁️ [useAuth] Cloud mode - signing out from Supabase');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [useAuth] Logout error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('✅ [useAuth] Successfully signed out');
      toast.success('Disconnesso');
      return { error: null };
    } catch (error) {
      console.error('❌ [useAuth] Sign out error:', error);
      toast.error('Errore durante la disconnessione');
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Google Sign-In richiede configurazione Supabase');
      return { user: null, error: new Error('Supabase not configured') };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
        },
      });

      if (error) {
        toast.error(error.message);
        return { user: null, error };
      }

      return { user: data, error: null };
    } catch (error) {
      console.error('Google sign in error:', error);
      toast.error('Errore durante l\'accesso con Google');
      return { user: null, error: error as Error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    // Aliases for compatibility with AuthProvider
    signInWithEmail: signIn,
    signUpWithEmail: signUp,
    signInWithMagicLink: signInWithGoogle, // Placeholder for magic link
  };
}