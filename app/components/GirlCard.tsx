'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { GirlWithSchedule } from '@/lib/types';

interface GirlCardProps {
  girl: GirlWithSchedule;
  showStatus?: boolean;
}

export default function GirlCard({ girl, showStatus = false }: GirlCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group relative rounded-xl overflow-hidden bg-[#0a1628] border border-[#d4a017]/20 hover:border-[#d4a017]/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,160,23,0.15)] cursor-pointer">
      {/* Photo */}
      <div className="relative h-56 sm:h-64 w-full overflow-hidden">
        {!imgError ? (
          <Image
            src={girl.photo_url}
            alt={girl.name}
            fill
            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f2040] to-[#162b55] flex items-center justify-center">
            <span className="text-4xl text-[#d4a017]/40">✦</span>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1a] via-[#050b1a]/30 to-transparent" />

        {/* Store badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[#d4a017]/20 text-[#f0c040] border border-[#d4a017]/30 backdrop-blur-sm">
            {girl.store}
          </span>
        </div>

        {/* Availability badge */}
        {showStatus && (
          <div className="absolute top-3 right-3">
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm border ${
                girl.is_available
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border-red-500/30'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${girl.is_available ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {girl.is_available ? '예약가능' : '마감'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-1">
          <h3 className="text-lg font-semibold text-white">{girl.name}</h3>
          <span className="text-sm text-[#d4a017]">{girl.age}세</span>
        </div>

        {/* Stats row */}
        {girl.stats && (
          <div className="flex gap-2 flex-wrap mb-2">
            {girl.stats.height && (
              <span className="text-xs text-[#e8e0d0]/50">{girl.stats.height}cm</span>
            )}
            {girl.stats.weight && (
              <span className="text-xs text-[#e8e0d0]/50">·</span>
            )}
            {girl.stats.weight && (
              <span className="text-xs text-[#e8e0d0]/50">{girl.stats.weight}kg</span>
            )}
            {girl.stats.bust && (
              <>
                <span className="text-xs text-[#e8e0d0]/50">·</span>
                <span className="text-xs text-[#e8e0d0]/50">{girl.stats.bust}컵</span>
              </>
            )}
            {girl.stats.specialty && (
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-[#d4a017]/10 text-[#d4a017] border border-[#d4a017]/20">
                {girl.stats.specialty}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-[#e8e0d0]/40 line-clamp-2">{girl.intro}</p>

        {/* CTA */}
        <button className="mt-3 w-full py-2 rounded-lg text-sm font-medium bg-[#d4a017]/10 hover:bg-[#d4a017]/20 text-[#d4a017] border border-[#d4a017]/20 hover:border-[#d4a017]/50 transition-all duration-200">
          지명 예약
        </button>
      </div>
    </div>
  );
}
