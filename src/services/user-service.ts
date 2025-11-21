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
    // Note: In a real production app, you should use a Supabase Edge Function
    // to create users so you don't need to expose service keys or manage sessions like this.
    // For this demo, we'll use a workaround or assume the RLS allows it.

    // 1. Sign up the user
    // WARNING: This will sign in the NEW user in the browser context if we use the main client!
    // But we need the main client's session to pass the RLS "is_admin" check for the INSERT.
    // This is a catch-22 in client-side only apps.

    // CORRECT APPROACH FOR CLIENT-SIDE ADMIN CREATION:
    // We actually DO need the temp client to avoid losing the admin session,
    // BUT the INSERT must be done by the ADMIN (main client).

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
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed');

    // 2. Insert the profile using the ADMIN's credentials (main supabase client)
    const { data, error } = await supabase
      .from('app_users')
      .insert({
        id: authData.user.id,
        ...userData,
      } as any)
      .select()
      .single();

    if (error) throw error;
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
};
