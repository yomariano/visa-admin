'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { authSupabase, isAdminEmail } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Development bypass configuration
const DEV_BYPASS_AUTH = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === 'true';
const DEV_USER_EMAIL = process.env.NEXT_PUBLIC_DEV_USER_EMAIL || 'dev@localhost.com';

// Create a mock user for development
const createMockUser = (email: string): User => ({
  id: 'dev-user-id',
  aud: 'authenticated',
  role: 'authenticated',
  email,
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email ? isAdminEmail(user.email) : false;

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      console.log('🚧 DEV MODE: Bypassing authentication with real Supabase session');
      console.log(`👤 Creating dev session for: ${DEV_USER_EMAIL}`);
      
      // Create a development session that Supabase will recognize
      const createDevSession = async () => {
        try {
          // Check if we already have a session
          const { data: { session: existingSession } } = await authSupabase.auth.getSession();
          
          if (existingSession?.user) {
            console.log('✅ Existing session found:', existingSession.user.email);
            setUser(existingSession.user);
            setLoading(false);
            return;
          }

          // For development, we'll use the service role to create a session
          // This is a workaround - in production you'd never do this
          console.log('🔧 Creating development session...');
          
          // Create a mock user that matches Supabase's User interface
          const mockUser = createMockUser(DEV_USER_EMAIL);
          setUser(mockUser);
          setLoading(false);
          
          console.log('✅ Development session created');
        } catch (error) {
          console.error('❌ Failed to create dev session:', error);
          // Fall back to mock user
          const mockUser = createMockUser(DEV_USER_EMAIL);
          setUser(mockUser);
          setLoading(false);
        }
      };

      createDevSession();
      return;
    }

    const getUser = async () => {
      const { data: { session } } = await authSupabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getUser();

    const { data: { subscription } } = authSupabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (DEV_BYPASS_AUTH) {
      console.log('🚧 DEV MODE: Skipping Google sign-in');
      return;
    }
    
    await authSupabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const signOut = async () => {
    if (DEV_BYPASS_AUTH) {
      console.log('🚧 DEV MODE: Skipping sign-out');
      setUser(null);
      // Optionally reload the page to reset to mock user
      setTimeout(() => {
        const mockUser = createMockUser(DEV_USER_EMAIL);
        setUser(mockUser);
      }, 100);
      return;
    }
    
    await authSupabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 