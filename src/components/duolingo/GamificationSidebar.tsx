'use client';

import React from 'react';
import Link from 'next/link';
import { Flame, Zap, Trophy, Target, ShieldCheck, ChevronRight, Award, Sparkles, BookOpen, Clock } from 'lucide-react';
import { QuestData, LeaderboardEntry } from './types';

interface GamificationSidebarProps {
  streakDays: number;
  totalXp: number;
  gemsCount: number;
  courseTitle?: string;
  courseSlug?: string;
  quests?: QuestData[];
  leaderboard?: LeaderboardEntry[];
}

const DEFAULT_QUESTS: QuestData[] = [
  { id: '1', title: 'Complete 2 lessons', target: 2, current: 1, xpReward: 20, icon: '🎯' },
  { id: '2', title: 'Earn 50 XP today', target: 50, current: 35, xpReward: 15, icon: '⚡' },
  { id: '3', title: 'Practice Speaking 1 time', target: 1, current: 0, xpReward: 25, icon: '🗣️' },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: 'Elena Rostova', xp: 620 },
  { rank: 2, name: 'Marco Silva', xp: 540 },
  { rank: 3, name: 'Dominic N. (You)', xp: 480, isCurrentUser: true },
  { rank: 4, name: 'Sophie Laurent', xp: 410 },
  { rank: 5, name: 'Kenji Takahashi', xp: 390 },
];

export default function GamificationSidebar({
  streakDays = 5,
  totalXp = 480,
  gemsCount = 150,
  courseTitle,
  courseSlug,
  quests = DEFAULT_QUESTS,
  leaderboard = DEFAULT_LEADERBOARD,
}: GamificationSidebarProps) {
  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const todayIndex = 4; // Friday

  return (
    <div className="w-full space-y-6">
      {/* Top Floating Stats Bar (Streak, XP, Gems) */}
      <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border-2 border-slate-200/80 shadow-xs">
        {/* Streak */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
            <Flame className="w-5 h-5 fill-orange-500 text-orange-600 animate-pulse" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-800">{streakDays}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Streak</span>
          </div>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
            <span className="text-base">💎</span>
          </div>
          <div>
            <span className="block text-xs font-black text-slate-800">{gemsCount}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Gems</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
            <Zap className="w-5 h-5 fill-amber-500 text-amber-600" />
          </div>
          <div>
            <span className="block text-xs font-black text-slate-800">{totalXp}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase">Total XP</span>
          </div>
        </div>
      </div>

      {/* Streak Calendar Widget */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-600" />
            {streakDays} Day Streak!
          </h3>
          <span className="text-[11px] font-bold text-slate-400">Keep it up!</span>
        </div>
        <p className="text-xs text-slate-500 mb-3">Complete a lesson every day to build your streak.</p>
        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
          {daysOfWeek.map((day, idx) => {
            const isFilled = idx <= todayIndex;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-slate-400">{day}</span>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black transition-all ${
                    isFilled
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isFilled ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Quests Widget */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-emerald-600" /> Daily Quests
          </h3>
          <span className="text-xs font-bold text-emerald-600 cursor-pointer hover:underline">View all</span>
        </div>

        <div className="space-y-3">
          {quests.map((quest) => {
            const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
            return (
              <div key={quest.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{quest.icon}</span> {quest.title}
                  </span>
                  <span className="text-[11px] font-black text-amber-600">+{quest.xpReward} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">
                    {quest.current}/{quest.target}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard League Preview */}
      <div className="bg-white p-5 rounded-2xl border-2 border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">Bronze League</h3>
              <p className="text-[10px] font-bold text-slate-400">Top 10 advance to Silver</p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {leaderboard.map((user) => (
            <div
              key={user.rank}
              className={`flex items-center justify-between py-2 px-2 rounded-lg text-xs font-semibold ${
                user.isCurrentUser ? 'bg-amber-50/80 text-amber-950 font-bold border border-amber-200/60' : 'text-slate-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-5 text-center font-black ${
                    user.rank === 1
                      ? 'text-amber-500 text-sm'
                      : user.rank === 2
                      ? 'text-slate-400 text-sm'
                      : user.rank === 3
                      ? 'text-amber-700 text-sm'
                      : 'text-slate-400'
                  }`}
                >
                  {user.rank}
                </span>
                <span className="truncate max-w-[130px]">{user.name}</span>
              </div>
              <span className="font-bold text-slate-500">{user.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
