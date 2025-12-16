import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Auth hook for btcwheel app - supports both local and Supabase modes
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if Supabase is configured (constant, not function!)
    const supabaseEnabled = isSupabaseConfigured;
    
    if (!supabaseEnabled) {
      console.log('Supabase not configured, using local mode');
      
      // Check localStorage for local user
      const localUser = localStorage.getItem('btcwheel_local_user');
      if (localUser) {
        try {
          const parsedUser = JSON.parse(localUser);
          setUser(parsedUser as User);
        } catch (error) {
          console.error('Error parsing local user:', error);
          localStorage.removeItem('btcwheel_local_user');
        }
      }
      
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      // Local mode sign in
      const localUser = localStorage.getItem('btcwheel_local_user');
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
      
      localStorage.setItem('btcwheel_local_user', JSON.stringify(newUser));
      setUser(newUser as User);
      toast.success('Account creato! Benvenuto!');
      return { user: newUser as User, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name || 'User',
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return { user: null, error };
      }

      toast.success('Account creato! Controlla la tua email per confermare.');
      return { user: data.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      toast.error('Errore durante la registrazione');
      return { user: null, error: error as Error };
    }
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      // Local mode sign out
      localStorage.removeItem('btcwheel_local_user');
      setUser(null);
      toast.success('Disconnesso');
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('Disconnesso');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
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
  };
}