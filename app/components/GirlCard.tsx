'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import type { GirlWithSchedule } from '@/lib/types';

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const STORE_TAG: Record<string, string> = {
  도파민: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  엘리트: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  퍼펙트: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

// ─── 출근일 생성 (걸 ID 기반 deterministic) ────────────────────────────────────

function getMockWorkDates(girlId: string): string[] {
  // ID 문자 합산으로 시드 생성
  const seed = girlId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  // 이 아가씨가 일하는 요일 (3개 고정)
  const workDays = new Set([
    seed % 7,
    (seed + 2) % 7,
    (seed + 4) % 7,
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 이번달 1일부터 다음달 말까지
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end   = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  const dates: string[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    if (workDays.has(cur.getDay())) {
      dates.push(cur.toISOString().slice(0, 10));
    }
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// ─── 날짜 그룹화 (월별) ────────────────────────────────────────────────────────

function groupByMonth(dates: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const d of dates) {
    const key = d.slice(0, 7); // 'YYYY-MM'
    if (!groups[key]) groups[key] = [];
    groups[key].push(d);
  }
  return groups;
}

// ─── 예약 팝업 ─────────────────────────────────────────────────────────────────

interface BookingPopupProps {
  girl: GirlWithSchedule;
  onClose: () => void;
}

function BookingPopup({ girl, onClose }: BookingPopupProps) {
  const workDates  = getMockWorkDates(girl.id);
  const grouped    = groupByMonth(workDates);
  const monthKeys  = Object.keys(grouped).sort();
  const today      = new Date().toISOString().slice(0, 10);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-sm bg-[#080f20] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <div className="flex items-center gap-2.5">
            <span className="text-white font-bold text-base">{girl.name}</span>
            <span className="text-[#d4a017] text-sm">{girl.age}세</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STORE_TAG[girl.store] ?? ''}`}>
              {girl.store}
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* 스탯 */}
        {girl.stats && (
          <div className="px-5 py-3 flex gap-3 border-b border-white/5">
            {girl.stats.height && (
              <span className="text-xs text-[#e8e0d0]/50">{girl.stats.height}cm</span>
            )}
            {girl.stats.weight && (
              <>
                <span className="text-xs text-[#e8e0d0]/20">·</span>
                <span className="text-xs text-[#e8e0d0]/50">{girl.stats.weight}kg</span>
              </>
            )}
            {girl.stats.bust && (
              <>
                <span className="text-xs text-[#e8e0d0]/20">·</span>
                <span className="text-xs text-[#e8e0d0]/50">{girl.stats.bust}컵</span>
              </>
            )}
          </div>
        )}

        {/* 출근 일정 */}
        <div className="px-5 py-4 max-h-72 overflow-y-auto">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={13} className="text-[#d4a017]" />
            <span className="text-xs font-semibold text-[#e8e0d0]/50 tracking-widest uppercase">출근 일정</span>
          </div>

          <div className="flex flex-col gap-5">
            {monthKeys.map(monthKey => {
              const [y, m] = monthKey.split('-').map(Number);
              return (
                <div key={monthKey}>
                  <p className="text-xs text-[#e8e0d0]/30 font-medium mb-2.5">
                    {y}년 {m}월
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {grouped[monthKey].map(dateStr => {
                      const d   = new Date(dateStr);
                      const day = d.getDate();
                      const wd  = WEEKDAYS[d.getDay()];
                      const isPast = dateStr < today;
                      const isToday = dateStr === today;

                      return (
                        <div
                          key={dateStr}
                          className={`flex flex-col items-center px-2.5 py-1.5 rounded-xl border text-center min-w-[44px] ${
                            isToday
                              ? 'bg-[#d4a017]/20 border-[#d4a017]/50 text-[#f0c040]'
                              : isPast
                              ? 'bg-white/3 border-white/6 text-white/20'
                              : 'bg-[#0d1a30] border-white/10 text-white/80'
                          }`}
                        >
                          <span className={`text-sm font-bold leading-none ${isToday ? 'text-[#f0c040]' : isPast ? 'text-white/20' : 'text-white'}`}>
                            {day}
                          </span>
                          <span className={`text-[10px] mt-0.5 ${isToday ? 'text-[#d4a017]' : isPast ? 'text-white/15' : 'text-[#e8e0d0]/40'}`}>
                            {wd}
                          </span>
                          {isToday && (
                            <span className="w-1 h-1 rounded-full bg-[#d4a017] mt-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#f0c040] active:scale-[.98] text-[#050b1a] font-bold text-sm transition-all duration-150"
          >
            예약 문의하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── GirlCard ─────────────────────────────────────────────────────────────────

interface GirlCardProps {
  girl: GirlWithSchedule;
  showStatus?: boolean;
}

export default function GirlCard({ girl, showStatus = false }: GirlCardProps) {
  const [imgError, setImgError]     = useState(false);
  const [showPopup, setShowPopup]   = useState(false);

  return (
    <>
      <div className="group relative rounded-xl overflow-hidden bg-[#0a1628] border border-[#d4a017]/20 hover:border-[#d4a017]/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] cursor-pointer">
        {/* 사진 */}
        <div className="relative h-56 sm:h-64 w-full overflow-hidden">
          {!imgError ? (
            <Image
              src={girl.photo_url}
              alt={girl.name}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f2040] to-[#162b55] flex items-center justify-center">
              <span className="text-4xl text-[#d4a017]/40">✦</span>
            </div>
          )}

          {/* 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b1a] via-[#050b1a]/30 to-transparent" />

          {/* 매장 뱃지 */}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#d4a017]/20 text-[#f0c040] border border-[#d4a017]/30 backdrop-blur-sm">
              {girl.store}
            </span>
          </div>

          {/* 예약가능 뱃지 */}
          {showStatus && (
            <div className="absolute top-3 right-3">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                girl.is_available
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${girl.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                {girl.is_available ? '예약가능' : '마감'}
              </span>
            </div>
          )}
        </div>

        {/* 정보 */}
        <div className="p-4">
          <div className="flex items-baseline justify-between mb-1">
            <h3 className="text-lg font-semibold text-white">{girl.name}</h3>
            <span className="text-sm text-[#d4a017]">{girl.age}세</span>
          </div>

          {/* 스탯 (specialty 제외) */}
          {girl.stats && (
            <div className="flex gap-2 flex-wrap mb-2">
              {girl.stats.height && (
                <span className="text-xs text-[#e8e0d0]/50">{girl.stats.height}cm</span>
              )}
              {girl.stats.weight && (
                <>
                  <span className="text-xs text-[#e8e0d0]/50">·</span>
                  <span className="text-xs text-[#e8e0d0]/50">{girl.stats.weight}kg</span>
                </>
              )}
              {girl.stats.bust && (
                <>
                  <span className="text-xs text-[#e8e0d0]/50">·</span>
                  <span className="text-xs text-[#e8e0d0]/50">{girl.stats.bust}컵</span>
                </>
              )}
            </div>
          )}

          <p className="text-xs text-[#e8e0d0]/40 line-clamp-2">{girl.intro}</p>

          {/* 지명 예약 버튼 */}
          <button
            onClick={() => setShowPopup(true)}
            className="mt-3 w-full py-2 rounded-lg text-sm font-medium bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/20 hover:border-[#d4a017]/50 transition-all duration-200"
          >
            지명 예약
          </button>
        </div>
      </div>

      {/* 팝업 */}
      <AnimatePresence>
        {showPopup && (
          <BookingPopup girl={girl} onClose={() => setShowPopup(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
