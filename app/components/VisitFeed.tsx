'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Plus, Check, Users, ChevronRight, ChevronDown, Zap } from 'lucide-react';
import type { Store, VisitPostWithDetails, CustomerSpend, ApplicantPreview } from '@/lib/types';
import { MOCK_VISIT_POSTS } from '@/lib/mockVisitData';

// ─── constants ───────────────────────────────────────────────────────────────

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const FILTER_TABS = ['전체', '도파민', '엘리트', '퍼펙트', 'VIP만'] as const;
type FilterTab = (typeof FILTER_TABS)[number];

const STORE_STYLE: Record<Store, { tag: string; bar: string; cardBorder: string; glow: string }> = {
  도파민: {
    tag: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
    bar: 'bg-gradient-to-r from-blue-600 to-blue-400',
    cardBorder: 'border-blue-500/20 hover:border-blue-500/45',
    glow: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.12)]',
  },
  엘리트: {
    tag: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
    bar: 'bg-gradient-to-r from-amber-600 to-amber-400',
    cardBorder: 'border-amber-500/20 hover:border-amber-500/45',
    glow: 'hover:shadow-[0_0_24px_rgba(245,158,11,0.12)]',
  },
  퍼펙트: {
    tag: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
    bar: 'bg-gradient-to-r from-rose-600 to-rose-400',
    cardBorder: 'border-rose-400/20 hover:border-rose-400/45',
    glow: 'hover:shadow-[0_0_24px_rgba(251,113,133,0.12)]',
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────

function getDDay(dateStr: string): { label: string; cls: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const visit = new Date(dateStr);
  visit.setHours(0, 0, 0, 0);
  const diff = Math.round((visit.getTime() - today.getTime()) / 86_400_000);
  if (diff === 0) return { label: 'TODAY', cls: 'bg-red-500/20 text-red-400 border border-red-500/40' };
  if (diff === 1) return { label: 'D-1', cls: 'bg-orange-500/15 text-orange-400 border border-orange-500/30' };
  return { label: `D-${diff}`, cls: 'bg-white/5 text-white/35 border border-white/10' };
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return { month: d.getMonth() + 1, day: d.getDate(), weekday: WEEKDAYS[d.getDay()] };
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? '오후' : '오전';
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${period} ${hour}:${m.toString().padStart(2, '0')}`;
}

function starCount(monthly: number) {
  if (monthly >= 2000) return 3;
  if (monthly >= 1000) return 2;
  if (monthly >= 500) return 1;
  return 0;
}

function isVip(spend: CustomerSpend | null) {
  return !!spend && spend.monthly_spent >= 500;
}

// ─── SpendBadges ─────────────────────────────────────────────────────────────

function SpendBadges({ spend }: { spend: CustomerSpend | null }) {
  if (!spend) return null;
  const stars = starCount(spend.monthly_spent);
  return (
    <div className="flex flex-wrap gap-1.5">
      {stars > 0 && (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#d4a017]/10 text-[#f0c040] border border-[#d4a017]/25">
          {'★'.repeat(stars)}
        </span>
      )}
      {spend.has_tip_badge && (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          팁 잘 뿌림
        </span>
      )}
      {spend.is_regular && (
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
          단골
        </span>
      )}
    </div>
  );
}

// ─── ApplicantStack ───────────────────────────────────────────────────────────

function ApplicantStack({ applicants }: { applicants: ApplicantPreview[] }) {
  const visible = applicants.slice(0, 3);
  const extra = applicants.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {visible.map((a, i) => (
          <div
            key={a.girl_id}
            className="relative w-7 h-7 rounded-full overflow-hidden border-2 border-[#0a1628] ring-1 ring-white/10"
            style={{ marginLeft: i > 0 ? '-10px' : 0, zIndex: visible.length - i }}
          >
            <Image src={a.photo_url} alt={a.name} fill className="object-cover" unoptimized />
          </div>
        ))}
        {extra > 0 && (
          <div
            className="relative w-7 h-7 rounded-full bg-[#1a2a4a] border-2 border-[#0a1628] ring-1 ring-white/10 flex items-center justify-center"
            style={{ marginLeft: '-10px', zIndex: 0 }}
          >
            <span className="text-[9px] text-white/60 font-medium">+{extra}</span>
          </div>
        )}
      </div>
      {applicants.length > 0 ? (
        <span className="text-xs text-[#e8e0d0]/40">
          {applicants.length}명 신청 중
        </span>
      ) : (
        <span className="text-xs text-[#e8e0d0]/25">아직 신청 없음</span>
      )}
    </div>
  );
}

// ─── VisitCard ────────────────────────────────────────────────────────────────

interface VisitCardProps {
  post: VisitPostWithDetails;
  applied: boolean;
  onApply: (post: VisitPostWithDetails) => void;
}

function VisitCard({ post, applied, onApply }: VisitCardProps) {
  const style = STORE_STYLE[post.store];
  const dday = getDDay(post.visit_date);
  const { month, day, weekday } = formatDate(post.visit_date);
  const timeStr = formatTime(post.visit_time);
  const vip = isVip(post.spend);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className={`relative flex flex-col rounded-2xl overflow-hidden bg-[#080f20] border transition-all duration-300 ${style.cardBorder} ${style.glow} cursor-default`}
    >
      {/* Store accent bar */}
      <div className={`h-[3px] w-full ${style.bar}`} />

      {/* Card body */}
      <div className="flex flex-col flex-1 p-5 gap-4">

        {/* Row 1: store tag + D-day */}
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${style.tag}`}>
            {post.store}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${dday.cls}`}>
            {dday.label}
          </span>
        </div>

        {/* Row 2: big date + time */}
        <div className="text-center py-1">
          <div className="flex items-end justify-center gap-2 leading-none">
            <span className="text-[64px] font-black text-white leading-none tracking-tight">{day}</span>
            <div className="mb-2 text-left">
              <p className="text-xs text-[#e8e0d0]/35 font-medium">{month}월</p>
              <p className="text-sm text-[#e8e0d0]/55 font-semibold">{weekday}요일</p>
            </div>
          </div>
          <p className="text-sm text-[#e8e0d0]/50 mt-0.5">{timeStr}</p>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Row 3: customer info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2.5">
            {/* Avatar initial */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1a2a4a] to-[#0f1e38] border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-[#d4a017]">
                {post.customer.nickname.slice(0, 1)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-white truncate">
                  {post.customer.nickname}
                </span>
                {vip && (
                  <span className="px-1.5 py-px rounded text-[10px] font-bold bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/25 flex-shrink-0">
                    VIP
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Spend badges */}
          <SpendBadges spend={post.spend} />
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5" />

        {/* Row 4: applicants + CTA */}
        <div className="flex items-center justify-between gap-3">
          <ApplicantStack applicants={post.applicants} />

          <button
            onClick={() => !applied && onApply(post)}
            disabled={applied}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex-shrink-0 ${
              applied
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 cursor-default'
                : 'bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/25 hover:border-[#d4a017]/50 active:scale-95'
            }`}
          >
            {applied ? (
              <>
                <Check size={12} />
                신청완료
              </>
            ) : (
              <>
                초이스 신청
                <ChevronRight size={12} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── PostFormModal ────────────────────────────────────────────────────────────

interface PostFormModalProps {
  onClose: () => void;
  onSubmit: (data: { date: string; time: string; store: Store }) => void;
}

function PostFormModal({ onClose, onSubmit }: PostFormModalProps) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [time, setTime] = useState('20:00');
  const [store, setStore] = useState<Store>('도파민');

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
        className="w-full max-w-md bg-[#080f20] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <h3 className="text-white font-bold text-base">방문 등록</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Date */}
          <div>
            <label className="block text-xs text-[#e8e0d0]/50 font-medium mb-2 tracking-wide uppercase">날짜 선택</label>
            <input
              type="date"
              value={date}
              min={today}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-[#0d1a30] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a017]/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-xs text-[#e8e0d0]/50 font-medium mb-2 tracking-wide uppercase">시간 선택</label>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full bg-[#0d1a30] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#d4a017]/50 transition-colors [color-scheme:dark]"
            />
          </div>

          {/* Store */}
          <div>
            <label className="block text-xs text-[#e8e0d0]/50 font-medium mb-2 tracking-wide uppercase">매장 선택</label>
            <div className="grid grid-cols-3 gap-2">
              {(['도파민', '엘리트', '퍼펙트'] as Store[]).map(s => (
                <button
                  key={s}
                  onClick={() => setStore(s)}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all duration-150 ${
                    store === s
                      ? 'bg-[#d4a017]/15 text-[#f0c040] border-[#d4a017]/40'
                      : 'bg-[#0d1a30] text-[#e8e0d0]/50 border-white/8 hover:border-white/20'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={() => { onSubmit({ date, time, store }); onClose(); }}
            className="w-full py-3 rounded-xl bg-[#d4a017] hover:bg-[#f0c040] text-[#050b1a] font-bold text-sm transition-colors"
          >
            등록하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── ApplicantRow (ChoiceModal 내부용) ───────────────────────────────────────

function ApplicantRow({ applicant, index }: { applicant: ApplicantPreview; index: number }) {
  const [imgError, setImgError] = useState(false);
  const storeStyle = applicant.store ? STORE_STYLE[applicant.store] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-[#0a1628] border border-white/6"
    >
      {/* 순번 */}
      <span className="text-[11px] font-mono text-[#e8e0d0]/20 w-4 text-center flex-shrink-0">
        {index + 1}
      </span>

      {/* 사진 */}
      <div className="relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
        {!imgError && applicant.photo_url ? (
          <Image
            src={applicant.photo_url}
            alt={applicant.name}
            fill
            className="object-cover object-top"
            unoptimized
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a2a4a] to-[#0f1e38] flex items-center justify-center">
            <span className="text-xs font-bold text-[#d4a017]">{applicant.name.slice(0, 1)}</span>
          </div>
        )}
      </div>

      {/* 이름 */}
      <span className="text-sm font-semibold text-white flex-1">{applicant.name}</span>

      {/* 매장 뱃지 */}
      {storeStyle && applicant.store && (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${storeStyle.tag}`}>
          {applicant.store}
        </span>
      )}
    </motion.div>
  );
}

// ─── ChoiceModal ──────────────────────────────────────────────────────────────

interface ChoiceModalProps {
  post: VisitPostWithDetails;
  onClose: () => void;
  onSubmit: (message: string) => void;
}

function ChoiceModal({ post, onClose, onSubmit }: ChoiceModalProps) {
  const [message, setMessage] = useState('');
  const [showList, setShowList] = useState(false);
  const { month, day, weekday } = formatDate(post.visit_date);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 44, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 44, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="w-full max-w-md bg-[#080f20] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[88vh] sm:max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── 헤더 (고정) ── */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h3 className="text-white font-bold text-base">역초이스 신청</h3>
            <p className="text-[#e8e0d0]/40 text-xs mt-0.5">
              {post.store} · {month}월 {day}일 ({weekday}) · {formatTime(post.visit_time)}
            </p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* ── 스크롤 영역 ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">

          {/* 고객 요약 카드 */}
          <div className="mx-5 mt-5 p-3.5 rounded-xl bg-[#0d1a30] border border-white/8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a2a4a] to-[#0f1e38] border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-[#d4a017]">{post.customer.nickname.slice(0, 1)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-white">{post.customer.nickname}</span>
                {isVip(post.spend) && (
                  <span className="px-1.5 py-px rounded text-[10px] font-bold bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/25">
                    VIP
                  </span>
                )}
              </div>
              <div className="mt-1">
                <SpendBadges spend={post.spend} />
              </div>
            </div>
          </div>

          {/* 초이스 신청 리스트 토글 버튼 */}
          <div className="px-5 mt-4">
            <button
              onClick={() => setShowList(v => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 ${
                showList
                  ? 'bg-white/8 border-white/15 text-white'
                  : 'bg-white/4 border-white/8 text-[#e8e0d0]/60 hover:bg-white/7 hover:border-white/12 hover:text-white/80'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={14} className={showList ? 'text-[#d4a017]' : 'text-white/30'} />
                <span>초이스 신청 리스트</span>
                {post.applicants.length > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-normal text-emerald-400">{post.applicants.length}명</span>
                  </span>
                )}
              </div>
              <motion.div animate={{ rotate: showList ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={15} className="text-white/30" />
              </motion.div>
            </button>

            {/* 리스트 펼침 영역 */}
            <AnimatePresence initial={false}>
              {showList && (
                <motion.div
                  key="list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1 flex flex-col gap-1.5">
                    {post.applicants.length === 0 ? (
                      <div className="py-6 text-center">
                        <Users size={26} className="mx-auto mb-2 text-white/10" />
                        <p className="text-sm text-[#e8e0d0]/20">아직 신청한 아가씨가 없습니다</p>
                        <p className="text-xs text-[#e8e0d0]/15 mt-0.5">가장 먼저 신청해 보세요</p>
                      </div>
                    ) : (
                      post.applicants.map((a, i) => (
                        <ApplicantRow key={a.girl_id} applicant={a} index={i} />
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 초이스 신청 섹션 (메시지 입력) */}
          <div className="px-5 mt-4 mb-2">
            <label className="block text-xs font-semibold text-[#e8e0d0]/45 tracking-widest uppercase mb-2">
              메시지{' '}
              <span className="normal-case font-normal text-[#e8e0d0]/25 tracking-normal">(선택사항)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="손님께 남길 한마디를 입력하세요..."
              rows={3}
              className="w-full bg-[#0d1a30] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#d4a017]/40 resize-none transition-colors"
            />
          </div>
        </div>

        {/* ── 푸터: 버튼 2개 (고정) ── */}
        <div className="px-5 py-4 border-t border-white/8 flex-shrink-0 flex gap-2.5">
          <button
            onClick={() => setShowList(v => !v)}
            className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#e8e0d0]/70 hover:text-white font-semibold text-sm transition-all duration-150 active:scale-[.98]"
          >
            신청 리스트
          </button>
          <button
            onClick={() => { onSubmit(message); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#d4a017] hover:bg-[#f0c040] active:scale-[.98] text-[#050b1a] font-bold text-sm transition-all duration-150"
          >
            신청하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── VisitFeed (main) ─────────────────────────────────────────────────────────

export default function VisitFeed() {
  const [posts, setPosts] = useState<VisitPostWithDetails[]>(
    [...MOCK_VISIT_POSTS].sort(
      (a, b) => new Date(a.visit_date + 'T' + a.visit_time).getTime() - new Date(b.visit_date + 'T' + b.visit_time).getTime()
    )
  );
  const [activeFilter, setActiveFilter] = useState<FilterTab>('전체');
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [showPostForm, setShowPostForm] = useState(false);
  const [choiceTarget, setChoiceTarget] = useState<VisitPostWithDetails | null>(null);
  const [liveCount, setLiveCount] = useState(0);

  // Simulate a live "new applicant" ping every ~8s for realism
  useEffect(() => {
    const id = setInterval(() => {
      setLiveCount(n => n + 1);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'VIP만') return isVip(p.spend);
    if (activeFilter === '전체') return true;
    return p.store === activeFilter;
  });

  function handlePostSubmit(data: { date: string; time: string; store: Store }) {
    const newPost: VisitPostWithDetails = {
      id: `vp-new-${Date.now()}`,
      customer_id: 'me',
      store: data.store,
      visit_date: data.date,
      visit_time: data.time,
      status: 'open',
      created_at: new Date().toISOString(),
      customer: { id: 'me', nickname: '나', store_preference: data.store, created_at: new Date().toISOString() },
      spend: null,
      applicants: [],
    };
    setPosts(prev =>
      [...prev, newPost].sort(
        (a, b) => new Date(a.visit_date + 'T' + a.visit_time).getTime() - new Date(b.visit_date + 'T' + b.visit_time).getTime()
      )
    );
  }

  function handleChoiceSubmit(postId: string) {
    setAppliedIds(prev => { const s = new Set(prev); s.add(postId); return s; });
    // Optimistically add applicant count
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, applicants: [...p.applicants, { girl_id: 'me', photo_url: '', name: '나' }] }
          : p
      )
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-[#d4a017]" />
            <span className="text-[#d4a017] text-xs font-semibold tracking-widest uppercase">Live Feed</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">역초이스</h2>
          <p className="text-[#e8e0d0]/40 text-sm mt-1">손님이 직접 등록한 방문 일정 · 아가씨가 먼저 신청하세요</p>
        </div>

        {/* Post CTA */}
        <button
          onClick={() => setShowPostForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/25 hover:border-[#d4a017]/50 text-sm font-semibold transition-all duration-200 active:scale-95 self-start sm:self-auto"
        >
          <Plus size={15} />
          방문 등록
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap mb-6">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              activeFilter === tab
                ? 'bg-[#d4a017] text-[#050b1a] shadow-[0_0_12px_rgba(212,160,23,0.3)]'
                : 'bg-white/5 text-[#e8e0d0]/50 hover:bg-white/10 hover:text-white/80 border border-white/8'
            }`}
          >
            {tab}
          </button>
        ))}
        <span className="ml-auto text-[#e8e0d0]/25 text-xs self-center hidden sm:block">
          {filteredPosts.length}건
        </span>
      </div>

      {/* Grid */}
      <AnimatePresence mode="popLayout">
        {filteredPosts.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20 text-[#e8e0d0]/25 text-sm"
          >
            <Users size={32} className="mx-auto mb-3 opacity-20" />
            방문 예정인 손님이 없습니다
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {filteredPosts.map(post => (
              <VisitCard
                key={post.id}
                post={post}
                applied={appliedIds.has(post.id)}
                onApply={p => setChoiceTarget(p)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <AnimatePresence>
        {showPostForm && (
          <PostFormModal
            onClose={() => setShowPostForm(false)}
            onSubmit={handlePostSubmit}
          />
        )}
        {choiceTarget && (
          <ChoiceModal
            post={choiceTarget}
            onClose={() => setChoiceTarget(null)}
            onSubmit={msg => { handleChoiceSubmit(choiceTarget.id); }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
