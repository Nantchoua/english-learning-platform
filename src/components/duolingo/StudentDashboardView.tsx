'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { UnitData, LessonNodeData, QuestData, LeaderboardEntry } from './types';
import LearningPath from './LearningPath';
import GamificationSidebar from './GamificationSidebar';
import { BookOpen, Award, ArrowRight, Play, CheckCircle, ChevronDown, Sparkles, Trophy, Mic } from 'lucide-react';

interface EnrolledCourseOption {
  id: string;
  slug: string;
  title: string;
  level: string;
  units: UnitData[];
  completedCount: number;
  totalCount: number;
}

interface StudentDashboardViewProps {
  userName: string;
  courses: EnrolledCourseOption[];
  streakDays: number;
  totalXp: number;
  gemsCount: number;
}

export default function StudentDashboardView({
  userName,
  courses,
  streakDays,
  totalXp,
  gemsCount,
}: StudentDashboardViewProps) {
  const [activeCourseId, setActiveCourseId] = useState<string>(
    courses[0]?.id || ''
  );

  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  if (!activeCourse) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to start learning English?</h2>
        <p className="text-slate-500 mb-6">Choose a course from our catalog to unlock your Duolingo learning path!</p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] text-white font-black px-6 py-3 rounded-2xl shadow-md transition active:translate-y-1"
        >
          Explore Courses <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  // Calculate total progress
  const progressPercent = activeCourse.totalCount > 0 
    ? Math.round((activeCourse.completedCount / activeCourse.totalCount) * 100) 
    : 0;

  // Find next lesson to do
  const nextLesson = activeCourse.units
    .flatMap((u) => u.lessons)
    .find((l) => l.status === 'CURRENT' || l.status === 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header Card: Course Selector & Quick Jump */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-5 mb-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Active Course Title & Dropdown */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
              🇬🇧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {activeCourse.level} Level
                </span>
                <span className="text-xs font-bold text-slate-400">
                  {progressPercent}% Completed
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {activeCourse.title}
              </h1>
            </div>
          </div>

          {/* Switch Course (if multiple enrolled) & Practice Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            {courses.length > 1 && (
              <select
                value={activeCourseId}
                onChange={(e) => setActiveCourseId(e.target.value)}
                className="bg-slate-100 border-2 border-slate-200 font-bold text-sm text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.level})
                  </option>
                ))}
              </select>
            )}

            <Link
              href={`/courses/${activeCourse.slug}/certificate`}
              className="px-4 py-2 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4 text-amber-500" /> Certificate
            </Link>

            {nextLesson && (
              <Link
                href={`/courses/${activeCourse.slug}/learn/${nextLesson.id}`}
                className="bg-[#58CC02] hover:bg-[#46A302] border-b-4 border-[#46A302] active:border-b-0 active:translate-y-1 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition"
              >

                <Play className="w-4 h-4 fill-white" /> Continue Learning
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left/Center Learning Path + Right Gamification Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Central Winding Snake Pathway */}
        <div className="lg:col-span-2">
          <LearningPath
            units={activeCourse.units}
            courseSlug={activeCourse.slug}
            courseTitle={activeCourse.title}
          />
        </div>

        {/* Right Sticky Gamification Sidebar */}
        <div className="lg:col-span-1 sticky top-6">
          <GamificationSidebar
            streakDays={streakDays}
            totalXp={totalXp}
            gemsCount={gemsCount}
            courseTitle={activeCourse.title}
            courseSlug={activeCourse.slug}
          />
        </div>
      </div>
    </div>
  );
}
