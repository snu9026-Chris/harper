'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import ProfileSetupModal from './ProfileSetupModal';

export default function ProfileBanner() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // 로그인 안 했거나, 이미 프로필 있으면 배너 숨김
  if (!user || profile?.avatar_url || dismissed) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 mt-6"
      >
        <div className="relative overflow-hidden rounded-2xl border border-[#d4a017]/40 bg-gradient-to-r from-[#d4a017]/10 via-[#0a1628] to-[#d4a017]/5 p-5">
          {/* 배경 글로우 */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-[#d4a017]/10 blur-2xl" />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl" />
          </div>

          <div className="relative flex items-center gap-4">
            {/* 아이콘 */}
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-[#d4a017]/15 border border-[#d4a017]/30 flex items-center justify-center">
              <Sparkles size={26} className="text-[#d4a017]" />
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <p className="text-[#e8e0d0] font-bold text-base">
                프로필을 작성해보세요!
              </p>
              <p className="text-[#a0916e] text-sm mt-0.5">
                <span className="text-[#d4a017] font-semibold">나노 바나나 AI</span>가 내 사진을 애니메이션 프로필로 변환해드려요
              </p>
            </div>

            {/* 버튼 */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <button
                onClick={() => setOpen(true)}
                className="px-5 py-2.5 bg-[#d4a017] hover:bg-[#f0c040] text-black font-bold rounded-xl text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#d4a017]/20"
              >
                프로필 작성하기
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="p-1.5 text-[#a0916e] hover:text-[#e8e0d0] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <ProfileSetupModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
