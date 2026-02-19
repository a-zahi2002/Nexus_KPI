import { supabase } from '../lib/supabase';
import { createClient, type PostgrestError } from '@supabase/supabase-js';
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
    // Defense-in-depth: verify caller is an admin before proceeding
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'super_admin') {
      throw new Error('Unauthorized: Only Super Admins can create users.');
    }

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



    // Insert the profile using the ADMIN's credentials (main supabase client)
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        ...userData,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async update(id: string, updates: Partial<Omit<AppUser, 'id' | 'created_at'>>): Promise<AppUser> {
    const { data, error } = await supabase
      .from('app_users')
      // @ts-expect-error: Suppress type mismatch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  async delete(id: string): Promise<{ error: PostgrestError | null }> {
    // NOTE: This only deletes the app_users row.
    // The auth.users row persists (requires service role key to delete).
    // See USER_DELETION_GUIDE.md for manual cleanup instructions.

    const { error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', id);

    return { error };
  },
};
