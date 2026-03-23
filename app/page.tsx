import { getMockGirlsByStore } from '@/lib/mockData';
import StoreSection from './components/StoreSection';
import DatePickerFlow from './components/DatePickerFlow';
import VisitFeed from './components/VisitFeed';

export default function HomePage() {
  // Use mock data — swap with Supabase queries when DB is connected
  const allGirls = getMockGirlsByStore();

  return (
    <main className="min-h-screen bg-[#050b1a]">
      {/* Hero / Header */}
      <header className="relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full bg-[#d4a017]/5 blur-[120px]" />
          <div className="absolute bottom-[-30%] right-[-10%] w-[50%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 pt-16 pb-12">
          {/* Logo / brand */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/30 flex items-center justify-center">
                <span className="text-[#d4a017] font-bold text-lg">H</span>
              </div>
              <div>
                <p className="text-white font-bold text-lg tracking-wider">HARPER</p>
                <p className="text-[#e8e0d0]/30 text-xs tracking-widest">PREMIUM RESERVATION</p>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-6 text-sm text-[#e8e0d0]/50">
              <a href="#today" className="hover:text-[#d4a017] transition-colors">이번달 인기</a>
              <a href="#booking" className="hover:text-[#d4a017] transition-colors">날짜별 예약</a>
              <a href="#feed" className="hover:text-[#d4a017] transition-colors">역초이스</a>
              <button className="px-4 py-2 rounded-full bg-[#d4a017] text-[#050b1a] font-medium hover:bg-[#f0c040] transition-colors text-sm">
                문의하기
              </button>
            </nav>
          </div>

          {/* Hero text */}
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#d4a017]/10 border border-[#d4a017]/20 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4a017] animate-pulse" />
              <span className="text-[#d4a017] text-xs font-medium tracking-wide">실시간 예약 가능</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
              프리미엄{' '}
              <span className="gold-shimmer">지명 예약</span>
            </h1>
            <p className="text-[#e8e0d0]/50 text-lg sm:text-xl mb-8">
              도파민 · 엘리트 · 퍼펙트
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> — </span>
              세 매장의 최고 서비스를 경험하세요
            </p>

            {/* Quick stats */}
            <div className="flex justify-center gap-8 text-center">
              {[
                { label: '등록 직원', value: `${allGirls.length}명` },
                { label: '예약가능', value: `${allGirls.filter(g => g.is_available).length}명` },
                { label: '운영 매장', value: '3곳' },
              ].map(stat => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-[#d4a017]">{stat.value}</p>
                  <p className="text-[#e8e0d0]/40 text-xs mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4a017]/20 to-transparent" />
      </header>

      {/* Feature 1: Today's available staff */}
      <div id="today">
        <StoreSection girls={allGirls} />
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4a017]/20 to-transparent" />
      </div>

      {/* Feature 2: Date picker flow */}
      <div id="booking">
        <DatePickerFlow />
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-[#d4a017]/20 to-transparent" />
      </div>

      {/* Feature 3: Club Visit Feed */}
      <div id="feed">
        <VisitFeed />
      </div>

      {/* Footer */}
      <footer className="border-t border-[#d4a017]/10 py-8 px-4 text-center">
        <p className="text-[#e8e0d0]/20 text-sm">
          © 2025 Harper Premium. All rights reserved.
        </p>
        <div className="flex justify-center gap-4 mt-3 text-xs text-[#e8e0d0]/20">
          <span>도파민</span>
          <span>·</span>
          <span>엘리트</span>
          <span>·</span>
          <span>퍼펙트</span>
        </div>
      </footer>
    </main>
  );
}
