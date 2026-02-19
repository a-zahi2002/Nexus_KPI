import { supabase } from '../lib/supabase';
import { sanitizeSearchQuery } from '../lib/sanitize';
import type { Member, MemberInsert, MemberUpdate } from '../types/database';

export const memberService = {
  async getAll(): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('total_points', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByRegNo(regNo: string): Promise<Member | null> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('reg_no', regNo)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async getTopMembers(limit: number = 3): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('total_points', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getByFaculty(faculty: string): Promise<Member[]> {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('faculty', faculty)
      .order('total_points', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(member: MemberInsert): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .insert(member)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(regNo: string, updates: MemberUpdate): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      .update(updates)
      .eq('reg_no', regNo)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadPhoto(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `member-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('members')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('members')
      .getPublicUrl(filePath);

    return data.publicUrl;
  },

  async search(query: string): Promise<Member[]> {
    const sanitized = sanitizeSearchQuery(query);
    if (!sanitized) return [];

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .or(`reg_no.ilike.%${sanitized}%,full_name.ilike.%${sanitized}%,name_with_initials.ilike.%${sanitized}%`)
      .order('total_points', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
