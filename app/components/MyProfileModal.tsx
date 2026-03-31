'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, User, Edit3, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import ProfileSetupModal from './ProfileSetupModal';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRAIT_LABELS: Record<string, string> = {
  사이즈: '사이즈', 마인드: '마인드', 글래머: '글래머', 슬래머: '슬래머',
  마른: '마른', 섹시한: '섹시한', 귀여운: '귀여운',
  후한팁: '후한팁', 매너: '매너', 로맨스: '로맨스', 애주가: '애주가', 알쓰: '알쓰',
};

export default function MyProfileModal({ isOpen, onClose }: MyProfileModalProps) {
  const { profile } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  if (!isOpen) return null;

  const changeLeft = 2 - (profile?.avatar_change_count ?? 0);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* 배경 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-sm bg-[#0a1628] border border-[#d4a017]/30 rounded-2xl shadow-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* 헤더 */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
                <p className="text-[#e8e0d0] font-bold">내 프로필</p>
                <button onClick={onClose} className="text-[#a0916e] hover:text-[#e8e0d0] transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* 프로필 사진 */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#d4a017]/40 shadow-[0_0_24px_rgba(212,160,23,0.15)]">
                    {profile?.avatar_url ? (
                      <Image src={profile.avatar_url} alt="프로필" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a2a4a] to-[#0f1e38] flex items-center justify-center">
                        <User size={32} className="text-[#d4a017]/40" />
                      </div>
                    )}
                  </div>

                  {/* 사진 변경 횟수 */}
                  <div className="flex items-center gap-1.5">
                    {changeLeft > 0 ? (
                      <span className="flex items-center gap-1 text-xs text-[#a0916e]">
                        <Sparkles size={11} className="text-[#d4a017]" />
                        사진 변경 {changeLeft}회 남음
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400/70">
                        <Lock size={11} />
                        사진 변경 횟수 소진
                      </span>
                    )}
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="bg-[#050b1a] rounded-xl border border-white/8 divide-y divide-white/5">
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[#a0916e] text-xs">닉네임</span>
                    <span className="text-[#e8e0d0] text-sm font-medium">{profile?.nickname}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[#a0916e] text-xs">아이디</span>
                    <span className="text-[#e8e0d0]/70 text-sm">@{profile?.username}</span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-[#a0916e] text-xs">구분</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">
                      {profile?.user_type}
                    </span>
                  </div>
                  {profile?.birth_date && (
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-[#a0916e] text-xs">생년월일</span>
                      <span className="text-[#e8e0d0]/70 text-sm">{profile.birth_date}</span>
                    </div>
                  )}
                </div>

                {/* 여자: 신체 정보 */}
                {profile?.user_type === '여자' && (profile?.height || profile?.weight || profile?.chest_size) && (
                  <div className="bg-[#050b1a] rounded-xl border border-white/8 divide-y divide-white/5">
                    {profile?.height && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[#a0916e] text-xs">키</span>
                        <span className="text-[#e8e0d0] text-sm font-medium">{profile.height}cm</span>
                      </div>
                    )}
                    {profile?.weight && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[#a0916e] text-xs">몸무게</span>
                        <span className="text-[#e8e0d0] text-sm font-medium">{profile.weight}kg</span>
                      </div>
                    )}
                    {profile?.chest_size && (
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-[#a0916e] text-xs">가슴 사이즈</span>
                        <span className="text-[#e8e0d0] text-sm font-medium">{profile.chest_size} 컵</span>
                      </div>
                    )}
                  </div>
                )}

                {/* 특징 태그 */}
                {profile?.traits && profile.traits.length > 0 && (
                  <div>
                    <p className="text-[#a0916e] text-xs mb-2">나의 특징</p>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.traits.map(t => (
                        <span
                          key={t}
                          className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20"
                        >
                          {TRAIT_LABELS[t] ?? t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 프로필 변경하기 버튼 */}
                <button
                  onClick={() => { setEditOpen(true); }}
                  className="w-full py-3 flex items-center justify-center gap-2 bg-[#d4a017]/10 hover:bg-[#d4a017]/20 border border-[#d4a017]/30 text-[#d4a017] font-semibold rounded-xl transition-all text-sm"
                >
                  <Edit3 size={15} />
                  프로필 변경하기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 프로필 수정 모달 */}
      <ProfileSetupModal
        isOpen={editOpen}
        onClose={() => { setEditOpen(false); onClose(); }}
      />
    </>
  );
}
