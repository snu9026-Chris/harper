'use client';

import { useState } from 'react';
import { LogIn, LogOut, User, ChevronDown, UserCircle, Info, ShieldCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import AuthModal from './auth/AuthModal';
import GirlStatusUpload from './GirlStatusUpload';
import ProfileSetupModal from './ProfileSetupModal';
import MyProfileModal from './MyProfileModal';
import NominationFeed from './NominationFeed';
import MadameManagementPanel from './MadameManagementPanel';
import AdminMadameFeed from './AdminMadameFeed';

export default function Header() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [girlUploadOpen, setGirlUploadOpen] = useState(false);
  const [profileSetupOpen, setProfileSetupOpen] = useState(false);
  const [myProfileOpen, setMyProfileOpen] = useState(false);
  const [madamePanelOpen, setMadamePanelOpen] = useState(false);

  const userTypeLabel: Record<string, string> = { '여자': '🌸', '남자': '💎', '마담': '👑' };
  const isMadame = profile?.user_type === '마담';
  const isPendingMadame = isMadame && !profile?.is_approved && !isAdmin;

  return (
    <>
      {/* 마담 승인 대기 오버레이 */}
      {isPendingMadame && (
        <div className="fixed inset-0 z-[100] bg-[#030b18]/95 backdrop-blur-sm flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm bg-[#0a1628] border border-[#d4a017]/30 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">⏳</span>
            </div>
            <p className="text-[#e8e0d0] font-bold text-xl mb-2">승인 대기 중</p>
            <p className="text-[#a0916e] text-sm mb-6 leading-relaxed">
              관리자 검토 후 승인 처리됩니다.<br />승인 완료 시 모든 기능을 이용하실 수 있습니다.
            </p>
            {!profile?.business_card_url && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-5 text-left">
                <p className="text-amber-400 text-xs font-semibold mb-1">📋 명함 미업로드</p>
                <p className="text-[#a0916e] text-xs">가게 명함을 업로드해야 승인이 빠르게 처리됩니다.</p>
              </div>
            )}
            <button
              onClick={() => setProfileSetupOpen(true)}
              className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] text-black font-semibold rounded-xl transition-colors mb-3"
            >
              {profile?.business_card_url ? '명함 재업로드' : '명함 업로드하기'}
            </button>
            <button
              onClick={() => signOut()}
              className="w-full py-2 text-sm text-[#a0916e] hover:text-[#e8e0d0] transition-colors"
            >
              로그아웃
            </button>
          </motion.div>
        </div>
      )}

      <div className="flex items-center justify-between mb-12">
        {/* 로고 + 지명 피딩 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/30 flex items-center justify-center">
              <span className="text-[#d4a017] font-bold text-lg">H</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-wider">HARPER</p>
              <p className="text-[#e8e0d0]/30 text-xs tracking-widest">PREMIUM RESERVATION</p>
            </div>
          </div>
          {/* 여자 유저 지명 현황 */}
          <NominationFeed />
          {/* 관리자 마담 승인 알림 */}
          <AdminMadameFeed />
        </div>

        {/* 네비게이션 */}
        <nav className="hidden sm:flex items-center gap-6 text-sm text-[#e8e0d0]/50">
          <a href="#today" className="hover:text-[#d4a017] transition-colors">이번달 인기</a>
          <a href="#booking" className="hover:text-[#d4a017] transition-colors">날짜별 예약</a>
          <a href="#feed" className="hover:text-[#d4a017] transition-colors">역초이스</a>

          {!user ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a017] text-[#050b1a] font-medium hover:bg-[#f0c040] transition-colors text-sm"
            >
              <LogIn size={15} />
              로그인
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/30 text-[#d4a017] hover:bg-[#d4a017]/20 transition-colors text-sm"
              >
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt="avatar" width={20} height={20} className="rounded-full object-cover" />
                ) : (
                  <span>{userTypeLabel[profile?.user_type || ''] || <User size={14} />}</span>
                )}
                <span className="max-w-[80px] truncate">{profile?.nickname || profile?.username}</span>
                {isAdmin && <ShieldCheck size={12} className="text-[#d4a017]" />}
                {!profile?.avatar_url && !isMadame && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="프로필 미완성" />
                )}
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-[#0a1628] border border-[#d4a017]/20 rounded-xl shadow-2xl overflow-hidden z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {/* 프로필 정보 */}
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-[#e8e0d0] font-semibold text-sm">{profile?.nickname}</p>
                      <p className="text-[#a0916e] text-xs mt-0.5">@{profile?.username}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">
                          {profile?.user_type}
                        </span>
                        {isAdmin && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">관리자</span>}
                      </div>
                    </div>

                    {/* 내 정보 보기 */}
                    <button
                      onClick={() => { setMyProfileOpen(true); setDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center gap-2 text-[#e8e0d0]"
                    >
                      <Info size={14} className="text-[#d4a017]" />
                      내 정보 보기
                    </button>

                    {/* 프로필 변경하기 */}
                    <button
                      onClick={() => { setProfileSetupOpen(true); setDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 transition-colors flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2 text-[#e8e0d0]">
                        <UserCircle size={14} className="text-[#d4a017]" />
                        프로필 변경하기
                      </span>
                      {!profile?.avatar_url && !isMadame && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">미완성</span>
                      )}
                    </button>

                    {/* 여자: 지명가능 상태 업로드 */}
                    {profile?.user_type === '여자' && (
                      <button
                        onClick={() => { setGirlUploadOpen(true); setDropdownOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#e8e0d0] hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        🌸 지명가능 상태 업로드
                      </button>
                    )}

                    {/* 남자: 역초이스 */}
                    {profile?.user_type === '남자' && (
                      <a
                        href="#feed"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-[#e8e0d0] hover:bg-white/5 transition-colors"
                      >
                        💎 역초이스 등록하기
                      </a>
                    )}

                    {/* 마담: 아가씨 관리 현황 */}
                    {isMadame && profile?.is_approved && (
                      <button
                        onClick={() => { setMadamePanelOpen(true); setDropdownOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#e8e0d0] hover:bg-white/5 transition-colors flex items-center gap-2"
                      >
                        <Users size={14} className="text-[#d4a017]" />
                        아가씨 관리 현황
                      </button>
                    )}

                    {/* 관리자: 마담 승인 페이지 */}
                    {isAdmin && (
                      <a
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2.5 text-sm text-blue-400 hover:bg-blue-500/10 transition-colors flex items-center gap-2 border-t border-white/5"
                      >
                        <ShieldCheck size={14} />
                        마담 승인 관리
                      </a>
                    )}

                    {/* 로그아웃 */}
                    <button
                      onClick={() => { signOut(); setDropdownOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-white/10"
                    >
                      <LogOut size={14} />
                      로그아웃
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </nav>

        {/* 모바일 */}
        <div className="sm:hidden">
          {!user ? (
            <button onClick={() => setAuthOpen(true)} className="p-2 text-[#d4a017]">
              <LogIn size={22} />
            </button>
          ) : (
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 text-[#d4a017]">
              <User size={22} />
            </button>
          )}
        </div>
      </div>

      {/* 모달들 */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignupDone={() => setProfileSetupOpen(true)}
      />
      {profile?.user_type === '여자' && (
        <GirlStatusUpload isOpen={girlUploadOpen} onClose={() => setGirlUploadOpen(false)} />
      )}
      <ProfileSetupModal isOpen={profileSetupOpen} onClose={() => setProfileSetupOpen(false)} />
      <MyProfileModal isOpen={myProfileOpen} onClose={() => setMyProfileOpen(false)} />
      {isMadame && (
        <MadameManagementPanel isOpen={madamePanelOpen} onClose={() => setMadamePanelOpen(false)} />
      )}
    </>
  );
}
