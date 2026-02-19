import { supabase } from './supabase';

const isDev = import.meta.env.DEV;

export async function initializeDatabase() {
  try {
    const { error: tablesError } = await supabase
      .from('members')
      .select('reg_no')
      .limit(1);

    if (tablesError && tablesError.code === '42P01') {
      console.warn('Database tables not found. Please run migrations manually.');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

export async function seedMockData() {
  // Only seed in development — never in production
  if (!isDev) return;

  try {
    const { data: existingMembers } = await supabase
      .from('members')
      .select('reg_no')
      .limit(1);

    if (existingMembers && existingMembers.length > 0) {
      return;
    }

    const mockMembers = [
      {
        reg_no: 'S/2021/001',
        full_name: 'Saman Kumara Perera',
        name_with_initials: 'S.K. Perera',
        batch: '2021',
        faculty: 'Faculty of Computing',
        whatsapp: '+94771234567',
        my_lci_num: 'LCI123456',
        total_points: 0,
      },
      {
        reg_no: 'S/2021/002',
        full_name: 'Nimal Rajapakse Silva',
        name_with_initials: 'N.R. Silva',
        batch: '2021',
        faculty: 'Faculty of Applied Sciences',
        whatsapp: '+94772345678',
        my_lci_num: 'LCI234567',
        total_points: 0,
      },
      {
        reg_no: 'S/2022/001',
        full_name: 'Kamal Wickramasinghe Fernando',
        name_with_initials: 'K.W. Fernando',
        batch: '2022',
        faculty: 'Faculty of Management Studies',
        whatsapp: '+94773456789',
        total_points: 0,
      },
    ];

    const { error: membersError } = await supabase
      .from('members')
      // @ts-expect-error: Suppress type mismatch for mock data
      .insert(mockMembers);

    if (membersError) {
      console.error('Error seeding members:', membersError);
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
}

