export type Store = '도파민' | '엘리트' | '퍼펙트';

export interface GirlStats {
  height?: number;
  weight?: number;
  bust?: string;
  specialty?: string;
}

export interface Girl {
  id: string;
  name: string;
  age: number;
  store: Store;
  photo_url: string;
  intro: string;
  stats: GirlStats;
  created_at: string;
}

export interface Schedule {
  id: string;
  girl_id: string;
  work_date: string;
  is_available: boolean;
}

export interface GirlWithSchedule extends Girl {
  is_available: boolean;
}

// ─── Visit Feed ─────────────────────────────────────────────────────────────

export interface CustomerProfile {
  id: string;
  nickname: string;
  store_preference: Store | null;
  created_at: string;
}

export interface CustomerSpend {
  id: string;
  customer_id: string;
  month_year: string;
  monthly_spent: number; // 만원 단위
  total_spent: number;
  has_tip_badge: boolean;
  is_regular: boolean;
}

export interface VisitPost {
  id: string;
  customer_id: string;
  store: Store;
  visit_date: string; // 'YYYY-MM-DD'
  visit_time: string; // 'HH:MM'
  status: 'open' | 'closed' | 'cancelled';
  created_at: string;
}

export interface ApplicantPreview {
  girl_id: string;
  photo_url: string;
  name: string;
  store?: Store;
}

export interface VisitPostWithDetails extends VisitPost {
  customer: CustomerProfile;
  spend: CustomerSpend | null;
  applicants: ApplicantPreview[];
}

export interface ChoiceApplication {
  id: string;
  visit_id: string;
  girl_id: string;
  message?: string;
  status: 'pending' | 'selected' | 'rejected';
  created_at: string;
}
