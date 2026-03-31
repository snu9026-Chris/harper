'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Loader2, Clock, MapPin, Calendar, ToggleLeft, ToggleRight, Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/AuthContext';

type Store = '도파민' | '엘리트' | '퍼펙트';

interface GirlStatusUploadProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MyListing {
  id: string;
  date: string;
  store: Store | null;
  available_times: string[];
  is_available: boolean;
}

const STORES: Store[] = ['도파민', '엘리트', '퍼펙트'];

function to24h(hour: string, minute: string, ampm: 'AM' | 'PM'): string {
  let h = parseInt(hour, 10);
  if (ampm === 'AM' && h === 12) h = 0;
  if (ampm === 'PM' && h !== 12) h += 12;
  return `${h.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`;
}

function toDisplay(time24: string): string {
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${ampm} ${h}:${mStr}`;
}

export default function GirlStatusUpload({ isOpen, onClose }: GirlStatusUploadProps) {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];

  // 내 일정 목록
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 폼 상태
  const [editingId, setEditingId] = useState<string | null>(null); // null = 새 등록
  const [isAvailable, setIsAvailable] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedStore, setSelectedStore] = useState<Store | ''>('');
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [hour, setHour] = useState('8');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // 내 일정 불러오기
  const fetchMyListings = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('girl_availability')
      .select('id, date, store, available_times, is_available')
      .eq('user_id', profile.id)
      .order('date', { ascending: true });
    if (data) setMyListings(data as MyListing[]);
  };

  useEffect(() => {
    if (isOpen) fetchMyListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, profile?.id]);

  // 수정 클릭
  const handleEditClick = (row: MyListing) => {
    setEditingId(row.id);
    setSelectedDate(row.date);
    setIsAvailable(row.is_available);
    setSelectedStore(row.store ?? '');
    setSelectedTimes(row.available_times ?? []);
    setHour('8'); setMinute('00'); setAmpm('PM');
    setError('');
    setDone(false);
    setListOpen(false);
  };

  // 삭제
  const handleDelete = async (id: string) => {
    if (!confirm('해당 일정을 삭제할까요?')) return;
    setDeletingId(id);
    await supabase.from('girl_availability').delete().eq('id', id);
    setDeletingId(null);
    setMyListings(prev => prev.filter(r => r.id !== id));
    if (editingId === id) resetForm();
  };

  const addTime = () => {
    const h = parseInt(hour, 10);
    if (isNaN(h) || h < 1 || h > 12) { setError('시간은 1~12 사이로 입력해주세요.'); return; }
    const min = parseInt(minute, 10);
    if (isNaN(min) || min < 0 || min > 59) { setError('분은 0~59 사이로 입력해주세요.'); return; }
    setError('');
    const t24 = to24h(hour, minute.padStart(2, '0'), ampm);
    if (!selectedTimes.includes(t24)) {
      setSelectedTimes(prev => [...prev, t24].sort());
    }
  };

  const removeTime = (t: string) => {
    setSelectedTimes(prev => prev.filter(x => x !== t));
  };

  const handleSubmit = async () => {
    setError('');
    if (!selectedDate) { setError('날짜를 선택해주세요.'); return; }

    setLoading(true);

    if (editingId) {
      // 수정 모드
      const payload: Record<string, unknown> = {
        date: selectedDate,
        is_available: isAvailable,
        available_times: isAvailable ? selectedTimes : [],
        store: isAvailable ? selectedStore || null : null,
        updated_at: new Date().toISOString(),
      };
      if (!isAvailable) {
        // 지명 불가로 수정
      } else {
        if (!selectedStore) { setLoading(false); setError('매장을 선택해주세요.'); return; }
        if (selectedTimes.length === 0) { setLoading(false); setError('만남 가능 시간을 1개 이상 추가해주세요.'); return; }
      }
      const { error: e } = await supabase
        .from('girl_availability')
        .update(payload)
        .eq('id', editingId);
      setLoading(false);
      if (e) { setError('수정에 실패했습니다: ' + e.message); return; }
      await fetchMyListings();
      setDone(true);
    } else {
      // 새 등록 모드
      if (!isAvailable) {
        const { error: e } = await supabase.from('girl_availability').upsert({
          nickname: profile?.nickname, user_id: profile?.id,
          date: selectedDate, is_available: false, store: null,
          available_times: [], updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,date' });
        setLoading(false);
        if (e) { setError('저장에 실패했습니다: ' + e.message); return; }
        await fetchMyListings();
        setDone(true);
        return;
      }
      if (!selectedStore) { setLoading(false); setError('매장을 선택해주세요.'); return; }
      if (selectedTimes.length === 0) { setLoading(false); setError('만남 가능 시간을 1개 이상 추가해주세요.'); return; }
      const { error: e } = await supabase.from('girl_availability').upsert({
        nickname: profile?.nickname, user_id: profile?.id,
        date: selectedDate, is_available: true, store: selectedStore,
        available_times: selectedTimes, updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,date' });
      setLoading(false);
      if (e) { setError('저장에 실패했습니다: ' + e.message); return; }
      await fetchMyListings();
      setDone(true);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setDone(false); setError('');
    setSelectedDate(today); setSelectedStore('');
    setSelectedTimes([]); setIsAvailable(true);
    setHour('8'); setMinute('00'); setAmpm('PM');
  };

  const handleClose = () => {
    resetForm();
    setListOpen(false);
    onClose();
  };

  const formatDate = (d: string) => {
    if (!d) return '';
    return new Date(d + 'T00:00:00').toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#0a1628] border border-[#d4a017]/30 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-[#e8e0d0] font-semibold">🌸 지명가능 상태 업로드</h2>
                <p className="text-[#a0916e] text-xs mt-0.5">{profile?.nickname}님의 지명 일정</p>
              </div>
              <button onClick={handleClose} className="text-[#a0916e] hover:text-[#e8e0d0]">
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-5 max-h-[82vh] overflow-y-auto space-y-5">

              {/* ── 내 등록 일정 접이식 ── */}
              {myListings.length > 0 && (
                <div className="border border-white/10 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setListOpen(o => !o)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
                  >
                    <span className="text-[#e8e0d0] text-sm font-medium">
                      내 등록 일정
                      <span className="ml-2 text-xs text-[#d4a017] bg-[#d4a017]/10 px-2 py-0.5 rounded-full">{myListings.length}</span>
                    </span>
                    {listOpen ? <ChevronUp size={16} className="text-[#a0916e]" /> : <ChevronDown size={16} className="text-[#a0916e]" />}
                  </button>

                  <AnimatePresence>
                    {listOpen && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="divide-y divide-white/5">
                          {myListings.map(row => (
                            <div key={row.id} className={`px-4 py-3 flex items-center gap-3 ${editingId === row.id ? 'bg-[#d4a017]/5 border-l-2 border-[#d4a017]' : ''}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#e8e0d0] text-sm font-medium truncate">{formatDate(row.date)}</p>
                                <p className="text-[#a0916e] text-xs mt-0.5 truncate">
                                  {row.is_available
                                    ? `${row.store ?? ''} · ${(row.available_times ?? []).map(toDisplay).join(', ')}`
                                    : '지명 불가'}
                                </p>
                              </div>
                              <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                  onClick={() => handleEditClick(row)}
                                  className="p-1.5 rounded-lg bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] transition-colors"
                                  title="수정"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => handleDelete(row.id)}
                                  disabled={deletingId === row.id}
                                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"
                                  title="삭제"
                                >
                                  {deletingId === row.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* ── 완료 화면 ── */}
              {done ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                  <CheckCircle className="mx-auto mb-3 text-green-400" size={48} />
                  <p className="text-[#e8e0d0] font-semibold text-lg">{editingId ? '수정 완료!' : '업로드 완료!'}</p>
                  <p className="text-[#a0916e] text-sm mt-1">
                    {formatDate(selectedDate)}
                    {isAvailable
                      ? ` · ${selectedStore} · ${selectedTimes.map(toDisplay).join(', ')}`
                      : ' · 지명 불가'}
                  </p>
                  <div className="flex gap-2 mt-6 justify-center">
                    <button
                      onClick={resetForm}
                      className="px-5 py-2 border border-white/10 text-[#a0916e] hover:text-[#e8e0d0] rounded-xl text-sm transition-colors"
                    >
                      새 일정 추가
                    </button>
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 bg-[#d4a017] hover:bg-[#f0c040] text-black font-semibold rounded-xl text-sm transition-colors"
                    >
                      닫기
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-5">

                  {/* 수정 중 배너 */}
                  {editingId && (
                    <div className="flex items-center justify-between px-3 py-2 bg-[#d4a017]/10 border border-[#d4a017]/30 rounded-lg">
                      <p className="text-[#d4a017] text-xs font-semibold">✏️ 일정 수정 중</p>
                      <button onClick={resetForm} className="text-[#a0916e] hover:text-[#e8e0d0] text-xs underline">
                        취소
                      </button>
                    </div>
                  )}

                  {/* 날짜 선택 */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs text-[#a0916e] mb-2">
                      <Calendar size={12} /> 날짜 선택
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-4 py-3 text-[#e8e0d0] text-sm focus:outline-none focus:border-[#d4a017]/50"
                    />
                    {selectedDate && (
                      <p className="text-[#d4a017] text-xs mt-1.5">{formatDate(selectedDate)}</p>
                    )}
                  </div>

                  {/* 지명 가능 토글 */}
                  <div className="flex items-center justify-between p-4 bg-[#050b1a] rounded-xl border border-white/10">
                    <div>
                      <p className="text-[#e8e0d0] text-sm font-medium">지명 가능 상태</p>
                      <p className="text-[#a0916e] text-xs mt-0.5">
                        {isAvailable ? '현재 지명 가능' : '현재 지명 불가'}
                      </p>
                    </div>
                    <button
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`transition-colors ${isAvailable ? 'text-green-400' : 'text-[#a0916e]'}`}
                    >
                      {isAvailable ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                    </button>
                  </div>

                  {isAvailable && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-5"
                    >
                      {/* 매장 선택 */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-[#a0916e] mb-2">
                          <MapPin size={12} /> 만남 가능 매장
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {STORES.map(s => (
                            <button
                              key={s}
                              onClick={() => setSelectedStore(s)}
                              className={`py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                selectedStore === s
                                  ? 'bg-[#d4a017] border-[#d4a017] text-black'
                                  : 'bg-transparent border-white/10 text-[#a0916e] hover:border-[#d4a017]/50 hover:text-[#e8e0d0]'
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 시간 입력 */}
                      <div>
                        <label className="flex items-center gap-1.5 text-xs text-[#a0916e] mb-2">
                          <Clock size={12} /> 만남 가능 시간 추가
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="flex rounded-lg overflow-hidden border border-white/10 flex-shrink-0">
                            {(['AM', 'PM'] as const).map(p => (
                              <button
                                key={p}
                                onClick={() => setAmpm(p)}
                                className={`px-3 py-2.5 text-xs font-semibold transition-colors ${
                                  ampm === p
                                    ? 'bg-[#d4a017] text-black'
                                    : 'bg-[#050b1a] text-[#a0916e] hover:text-[#e8e0d0]'
                                }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                          <input
                            type="number" min={1} max={12} value={hour}
                            onChange={e => setHour(e.target.value)}
                            placeholder="시"
                            className="w-16 bg-[#050b1a] border border-white/10 rounded-lg px-3 py-2.5 text-[#e8e0d0] text-sm text-center focus:outline-none focus:border-[#d4a017]/50"
                          />
                          <span className="text-[#a0916e] font-bold">:</span>
                          <input
                            type="number" min={0} max={59} value={minute}
                            onChange={e => setMinute(e.target.value.padStart(2, '0'))}
                            placeholder="분"
                            className="w-16 bg-[#050b1a] border border-white/10 rounded-lg px-3 py-2.5 text-[#e8e0d0] text-sm text-center focus:outline-none focus:border-[#d4a017]/50"
                          />
                          <button
                            onClick={addTime}
                            className="flex-1 py-2.5 flex items-center justify-center gap-1.5 bg-[#d4a017]/10 hover:bg-[#d4a017]/20 border border-[#d4a017]/30 text-[#d4a017] rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Plus size={13} />
                            추가
                          </button>
                        </div>
                        {selectedTimes.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {selectedTimes.map(t => (
                              <button
                                key={t}
                                onClick={() => removeTime(t)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#d4a017]/15 border border-[#d4a017]/30 text-[#d4a017] text-xs font-medium hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-400 transition-all group"
                              >
                                {toDisplay(t)}
                                <X size={10} className="opacity-50 group-hover:opacity-100" />
                              </button>
                            ))}
                          </div>
                        )}
                        {selectedTimes.length === 0 && (
                          <p className="text-[#a0916e]/50 text-xs mt-2">시간을 입력하고 추가 버튼을 눌러주세요</p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {error && <p className="text-red-400 text-xs">{error}</p>}

                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full py-3 bg-[#d4a017] hover:bg-[#f0c040] text-black font-semibold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    {editingId
                      ? '일정 수정 완료'
                      : isAvailable ? '지명가능 상태 업로드' : '지명 불가로 설정'}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
