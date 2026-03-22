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
      .ilike('reg_no', regNo)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .insert(member as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(regNo: string, updates: MemberUpdate): Promise<Member> {
    const { data, error } = await supabase
      .from('members')
      // @ts-expect-error: Suppress type mismatch
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update(updates as any)
      .eq('reg_no', regNo)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadPhoto(file: File, oldPhotoUrl?: string | null): Promise<string> {
    const { validatePhotoFile } = await import('../lib/sanitize');
    const validation = validatePhotoFile(file);
    if (!validation.valid) throw new Error(validation.error);

    const EXT_MAP: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
    };
    const ext = EXT_MAP[file.type] ?? 'jpg';
    const randomId = crypto.randomUUID();
    const filePath = `member-photos/${randomId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('members')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('members').getPublicUrl(filePath);

    // Delete old photo (best-effort)
    if (oldPhotoUrl) {
      try {
        const oldPath = oldPhotoUrl.split('/members/')[1];
        if (oldPath) await supabase.storage.from('members').remove([oldPath]);
      } catch { /* non-fatal */ }
    }

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
