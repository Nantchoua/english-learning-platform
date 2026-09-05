'use client';

import React from 'react';
import Link from 'next/link';
import { Check, Lock, Play, BookOpen, Mic, HelpCircle, Trophy, Sparkles, Star } from 'lucide-react';
import { LessonNodeData } from './types';

interface PathNodeProps {
  lesson: LessonNodeData;
  offsetPercentage: number; // e.g. -45, 0, 45
  unitTheme: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  isLastInUnit?: boolean;
  onSelectNode: (lesson: LessonNodeData) => void;
  isSelected: boolean;
}

const THEME_STYLES = {
  emerald: {
    completedBg: 'bg-[#58CC02] border-[#46A302] text-white shadow-[0_6px_0_#46A302]',
    completedRing: 'ring-[#58CC02]/30',
    currentBg: 'bg-[#FFC800] border-[#E5B300] text-amber-950 shadow-[0_6px_0_#CC9E00]',
    currentPulse: 'ring-[#FFC800]/50 animate-pulse',
    activeGlow: 'from-amber-400 to-amber-500',
    bannerBadge: 'bg-[#58CC02]',
  },
  blue: {
    completedBg: 'bg-[#1CB0F6] border-[#1899D6] text-white shadow-[0_6px_0_#1899D6]',
    completedRing: 'ring-[#1CB0F6]/30',
    currentBg: 'bg-[#FFC800] border-[#E5B300] text-amber-950 shadow-[0_6px_0_#CC9E00]',
    currentPulse: 'ring-[#FFC800]/50 animate-pulse',
    activeGlow: 'from-amber-400 to-amber-500',
    bannerBadge: 'bg-[#1CB0F6]',
  },
  purple: {
    completedBg: 'bg-[#CE82FF] border-[#B559F0] text-white shadow-[0_6px_0_#B559F0]',
    completedRing: 'ring-[#CE82FF]/30',
    currentBg: 'bg-[#FFC800] border-[#E5B300] text-amber-950 shadow-[0_6px_0_#CC9E00]',
    currentPulse: 'ring-[#FFC800]/50 animate-pulse',
    activeGlow: 'from-amber-400 to-amber-500',
    bannerBadge: 'bg-[#CE82FF]',
  },
  amber: {
    completedBg: 'bg-[#FF9600] border-[#D97F00] text-white shadow-[0_6px_0_#D97F00]',
    completedRing: 'ring-[#FF9600]/30',
    currentBg: 'bg-[#FFC800] border-[#E5B300] text-amber-950 shadow-[0_6px_0_#CC9E00]',
    currentPulse: 'ring-[#FFC800]/50 animate-pulse',
    activeGlow: 'from-amber-400 to-amber-500',
    bannerBadge: 'bg-[#FF9600]',
  },
  rose: {
    completedBg: 'bg-[#FF4B4B] border-[#D93838] text-white shadow-[0_6px_0_#D93838]',
    completedRing: 'ring-[#FF4B4B]/30',
    currentBg: 'bg-[#FFC800] border-[#E5B300] text-amber-950 shadow-[0_6px_0_#CC9E00]',
    currentPulse: 'ring-[#FFC800]/50 animate-pulse',
    activeGlow: 'from-amber-400 to-amber-500',
    bannerBadge: 'bg-[#FF4B4B]',
  },
};

export default function PathNode({
  lesson,
  offsetPercentage,
  unitTheme,
  isLastInUnit,
  onSelectNode,
  isSelected,
}: PathNodeProps) {
  const theme = THEME_STYLES[unitTheme] || THEME_STYLES.emerald;
  const isCompleted = lesson.status === 'COMPLETED';
  const isCurrent = lesson.status === 'CURRENT';
  const isLocked = lesson.status === 'LOCKED';

  const getNodeIcon = () => {
    if (isCompleted) {
      return <Check className="w-8 h-8 stroke-[3.5]" />;
    }
    if (isCurrent) {
      if (lesson.type === 'SPEAKING') return <Mic className="w-8 h-8 stroke-[3]" />;
      if (lesson.type === 'QUIZ') return <HelpCircle className="w-8 h-8 stroke-[3]" />;
      if (isLastInUnit) return <Trophy className="w-8 h-8 stroke-[3]" />;
      return <Star className="w-8 h-8 fill-amber-950 stroke-[2.5]" />;
    }
    if (isLastInUnit) {
      return <Trophy className="w-7 h-7 text-slate-400 stroke-[2]" />;
    }
    return <Lock className="w-6 h-6 text-slate-400 stroke-[2.5]" />;
  };

  return (
    <div
      className="relative flex flex-col items-center my-3 transition-transform duration-300"
      style={{
        transform: `translateX(${offsetPercentage}px)`,
      }}
    >
      {/* Floating START pill indicator for the current lesson */}
      {isCurrent && (
        <div className="absolute -top-11 z-20 animate-bounce">
          <div className="relative bg-white text-slate-900 border-2 border-slate-200 font-extrabold text-xs tracking-wider uppercase px-3 py-1.5 rounded-2xl shadow-lg flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>START</span>
            <span className="text-amber-500 font-black">+{lesson.xpReward} XP</span>
            {/* Triangle pointer arrow */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-white" />
          </div>
        </div>
      )}

      {/* 3 Stars Crown on top of completed node */}
      {isCompleted && (
        <div className="absolute -top-3 flex items-center justify-center gap-0.5 z-10">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 drop-shadow-sm rotate-[-12deg]" />
          <Star className="w-4 h-4 fill-amber-400 text-amber-500 drop-shadow-sm -translate-y-1" />
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 drop-shadow-sm rotate-[12deg]" />
        </div>
      )}

      {/* Main 3D Circular Button */}
      <button
        type="button"
        disabled={isLocked}
        onClick={() => onSelectNode(lesson)}
        className={`
          group relative w-20 h-20 rounded-full flex items-center justify-center border-b-4 transition-all duration-150 active:translate-y-1 active:shadow-none
          ${
            isCompleted
              ? `${theme.completedBg} hover:brightness-105 active:border-b-0 cursor-pointer`
              : isCurrent
              ? `${theme.currentBg} ring-8 ring-amber-400/20 hover:scale-105 cursor-pointer active:border-b-0`
              : 'bg-slate-200 border-slate-300 shadow-[0_6px_0_#cbd5e1] text-slate-400 cursor-not-allowed opacity-90'
          }
          ${isSelected ? 'ring-4 ring-offset-2 ring-blue-500 scale-105' : ''}
        `}
      >
        {/* Inner highlight gloss */}
        <div className="absolute top-1.5 left-3 right-3 h-4 bg-white/20 rounded-full blur-[0.5px] pointer-events-none" />

        {/* Node Center Icon */}
        <div className="relative z-10 flex items-center justify-center transition-transform group-hover:scale-110">
          {getNodeIcon()}
        </div>
      </button>

      {/* Lesson Title Caption */}
      <span className={`mt-2 text-xs font-bold text-center max-w-[120px] truncate px-1 ${
        isCurrent ? 'text-slate-900 font-extrabold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
      }`}>
        {lesson.title}
      </span>
    </div>
  );
}
