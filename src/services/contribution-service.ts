import { supabase } from '../lib/supabase';
import type { Contribution, ContributionInsert } from '../types/database';

export const contributionService = {
  async getAll(): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .order('date_added', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getByMember(memberRegNo: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('member_reg_no', memberRegNo)
      .order('date_added', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async create(contribution: ContributionInsert): Promise<Contribution> {
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('contributions')
      .insert({
        ...contribution,
        added_by: user?.id || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getByDateRange(startDate: string, endDate: string): Promise<Contribution[]> {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .gte('date_added', startDate)
      .lte('date_added', endDate)
      .order('date_added', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getMonthlyStats(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('contributions')
      .select('project_name', { count: 'exact', head: true })
      .gte('date_added', startDate)
      .lte('date_added', endDate);

    if (error) throw error;
    return data ? (data as unknown as number) : 0;
  },

  async getTotalPoints(): Promise<number> {
    const { data, error } = await supabase
      .from('contributions')
      .select('points');

    if (error) throw error;
    return data?.reduce((sum, c) => sum + c.points, 0) || 0;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contributions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};

