'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, Users, Star, Plus, Trash2, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

interface ManagedGirl {
  id: string;
  nickname: string;
  avatar_url: string | null;
  traits: string[] | null;
  height: number | null;
  weight: number | null;
  chest_size: string | null;
  madame_badges: { badge_text: string }[];
}

interface BadgeModalState {
  girlId: string;
  girlNickname: string;
  existingBadges: string[];
}

const BADGE_SUGGESTIONS = ['친절', '분위기', '인기', '매너', '실력', '단골추천', '신입', '베테랑'];

export default function MadameManagementPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { profile, user } = useAuth();
  const [girls, setGirls] = useState<ManagedGirl[]>([]);
  const [loading, setLoading] = useState(false);
  const [badgeModal, setBadgeModal] = useState<BadgeModalState | null>(null);

  const fetchGirls = async () => {
    if (!profile) return;
    setLoading(true);
    // 이 마담의 이름을 madame_name으로 등록한 아가씨들 가져오기
    const { data } = await supabase
      .from('profiles')
      .select(`
        id, nickname, avatar_url, traits, height, weight, chest_size,
        madame_badges ( badge_text )
      `)
      .eq('user_type', '여자')
      .or(`madame_name.eq.${profile.nickname},madame_id.eq.${profile.id}`);
    if (data) setGirls(data as ManagedGirl[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && profile) fetchGirls();
  }, [isOpen, profile]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a1628] border border-[#d4a017]/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#d4a017]" />
                <p className="text-[#e8e0d0] font-bold">아가씨 관리 현황</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">
                  {girls.length}명
                </span>
              </div>
              <button onClick={onClose} className="text-[#a0916e] hover:text-[#e8e0d0] transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* 본문 */}
            <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-[#d4a017]" />
                </div>
              ) : girls.length === 0 ? (
                <div className="text-center py-14">
                  <p className="text-4xl mb-3">🌸</p>
                  <p className="text-[#e8e0d0] font-semibold mb-1">등록된 아가씨가 없습니다</p>
                  <p className="text-[#a0916e] text-xs">아가씨가 프로필에서 마담 이름을 등록하면 여기에 나타납니다</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {girls.map(girl => {
                    const badges = girl.madame_badges?.map(b => b.badge_text) ?? [];
                    return (
                      <div key={girl.id} className="bg-[#080f20] border border-white/8 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          {/* 아바타 */}
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#d4a017]/20 flex-shrink-0 bg-[#0f1e38] flex items-center justify-center">
                            {girl.avatar_url ? (
                              <Image src={girl.avatar_url} alt={girl.nickname} width={48} height={48} className="object-cover w-full h-full" unoptimized />
                            ) : (
                              <span className="text-[#d4a017] font-bold">{girl.nickname.slice(0, 1)}</span>
                            )}
                          </div>

                          {/* 정보 */}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-[#e8e0d0]">{girl.nickname}</p>

                            {/* 신체 정보 */}
                            {(girl.height || girl.weight || girl.chest_size) && (
                              <p className="text-xs text-[#a0916e] mt-0.5">
                                {[
                                  girl.height && `${girl.height}cm`,
                                  girl.weight && `${girl.weight}kg`,
                                  girl.chest_size && `${girl.chest_size}컵`,
                                ].filter(Boolean).join(' · ')}
                              </p>
                            )}

                            {/* 자체 특징 태그 */}
                            {girl.traits && girl.traits.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {girl.traits.map(t => (
                                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-[#a0916e] border border-white/8">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* 마담 인증 뱃지 */}
                            {badges.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {badges.map(b => (
                                  <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/30 flex items-center gap-1">
                                    <Star size={9} className="fill-[#f0c040]" /> {b}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* 뱃지 관리 버튼 */}
                          <button
                            onClick={() => setBadgeModal({ girlId: girl.id, girlNickname: girl.nickname, existingBadges: badges })}
                            className="flex-shrink-0 px-3 py-1.5 text-xs border border-[#d4a017]/30 text-[#d4a017] hover:bg-[#d4a017]/10 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Star size={11} />
                            뱃지 {badges.length}/3
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* 뱃지 관리 모달 */}
          {badgeModal && (
            <BadgeManager
              girlId={badgeModal.girlId}
              girlNickname={badgeModal.girlNickname}
              existingBadges={badgeModal.existingBadges}
              madameId={user!.id}
              onClose={() => { setBadgeModal(null); fetchGirls(); }}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── 뱃지 관리 서브모달 ────────────────────────────────────────────────────────
function BadgeManager({
  girlId, girlNickname, existingBadges, madameId, onClose,
}: {
  girlId: string;
  girlNickname: string;
  existingBadges: string[];
  madameId: string;
  onClose: () => void;
}) {
  const [badges, setBadges] = useState<string[]>(existingBadges);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2000); };

  const addBadge = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (badges.includes(trimmed)) { showToast('이미 있는 뱃지입니다'); return; }
    if (badges.length >= 3) { showToast('최대 3개까지 부여할 수 있습니다'); return; }

    setSaving(true);
    const { error } = await supabase.from('madame_badges').insert({
      recipient_id: girlId,
      madame_id: madameId,
      badge_text: trimmed,
    });
    setSaving(false);
    if (error) { showToast('오류: ' + error.message); return; }
    setBadges(prev => [...prev, trimmed]);
    setCustom('');
    showToast('뱃지 추가 완료!');
  };

  const removeBadge = async (text: string) => {
    setSaving(true);
    const { error } = await supabase.from('madame_badges')
      .delete()
      .eq('recipient_id', girlId)
      .eq('badge_text', text);
    setSaving(false);
    if (error) { showToast('삭제 실패: ' + error.message); return; }
    setBadges(prev => prev.filter(b => b !== text));
    showToast('뱃지 삭제됨');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 flex items-center justify-center p-4 z-10"
    >
      <div className="w-full max-w-sm bg-[#0d1f3a] border border-[#d4a017]/40 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[#e8e0d0] font-bold">{girlNickname}님 뱃지 관리</p>
            <p className="text-[#a0916e] text-xs mt-0.5">최대 3개 · 마담만 부여 가능</p>
          </div>
          <button onClick={onClose} className="text-[#a0916e] hover:text-[#e8e0d0]"><X size={18} /></button>
        </div>

        {/* 현재 뱃지 */}
        <div className="mb-4">
          <p className="text-xs text-[#a0916e] mb-2">현재 뱃지 ({badges.length}/3)</p>
          {badges.length === 0 ? (
            <p className="text-xs text-white/25">부여된 뱃지 없음</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {badges.map(b => (
                <span key={b} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-[#d4a017]/15 text-[#f0c040] border border-[#d4a017]/30">
                  <Star size={10} className="fill-[#f0c040]" />
                  {b}
                  <button onClick={() => removeBadge(b)} className="hover:text-red-400 transition-colors ml-0.5">
                    <Trash2 size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 추천 뱃지 */}
        {badges.length < 3 && (
          <div className="mb-4">
            <p className="text-xs text-[#a0916e] mb-2">추천 뱃지</p>
            <div className="flex flex-wrap gap-1.5">
              {BADGE_SUGGESTIONS.filter(s => !badges.includes(s)).map(s => (
                <button
                  key={s}
                  onClick={() => addBadge(s)}
                  disabled={saving}
                  className="px-2.5 py-1 text-xs rounded-full border border-white/10 text-[#a0916e] hover:border-[#d4a017]/50 hover:text-[#d4a017] transition-colors flex items-center gap-1"
                >
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 직접 입력 */}
        {badges.length < 3 && (
          <div className="flex gap-2">
            <input
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBadge(custom)}
              placeholder="직접 입력 후 Enter"
              maxLength={10}
              className="flex-1 bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#4a4a4a] focus:outline-none focus:border-[#d4a017]/50"
            />
            <button
              onClick={() => addBadge(custom)}
              disabled={!custom.trim() || saving}
              className="px-3 py-2 bg-[#d4a017] hover:bg-[#f0c040] text-black rounded-xl text-sm font-semibold disabled:opacity-40 transition-colors"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            </button>
          </div>
        )}

        {/* 토스트 */}
        <AnimatePresence>
          {toast && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center text-xs text-[#d4a017] mt-3 flex items-center justify-center gap-1">
              <CheckCircle size={11} /> {toast}
            </motion.p>
          )}
        </AnimatePresence>

        <button onClick={onClose} className="w-full mt-5 py-2.5 bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/20 rounded-xl text-sm transition-colors">
          완료
        </button>
      </div>
    </motion.div>
  );
}
