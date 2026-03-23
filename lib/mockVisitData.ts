import type { CustomerProfile, CustomerSpend, VisitPostWithDetails } from './types';

// ─── Customers ───────────────────────────────────────────────────────────────
export const MOCK_CUSTOMERS: CustomerProfile[] = [
  { id: 'cust-1', nickname: '킹덤808',   store_preference: '도파민', created_at: '2025-01-10T00:00:00Z' },
  { id: 'cust-2', nickname: '실버나이트', store_preference: '엘리트', created_at: '2025-02-05T00:00:00Z' },
  { id: 'cust-3', nickname: '루나틱',    store_preference: '퍼펙트', created_at: '2025-04-20T00:00:00Z' },
  { id: 'cust-4', nickname: '스카이77',  store_preference: null,     created_at: '2025-09-01T00:00:00Z' },
  { id: 'cust-5', nickname: '프린스',    store_preference: '도파민', created_at: '2024-11-15T00:00:00Z' },
];

// ─── Spend records (마담 입력) ────────────────────────────────────────────────
export const MOCK_SPENDS: Record<string, CustomerSpend> = {
  'cust-1': {
    id: 'sp-1', customer_id: 'cust-1', month_year: '2026-03',
    monthly_spent: 2500, total_spent: 19800,
    has_tip_badge: true, is_regular: true,
  },
  'cust-2': {
    id: 'sp-2', customer_id: 'cust-2', month_year: '2026-03',
    monthly_spent: 1200, total_spent: 8700,
    has_tip_badge: false, is_regular: true,
  },
  'cust-3': {
    id: 'sp-3', customer_id: 'cust-3', month_year: '2026-03',
    monthly_spent: 650, total_spent: 3100,
    has_tip_badge: true, is_regular: false,
  },
  'cust-4': {
    id: 'sp-4', customer_id: 'cust-4', month_year: '2026-03',
    monthly_spent: 180, total_spent: 420,
    has_tip_badge: false, is_regular: false,
  },
  'cust-5': {
    id: 'sp-5', customer_id: 'cust-5', month_year: '2026-03',
    monthly_spent: 3100, total_spent: 34500,
    has_tip_badge: true, is_regular: true,
  },
};

// ─── Applicant avatar pool (from existing girl photos) ───────────────────────
const APPLICANT_POOL = [
  { girl_id: 'd0', photo_url: 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=80&h=80&fit=crop&crop=face', name: '수아',  store: '도파민' as const },
  { girl_id: 'd1', photo_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face', name: '지원',  store: '도파민' as const },
  { girl_id: 'd2', photo_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&h=80&fit=crop&crop=face', name: '하은',  store: '도파민' as const },
  { girl_id: 'e0', photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face', name: '서연',  store: '엘리트' as const },
  { girl_id: 'e1', photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face', name: '민지',  store: '엘리트' as const },
  { girl_id: 'p0', photo_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face', name: '지유',  store: '퍼펙트' as const },
  { girl_id: 'p1', photo_url: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face', name: '소율',  store: '퍼펙트' as const },
];

// ─── Visit posts ─────────────────────────────────────────────────────────────
// Dates are relative to today (2026-03-24) — adjust if needed
export const MOCK_VISIT_POSTS: VisitPostWithDetails[] = [
  {
    id: 'vp-1',
    customer_id: 'cust-5',
    store: '도파민',
    visit_date: (() => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '20:00',
    status: 'open',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    customer: MOCK_CUSTOMERS[4],
    spend: MOCK_SPENDS['cust-5'],
    applicants: [APPLICANT_POOL[0], APPLICANT_POOL[1], APPLICANT_POOL[3], APPLICANT_POOL[5]],
  },
  {
    id: 'vp-2',
    customer_id: 'cust-1',
    store: '엘리트',
    visit_date: (() => { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '21:30',
    status: 'open',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    customer: MOCK_CUSTOMERS[0],
    spend: MOCK_SPENDS['cust-1'],
    applicants: [APPLICANT_POOL[3], APPLICANT_POOL[4]],
  },
  {
    id: 'vp-3',
    customer_id: 'cust-2',
    store: '퍼펙트',
    visit_date: (() => { const d = new Date(); d.setDate(d.getDate()+1); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '19:00',
    status: 'open',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    customer: MOCK_CUSTOMERS[1],
    spend: MOCK_SPENDS['cust-2'],
    applicants: [APPLICANT_POOL[5], APPLICANT_POOL[6], APPLICANT_POOL[2]],
  },
  {
    id: 'vp-4',
    customer_id: 'cust-3',
    store: '도파민',
    visit_date: (() => { const d = new Date(); d.setDate(d.getDate()+2); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '22:00',
    status: 'open',
    created_at: new Date(Date.now() - 18000000).toISOString(),
    customer: MOCK_CUSTOMERS[2],
    spend: MOCK_SPENDS['cust-3'],
    applicants: [APPLICANT_POOL[0], APPLICANT_POOL[1]],
  },
  {
    id: 'vp-5',
    customer_id: 'cust-4',
    store: '엘리트',
    visit_date: (() => { const d = new Date(); d.setDate(d.getDate()+3); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '18:30',
    status: 'open',
    created_at: new Date(Date.now() - 21600000).toISOString(),
    customer: MOCK_CUSTOMERS[3],
    spend: MOCK_SPENDS['cust-4'],
    applicants: [],
  },
  {
    id: 'vp-6',
    customer_id: 'cust-1',
    store: '퍼펙트',
    visit_date: (() => { const d = new Date(); d.setDate(d.getDate()+4); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '20:30',
    status: 'open',
    created_at: new Date(Date.now() - 28800000).toISOString(),
    customer: MOCK_CUSTOMERS[0],
    spend: MOCK_SPENDS['cust-1'],
    applicants: [APPLICANT_POOL[5], APPLICANT_POOL[6]],
  },
  {
    id: 'vp-7',
    customer_id: 'cust-5',
    store: '도파민',
    visit_date: (() => { const d = new Date(); d.setDate(d.getDate()+5); d.setHours(0,0,0,0); return d.toISOString().slice(0,10); })(),
    visit_time: '21:00',
    status: 'open',
    created_at: new Date(Date.now() - 36000000).toISOString(),
    customer: MOCK_CUSTOMERS[4],
    spend: MOCK_SPENDS['cust-5'],
    applicants: [APPLICANT_POOL[0], APPLICANT_POOL[2], APPLICANT_POOL[4]],
  },
];
