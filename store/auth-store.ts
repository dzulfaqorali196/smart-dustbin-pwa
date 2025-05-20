import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
        toast.error('Login gagal: ' + error.message);
        return { error: error.message };
      }
      
      set({ user: data.user, isLoading: false });
      toast.success('Login berhasil! Selamat datang kembali.');
      return {};
    } catch (error: any) {
      console.error('Sign in error:', error);
      const errorMessage = error.message || 'Failed to sign in';
      set({ error: errorMessage, isLoading: false });
      toast.error('Login gagal: ' + errorMessage);
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
      
      if (error) {
        toast.error('Pendaftaran gagal: ' + error.message);
        throw error;
      }
      
      set({ user: data.user, isLoading: false });
      toast.success('Pendaftaran berhasil! Selamat datang di Smart Dustbin.');
      
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
      
      if (error) {
        toast.error('Login dengan Google gagal: ' + error.message);
        throw error;
      }
      // Redirect akan ditangani oleh Supabase, tidak perlu set user
      toast.loading('Menghubungkan dengan Google...');
      
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
      
      if (error) {
        toast.error('Login dengan GitHub gagal: ' + error.message);
        throw error;
      }
      // Redirect akan ditangani oleh Supabase, tidak perlu set user
      toast.loading('Menghubungkan dengan GitHub...');
      
    } catch (error: any) {
      console.error('GitHub sign in error:', error);
      set({ error: error.message || 'Failed to sign in with GitHub', isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Logout gagal: ' + error.message);
        throw error;
      }
      set({ user: null, isLoading: false });
      toast.success('Logout berhasil. Sampai jumpa kembali!');
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
      
      if (error) {
        toast.error('Reset password gagal: ' + error.message);
        throw error;
      }
      set({ isLoading: false });
      toast.success('Instruksi reset password telah dikirim ke email Anda.');
    } catch (error: any) {
      console.error('Reset password error:', error);
      set({ error: error.message || 'Failed to reset password', isLoading: false });
    }
  },

  updateProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Update user_metadata di auth
      const { error } = await supabase.auth.updateUser({
        data: profile
      });
      
      if (error) {
        toast.error('Update profil gagal: ' + error.message);
        throw error;
      }

      // 2. Simpan juga di tabel profiles (CREATE IF NOT EXISTS)
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        // Cek apakah profil sudah ada
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.user.id)
          .single();

        if (existingProfile) {
          // Update profil yang ada
          await supabase
            .from('profiles')
            .update({
              name: profile.name || existingProfile.name,
              avatar_url: profile.avatar_url || existingProfile.avatar_url,
              updated_at: new Date().toISOString()
            })
            .eq('id', currentUser.user.id);
        } else {
          // Buat profil baru
          await supabase
            .from('profiles')
            .insert({
              id: currentUser.user.id,
              name: profile.name || currentUser.user.user_metadata?.name,
              avatar_url: profile.avatar_url || currentUser.user.user_metadata?.avatar_url,
              email: currentUser.user.email
            });
        }
      }
      
      // Refresh user data
      await get().checkSession();
      set({ isLoading: false });
      toast.success('Profil berhasil diperbarui!');
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
      
      if (userData?.user) {
        // Coba ambil data profil kustom dari tabel profiles
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userData.user.id)
          .single();
        
        // Jika ada profil kustom, gunakan data dari sana untuk override metadata
        if (profileData) {
          // Buat salinan user untuk dimodifikasi
          const userWithCustomProfile = { ...userData.user };
          // Override metadata dengan data dari profil kustom
          userWithCustomProfile.user_metadata = {
            ...userWithCustomProfile.user_metadata,
            name: profileData.name || userWithCustomProfile.user_metadata?.name,
            avatar_url: profileData.avatar_url || userWithCustomProfile.user_metadata?.avatar_url
          };
          
          set({ 
            user: userWithCustomProfile,
            isLoading: false 
          });
          return;
        }
      }
      
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
