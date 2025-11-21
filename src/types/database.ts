export interface Database {
  public: {
    Tables: {
      members: {
        Row: Member;
        Insert: MemberInsert;
        Update: MemberUpdate;
      };
      contributions: {
        Row: Contribution;
        Insert: ContributionInsert;
        Update: ContributionUpdate;
      };
      app_users: {
        Row: AppUser;
        Insert: AppUserInsert;
        Update: AppUserUpdate;
      };
    };
  };
}

export interface Member {
  reg_no: string;
  photo_url: string | null;
  full_name: string;
  name_with_initials: string;
  my_lci_num: string | null;
  batch: string;
  faculty: string;
  whatsapp: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface MemberInsert {
  reg_no: string;
  photo_url?: string | null;
  full_name: string;
  name_with_initials: string;
  my_lci_num?: string | null;
  batch: string;
  faculty: string;
  whatsapp: string;
  total_points?: number;
}

export interface MemberUpdate {
  photo_url?: string | null;
  full_name?: string;
  name_with_initials?: string;
  my_lci_num?: string | null;
  batch?: string;
  faculty?: string;
  whatsapp?: string;
}

export interface Contribution {
  id: string;
  member_reg_no: string;
  project_name: string;
  time_period: string;
  position: string;
  points: number;
  avenue: string | null;
  date_added: string;
  added_by: string | null;
}

export interface ContributionInsert {
  member_reg_no: string;
  project_name: string;
  time_period: string;
  position: string;
  points: number;
  avenue?: string | null;
  added_by?: string | null;
}

export interface ContributionUpdate {
  project_name?: string;
  time_period?: string;
  position?: string;
  points?: number;
  avenue?: string | null;
}

export interface AppUser {
  id: string;
  username: string;
  designation: string;
  role: 'super_admin' | 'editor' | 'viewer';
  linked_member_reg_no: string | null;
  created_at: string;
}

export interface AppUserInsert {
  id: string;
  username: string;
  designation: string;
  role: 'super_admin' | 'editor' | 'viewer';
  linked_member_reg_no?: string | null;
}

export interface AppUserUpdate {
  username?: string;
  designation?: string;
  role?: 'super_admin' | 'editor' | 'viewer';
  linked_member_reg_no?: string | null;
}
