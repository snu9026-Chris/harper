'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../../lib/AuthContext';
import type { UserType } from '../../../lib/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupDone: () => void;
}

type Tab = 'login' | 'signup' | 'reset';

export default function AuthModal({ isOpen, onClose, onSignupDone }: AuthModalProps) {
  const { signIn, signUp, checkUsername, resetPassword } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // 로그인
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');

  // 회원가입
  const [signupId, setSignupId] = useState('');
  const [signupPw, setSignupPw] = useState('');
  const [nickname, setNickname] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [userType, setUserType] = useState<UserType>('남자');
  const [phone, setPhone] = useState('');
  const [storeName, setStoreName] = useState('');
  const [idChecked, setIdChecked] = useState(false);

  // 비밀번호 찾기
  const [resetNickname, setResetNickname] = useState('');
  const [resetBirth, setResetBirth] = useState('');
  const [resetPw, setResetPw] = useState('');
  const [resetDone, setResetDone] = useState('');

  const switchTab = (t: Tab) => {
    setTab(t);
    setError('');
    setResetDone('');
  };

  const handleLogin = async () => {
    if (!loginId || !loginPw) return setError('아이디와 비밀번호를 입력해주세요.');
    setLoading(true);
    setError('');
    const { error } = await signIn(loginId, loginPw);
    setLoading(false);
    if (error) return setError(error);
    onClose();
  };

  const handleCheckId = async () => {
    if (!signupId) return setError('아이디를 입력해주세요.');
    setLoading(true);
    const available = await checkUsername(signupId);
    setLoading(false);
    if (available) {
      setIdChecked(true);
      setError('');
    } else {
      setIdChecked(false);
      setError('이미 사용 중인 아이디입니다.');
    }
  };

  const handleSignup = async () => {
    if (!idChecked) return setError('아이디 중복 확인을 해주세요.');
    if (!signupId || !signupPw || !nickname || !birthDate) return setError('모든 항목을 입력해주세요.');
    if (userType === '마담' && (!phone || !storeName)) return setError('마담은 전화번호와 가게명을 입력해주세요.');
    setLoading(true);
    setError('');
    const { error } = await signUp({
      username: signupId,
      password: signupPw,
      nickname,
      birth_date: birthDate,
      user_type: userType,
      phone: userType === '마담' ? phone : undefined,
      store_name: userType === '마담' ? storeName : undefined,
    });
    setLoading(false);
    if (error) return setError(error);
    onClose();
    onSignupDone();
  };

  const handleReset = async () => {
    if (!resetNickname || !resetBirth || !resetPw) return setError('모든 항목을 입력해주세요.');
    setLoading(true);
    setError('');
    const { error, username } = await resetPassword(resetNickname, resetBirth, resetPw);
    setLoading(false);
    if (error) return setError(error);
    setResetDone(`비밀번호가 변경되었습니다. 아이디: ${username}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-sm bg-[#0a1628] border border-[#d4a017]/20 rounded-2xl p-6 relative"
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-[#a0916e] hover:text-white transition-colors">
              <X size={18} />
            </button>

            {/* 탭 */}
            <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1">
              {(['login', 'signup'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
                    tab === t ? 'bg-[#d4a017] text-black' : 'text-[#a0916e] hover:text-white'
                  }`}
                >
                  {t === 'login' ? '로그인' : '회원가입'}
                </button>
              ))}
            </div>

            {/* 로그인 */}
            {tab === 'login' && (
              <div className="space-y-3">
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="아이디"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50 pr-10"
                    placeholder="비밀번호"
                    value={loginPw}
                    onChange={(e) => setLoginPw(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0916e]">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? '로그인 중...' : '로그인'}
                </button>
                <button onClick={() => switchTab('reset')} className="w-full text-xs text-[#a0916e] hover:text-white transition-colors py-1">
                  비밀번호를 잊으셨나요?
                </button>
              </div>
            )}

            {/* 회원가입 */}
            {tab === 'signup' && (
              <div className="space-y-3">
                {/* 유저 타입 */}
                <div className="flex gap-2">
                  {(['남자', '여자', '마담'] as UserType[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setUserType(t)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        userType === t
                          ? 'bg-[#d4a017]/20 border-[#d4a017] text-[#d4a017]'
                          : 'border-white/10 text-[#a0916e] hover:border-white/30'
                      }`}
                    >
                      {t === '남자' ? '💎 남자' : t === '여자' ? '🌸 여자' : '👑 마담'}
                    </button>
                  ))}
                </div>

                {/* 아이디 */}
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                    placeholder="아이디"
                    value={signupId}
                    onChange={(e) => { setSignupId(e.target.value); setIdChecked(false); }}
                  />
                  <button
                    onClick={handleCheckId}
                    disabled={loading}
                    className="px-3 py-2 bg-white/5 border border-white/10 hover:border-[#d4a017]/50 text-[#a0916e] hover:text-white text-xs rounded-xl transition-colors whitespace-nowrap"
                  >
                    중복확인
                  </button>
                </div>
                {idChecked && <p className="text-green-400 text-xs">사용 가능한 아이디입니다.</p>}

                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="비밀번호"
                  value={signupPw}
                  onChange={(e) => setSignupPw(e.target.value)}
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="닉네임"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="생년월일 (예: 1995-03-15)"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                />

                {userType === '마담' && (
                  <>
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                      placeholder="전화번호"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                    <input
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                      placeholder="가게명"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                    />
                  </>
                )}

                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button
                  onClick={handleSignup}
                  disabled={loading}
                  className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? '가입 중...' : '회원가입'}
                </button>
              </div>
            )}

            {/* 비밀번호 찾기 */}
            {tab === 'reset' && (
              <div className="space-y-3">
                <p className="text-[#a0916e] text-xs mb-4">닉네임과 생년월일로 비밀번호를 재설정합니다.</p>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="닉네임"
                  value={resetNickname}
                  onChange={(e) => setResetNickname(e.target.value)}
                />
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="생년월일 (예: 1995-03-15)"
                  value={resetBirth}
                  onChange={(e) => setResetBirth(e.target.value)}
                />
                <input
                  type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#a0916e] text-sm focus:outline-none focus:border-[#d4a017]/50"
                  placeholder="새 비밀번호"
                  value={resetPw}
                  onChange={(e) => setResetPw(e.target.value)}
                />
                {error && <p className="text-red-400 text-xs">{error}</p>}
                {resetDone && <p className="text-green-400 text-xs">{resetDone}</p>}
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] disabled:opacity-50 text-black font-semibold rounded-xl transition-colors text-sm"
                >
                  {loading ? '처리 중...' : '비밀번호 변경'}
                </button>
                <button onClick={() => switchTab('login')} className="w-full text-xs text-[#a0916e] hover:text-white transition-colors py-1">
                  로그인으로 돌아가기
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
