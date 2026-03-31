'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { ShieldCheck, X, Clock, Check, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

interface PendingMadame {
  id: string;
  username: string;
  nickname: string;
  phone?: string;
  store_name?: string;
  business_card_url?: string | null;
  is_approved: boolean;
  created_at: string;
}

function relativeTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return '방금 전';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function AdminMadameFeed() {
  const { user, isAdmin } = useAuth();
  const [pending, setPending] = useState<PendingMadame[]>([]);
  const [open, setOpen] = useState(false);
  const [newCount, setNewCount] = useState(0);
  const [approving, setApproving] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 훅은 조건부 반환 전에 모두 선언
  useEffect(() => {
    if (!user || !isAdmin) return;

    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username, nickname, phone, store_name, business_card_url, is_approved, created_at')
        .eq('user_type', '마담')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });
      if (data) setPending(data as PendingMadame[]);
    };
    load();

    // 실시간: 새 마담 가입 시
    const channel = supabase
      .channel('admin:madame-signups')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles', filter: 'user_type=eq.마담' },
        (payload) => {
          const m = payload.new as PendingMadame;
          if (!m.is_approved) {
            setPending(prev => [m, ...prev]);
            setNewCount(c => c + 1);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, isAdmin]);

  // 외부 클릭 닫기
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

  // 관리자만
  if (!user || !isAdmin) return null;

  const handleOpen = () => {
    setOpen(o => !o);
    setNewCount(0);
  };

  const handleApprove = async (madameId: string) => {
    setApproving(madameId);
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', madameId);
    setApproving(null);
    if (!error) {
      setPending(prev => prev.filter(m => m.id !== madameId));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      {/* 알림 버튼 */}
      <button
        onClick={handleOpen}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all text-xs font-semibold ${
          open
            ? 'bg-blue-500/20 border-blue-400/40 text-blue-300'
            : pending.length > 0
              ? 'bg-blue-500/15 border-blue-400/30 text-blue-400 hover:bg-blue-500/25'
              : 'bg-white/5 border-white/10 text-[#a0916e] hover:bg-white/10'
        }`}
      >
        <ShieldCheck size={13} />
        <span>마담 승인</span>
        {pending.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] font-bold">
            {pending.length}
          </span>
        )}
        {newCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 animate-ping" />
        )}
      </button>

      {/* 드롭다운 패널 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-80 bg-[#080f20] border border-blue-500/20 rounded-2xl shadow-2xl overflow-hidden z-[60]"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 bg-blue-500/5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-blue-400" />
                <p className="text-[#e8e0d0] text-sm font-bold">마담 승인 대기</p>
                <span className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded-full">
                  {pending.length}건
                </span>
              </div>
              <button onClick={() => setOpen(false)} className="text-[#a0916e] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* 목록 */}
            <div className="max-h-96 overflow-y-auto divide-y divide-white/5">
              {pending.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <p className="text-[#a0916e] text-sm">대기 중인 마담 신청이 없습니다</p>
                </div>
              ) : (
                pending.map(m => (
                  <div key={m.id} className="px-4 py-3 hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-start gap-3">
                      {/* 명함 썸네일 or 이니셜 */}
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#1a2a4a] border border-white/10 flex-shrink-0 flex items-center justify-center">
                        {m.business_card_url ? (
                          <Image src={m.business_card_url} alt="명함" width={40} height={40} className="object-cover w-full h-full" unoptimized />
                        ) : (
                          <span className="text-[#a0916e] text-xs font-bold">{m.nickname?.slice(0, 1)}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[#e8e0d0] text-sm font-semibold">{m.nickname}</p>
                          <span className="text-[10px] text-[#a0916e]">@{m.username}</span>
                        </div>
                        {m.store_name && (
                          <p className="text-[#a0916e] text-xs mt-0.5">🏠 {m.store_name}</p>
                        )}
                        {m.phone && (
                          <p className="text-[#a0916e] text-xs">📞 {m.phone}</p>
                        )}
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Clock size={10} className="text-[#a0916e]/50" />
                          <span className="text-[#a0916e]/50 text-[10px]">{relativeTime(m.created_at)}</span>
                          {!m.business_card_url && (
                            <span className="text-[10px] text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">명함 미업로드</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 명함 크게 보기 + 승인 버튼 */}
                    <div className="flex gap-2 mt-2.5">
                      {m.business_card_url && (
                        <a
                          href={m.business_card_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 text-xs border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-lg transition-colors flex items-center justify-center gap-1"
                        >
                          명함 확인 <ChevronRight size={11} />
                        </a>
                      )}
                      <button
                        onClick={() => handleApprove(m.id)}
                        disabled={approving === m.id}
                        className="flex-1 py-2 text-xs bg-blue-500/20 hover:bg-blue-500/35 text-blue-300 border border-blue-500/30 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-1 font-semibold"
                      >
                        {approving === m.id ? (
                          <span className="animate-pulse">처리 중...</span>
                        ) : (
                          <><Check size={11} /> 승인</>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
