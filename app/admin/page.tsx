'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShieldCheck, CheckCircle, XCircle, Loader2, ArrowLeft, Phone, Store, Clock } from 'lucide-react';
import { useAuth, ADMIN_USERNAME } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

interface MadamePending {
  id: string;
  username: string;
  nickname: string;
  phone: string | null;
  store_name: string | null;
  business_card_url: string | null;
  created_at: string;
  is_approved: boolean;
}

export default function AdminPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<MadamePending[]>([]);
  const [fetching, setFetching] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  // 관리자 아닌 경우 리다이렉트
  useEffect(() => {
    if (!loading && profile?.username !== ADMIN_USERNAME) {
      router.replace('/');
    }
  }, [loading, profile, router]);

  const fetchList = async () => {
    setFetching(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, username, nickname, phone, store_name, business_card_url, created_at, is_approved')
      .eq('user_type', '마담')
      .order('created_at', { ascending: false });
    if (data) setList(data as MadamePending[]);
    setFetching(false);
  };

  useEffect(() => {
    if (profile?.username === ADMIN_USERNAME) fetchList();
  }, [profile]);

  const showToast = (msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: true })
      .eq('id', id);
    setActionId(null);
    if (error) { showToast('승인 실패: ' + error.message, 'err'); return; }
    setList(prev => prev.map(p => p.id === id ? { ...p, is_approved: true } : p));
    showToast('승인 완료!', 'ok');
  };

  const handleRevoke = async (id: string) => {
    setActionId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: false })
      .eq('id', id);
    setActionId(null);
    if (error) { showToast('취소 실패: ' + error.message, 'err'); return; }
    setList(prev => prev.map(p => p.id === id ? { ...p, is_approved: false } : p));
    showToast('승인 취소됨', 'ok');
  };

  if (loading || profile?.username !== ADMIN_USERNAME) {
    return (
      <div className="min-h-screen bg-[#030b18] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#d4a017]" />
      </div>
    );
  }

  const pending = list.filter(p => !p.is_approved);
  const approved = list.filter(p => p.is_approved);

  return (
    <div className="min-h-screen bg-[#030b18] text-[#e8e0d0] px-4 py-8 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/')} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft size={18} className="text-[#a0916e]" />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={22} className="text-[#d4a017]" />
          <h1 className="text-xl font-bold">마담 승인 관리</h1>
        </div>
        <span className="ml-auto text-xs text-[#a0916e] bg-white/5 px-3 py-1 rounded-full">
          관리자: {ADMIN_USERNAME}
        </span>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: '전체 마담', value: list.length, color: 'text-[#d4a017]' },
          { label: '승인 대기', value: pending.length, color: 'text-amber-400' },
          { label: '승인 완료', value: approved.length, color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0a1628] border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[#a0916e] text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {fetching ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-[#d4a017]" />
        </div>
      ) : (
        <>
          {/* 승인 대기 */}
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-amber-400 mb-3 flex items-center gap-2">
                <Clock size={14} /> 승인 대기 ({pending.length})
              </h2>
              <div className="space-y-3">
                {pending.map(m => (
                  <MadameCard key={m.id} madame={m} actionId={actionId} onApprove={handleApprove} onRevoke={handleRevoke} />
                ))}
              </div>
            </section>
          )}

          {/* 승인 완료 */}
          {approved.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-green-400 mb-3 flex items-center gap-2">
                <CheckCircle size={14} /> 승인 완료 ({approved.length})
              </h2>
              <div className="space-y-3">
                {approved.map(m => (
                  <MadameCard key={m.id} madame={m} actionId={actionId} onApprove={handleApprove} onRevoke={handleRevoke} />
                ))}
              </div>
            </section>
          )}

          {list.length === 0 && (
            <div className="text-center py-20 text-[#a0916e]">
              <p className="text-4xl mb-3">👑</p>
              <p>등록된 마담이 없습니다</p>
            </div>
          )}
        </>
      )}

      {/* 토스트 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-medium shadow-xl flex items-center gap-2 ${
              toast.type === 'ok' ? 'bg-green-500/20 border border-green-500/30 text-green-300' : 'bg-red-500/20 border border-red-500/30 text-red-300'
            }`}
          >
            {toast.type === 'ok' ? <CheckCircle size={14} /> : <XCircle size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── 마담 카드 ────────────────────────────────────────────────────────────────
function MadameCard({
  madame, actionId, onApprove, onRevoke,
}: {
  madame: MadamePending;
  actionId: string | null;
  onApprove: (id: string) => void;
  onRevoke: (id: string) => void;
}) {
  const [cardOpen, setCardOpen] = useState(false);
  const isLoading = actionId === madame.id;

  return (
    <div className={`bg-[#0a1628] border rounded-xl p-4 transition-all ${
      madame.is_approved ? 'border-green-500/20' : 'border-amber-500/20'
    }`}>
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="w-10 h-10 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/20 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">👑</span>
        </div>

        {/* 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-[#e8e0d0]">{madame.nickname}</p>
            <span className="text-[#a0916e] text-xs">@{madame.username}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${
              madame.is_approved
                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {madame.is_approved ? '✓ 승인됨' : '대기 중'}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-[#a0916e]">
            {madame.phone && (
              <span className="flex items-center gap-1"><Phone size={11} /> {madame.phone}</span>
            )}
            {madame.store_name && (
              <span className="flex items-center gap-1"><Store size={11} /> {madame.store_name}</span>
            )}
            <span className="text-white/20">
              {new Date(madame.created_at).toLocaleDateString('ko-KR')} 가입
            </span>
          </div>

          {/* 명함 보기 */}
          {madame.business_card_url && (
            <button
              onClick={() => setCardOpen(!cardOpen)}
              className="mt-2 text-xs text-[#d4a017] hover:text-[#f0c040] transition-colors underline underline-offset-2"
            >
              {cardOpen ? '명함 닫기 ↑' : '명함 보기 ↓'}
            </button>
          )}
          {!madame.business_card_url && (
            <p className="mt-1.5 text-xs text-red-400/70">⚠ 명함 미업로드</p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {!madame.is_approved ? (
            <button
              onClick={() => onApprove(madame.id)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/25 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle size={11} />}
              승인
            </button>
          ) : (
            <button
              onClick={() => onRevoke(madame.id)}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {isLoading ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
              취소
            </button>
          )}
        </div>
      </div>

      {/* 명함 이미지 */}
      <AnimatePresence>
        {cardOpen && madame.business_card_url && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-3"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10">
              <Image src={madame.business_card_url} alt="명함" fill className="object-contain bg-[#050b1a]" unoptimized />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
