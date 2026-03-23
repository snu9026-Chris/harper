'use client';

import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'date-fns/locale';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Calendar, Store, Users } from 'lucide-react';
import GirlCard from './GirlCard';
import { getMockAvailableGirls } from '@/lib/mockData';
import type { GirlWithSchedule, Store as StoreType } from '@/lib/types';

import 'react-day-picker/dist/style.css';

type Step = 1 | 2 | 3;

const STORES: { id: StoreType; label: string; desc: string; color: string }[] = [
  { id: '도파민', label: '도파민', desc: 'Dopamine — 활기차고 생동감 넘치는 서비스', color: 'from-purple-600/20 to-purple-900/10 border-purple-500/30' },
  { id: '엘리트', label: '엘리트', desc: 'Elite — 품격 있는 프리미엄 케어', color: 'from-blue-600/20 to-blue-900/10 border-blue-500/30' },
  { id: '퍼펙트', label: '퍼펙트', desc: 'Perfect — 완벽한 힐링 경험', color: 'from-rose-600/20 to-rose-900/10 border-rose-500/30' },
];

const STEP_ICONS = [Calendar, Store, Users];
const STEP_LABELS = ['날짜 선택', '매장 선택', '직원 선택'];

function StepIndicator({ step, current }: { step: number; current: Step }) {
  const Icon = STEP_ICONS[step - 1];
  const done = current > step;
  const active = current === step;
  return (
    <div className="flex items-center">
      <div
        className={`flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 ${
          done
            ? 'bg-[#d4a017] text-[#050b1a]'
            : active
            ? 'bg-[#d4a017]/20 text-[#d4a017] border-2 border-[#d4a017]'
            : 'bg-[#0a1628] text-[#e8e0d0]/30 border border-[#e8e0d0]/10'
        }`}
      >
        {done ? <span className="text-xs font-bold">✓</span> : <Icon size={16} />}
      </div>
      <span
        className={`ml-2 text-sm font-medium hidden sm:block transition-colors duration-300 ${
          active ? 'text-[#d4a017]' : done ? 'text-[#e8e0d0]/60' : 'text-[#e8e0d0]/30'
        }`}
      >
        {STEP_LABELS[step - 1]}
      </span>
    </div>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: -dir * 40, opacity: 0 }),
};

export default function DatePickerFlow() {
  const [step, setStep] = useState<Step>(1);
  const [direction, setDirection] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStore, setSelectedStore] = useState<StoreType | undefined>();
  const [results, setResults] = useState<GirlWithSchedule[]>([]);

  const today = new Date();

  function goTo(next: Step) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    if (date) setTimeout(() => goTo(2), 300);
  }

  function handleStoreSelect(store: StoreType) {
    setSelectedStore(store);
    const dateStr = format(selectedDate!, 'yyyy-MM-dd');
    const data = getMockAvailableGirls(dateStr, store);
    setResults(data);
    setTimeout(() => goTo(3), 200);
  }

  function reset() {
    setStep(1);
    setDirection(-1);
    setSelectedDate(undefined);
    setSelectedStore(undefined);
    setResults([]);
  }

  const available = results.filter(g => g.is_available);
  const unavailable = results.filter(g => !g.is_available);
  const sorted = [...available, ...unavailable];

  return (
    <section className="py-12 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <p className="text-[#d4a017] text-sm font-medium tracking-widest uppercase mb-2">Reservation Flow</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">날짜별 예약 조회</h2>
        <p className="text-[#e8e0d0]/40 text-sm">날짜 → 매장 → 직원 순서로 선택하세요</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center">
            <StepIndicator step={s} current={step} />
            {s < 3 && (
              <ChevronRight size={16} className={`mx-2 sm:mx-3 ${step > s ? 'text-[#d4a017]' : 'text-[#e8e0d0]/20'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="overflow-hidden">
        <AnimatePresence custom={direction} mode="wait">
          {/* Step 1: Date picker */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <div className="flex flex-col items-center">
                <div className="bg-[#0a1628] border border-[#d4a017]/20 rounded-2xl p-6 sm:p-8 inline-block">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    locale={ko}
                    fromDate={today}
                    className="!font-sans"
                    classNames={{
                      months: 'flex gap-4',
                      caption: 'flex items-center justify-between mb-4 px-1',
                      caption_label: 'text-white font-semibold text-base',
                      nav: 'flex items-center gap-1',
                      nav_button: 'w-8 h-8 rounded-lg bg-[#162b55] hover:bg-[#d4a017]/20 text-[#e8e0d0] flex items-center justify-center transition-colors',
                      nav_button_previous: '',
                      nav_button_next: '',
                      table: 'w-full border-collapse',
                      head_row: 'flex',
                      head_cell: 'text-[#e8e0d0]/40 text-xs w-9 text-center pb-2',
                      row: 'flex w-full mt-1',
                      cell: 'h-9 w-9 text-center text-sm relative',
                      day: 'h-9 w-9 rounded-lg hover:bg-[#d4a017]/20 hover:text-[#d4a017] transition-colors font-medium',
                      day_selected: '!bg-[#d4a017] !text-[#050b1a] font-bold',
                      day_today: 'text-[#f0c040] border border-[#d4a017]/40',
                      day_disabled: 'text-[#e8e0d0]/20 cursor-not-allowed',
                      day_outside: 'text-[#e8e0d0]/20',
                    }}
                  />
                </div>
                <p className="mt-4 text-[#e8e0d0]/40 text-sm">원하시는 날짜를 선택해주세요</p>
              </div>
            </motion.div>
          )}

          {/* Step 2: Store selector */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              <div className="max-w-lg mx-auto">
                <div className="mb-4 text-center">
                  <span className="text-[#d4a017] font-semibold">
                    {selectedDate && format(selectedDate, 'yyyy년 MM월 dd일 (EEEE)', { locale: ko })}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {STORES.map((store, i) => (
                    <motion.button
                      key={store.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      onClick={() => handleStoreSelect(store.id)}
                      className={`w-full p-5 rounded-xl border bg-gradient-to-r ${store.color} text-left hover:scale-[1.01] active:scale-[0.99] transition-all duration-200`}
                    >
                      <p className="text-white font-semibold text-lg">{store.label}</p>
                      <p className="text-[#e8e0d0]/50 text-sm mt-0.5">{store.desc}</p>
                    </motion.button>
                  ))}
                </div>
                <button
                  onClick={() => goTo(1)}
                  className="mt-4 text-[#e8e0d0]/40 hover:text-[#e8e0d0]/70 text-sm flex items-center gap-1 mx-auto transition-colors"
                >
                  ← 날짜 다시 선택
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: 'easeInOut' }}
            >
              {/* Summary bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-[#0a1628] border border-[#d4a017]/20">
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="text-[#d4a017] font-medium">
                    📅 {selectedDate && format(selectedDate, 'MM/dd (EEEE)', { locale: ko })}
                  </span>
                  <span className="text-[#e8e0d0]/40">|</span>
                  <span className="text-white font-medium">🏠 {selectedStore}</span>
                  <span className="text-[#e8e0d0]/40">|</span>
                  <span className="text-emerald-400">예약가능 {available.length}명</span>
                </div>
                <button
                  onClick={reset}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#d4a017]/30 text-[#d4a017] hover:bg-[#d4a017]/10 transition-colors"
                >
                  처음으로
                </button>
              </div>

              {sorted.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                  {sorted.map((girl, i) => (
                    <motion.div
                      key={girl.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.3 }}
                      className={girl.is_available ? '' : 'opacity-50'}
                    >
                      <GirlCard girl={girl} showStatus />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-[#e8e0d0]/30">
                  <p className="text-4xl mb-3">✦</p>
                  <p>해당 날짜에 예약 가능한 직원이 없습니다</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
