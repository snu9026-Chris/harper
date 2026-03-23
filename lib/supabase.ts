import { createClient } from '@supabase/supabase-js';
import type { Girl, GirlWithSchedule, Store } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getAvailableGirlsByDate(date: string, store?: Store): Promise<GirlWithSchedule[]> {
  let query = supabase
    .from('girls')
    .select(`
      *,
      schedules!inner(is_available, work_date)
    `)
    .eq('schedules.work_date', date)
    .eq('schedules.is_available', true);

  if (store) {
    query = query.eq('store', store);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []).map((g: Girl & { schedules: { is_available: boolean }[] }) => ({
    ...g,
    is_available: true,
  }));
}

export async function getAllGirls(store?: Store): Promise<Girl[]> {
  let query = supabase.from('girls').select('*');
  if (store) {
    query = query.eq('store', store);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}
