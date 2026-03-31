'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import AvailabilityCard, { type AvailabilityRow } from './AvailabilityCard';

type StoreFilter = '도파민' | '엘리트' | '퍼펙트' | 'all';

const STORES: { id: StoreFilter; label: string }[] = [
  { id: 'all', label: '전체' },
  { id: '도파민', label: '도파민' },
  { id: '엘리트', label: '엘리트' },
  { id: '퍼펙트', label: '퍼펙트' },
];

const STORE_COLORS: Record<StoreFilter, string> = {
  도파민: 'from-purple-900/40 to-[#050b1a]',
  엘리트: 'from-blue-900/40 to-[#050b1a]',
  퍼펙트: 'from-rose-900/40 to-[#050b1a]',
  all: 'from-[#162b55]/40 to-[#050b1a]',
};

export default function StoreSection() {
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStore, setActiveStore] = useState<StoreFilter>('all');

  const fetchData = async () => {
    // girl_availability: is_available=true, is_matched=false
    const { data: avail, error: e1 } = await supabase
      .from('girl_availability')
      .select('id, user_id, nickname, store, date, available_times, view_count, is_matched')
      .eq('is_available', true)
      .eq('is_matched', false)
      .order('view_count', { ascending: false });

    if (e1 || !avail || avail.length === 0) {
      setRows([]);
      setLoading(false);
      return;
    }

    // profiles + madame_badges join
    const userIds = avail.map(a => a.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url, traits, height, weight, chest_size')
      .in('id', userIds);

    const { data: badges } = await supabase
      .from('madame_badges')
      .select('recipient_id, badge_text')
      .in('recipient_id', userIds);

    const profileMap: Record<string, { avatar_url?: string; traits?: string[]; height?: number; weight?: number; chest_size?: string }> = {};
    profiles?.forEach(p => { profileMap[p.id] = p; });

    const badgeMap: Record<string, { badge_text: string }[]> = {};
    badges?.forEach(b => {
      if (!badgeMap[b.recipient_id]) badgeMap[b.recipient_id] = [];
      badgeMap[b.recipient_id].push({ badge_text: b.badge_text });
    });

    const merged: AvailabilityRow[] = avail.map(a => ({
      ...a,
      ...(profileMap[a.user_id] ?? {}),
      madame_badges: badgeMap[a.user_id] ?? [],
    }));

    setRows(merged);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = activeStore === 'all' ? rows : rows.filter(r => r.store === activeStore);

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* 헤더 */}
      <div className="mb-8">
        <p className="text-[#d4a017] text-sm font-medium tracking-widest uppercase mb-2">Today's Lineup</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">이번달 인기 지명</h2>
        <p className="text-[#e8e0d0]/40 text-sm">조회수 순 · 실시간 업데이트</p>
      </div>

      {/* 매장 탭 */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {STORES.map(store => (
          <button
            key={store.id}
            onClick={() => setActiveStore(store.id)}
            className={`relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeStore === store.id
                ? 'bg-[#d4a017] text-[#050b1a]'
                : 'bg-[#0a1628] text-[#e8e0d0]/60 hover:text-[#e8e0d0] border border-[#d4a017]/20 hover:border-[#d4a017]/40'
            }`}
          >
            {store.label}
          </button>
        ))}
      </div>

      {/* 스탯 바 */}
      <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${STORE_COLORS[activeStore]} border border-[#d4a017]/10`}>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-[#e8e0d0]/40">전체 </span>
            <span className="text-white font-semibold">{filtered.length}명</span>
          </div>
          <div>
            <span className="text-[#e8e0d0]/40">예약가능 </span>
            <span className="text-emerald-400 font-semibold">{filtered.length}명</span>
          </div>
        </div>
      </div>

      {/* 카드 그리드 */}
      {loading ? (
        <div className="text-center py-16 text-[#e8e0d0]/30">
          <p className="text-2xl animate-pulse mb-3">✦</p>
          <p>불러오는 중...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStore}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
          >
            {filtered.map((row, i) => (
              <motion.div
                key={row.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <AvailabilityCard row={row} onViewCounted={fetchData} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-[#e8e0d0]/30">
          <p className="text-4xl mb-3">✦</p>
          <p>현재 예약 가능한 직원이 없습니다</p>
        </div>
      )}
    </section>
  );
}
