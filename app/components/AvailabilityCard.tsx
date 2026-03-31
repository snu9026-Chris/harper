'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Eye, CheckCircle, Loader2, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

export interface AvailabilityRow {
  id: string;
  user_id: string;
  nickname: string;
  store: string;
  date: string;
  available_times: string[];
  view_count: number;
  is_matched: boolean;
  // joined from profiles
  avatar_url?: string;
  traits?: string[];
  height?: number;
  weight?: number;
  chest_size?: string;
  // 마담 인증 뱃지
  madame_badges?: { badge_text: string }[];
}

const STORE_TAG: Record<string, string> = {
  도파민: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  엘리트: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  퍼펙트: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
};

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'short',
  });
}

interface DetailPopupProps {
  row: AvailabilityRow;
  onClose: () => void;
  canRequest: boolean;
}

function DetailPopup({ row, onClose, canRequest }: DetailPopupProps) {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState('');

  const handleRequest = async () => {
    if (!user || !profile) return;
    setSending(true);
    setSendError('');
    const { error } = await supabase.from('nomination_requests').insert({
      availability_id: row.id,
      target_user_id: row.user_id,
      requester_id: user.id,
      requester_nickname: profile.nickname,
      requester_avatar_url: profile.avatar_url ?? null,
      message: message.trim() || null,
      status: 'pending',
    });
    setSending(false);
    if (error) { setSendError('신청에 실패했습니다: ' + error.message); return; }
    setSent(true);
  };

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
            <span className="text-white font-bold text-base">{row.nickname}</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${STORE_TAG[row.store] ?? ''}`}>
              {row.store}
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* 신체 정보 */}
        {(row.height || row.weight || row.chest_size) && (
          <div className="px-5 py-3 flex gap-3 border-b border-white/5">
            {row.height && <span className="text-xs text-[#e8e0d0]/50">{row.height}cm</span>}
            {row.weight && (
              <>
                <span className="text-xs text-[#e8e0d0]/20">·</span>
                <span className="text-xs text-[#e8e0d0]/50">{row.weight}kg</span>
              </>
            )}
            {row.chest_size && (
              <>
                <span className="text-xs text-[#e8e0d0]/20">·</span>
                <span className="text-xs text-[#e8e0d0]/50">{row.chest_size}컵</span>
              </>
            )}
          </div>
        )}

        {/* 마담 인증 뱃지 */}
        {row.madame_badges && row.madame_badges.length > 0 && (
          <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-white/5">
            {row.madame_badges.map(b => (
              <span key={b.badge_text} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/30">
                <Star size={9} className="fill-[#f0c040]" /> {b.badge_text}
              </span>
            ))}
          </div>
        )}

        {/* 자체 특징 */}
        {row.traits && row.traits.length > 0 && (
          <div className="px-5 py-3 flex flex-wrap gap-1.5 border-b border-white/5">
            {row.traits.map(t => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[#a0916e] border border-white/8">
                {t}
              </span>
            ))}
          </div>
        )}

        {/* 날짜 & 시간 */}
        <div className="px-5 py-4">
          <p className="text-xs text-[#a0916e] mb-2">{formatDate(row.date)} 지명 가능 시간</p>
          <div className="flex flex-wrap gap-1.5">
            {row.available_times.map(t => (
              <span key={t} className="text-xs px-3 py-1.5 rounded-lg bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* 신청 버튼 영역 */}
        <div className="px-5 pb-5 pt-1 space-y-2">
          {sent ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle size={15} className="text-emerald-400" />
              <p className="text-emerald-400 text-sm font-semibold">지명 신청 완료!</p>
            </div>
          ) : canRequest ? (
            <>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="메시지를 남겨주세요 (선택)"
                maxLength={100}
                rows={2}
                className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2 text-[#e8e0d0] text-xs focus:outline-none focus:border-[#d4a017]/40 placeholder:text-white/20 resize-none"
              />
              {sendError && <p className="text-red-400 text-xs">{sendError}</p>}
              <button
                onClick={handleRequest}
                disabled={sending}
                className="w-full py-2.5 rounded-xl bg-[#d4a017] hover:bg-[#f0c040] active:scale-[.98] text-[#050b1a] font-bold text-sm transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending && <Loader2 size={14} className="animate-spin" />}
                지명 신청하기
              </button>
            </>
          ) : (
            <p className="text-center text-xs text-[#a0916e]">로그인 후 지명 신청이 가능합니다</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

interface AvailabilityCardProps {
  row: AvailabilityRow;
  onViewCounted: () => void;
}

export default function AvailabilityCard({ row, onViewCounted }: AvailabilityCardProps) {
  const { user, profile } = useAuth();
  const [showPopup, setShowPopup] = useState(false);
  const [imgError, setImgError] = useState(false);

  const canRequest = !!user && (profile?.user_type === '남자' || profile?.user_type === '마담');

  const handleOpen = async () => {
    setShowPopup(true);
    // 조회수 증가
    await supabase.rpc('increment_view_count', { availability_id: row.id });
    onViewCounted();
  };

  return (
    <>
      <div
        onClick={handleOpen}
        className="group relative rounded-xl overflow-hidden bg-[#0a1628] border border-[#d4a017]/20 hover:border-[#d4a017]/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] cursor-pointer"
      >
        {/* 사진 */}
        <div className="relative h-52 sm:h-60 w-full overflow-hidden bg-[#0f1f3d]">
          {row.avatar_url && !imgError ? (
            <Image
              src={row.avatar_url}
              alt={row.nickname}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f1f3d] to-[#080f20]" />
          )}

          {/* 그라디언트 */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050b1a] via-[#050b1a]/20 to-transparent" />

          {/* 매장 뱃지 */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-sm ${STORE_TAG[row.store] ?? ''}`}>
              {row.store}
            </span>
          </div>

          {/* 조회수 */}
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm">
            <Eye size={10} className="text-white/40" />
            <span className="text-[10px] text-white/40">{row.view_count}</span>
          </div>

          {/* 지명가능 dot */}
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              지명가능
            </span>
          </div>
        </div>

        {/* 정보 */}
        <div className="p-3.5">
          <div className="flex items-baseline justify-between mb-1.5">
            <h3 className="text-sm font-semibold text-white">{row.nickname}</h3>
            <span className="text-[10px] text-[#a0916e]">{formatDate(row.date)}</span>
          </div>

          {/* 신체 스탯 */}
          {(row.height || row.weight || row.chest_size) && (
            <div className="flex gap-1.5 flex-wrap mb-2">
              {row.height && <span className="text-[11px] text-[#e8e0d0]/40">{row.height}cm</span>}
              {row.weight && <span className="text-[11px] text-[#e8e0d0]/40">· {row.weight}kg</span>}
              {row.chest_size && <span className="text-[11px] text-[#e8e0d0]/40">· {row.chest_size}컵</span>}
            </div>
          )}

          {/* 마담 뱃지 (있으면 우선) + 자체 traits */}
          {((row.madame_badges && row.madame_badges.length > 0) || (row.traits && row.traits.length > 0)) && (
            <div className="flex flex-wrap gap-1 mb-2">
              {row.madame_badges?.slice(0, 2).map(b => (
                <span key={b.badge_text} className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/25">
                  <Star size={8} className="fill-[#f0c040]" /> {b.badge_text}
                </span>
              ))}
              {row.traits?.slice(0, 2).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#a0916e] border border-white/8">
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* 가능 시간 */}
          <div className="flex items-center gap-1 text-[10px] text-[#a0916e]">
            <Clock size={10} />
            <span className="truncate">{row.available_times.slice(0, 3).join(', ')}{row.available_times.length > 3 ? ' ...' : ''}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPopup && (
          <DetailPopup row={row} onClose={() => setShowPopup(false)} canRequest={canRequest} />
        )}
      </AnimatePresence>
    </>
  );
}
