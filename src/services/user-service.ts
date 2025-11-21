import { supabase } from '../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import type { AppUser, AppUserInsert } from '../types/database';

export const userService = {
  async getCurrentUser(): Promise<AppUser | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getAll(): Promise<AppUser[]> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(email: string, password: string, userData: Omit<AppUserInsert, 'id'>): Promise<AppUser> {
    const tempClient = createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Create user in Supabase Auth
    // Note: If email confirmation is enabled in Supabase settings, 
    // users won't be able to log in until they confirm their email.
    // See DISABLE_EMAIL_CONFIRMATION.md for instructions.
    const { data: authData, error: authError } = await tempClient.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          created_by_admin: true,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    console.log('User created in Supabase Auth:', {
      userId: authData.user.id,
      email: authData.user.email,
      confirmed_at: authData.user.confirmed_at,
      email_confirmed_at: authData.user.email_confirmed_at,
      confirmation_sent_at: authData.user.confirmation_sent_at,
      role: userData.role,
    });

    // Check if email confirmation is required
    if (authData.user && !authData.user.confirmed_at && authData.user.confirmation_sent_at) {
      console.warn('⚠️ Email confirmation is enabled. User must confirm email before logging in.');
      console.warn('See DISABLE_EMAIL_CONFIRMATION.md for instructions to disable this.');
    } else if (authData.user && authData.user.confirmed_at) {
      console.log('✅ User email is confirmed. They can log in immediately.');
    }

    // Insert the profile using the ADMIN's credentials (main supabase client)
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        ...userData,
      } as any)
      .select()
      .single();

    if (error) throw error;

    console.log('User profile created in app_users:', {
      userId: (data as AppUser).id,
      username: (data as AppUser).username,
      role: (data as AppUser).role,
    });

    return data;
  },

  async update(id: string, updates: Partial<Omit<AppUser, 'id' | 'created_at'>>): Promise<AppUser> {
    const { data, error } = await supabase
      .from('app_users')
      // @ts-ignore
      .update(updates as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  async delete(id: string): Promise<{ error: any }> {
    // WARNING: This only deletes the user profile from app_users.
    // The user still exists in Supabase Auth (auth.users).
    // Deleting from auth.users requires service role key (server-side).
    // See USER_DELETION_GUIDE.md for manual cleanup instructions.

    console.warn('⚠️ Deleting user profile. Note: Auth user will remain in Supabase Auth.');
    console.warn('To fully delete the user, go to Supabase Dashboard → Authentication → Users');

    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    if (!error) {
      console.log('✅ User profile deleted from app_users');
      console.log('⚠️ Remember to delete the auth user from Supabase Dashboard if needed');
    }

    return { error };
  },
};
