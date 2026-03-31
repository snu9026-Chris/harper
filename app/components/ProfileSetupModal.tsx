'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, CheckCircle, Loader2, Camera, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';


interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GIRL_TRAITS = ['사이즈', '마인드', '글래머', '슬래머', '마른', '섹시한', '귀여운'];
const BOY_TRAITS = ['후한팁', '매너', '로맨스', '애주가', '알쓰'];

export default function ProfileSetupModal({ isOpen, onClose }: ProfileSetupModalProps) {
  const { profile, updateProfile, user } = useAuth();
  const isMadame = profile?.user_type === '마담';
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: 사진 (남자/여자) 또는 명함 (마담)
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [animeUrl, setAnimeUrl] = useState<string | null>(null);
  const [photoMode, setPhotoMode] = useState<'ai' | 'original'>('ai'); // 사진 선택 모드
  const [converting, setConverting] = useState(false);
  const [convertError, setConvertError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 마담: 명함 업로드
  const [cardUploading, setCardUploading] = useState(false);
  const [cardError, setCardError] = useState('');
  const cardInputRef = useRef<HTMLInputElement>(null);

  // Step 2: 특징 & 신체 정보
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [chestSize, setChestSize] = useState('');
  const [managerNumber, setManagerNumber] = useState('');
  const [realName, setRealName] = useState('');
  const [madameName, setMadameName] = useState(profile?.madame_name ?? '');

  // 완료
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const traitList = profile?.user_type === '여자' ? GIRL_TRAITS : BOY_TRAITS;

  const handleFileChange = useCallback((f: File) => {
    setFile(f);
    setLocalPreview(URL.createObjectURL(f));
    setAnimeUrl(null);
    setConvertError('');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFileChange(f);
  }, [handleFileChange]);

  const handleConvert = async (mode: 'ai' | 'original' = 'ai') => {
    if (!file || !user) return;
    setConverting(true);
    setConvertError('');
    setPhotoMode(mode);

    try {
      const form = new FormData();
      form.append('image', file, file.name);
      form.append('mode', mode);

      const { data: { session } } = await supabase.auth.getSession();
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;

      const res = await fetch(`${functionsUrl}/convert-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
        body: form,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `오류 (${res.status})`);
      if (!json.avatarUrl) throw new Error('이미지 URL을 받지 못했습니다.');

      setAnimeUrl(json.avatarUrl);
    } catch (err: any) {
      setConvertError(err.message || '변환 중 오류가 발생했습니다.');
    } finally {
      setConverting(false);
    }
  };

  const toggleTrait = (t: string) => {
    setSelectedTraits(prev =>
      prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
    );
  };

  // 마담 명함 업로드
  const handleCardUpload = async (f: File) => {
    setCardUploading(true);
    setCardError('');
    setFile(f);
    setLocalPreview(URL.createObjectURL(f));
    try {
      const form = new FormData();
      form.append('image', f, f.name);
      const { data: { session } } = await supabase.auth.getSession();
      const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
      const res = await fetch(`${functionsUrl}/upload-business-card`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token ?? ''}` },
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `오류 (${res.status})`);
      // 로컬 profile 상태 업데이트
      await updateProfile({ business_card_url: json.cardUrl });
      setDone(true);
    } catch (err: unknown) {
      setCardError(err instanceof Error ? err.message : '업로드 오류');
    } finally {
      setCardUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const updates: Parameters<typeof updateProfile>[0] = {};
    // 캐시버스팅 파라미터(?t=...) 제거 후 저장
    if (animeUrl) updates.avatar_url = animeUrl.split('?')[0];
    if (selectedTraits.length > 0) updates.traits = selectedTraits;
    if (profile?.user_type === '여자') {
      if (height) updates.height = parseInt(height);
      if (weight) updates.weight = parseInt(weight);
      if (chestSize) updates.chest_size = chestSize;
      if (managerNumber) updates.manager_number = managerNumber;
      if (realName) updates.real_name = realName;
      if (madameName.trim()) updates.madame_name = madameName.trim();
    }

    const { error } = await updateProfile(updates);
    setSaving(false);
    if (error) return;
    setDone(true);
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setLocalPreview(null);
    setAnimeUrl(null);
    setConvertError('');
    setSelectedTraits([]);
    setHeight('');
    setWeight('');
    setChestSize('');
    setManagerNumber('');
    setRealName('');
    setDone(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-md bg-[#0a1628] border border-[#d4a017]/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
              <div>
                <p className="text-[#e8e0d0] font-bold">프로필 작성하기</p>
                <p className="text-[#a0916e] text-xs mt-0.5">
                  {isMadame
                    ? (done ? '완료' : '명함 업로드')
                    : (step === 1 ? '1단계 · 프로필 사진' : step === 2 ? '2단계 · 나의 특징' : '완료')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* 스텝 인디케이터 */}
                <div className="flex gap-1.5">
                  {(isMadame ? [1] : [1, 2]).map(s => (
                    <div
                      key={s}
                      className={`h-1.5 rounded-full transition-all ${
                        step >= s ? 'bg-[#d4a017] w-6' : 'bg-white/10 w-3'
                      }`}
                    />
                  ))}
                </div>
                <button onClick={handleClose} className="text-[#a0916e] hover:text-[#e8e0d0] transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* ── 마담 전용: 명함 업로드 ── */}
                {isMadame && !done && (
                  <motion.div key="madame-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                    <p className="text-[#e8e0d0] font-semibold mb-1">가게 명함 업로드</p>
                    <p className="text-[#a0916e] text-xs mb-4">
                      관리자 검토를 위해 근무 가게 명함을 업로드해 주세요
                    </p>

                    {!localPreview ? (
                      <div
                        onClick={() => cardInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d4a017]/30 hover:border-[#d4a017]/60 rounded-xl p-10 text-center cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#d4a017]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a017]/20 transition-colors">
                          <Camera size={24} className="text-[#d4a017]" />
                        </div>
                        <p className="text-[#e8e0d0] text-sm font-medium mb-1">명함 사진 업로드</p>
                        <p className="text-[#a0916e] text-xs">JPG, PNG · 클릭하여 선택</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#d4a017]/30">
                          <Image src={localPreview} alt="명함 미리보기" fill className="object-contain bg-[#050b1a]" />
                        </div>
                        {cardUploading && (
                          <div className="flex items-center justify-center gap-2 text-[#a0916e] text-sm">
                            <Loader2 size={16} className="animate-spin text-[#d4a017]" />
                            업로드 중...
                          </div>
                        )}
                        {cardError && <p className="text-red-400 text-xs text-center">{cardError}</p>}
                        {!cardUploading && !cardError && (
                          <p className="text-green-400 text-xs text-center">✓ 업로드 완료</p>
                        )}
                        <button
                          onClick={() => { setLocalPreview(null); setFile(null); setCardError(''); }}
                          className="w-full py-2 text-sm border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw size={14} /> 다시 선택
                        </button>
                      </div>
                    )}

                    <input
                      ref={cardInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleCardUpload(f); }}
                    />

                    <div className="mt-5">
                      <button onClick={handleClose} className="w-full py-3 border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl text-sm transition-colors">
                        나중에 하기
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 1: 사진 (남자/여자) ── */}
                {!isMadame && step === 1 && !done && (
                  <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[#e8e0d0] font-semibold">프로필 사진</p>
                      {profile?.avatar_url && (
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${
                          (profile.avatar_change_count ?? 0) >= 2
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-[#d4a017]/10 text-[#d4a017] border-[#d4a017]/20'
                        }`}>
                          변경 {profile.avatar_change_count ?? 0}/2회
                        </span>
                      )}
                    </div>
                    <div className="bg-[#050b1a] border border-white/8 rounded-xl px-4 py-3 mb-4 space-y-1.5">
                      <p className="text-[#a0916e] text-xs leading-relaxed">
                        사진을 올리면 <span className="text-[#d4a017] font-semibold">나노 바나나 AI</span>가
                        이목구비를 반영한 애니메이션 프로필로 변환해드려요.
                      </p>
                      <p className="text-[#a0916e]/70 text-xs leading-relaxed">
                        🔒 개인 정보 보호를 위해 AI 변환 후 <span className="text-white/50">원본 사진은 서버에 저장되지 않습니다.</span>
                      </p>
                      <p className="text-[#a0916e]/60 text-xs leading-relaxed">
                        ⚠️ 원본 사진을 그대로 사용할 경우, <span className="text-amber-400/80">AI 합성 사진 사용을 권장</span>합니다.
                      </p>
                    </div>

                    {/* 변경 횟수 소진 */}
                    {(profile?.avatar_change_count ?? 0) >= 2 ? (
                      <div className="border border-red-500/20 rounded-xl p-6 text-center bg-red-500/5">
                        <p className="text-red-400 text-sm font-semibold mb-1">사진 변경 횟수를 모두 사용했습니다</p>
                        <p className="text-[#a0916e] text-xs">프로필 사진은 최대 2번까지만 변경할 수 있어요</p>
                      </div>
                    ) : !localPreview ? (
                      <div
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d4a017]/30 hover:border-[#d4a017]/60 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#d4a017]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#d4a017]/20 transition-colors">
                          <Camera size={24} className="text-[#d4a017]" />
                        </div>
                        <p className="text-[#e8e0d0] text-sm font-medium mb-1">사진 업로드</p>
                        <p className="text-[#a0916e] text-xs">클릭하거나 드래그해서 업로드</p>
                        <p className="text-[#a0916e]/60 text-xs mt-1">JPG, PNG, WEBP · 최대 10MB</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* 미리보기 비교 */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* 원본 */}
                          <div className="text-center">
                            <p className="text-[#a0916e] text-xs mb-2">원본 사진</p>
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-white/10">
                              <Image src={localPreview} alt="원본" fill className="object-cover" />
                            </div>
                          </div>

                          {/* 변환 결과 */}
                          <div className="text-center">
                            <p className="text-[#a0916e] text-xs mb-2">애니메이션 변환</p>
                            <div className="relative aspect-square rounded-xl overflow-hidden border border-[#d4a017]/30 bg-[#050b1a] flex items-center justify-center">
                              {converting ? (
                                <div className="text-center">
                                  <Loader2 size={24} className="text-[#d4a017] animate-spin mx-auto mb-1" />
                                  <p className="text-[#a0916e] text-xs">AI 변환 중...</p>
                                </div>
                              ) : animeUrl ? (
                                <Image src={animeUrl} alt="애니" fill className="object-cover" />
                              ) : (
                                <div className="text-center px-2">
                                  <Sparkles size={20} className="text-[#d4a017]/40 mx-auto mb-1" />
                                  <p className="text-[#a0916e]/60 text-xs">변환 대기</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {convertError && (
                          <p className="text-red-400 text-xs text-center">{convertError}</p>
                        )}

                        {/* 버튼들 */}
                        <div className="space-y-2">
                          {/* 사진 재선택 */}
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full py-2.5 text-sm border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                          >
                            <RefreshCw size={14} />
                            사진 다시 선택
                          </button>
                          {/* AI 변환 버튼 */}
                          <button
                            onClick={() => handleConvert('ai')}
                            disabled={converting}
                            className={`w-full py-2.5 text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 font-semibold ${
                              animeUrl && photoMode === 'ai'
                                ? 'border border-[#d4a017]/40 text-[#d4a017] hover:bg-[#d4a017]/10'
                                : 'bg-[#d4a017] hover:bg-[#f0c040] text-black'
                            }`}
                          >
                            {converting && photoMode === 'ai' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                            {converting && photoMode === 'ai' ? 'AI 변환 중...' : animeUrl && photoMode === 'ai' ? 'AI 재변환' : '✨ 나노 바나나 AI 변환 (권장)'}
                          </button>
                          {/* 원본 사용 버튼 */}
                          <button
                            onClick={() => handleConvert('original')}
                            disabled={converting}
                            className={`w-full py-2.5 text-sm rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5 ${
                              animeUrl && photoMode === 'original'
                                ? 'bg-white/10 text-[#e8e0d0] border border-white/20'
                                : 'border border-white/15 text-[#a0916e] hover:text-[#e8e0d0] hover:border-white/30'
                            }`}
                          >
                            {converting && photoMode === 'original' ? <Loader2 size={14} className="animate-spin" /> : null}
                            {converting && photoMode === 'original' ? '업로드 중...' : animeUrl && photoMode === 'original' ? '✓ 원본 사진 사용 중' : '원본 사진 그대로 사용'}
                          </button>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
                    />

                    <div className="mt-5 flex gap-2">
                      <button
                        onClick={handleClose}
                        className="flex-1 py-3 border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl text-sm transition-colors"
                      >
                        나중에 하기
                      </button>
                      <button
                        onClick={() => setStep(2)}
                        className="flex-1 py-3 bg-[#d4a017] hover:bg-[#f0c040] text-black font-semibold rounded-xl text-sm transition-colors"
                      >
                        다음 →
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 2: 특징 ── */}
                {!isMadame && step === 2 && !done && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                    <p className="text-[#e8e0d0] font-semibold mb-1">나의 특징</p>
                    <p className="text-[#a0916e] text-xs mb-5">
                      해당하는 특징을 모두 선택해주세요 (중복 선택 가능)
                    </p>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {traitList.map(trait => (
                        <button
                          key={trait}
                          onClick={() => toggleTrait(trait)}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                            selectedTraits.includes(trait)
                              ? 'bg-[#d4a017] border-[#d4a017] text-black'
                              : 'bg-transparent border-white/10 text-[#a0916e] hover:border-[#d4a017]/50 hover:text-[#e8e0d0]'
                          }`}
                        >
                          {trait}
                        </button>
                      ))}
                    </div>

                    {selectedTraits.length > 0 && (
                      <div className="bg-[#d4a017]/5 border border-[#d4a017]/15 rounded-xl px-4 py-3 mb-5">
                        <p className="text-[#a0916e] text-xs mb-1.5">선택된 특징</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedTraits.map(t => (
                            <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/30">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 신체 정보 (여자만) */}
                    {profile?.user_type === '여자' && (
                      <div className="space-y-4 mb-5">
                        <p className="text-[#e8e0d0] font-semibold text-sm">신체 정보</p>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-xs text-[#a0916e] mb-1 block">키 (cm)</label>
                            <input
                              type="number"
                              value={height}
                              onChange={e => setHeight(e.target.value)}
                              placeholder="예) 162"
                              min={140} max={190}
                              className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50 placeholder:text-white/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#a0916e] mb-1 block">몸무게 (kg)</label>
                            <input
                              type="number"
                              value={weight}
                              onChange={e => setWeight(e.target.value)}
                              placeholder="예) 50"
                              min={35} max={100}
                              className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50 placeholder:text-white/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#a0916e] mb-1 block">가슴 사이즈</label>
                            <select
                              value={chestSize}
                              onChange={e => setChestSize(e.target.value)}
                              className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50"
                            >
                              <option value="">선택</option>
                              {['A', 'B', 'C', 'D', 'E', 'F'].map(c => (
                                <option key={c} value={c}>{c}컵</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* 담당 번호 & 이름 */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-[#a0916e] mb-1 block">담당 번호</label>
                            <input
                              type="text"
                              value={managerNumber}
                              onChange={e => setManagerNumber(e.target.value)}
                              placeholder="예) 010-0000-0000"
                              className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50 placeholder:text-white/20"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-[#a0916e] mb-1 block">가게예명</label>
                            <input
                              type="text"
                              value={realName}
                              onChange={e => setRealName(e.target.value)}
                              placeholder="가게에서 쓰는 이름"
                              className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50 placeholder:text-white/20"
                            />
                          </div>
                        </div>

                        {/* 마담 이름 */}
                        <div>
                          <label className="text-xs text-[#a0916e] mb-1 block">마담 이름 <span className="text-white/30">(선택 · 나중에 변경 가능)</span></label>
                          <input
                            type="text"
                            value={madameName}
                            onChange={e => setMadameName(e.target.value)}
                            placeholder="담당 마담 이름 입력"
                            className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50 placeholder:text-white/20"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl text-sm transition-colors"
                      >
                        ← 이전
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 bg-[#d4a017] hover:bg-[#f0c040] text-black font-semibold rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {saving && <Loader2 size={14} className="animate-spin" />}
                        저장하기
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ── 완료 ── */}
                {done && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                    <div className="w-16 h-16 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/30 flex items-center justify-center mx-auto mb-4">
                      {animeUrl ? (
                        <Image src={animeUrl} alt="avatar" width={64} height={64} className="rounded-full object-cover" />
                      ) : (
                        <CheckCircle className="text-[#d4a017]" size={32} />
                      )}
                    </div>
                    <p className="text-[#e8e0d0] font-bold text-xl mb-1">프로필 완성!</p>
                    <p className="text-[#a0916e] text-sm mb-6">나만의 프로필이 저장되었어요</p>
                    <button
                      onClick={handleClose}
                      className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] text-black font-bold rounded-xl transition-colors"
                    >
                      확인
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
