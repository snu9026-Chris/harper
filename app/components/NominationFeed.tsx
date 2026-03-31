'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Bell, X, User, Sparkles, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

interface NominationRequest {
  id: string;
  requester_id: string;
  requester_nickname: string;
  requester_avatar_url: string | null;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface RequesterDetail {
  id: string;
  nickname: string;
  username: string;
  user_type: string;
  avatar_url: string | null;
  traits: string[] | null;
  birth_date: string | null;
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

// ─── 신청자 상세 팝업 ──────────────────────────────────────────────────────────
function RequesterCard({ detail, onClose }: { detail: RequesterDetail; onClose: () => void }) {
  const age = detail.birth_date
    ? new Date().getFullYear() - parseInt(detail.birth_date.slice(0, 4)) + 1
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 6 }}
      transition={{ duration: 0.15 }}
      className="absolute z-[70] w-60 bg-[#080f20] border border-[#d4a017]/30 rounded-2xl shadow-2xl overflow-hidden"
      style={{ top: '110%', left: '50%', transform: 'translateX(-50%)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
        <p className="text-[#e8e0d0] text-xs font-bold">신청자 정보</p>
        <button onClick={onClose} className="text-[#a0916e] hover:text-white transition-colors">
          <X size={13} />
        </button>
      </div>
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full overflow-hidden border border-[#d4a017]/30 flex-shrink-0 bg-[#0f1e38] flex items-center justify-center">
          {detail.avatar_url ? (
            <Image src={detail.avatar_url} alt={detail.nickname} width={44} height={44} className="object-cover w-full h-full" unoptimized />
          ) : (
            <User size={18} className="text-[#d4a017]/50" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-semibold text-sm truncate">{detail.nickname}</p>
          <p className="text-[#a0916e] text-xs">@{detail.username}{age ? ` · ${age}세` : ''}</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20 mt-1 inline-block">
            {detail.user_type}
          </span>
        </div>
      </div>
      {detail.traits && detail.traits.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-1.5">
          {detail.traits.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-[#a0916e] border border-white/8">
              {t}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── 전체 패널 ────────────────────────────────────────────────────────────────
function NominationListPanel({
  requests,
  onClose,
}: {
  requests: NominationRequest[];
  onClose: () => void;
}) {
  const [selectedDetail, setSelectedDetail] = useState<RequesterDetail | null>(null);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchDetail = async (req: NominationRequest) => {
    if (selectedReqId === req.id) {
      setSelectedDetail(null);
      setSelectedReqId(null);
      return;
    }
    setLoadingId(req.requester_id);
    const { data } = await supabase
      .from('profiles')
      .select('id,nickname,username,user_type,avatar_url,traits,birth_date')
      .eq('id', req.requester_id)
      .single();
    setLoadingId(null);
    if (data) {
      setSelectedDetail(data as RequesterDetail);
      setSelectedReqId(req.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ duration: 0.18 }}
      className="absolute left-0 top-full mt-2 w-80 bg-[#080f20] border border-[#d4a017]/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
      onClick={e => e.stopPropagation()}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-[#d4a017]/5">
        <div className="flex items-center gap-2">
          <Bell size={14} className="text-[#d4a017]" />
          <p className="text-[#e8e0d0] font-bold text-sm">내 지명 현황</p>
          {requests.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#d4a017]/20 text-[#d4a017] font-bold border border-[#d4a017]/30">
              {requests.length}
            </span>
          )}
        </div>
        <button onClick={onClose} className="text-[#a0916e] hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="px-4 py-10 text-center">
          <Sparkles size={22} className="text-[#d4a017]/20 mx-auto mb-2" />
          <p className="text-[#a0916e] text-sm">아직 지명 신청이 없습니다</p>
          <p className="text-[#a0916e]/50 text-xs mt-1">지명이 들어오면 실시간으로 알려드려요</p>
        </div>
      ) : (
        <>
          {/* 동그라미 프로필 그리드 */}
          <div className="px-4 pt-4 pb-3 flex flex-wrap gap-3">
            {requests.map(req => (
              <div
                key={req.id}
                className="relative flex flex-col items-center gap-1.5 cursor-pointer group"
                onClick={() => fetchDetail(req)}
              >
                <div className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${
                  loadingId === req.requester_id
                    ? 'border-[#d4a017]/60 animate-pulse'
                    : selectedReqId === req.id
                    ? 'border-[#d4a017] shadow-[0_0_10px_rgba(212,160,23,0.4)]'
                    : 'border-[#d4a017]/20 group-hover:border-[#d4a017]/60'
                } bg-[#0f1e38] flex items-center justify-center`}>
                  {req.requester_avatar_url ? (
                    <Image src={req.requester_avatar_url} alt={req.requester_nickname} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                  ) : (
                    <User size={18} className="text-[#d4a017]/40" />
                  )}
                </div>
                <p className="text-[10px] text-[#a0916e] group-hover:text-[#e8e0d0] transition-colors text-center max-w-[52px] truncate">
                  {req.requester_nickname}
                </p>

                <AnimatePresence>
                  {selectedDetail && selectedReqId === req.id && (
                    <RequesterCard detail={selectedDetail} onClose={() => { setSelectedDetail(null); setSelectedReqId(null); }} />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* 메시지 리스트 */}
          <div className="border-t border-white/8 divide-y divide-white/5 max-h-56 overflow-y-auto">
            {requests.map(req => (
              <div key={req.id} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.03] transition-colors">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-[#d4a017]/20 flex-shrink-0 bg-[#0f1e38] flex items-center justify-center mt-0.5">
                  {req.requester_avatar_url ? (
                    <Image src={req.requester_avatar_url} alt="" width={32} height={32} className="object-cover" unoptimized />
                  ) : (
                    <User size={13} className="text-[#d4a017]/40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#e8e0d0] text-xs font-medium leading-snug">
                    <span className="text-[#d4a017]">{req.requester_nickname}</span>
                    {' '}님이 지명을 신청했습니다
                  </p>
                  {req.message && (
                    <p className="text-[#a0916e] text-[11px] mt-0.5 line-clamp-2 leading-snug">
                      &ldquo;{req.message}&rdquo;
                    </p>
                  )}
                  <p className="text-[#a0916e]/45 text-[10px] mt-0.5">{relativeTime(req.created_at)}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                  req.status === 'pending'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : req.status === 'accepted'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {req.status === 'pending' ? '대기' : req.status === 'accepted' ? '수락' : '거절'}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

// ─── 메인: NominationFeed ────────────────────────────────────────────────────
export default function NominationFeed() {
  const { user, profile } = useAuth();
  const [requests, setRequests] = useState<NominationRequest[]>([]);
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 모든 훅은 조건부 반환 전에 선언
  useEffect(() => {
    if (!user || profile?.user_type !== '여자') return;

    const load = async () => {
      const { data } = await supabase
        .from('nomination_requests')
        .select('id,requester_id,requester_nickname,requester_avatar_url,message,status,created_at')
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);
      if (data) setRequests(data as NominationRequest[]);
    };
    load();

    const channel = supabase
      .channel(`nominations:${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'nomination_requests', filter: `target_user_id=eq.${user.id}` },
        (payload) => {
          const newReq = payload.new as NominationRequest;
          setRequests(prev => [newReq, ...prev]);
          setNewCount(c => c + 1);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, profile?.user_type]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // 훅 이후에 조건부 반환
  if (!user || profile?.user_type !== '여자') return null;

  const latest = requests[0];
  const handleOpen = () => {
    setOpen(o => !o);
    setNewCount(0);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* ── 항상 보이는 피딩 바 ── */}
      <button
        onClick={handleOpen}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-200 group ${
          open
            ? 'bg-[#d4a017]/15 border-[#d4a017]/50 shadow-[0_0_16px_rgba(212,160,23,0.15)]'
            : 'bg-[#d4a017]/8 border-[#d4a017]/20 hover:border-[#d4a017]/45 hover:bg-[#d4a017]/12'
        }`}
      >
        {/* 벨 + 뱃지 */}
        <div className="relative flex-shrink-0">
          <Bell
            size={14}
            className={`transition-colors ${open ? 'text-[#d4a017]' : 'text-[#d4a017]/60 group-hover:text-[#d4a017]'}`}
          />
          {newCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
              {newCount > 9 ? '9+' : newCount}
            </span>
          )}
        </div>

        {/* 피딩 메시지 영역 */}
        <div className="flex flex-col items-start min-w-0 max-w-[200px] sm:max-w-[280px]">
          {latest ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={latest.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <p className="text-[11px] leading-tight truncate text-left">
                  <span className="text-[#d4a017] font-semibold">{latest.requester_nickname}</span>
                  <span className="text-[#e8e0d0]/70">님이 지명을 신청했습니다</span>
                </p>
                {latest.message && (
                  <p className="text-[10px] text-[#a0916e]/80 truncate text-left mt-0.5 leading-tight">
                    &ldquo;{latest.message}&rdquo;
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <p className="text-[11px] text-[#a0916e]/60 truncate">아직 지명 신청이 없습니다</p>
          )}
        </div>

        {/* 화살표 */}
        <ChevronRight
          size={12}
          className={`flex-shrink-0 transition-all ${open ? 'rotate-90 text-[#d4a017]' : 'text-[#a0916e]/50 group-hover:text-[#d4a017]/60'}`}
        />
      </button>

      {/* 드롭다운 패널 */}
      <AnimatePresence>
        {open && (
          <NominationListPanel requests={requests} onClose={() => setOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
