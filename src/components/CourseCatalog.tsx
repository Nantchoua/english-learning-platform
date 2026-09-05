'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Users, Search, X, Sparkles, Award, Zap, Flame, ArrowRight, Play, CheckCircle } from 'lucide-react';

type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  price: number | null;
  instructor: { name: string | null };
  _count: { enrollments: number; modules: number };
};

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const LEVEL_CONFIG: Record<
  string,
  { label: string; name: string; color: string; bg: string; border: string; btnBg: string; btnBorder: string; icon: string }
> = {
  A1: {
    label: 'A1',
    name: 'Beginner',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    btnBg: 'bg-[#58CC02]',
    btnBorder: 'border-[#46A302]',
    icon: '🌱',
  },
  A2: {
    label: 'A2',
    name: 'Elementary',
    color: 'text-emerald-800',
    bg: 'bg-emerald-100',
    border: 'border-emerald-300',
    btnBg: 'bg-[#58CC02]',
    btnBorder: 'border-[#46A302]',
    icon: '🌿',
  },
  B1: {
    label: 'B1',
    name: 'Intermediate',
    color: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    btnBg: 'bg-[#1CB0F6]',
    btnBorder: 'border-[#1899D6]',
    icon: '⚡',
  },
  B2: {
    label: 'B2',
    name: 'Upper-Int.',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    btnBg: 'bg-[#1CB0F6]',
    btnBorder: 'border-[#1899D6]',
    icon: '🚀',
  },
  C1: {
    label: 'C1',
    name: 'Advanced',
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    btnBg: 'bg-[#CE82FF]',
    btnBorder: 'border-[#B559F0]',
    icon: '💎',
  },
  C2: {
    label: 'C2',
    name: 'Proficient',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    btnBg: 'bg-[#FF4B4B]',
    btnBorder: 'border-[#D93838]',
    icon: '👑',
  },
};

export default function CourseCatalog({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState('');
  const [activeLevel, setActiveLevel] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return courses.filter((c) => {
      const matchesLevel = !activeLevel || c.level === activeLevel;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        !q ||
        c.title.toLowerCase().includes(q) ||
        (c.description ?? '').toLowerCase().includes(q) ||
        (c.instructor.name ?? '').toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [courses, query, activeLevel]);

  return (
    <div className="w-full">
      {/* Duolingo-style Search and Filter Bar */}
      <div className="bg-white rounded-3xl border-2 border-slate-200/80 p-6 mb-10 shadow-xs">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Search Box */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses, grammar, topics..."
              className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#58CC02] focus:outline-none transition"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Level Filter 3D Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
            <button
              onClick={() => setActiveLevel(null)}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs transition duration-150 border-b-4 cursor-pointer flex items-center gap-1.5 ${
                !activeLevel
                  ? 'bg-[#58CC02] border-[#46A302] text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <span>🌍</span> All Levels
            </button>
            {LEVELS.map((lvl) => {
              const cfg = LEVEL_CONFIG[lvl];
              const isActive = activeLevel === lvl;
              return (
                <button
                  key={lvl}
                  onClick={() => setActiveLevel(isActive ? null : lvl)}
                  className={`px-3.5 py-2.5 rounded-2xl font-black text-xs transition duration-150 border-b-4 cursor-pointer flex items-center gap-1 ${
                    isActive
                      ? `${cfg.btnBg} ${cfg.btnBorder} text-white shadow-xs`
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span>{cfg.icon}</span>
                  <span>{lvl}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results helper */}
        {(query || activeLevel) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500">
            <span>
              Showing {filtered.length} course{filtered.length === 1 ? '' : 's'}
              {activeLevel && (
                <> in <strong className="text-slate-800">{LEVEL_CONFIG[activeLevel]?.name} ({activeLevel})</strong></>
              )}
              {query && <> for "<strong className="text-slate-800">{query}</strong>"</>}
            </span>
            <button
              onClick={() => {
                setQuery('');
                setActiveLevel(null);
              }}
              className="text-[#58CC02] font-black hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-slate-200/80 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">No courses published yet</h3>
          <p className="text-slate-500 text-sm">Check back soon for new English speaking and grammar pathways!</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-slate-200/80 p-8 max-w-md mx-auto">
          <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-1">No matching courses</h3>
          <p className="text-slate-500 text-sm mb-4">Try clearing your search query or selecting a different CEFR level.</p>
          <button
            onClick={() => {
              setQuery('');
              setActiveLevel(null);
            }}
            className="bg-[#58CC02] border-b-4 border-[#46A302] text-white font-black px-5 py-2 rounded-xl text-xs"
          >
            Show All Courses
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((course) => {
            const cfg = LEVEL_CONFIG[course.level] || LEVEL_CONFIG.A1;
            const approxXp = course._count.modules * 80 + 150;

            return (
              <div
                key={course.id}
                className="group bg-white rounded-3xl border-2 border-slate-200/90 hover:border-emerald-400 overflow-hidden shadow-[0_6px_0_#e2e8f0] hover:shadow-[0_8px_0_#cbd5e1] transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top Illustrated Header Card */}
                  <div className={`h-40 ${cfg.bg} border-b-2 ${cfg.border} p-5 relative overflow-hidden flex flex-col justify-between`}>
                    {/* Background bubble shapes */}
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/40 rounded-full pointer-events-none" />
                    <div className="absolute right-10 -top-4 w-14 h-14 bg-white/30 rounded-full pointer-events-none" />

                    <div className="flex items-center justify-between relative z-10">
                      <span className={`inline-flex items-center gap-1.5 ${cfg.bg} ${cfg.border} ${cfg.color} border font-black text-xs px-3 py-1 rounded-full shadow-xs bg-white`}>
                        <span>{cfg.icon}</span> {course.level} • {cfg.name}
                      </span>
                      <span className="text-xs font-black text-amber-700 bg-amber-100/90 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" /> +{approxXp} XP
                      </span>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-xs flex items-center justify-center text-2xl">
                        🇬🇧
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pathway</span>
                        <span className="text-xs font-black text-slate-800">
                          {course._count.modules} Units • Duolingo Path
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6">
                    <h3 className="font-black text-xl text-slate-900 mb-2 leading-tight group-hover:text-[#58CC02] transition">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-2 mb-4 leading-relaxed">
                      {course.description || 'Master English speaking, grammar, and vocabulary step-by-step with gamified interactive lessons.'}
                    </p>

                    {/* Gamified perk badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                        <Award className="w-4 h-4 text-amber-500" /> Certificate
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                        <Flame className="w-4 h-4 text-orange-500" /> Streak Sync
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="p-6 pt-0 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {course._count.enrollments} Learners
                    </span>
                    <span className="text-slate-800 font-black text-sm">
                      {course.price && course.price > 0 ? `€${course.price.toFixed(2)}` : 'Free'}
                    </span>
                  </div>

                  <Link
                    href={`/courses/${course.slug}`}
                    className={`w-full ${cfg.btnBg} hover:brightness-105 border-b-4 ${cfg.btnBorder} active:border-b-0 active:translate-y-1 text-white font-black text-sm py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition duration-150`}
                  >
                    <span>START PATHWAY</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
