import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  // Social auth
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  
  // Profile update
  updateProfile: (profile: { name?: string; avatar_url?: string }) => Promise<void>;
  
  // Session management
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false, // Set initial loading to false
  error: null,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        set({ error: error.message, isLoading: false });
        return { error: error.message };
      }
      
      set({ user: data.user, isLoading: false });
      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      set({ error: errorMessage, isLoading: false });
      return { error: errorMessage };
    }
  },

  signUp: async (email: string, password: string, name: string) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Register the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) throw error;
      set({ user: data.user, isLoading: false });
      
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ error: error.message || 'Failed to sign up', isLoading: false });
    }
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback` 
            : undefined
        }
      });
      
      if (error) throw error;
      // Redirect akan ditangani oleh Supabase, tidak perlu set user
      
    } catch (error: any) {
      console.error('Google sign in error:', error);
      set({ error: error.message || 'Failed to sign in with Google', isLoading: false });
    }
  },

  signInWithGithub: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: typeof window !== 'undefined' 
            ? `${window.location.origin}/auth/callback` 
            : undefined
        }
      });
      
      if (error) throw error;
      // Redirect akan ditangani oleh Supabase, tidak perlu set user
      
    } catch (error: any) {
      console.error('GitHub sign in error:', error);
      set({ error: error.message || 'Failed to sign in with GitHub', isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isLoading: false });
    } catch (error: any) {
      console.error('Sign out error:', error);
      set({ error: error.message || 'Failed to sign out', isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/reset-password` 
          : undefined,
      });
      
      if (error) throw error;
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Reset password error:', error);
      set({ error: error.message || 'Failed to reset password', isLoading: false });
    }
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        data: profile
      });
      
      if (error) throw error;
      
      // Refresh user data
      await get().checkSession();
      set({ isLoading: false });
    } catch (error: any) {
      console.error('Update profile error:', error);
      set({ error: error.message || 'Failed to update profile', isLoading: false });
    }
  },

  checkSession: async () => {
    set({ isLoading: true });
    try {
      const { data } = await supabase.auth.getSession();
      const { data: userData } = await supabase.auth.getUser();
      
      set({ 
        user: userData?.user || null,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Check session error:', error);
      set({ 
        user: null, 
        error: error.message || 'Failed to check session',
        isLoading: false 
      });
    }
  },
}));
