'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GirlCard from './GirlCard';
import type { GirlWithSchedule, Store } from '@/lib/types';

interface StoreSectionProps {
  girls: GirlWithSchedule[];
}

const STORES: { id: Store | 'all'; label: string; desc: string }[] = [
  { id: 'all', label: '전체', desc: '모든 매장' },
  { id: '도파민', label: '도파민', desc: 'Dopamine' },
  { id: '엘리트', label: '엘리트', desc: 'Elite' },
  { id: '퍼펙트', label: '퍼펙트', desc: 'Perfect' },
];

const STORE_COLORS: Record<string, string> = {
  '도파민': 'from-purple-900/40 to-[#050b1a]',
  '엘리트': 'from-blue-900/40 to-[#050b1a]',
  '퍼펙트': 'from-rose-900/40 to-[#050b1a]',
  'all': 'from-[#162b55]/40 to-[#050b1a]',
};

export default function StoreSection({ girls }: StoreSectionProps) {
  const [activeStore, setActiveStore] = useState<Store | 'all'>('all');

  const filtered = activeStore === 'all'
    ? girls
    : girls.filter(g => g.store === activeStore);

  const available = filtered.filter(g => g.is_available);
  const unavailable = filtered.filter(g => !g.is_available);
  const sorted = [...available, ...unavailable];

  const todayStr = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  });

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[#d4a017] text-sm font-medium tracking-widest uppercase mb-2">Today's Lineup</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">이번달 인기 지명</h2>
        <p className="text-[#e8e0d0]/40 text-sm">{todayStr} 기준 · 실시간 업데이트</p>
      </div>

      {/* Store tabs */}
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
            {activeStore === store.id && (
              <motion.span
                layoutId="store-tab-indicator"
                className="absolute inset-0 rounded-full bg-[#d4a017] -z-10"
              />
            )}
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div className={`mb-6 p-4 rounded-xl bg-gradient-to-r ${STORE_COLORS[activeStore]} border border-[#d4a017]/10`}>
        <div className="flex gap-6 text-sm">
          <div>
            <span className="text-[#e8e0d0]/40">전체 </span>
            <span className="text-white font-semibold">{filtered.length}명</span>
          </div>
          <div>
            <span className="text-[#e8e0d0]/40">예약가능 </span>
            <span className="text-emerald-400 font-semibold">{available.length}명</span>
          </div>
          <div>
            <span className="text-[#e8e0d0]/40">마감 </span>
            <span className="text-red-400 font-semibold">{unavailable.length}명</span>
          </div>
        </div>
      </div>

      {/* Girl grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStore}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4"
        >
          {sorted.map((girl, i) => (
            <motion.div
              key={girl.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className={girl.is_available ? '' : 'opacity-50'}
            >
              <GirlCard girl={girl} showStatus />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {sorted.length === 0 && (
        <div className="text-center py-16 text-[#e8e0d0]/30">
          <p className="text-4xl mb-3">✦</p>
          <p>오늘 등록된 직원이 없습니다</p>
        </div>
      )}
    </section>
  );
}
