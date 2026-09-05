'use client';

import React from 'react';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { UnitData } from './types';

interface UnitBannerProps {
  unit: UnitData;
  unitIndex: number;
  totalUnits: number;
}

const THEME_BANNER_COLORS = {
  emerald: {
    bg: 'bg-[#58CC02] border-[#46A302]',
    progressTrack: 'bg-[#46A302]',
    progressBar: 'bg-white',
    badge: 'bg-[#46A302]/40 text-white',
  },
  blue: {
    bg: 'bg-[#1CB0F6] border-[#1899D6]',
    progressTrack: 'bg-[#1899D6]',
    progressBar: 'bg-white',
    badge: 'bg-[#1899D6]/40 text-white',
  },
  purple: {
    bg: 'bg-[#CE82FF] border-[#B559F0]',
    progressTrack: 'bg-[#B559F0]',
    progressBar: 'bg-white',
    badge: 'bg-[#B559F0]/40 text-white',
  },
  amber: {
    bg: 'bg-[#FF9600] border-[#D97F00]',
    progressTrack: 'bg-[#D97F00]',
    progressBar: 'bg-white',
    badge: 'bg-[#D97F00]/40 text-white',
  },
  rose: {
    bg: 'bg-[#FF4B4B] border-[#D93838]',
    progressTrack: 'bg-[#D93838]',
    progressBar: 'bg-white',
    badge: 'bg-[#D93838]/40 text-white',
  },
};

export default function UnitBanner({ unit, unitIndex, totalUnits }: UnitBannerProps) {
  const theme = THEME_BANNER_COLORS[unit.colorTheme] || THEME_BANNER_COLORS.emerald;
  const progressPercent = unit.totalCount > 0 
    ? Math.round((unit.completedCount / unit.totalCount) * 100) 
    : 0;

  return (
    <div className="w-full max-w-xl mx-auto my-6 px-4">
      <div className={`${theme.bg} border-b-4 text-white rounded-2xl p-5 shadow-md relative overflow-hidden`}>
        {/* Subtle background decorative shapes */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute right-12 -top-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none" />

        <div className="flex items-start justify-between relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                Unit {unitIndex + 1} of {totalUnits}
              </span>
              {progressPercent === 100 && (
                <span className="inline-flex items-center gap-1 bg-amber-300 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> Mastered
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight text-white drop-shadow-sm">
              {unit.title}
            </h2>
            {unit.description && (
              <p className="text-white/90 text-sm font-medium mt-1 line-clamp-2 max-w-md">
                {unit.description}
              </p>
            )}
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white/15 rounded-xl border border-white/20 backdrop-blur-xs">
            <BookOpen className="w-6 h-6 text-white" />
            <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Guide</span>
          </div>
        </div>

        {/* Unit Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-3">
          <div className={`flex-1 h-3 rounded-full overflow-hidden ${theme.progressTrack} p-0.5`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${theme.progressBar}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-black whitespace-nowrap text-white">
            {unit.completedCount}/{unit.totalCount} Lessons ({progressPercent}%)
          </span>
        </div>
      </div>
    </div>
  );
}
